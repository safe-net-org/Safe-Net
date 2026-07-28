import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { hash } from 'argon2'
import { createHash, randomBytes } from 'crypto'
import { normalizeEmail } from 'src/common/email'
import { PrismaService } from 'src/prisma.service'
import { PasswordResetMailer } from './password-reset-mailer.service'

const TOKEN_BYTES = 32
const EXPIRY_MINUTES = 30
const MS_PER_MINUTE = 60_000

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

			await this.prisma.passwordResetToken.create({
				data: {
					userId: user.id,
					tokenHash: this.hashToken(token),
					expiresAt,
				},
			})

			const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000'
			const link = `${frontendUrl}/reset-password?token=${token}`
			let delivered = false
			try {
				delivered = await this.mailer.sendResetLink(
					normalizedEmail,
					link,
					user.legalLocale === 'ru' ? 'ru' : 'en'
				)
			} catch {
				// Keep the public response indistinguishable from the
				// nonexistent-account case. The raw token, link and recipient are
				// intentionally excluded from operational logs.
				this.logger.error('Password reset email delivery failed')
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
		const record = await this.prisma.passwordResetToken.findUnique({
			where: { tokenHash: this.hashToken(token) },
		})

		if (!record || record.usedAt || record.expiresAt < new Date()) {
			throw new BadRequestException('Invalid or expired reset link')
		}

		// Mark used and update the password together, so a token can never be
		// replayed even if two requests race.
		await this.prisma.$transaction([
			this.prisma.user.update({
				where: { id: record.userId },
				data: { password: await hash(newPassword) },
			}),
			this.prisma.passwordResetToken.update({
				where: { id: record.id },
				data: { usedAt: new Date() },
			}),
			// Invalidate any other outstanding tokens for this user.
			this.prisma.passwordResetToken.updateMany({
				where: { userId: record.userId, usedAt: null },
				data: { usedAt: new Date() },
			}),
			// Password changes are a security boundary: every signed-in device
			// must authenticate again with the new password.
			this.prisma.refreshSession.updateMany({
				where: { userId: record.userId, revokedAt: null },
				data: { revokedAt: new Date() },
			}),
		])

		return { message: 'Password has been reset. You can now sign in.' }
	}
}
