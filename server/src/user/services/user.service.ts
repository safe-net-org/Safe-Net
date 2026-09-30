import {
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common'
import { hash, verify } from 'argon2'
import { AuthRegisterDto } from 'src/auth/dto/auth.dto'
import { normalizeEmail } from 'src/common/email'
import { PrismaService } from 'src/prisma.service'
import { UserDto } from '../dto/user.dto'

@Injectable()
export class UserService {
	constructor(private readonly prisma: PrismaService) {}

	async getById(id: string) {
		return this.prisma.user.findUnique({
			where: { id },
		})
	}

	getByEmail(email: string) {
		return this.prisma.user.findUnique({
			where: { email: normalizeEmail(email) },
		})
	}

	async getProfile(id: string) {
		const profile = await this.getById(id)
		if (!profile) {
			throw new NotFoundException('User not found')
		}

		const { password: _password, ...rest } = profile
		return {
			user: rest,
		}
	}

	async create(dto: AuthRegisterDto) {
		const acceptedAt = new Date()
		const user = {
			email: normalizeEmail(dto.email),
			name: dto.name,
			password: await hash(dto.password),
			termsAcceptedAt: acceptedAt,
			privacyAcceptedAt: acceptedAt,
			legalVersion: dto.legalVersion,
			legalLocale: dto.legalLocale,
		}
		const allCourses = await this.prisma.course.findMany()
		const userData = await this.prisma.user.create({ data: user })
		const progressRecords = allCourses.map((course) => ({
			userId: userData.id,
			courseId: course.id,
			progress: 0,
			totalXp: 0,
		}))
		await this.prisma.courseProgress.createMany({
			data: progressRecords,
			skipDuplicates: true,
		})
		return userData
	}

	async update(id: string, dto: UserDto) {
		const data: { name?: string; password?: string; authVersion?: { increment: number } } = {}
		let verifiedAuthVersion: number | undefined

		if (dto.name !== undefined) {
			data.name = dto.name
		}
		if (dto.password !== undefined) {
			const user = await this.getById(id)
			const currentPasswordIsValid =
				!!user?.password &&
				!!dto.currentPassword &&
				(await verify(user.password, dto.currentPassword).catch(() => false))
			if (!currentPasswordIsValid) {
				throw new UnauthorizedException('Current password is incorrect')
			}
			data.password = await hash(dto.password)
			data.authVersion = { increment: 1 }
			verifiedAuthVersion = user!.authVersion
		}

		if (dto.password !== undefined) {
			return this.prisma.$transaction(async tx => {
				// Claim the credential snapshot verified above. The row write also
				// serializes with issuance/confirmation of recovery and email links.
				const changed = await tx.user.updateMany({
					where: { id, authVersion: verifiedAuthVersion }, data,
				})
				if (changed.count !== 1) throw new UnauthorizedException('Credentials changed; sign in again')
				const now = new Date()
				await tx.refreshSession.updateMany({
					where: { userId: id, revokedAt: null }, data: { revokedAt: now },
				})
				await tx.passwordResetToken.updateMany({
					where: { userId: id, usedAt: null }, data: { usedAt: now },
				})
				await tx.emailChangeToken.updateMany({
					where: { userId: id, usedAt: null }, data: { usedAt: now },
				})
				await tx.emailVerificationToken.updateMany({
					where: { userId: id, usedAt: null }, data: { usedAt: now },
				})
				return tx.user.findUniqueOrThrow({ where: { id }, select: { name: true, email: true } })
			})
		}

		return this.prisma.user.update({
			where: { id }, data, select: { name: true, email: true },
		})
	}
}
