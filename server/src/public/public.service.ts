import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'

export interface PublicStatsResponse {
	totalUsers: number
	totalTasks: number
	averageAccuracy: number
	totalLessons: number
}

@Injectable()
export class PublicService {
	constructor(private readonly prisma: PrismaService) {}

	async getStats(): Promise<PublicStatsResponse> {
		const [totalUsers, totalTasks, totalLessons, performanceStats] =
			await Promise.all([
				this.prisma.user.count({
					where: { status: 'ACTIVE' },
				}),
				this.prisma.task.count(),
				this.prisma.lesson.count(),
				this.prisma.taskAttempt.aggregate({
					_count: { id: true },
					where: { isCorrect: true },
				}),
			])

		const totalAttempts = await this.prisma.taskAttempt.count()
		const averageAccuracy =
			totalAttempts > 0
				? Math.round((performanceStats._count.id / totalAttempts) * 100)
				: 0

		return {
			totalUsers,
			totalTasks,
			averageAccuracy,
			totalLessons,
		}
	}

	async getFeaturedFeedback() {
		const feedback = await this.prisma.feedback.findMany({
			where: { featured: true, status: 'REVIEWED' },
			orderBy: { createdAt: 'desc' },
			take: 6,
			select: {
				id: true,
				rating: true,
				message: true,
				createdAt: true,
				user: { select: { name: true } },
			},
		})

		return feedback.map(item => ({
			id: item.id,
			rating: item.rating,
			message: item.message,
			createdAt: item.createdAt,
			authorName: item.user.name,
		}))
	}
}
