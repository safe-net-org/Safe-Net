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
		const data: { name?: string; email?: string; password?: string } = {}

		if (dto.name !== undefined) {
			data.name = dto.name
		}
		if (dto.email !== undefined) {
			data.email = normalizeEmail(dto.email)
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
		}

		return this.prisma.user.update({
			where: { id },
			data,
			select: {
				name: true,
				email: true,
			},
		})
	}
}
