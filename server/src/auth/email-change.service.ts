import { BadRequestException, ConflictException, Injectable, Logger, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common'
import { verify } from 'argon2'
import { createHash, randomBytes } from 'crypto'
import { normalizeEmail } from 'src/common/email'
import { PrismaService } from 'src/prisma.service'
import { PasswordResetMailer } from './password-reset-mailer.service'

const EXPIRY_MS = 30 * 60_000

@Injectable()
export class EmailChangeService {
	private readonly logger = new Logger(EmailChangeService.name)

	constructor(
		private readonly prisma: PrismaService,
		private readonly mailer: PasswordResetMailer
	) {}

	private hashToken(token: string) {
		return createHash('sha256').update(token).digest('hex')
	}

	async request(userId: string, email: string, currentPassword: string) {
		if (!this.mailer.isConfigured()) throw new ServiceUnavailableException('Email delivery is unavailable')
		const user = await this.prisma.user.findUnique({ where: { id: userId } })
		if (!user?.password || !await verify(user.password, currentPassword).catch(() => false)) {
			throw new UnauthorizedException('Current password is incorrect')
		}
		const newEmail = normalizeEmail(email)
		if (newEmail === user.email) throw new BadRequestException('New email must differ from current email')
		if (await this.prisma.user.findUnique({ where: { email: newEmail }, select: { id: true } })) {
			throw new ConflictException('Email is already in use')
		}
		const token = randomBytes(32).toString('hex')
		const now = new Date()
		await this.prisma.$transaction(async tx => {
			// Serialize issuance with password recovery and email confirmation.
			// Recheck the version read before password verification so a stale
			// request cannot create a new capability after credentials changed.
			const current = await tx.user.updateMany({
				where: { id: userId, authVersion: user.authVersion },
				data: { authVersion: user.authVersion },
			})
			if (current.count !== 1) throw new UnauthorizedException('Credentials changed; sign in again')
			await tx.emailChangeToken.updateMany({
				where: { userId, usedAt: null }, data: { usedAt: now },
			})
			await tx.emailChangeToken.create({
				data: { userId, newEmail, tokenHash: this.hashToken(token), expiresAt: new Date(now.getTime() + EXPIRY_MS) },
			})
		})
		const link = `${process.env.FRONTEND_URL ?? 'http://localhost:3000'}/confirm-email-change?token=${token}`
		const locale = user.legalLocale === 'ru' ? 'ru' : 'en'
		try {
			if (!await this.mailer.sendEmailChangeNotice(user.email, locale)) {
				throw new Error('Old-address notice delivery returned false')
			}
			if (!await this.mailer.sendEmailChangeLink(newEmail, link, locale)) {
				throw new Error('Email delivery returned false')
			}
		} catch {
			await this.prisma.emailChangeToken.updateMany({
				where: { tokenHash: this.hashToken(token), usedAt: null }, data: { usedAt: new Date() },
			})
			this.logger.error('Email change delivery failed')
			throw new ServiceUnavailableException('Email delivery failed')
		}
		return { message: 'Check the new address to confirm the change.' }
	}

	async confirm(token: string) {
		const now = new Date()
		let identity: { userId: string; authVersion: number }
		try {
			identity = await this.prisma.$transaction(async tx => {
				const tokenHash = this.hashToken(token)
				const record = await tx.emailChangeToken.findUnique({ where: { tokenHash } })
				if (!record || record.usedAt || record.expiresAt <= now) {
					throw new BadRequestException('Invalid or expired email change link')
				}
				// Updating the same user serializes concurrent confirmations. The
				// increment rolls back if the token was invalidated while waiting.
				const updated = await tx.user.update({
					where: { id: record.userId },
					data: { authVersion: { increment: 1 } },
				})
				const consumedAt = new Date()
				const consumed = await tx.emailChangeToken.updateMany({
					where: { tokenHash, usedAt: null, expiresAt: { gt: consumedAt } },
					data: { usedAt: consumedAt },
				})
				if (consumed.count !== 1) throw new BadRequestException('Invalid or expired email change link')
				await tx.user.update({
					where: { id: record.userId },
					data: { email: record.newEmail, emailVerifiedAt: now },
				})
				await tx.emailChangeToken.updateMany({
					where: { userId: record.userId, usedAt: null }, data: { usedAt: now },
				})
				await tx.passwordResetToken.updateMany({
					where: { userId: record.userId, usedAt: null }, data: { usedAt: now },
				})
				await tx.emailVerificationToken.updateMany({
					where: { userId: record.userId, usedAt: null }, data: { usedAt: now },
				})
				await tx.refreshSession.updateMany({
					where: { userId: record.userId, revokedAt: null }, data: { revokedAt: now },
				})
				return { userId: record.userId, authVersion: updated.authVersion }
			})
		} catch (error) {
			if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
				throw new ConflictException('Email is already in use')
			}
			throw error
		}
		return { message: 'Email changed.', ...identity }
	}
}
