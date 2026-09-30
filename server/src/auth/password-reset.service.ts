import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { hash } from 'argon2'
import { createHash, randomBytes } from 'crypto'
import { normalizeEmail } from 'src/common/email'
import { PrismaService } from 'src/prisma.service'
import { PasswordResetMailer } from './password-reset-mailer.service'

const TOKEN_BYTES = 32
const EXPIRY_MINUTES = 30
const MS_PER_MINUTE = 60_000

function getDeliveryErrorContext(error: unknown): string {
	if (!error || typeof error !== 'object') return ''

	const smtpError = error as {
		code?: unknown
		command?: unknown
		responseCode?: unknown
	}
	const details: string[] = []
	const addSafeString = (key: string, value: unknown) => {
		if (
			typeof value === 'string' &&
			/^[a-zA-Z0-9_. -]{1,40}$/.test(value)
		) {
			details.push(`${key}=${value}`)
		}
	}

	addSafeString('code', smtpError.code)
	addSafeString('command', smtpError.command)
	if (
		typeof smtpError.responseCode === 'number' &&
		Number.isInteger(smtpError.responseCode)
	) {
		details.push(`responseCode=${smtpError.responseCode}`)
	}

	return details.length > 0 ? ` (${details.join(', ')})` : ''
}

/**
 * Token-based password reset. Replaces the removed `newPassword`, which changed
 * any account's password given only an email — no token, no proof of ownership.
 *
 * The raw token lives only in the reset link. The database stores its SHA-256
 * hash, so a leaked row cannot reset anyone's password. Tokens are single-use
 * and expire after 30 minutes.
 *
 * Delivery uses the configured SMTP transport. An explicit development-only
 * flag can log it for local testing when SMTP is absent. `requestReset` never
 * reveals whether an email exists, so it cannot enumerate accounts.
 */
@Injectable()
export class PasswordResetService {
	private readonly logger = new Logger(PasswordResetService.name)

	constructor(
		private readonly prisma: PrismaService,
		private readonly mailer: PasswordResetMailer
	) {}

	private hashToken(token: string): string {
		return createHash('sha256').update(token).digest('hex')
	}

	async requestReset(email: string): Promise<{ message: string }> {
		const normalizedEmail = normalizeEmail(email)
		const user = await this.prisma.user.findUnique({
			where: { email: normalizedEmail },
		})

		// Always return the same response whether or not the account exists —
		// otherwise this endpoint becomes an account-enumeration oracle.
		if (user) {
			const token = randomBytes(TOKEN_BYTES).toString('hex')
			const expiresAt = new Date(Date.now() + EXPIRY_MINUTES * MS_PER_MINUTE)

			const issued = await this.prisma.$transaction(async tx => {
				// This no-op write locks the user row and rejects an email/password
				// snapshot superseded while the request was preparing its token.
				const current = await tx.user.updateMany({
					where: { id: user.id, authVersion: user.authVersion },
					data: { authVersion: user.authVersion },
				})
				if (current.count !== 1) return false
				await tx.passwordResetToken.create({
					data: { userId: user.id, tokenHash: this.hashToken(token), expiresAt },
				})
				return true
			})
			if (!issued) return { message: 'If an account exists for that email, a reset link has been sent.' }

			const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000'
			const link = `${frontendUrl}/?auth=reset&token=${token}`
			let delivered = false
			try {
				delivered = await this.mailer.sendResetLink(
					normalizedEmail,
					link,
					user.legalLocale === 'ru' ? 'ru' : 'en'
				)
				if (delivered) {
					this.logger.log('Password reset email accepted by delivery provider')
				}
			} catch (error) {
				// Keep the public response indistinguishable from the
				// nonexistent-account case. The raw token, link and recipient are
				// intentionally excluded from operational logs.
				this.logger.error(
					`Password reset email delivery failed${getDeliveryErrorContext(error)}`
				)
			}

			// Raw reset details are opt-in for local development only. They must
			// never reach production logs.
			const shouldLogDevelopmentLink =
				!delivered &&
				process.env.NODE_ENV !== 'production' &&
				process.env.PASSWORD_RESET_DEBUG_LOG === 'true'
			if (shouldLogDevelopmentLink) {
				this.logger.warn(
					`Development-only password reset link for ${normalizedEmail}: ${link}`
				)
			}
		}

		return {
			message:
				'If an account exists for that email, a reset link has been sent.',
		}
	}

	async resetPassword(
		token: string,
		newPassword: string
	): Promise<{ message: string }> {
		const tokenHash = this.hashToken(token)
		const now = new Date()
		const passwordHash = await hash(newPassword)

		// Lock the user before claiming the token. All credential transitions
		// take this lock first, preventing competing links from surviving or
		// deadlocking by each holding a different token row.
		await this.prisma.$transaction(async tx => {
			const record = await tx.passwordResetToken.findUnique({
				where: { tokenHash },
			})
			if (!record || record.usedAt || record.expiresAt <= new Date()) {
				throw new BadRequestException('Invalid or expired reset link')
			}
			await tx.user.update({
				where: { id: record.userId },
				data: { authVersion: { increment: 1 } },
			})
			const consumedAt = new Date()
			const consumed = await tx.passwordResetToken.updateMany({
				where: { tokenHash, usedAt: null, expiresAt: { gt: consumedAt } },
				data: { usedAt: consumedAt },
			})
			if (consumed.count !== 1) {
				throw new BadRequestException('Invalid or expired reset link')
			}

			await tx.user.update({
				where: { id: record.userId },
				data: { password: passwordHash },
			})
			await tx.passwordResetToken.updateMany({
				where: { userId: record.userId, usedAt: null },
				data: { usedAt: now },
			})
			await tx.refreshSession.updateMany({
				where: { userId: record.userId, revokedAt: null },
				data: { revokedAt: now },
			})
			await tx.emailChangeToken.updateMany({
				where: { userId: record.userId, usedAt: null }, data: { usedAt: now },
			})
			await tx.emailVerificationToken.updateMany({
				where: { userId: record.userId, usedAt: null }, data: { usedAt: now },
			})
		})

		return { message: 'Password has been reset. You can now sign in.' }
	}
}
