import { Injectable, NotFoundException } from '@nestjs/common'
import { FeedbackStatus, Prisma } from '@prisma/client'
import { PrismaService } from 'src/prisma.service'
import {
	AdminFeedbackQueryDto,
	CreateFeedbackDto,
	UpdateFeedbackDto,
} from './dto/feedback.dto'

@Injectable()
export class FeedbackService {
	constructor(private readonly prisma: PrismaService) {}

	create(userId: string, dto: CreateFeedbackDto) {
		return this.prisma.feedback.create({
			data: {
				userId,
				rating: dto.rating,
				message: dto.message.trim(),
				sourcePage: dto.sourcePage,
			},
			select: { id: true, createdAt: true },
		})
	}

	async listForAdmin(query: AdminFeedbackQueryDto) {
		const where: Prisma.FeedbackWhereInput = {
			status: query.status,
			rating: query.rating,
			featured: query.featured,
			OR: query.search
				? [
						{ message: { contains: query.search, mode: 'insensitive' } },
						{ user: { name: { contains: query.search, mode: 'insensitive' } } },
						{ user: { email: { contains: query.search, mode: 'insensitive' } } },
					]
				: undefined,
		}
		const skip = (query.page - 1) * query.limit
		const [items, total] = await Promise.all([
			this.prisma.feedback.findMany({
				where,
				skip,
				take: query.limit,
				orderBy: { createdAt: 'desc' },
				include: {
					user: { select: { id: true, name: true, email: true } },
				},
			}),
			this.prisma.feedback.count({ where }),
		])

		return {
			items,
			total,
			page: query.page,
			totalPages: Math.max(1, Math.ceil(total / query.limit)),
		}
	}

	async update(id: string, dto: UpdateFeedbackDto) {
		const existing = await this.prisma.feedback.findUnique({ where: { id } })
		if (!existing) throw new NotFoundException('Feedback not found')

		const status = dto.featured ? FeedbackStatus.REVIEWED : dto.status
		const featured =
			status && status !== FeedbackStatus.REVIEWED ? false : dto.featured
		return this.prisma.feedback.update({
			where: { id },
			data: {
				status,
				featured,
				reviewedAt:
					status === FeedbackStatus.REVIEWED && !existing.reviewedAt
						? new Date()
						: undefined,
			},
			include: {
				user: { select: { id: true, name: true, email: true } },
			},
		})
	}
}
