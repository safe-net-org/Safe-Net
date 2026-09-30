import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { createHash, randomBytes } from 'crypto'
import { normalizeEmail } from 'src/common/email'
import { PrismaService } from 'src/prisma.service'
import { PasswordResetMailer } from './password-reset-mailer.service'

const TOKEN_BYTES = 32
const EXPIRY_MINUTES = 30

@Injectable()
export class EmailVerificationService {
	private readonly logger = new Logger(EmailVerificationService.name)

	constructor(
		private readonly prisma: PrismaService,
		private readonly mailer: PasswordResetMailer
	) {}

	private hashToken(token: string) {
		return createHash('sha256').update(token).digest('hex')
	}

	async sendForUser(user: { id: string; email: string; authVersion: number; legalLocale?: string | null }) {
		const token = randomBytes(TOKEN_BYTES).toString('hex')
		const expiresAt = new Date(Date.now() + EXPIRY_MINUTES * 60_000)
		const issued = await this.prisma.$transaction(async tx => {
			const current = await tx.user.updateMany({
				where: { id: user.id, email: user.email, authVersion: user.authVersion, emailVerifiedAt: null },
				data: { authVersion: user.authVersion },
			})
			if (current.count !== 1) return false
			await tx.emailVerificationToken.updateMany({
				where: { userId: user.id, usedAt: null },
				data: { usedAt: new Date() },
			})
			await tx.emailVerificationToken.create({
				data: { userId: user.id, tokenHash: this.hashToken(token), expiresAt },
			})
			return true
		})
		if (!issued) return

		const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000'
		const link = `${frontendUrl}/?auth=verify&token=${token}`
		try {
			await this.mailer.sendVerificationLink(
				user.email,
				link,
				user.legalLocale === 'ru' ? 'ru' : 'en'
			)
		} catch {
			// Do not log recipients or links: both are sensitive operational data.
			this.logger.error('Email verification delivery failed')
		}
	}

	async resend(email: string) {
		const user = await this.prisma.user.findUnique({
			where: { email: normalizeEmail(email) },
			select: { id: true, email: true, legalLocale: true, emailVerifiedAt: true, authVersion: true },
		})
		if (user && !user.emailVerifiedAt) await this.sendForUser(user)
		return { message: 'If an unverified account exists for that email, a link has been sent.' }
	}

	async verify(token: string) {
		const now = new Date()
		const updated = await this.prisma.$transaction(async tx => {
			const tokenHash = this.hashToken(token)
			const record = await tx.emailVerificationToken.findUnique({ where: { tokenHash } })
			if (!record || record.usedAt || record.expiresAt <= new Date()) return null
			// Take the same user lock as every credential transition before the
			// final conditional claim. A reset/email change may invalidate this
			// record while this request is waiting, so its timestamp write rolls
			// back with the failed claim.
			const user = await tx.user.update({ where: { id: record.userId }, data: { emailVerifiedAt: now } })
			const consumedAt = new Date()
			const consumed = await tx.emailVerificationToken.updateMany({
				where: { tokenHash, usedAt: null, expiresAt: { gt: consumedAt } },
				data: { usedAt: consumedAt },
			})
			if (consumed.count !== 1) throw new BadRequestException('Invalid or expired verification link')
			await tx.emailVerificationToken.updateMany({
				where: { userId: record.userId, usedAt: null }, data: { usedAt: consumedAt },
			})
			return user
		})
		if (!updated) throw new BadRequestException('Invalid or expired verification link')
		return { message: 'Email verified.', userId: updated.id, authVersion: updated.authVersion }
	}
}
