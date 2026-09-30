import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { AdminUpdateUserDto } from '../dto/update-user.dto'
@Injectable()
export class AdminUsersService {
	constructor(private readonly prisma: PrismaService) {}
	async getUsers() {
		const users = await this.prisma.user.findMany({
			orderBy: { createdAt: 'desc' },
			include: {
				courseProgress: true,
				completedLessons: true,
				achievements: true,
				certificates: true,
				testResults: true,
			},
		})
		return users.map(u => ({
			id: u.id,
			email: u.email,
			name: u.name,
			rights: u.rights,
			status: u.status,
			createdAt: u.createdAt,
			updatedAt: u.updatedAt,
			stats: {
				courses: u.courseProgress.length,
				lessonsCompleted: u.completedLessons.length,
				achievements: u.achievements.length,
				certificates: u.certificates.length,
				tests: u.testResults.length,
			},
		}))
	}
	async getUserById(id: string) {
		const user = await this.prisma.user.findUnique({
			where: { id },
			include: {
				courseProgress: {
					include: {
						course: {
							select: { id: true, title: true, description: true },
						},
					},
				},
				completedLessons: {
					include: {
						lesson: {
							select: {
								id: true,
								title: true,
								course: { select: { id: true, title: true } },
							},
						},
					},
				},
				achievements: {
					include: {
						achievement: true,
					},
				},
				certificates: {
					include: {
						course: { select: { id: true, title: true } },
					},
				},
				testResults: {
					include: {
						test: {
							select: {
								id: true,
								title: true,
								course: { select: { id: true, title: true } },
							},
						},
					},
				},
			},
		})
		if (!user) throw new NotFoundException('User not found')
		const totalLessons = user.completedLessons.length
		const totalCourses = user.courseProgress.length
		const completedCourses = user.courseProgress.filter(
			cp => cp.progress === 100
		).length
		const averageTestScore =
			user.testResults.length > 0
				? Math.round(
						user.testResults.reduce((sum, tr) => sum + tr.score, 0) /
							user.testResults.length
					)
				: 0
		const recentActivity = [
			...user.completedLessons.map(cl => ({
				type: 'lesson',
				title: cl.lesson.title,
				course: cl.lesson.course.title,
				date: cl.completedAt,
			})),
			...user.testResults.map(tr => ({
				type: 'test',
				title: tr.test.title,
				course: tr.test.course?.title,
				score: tr.score,
				date: tr.createdAt,
			})),
			...user.achievements.map(a => ({
				type: 'achievement',
				title: a.achievement.title,
				description: a.achievement.description,
				date: a.earnedAt,
			})),
		]
			.sort((a, b) => +new Date(b.date) - +new Date(a.date))
			.slice(0, 20)
		return {
			id: user.id,
			email: user.email,
			name: user.name,
			rights: user.rights,
			status: user.status,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
			statistics: {
				totalCourses,
				completedCourses,
				inProgressCourses: totalCourses - completedCourses,
				totalLessons,
				achievements: user.achievements.length,
				certificates: user.certificates.length,
				averageTestScore,
				totalTests: user.testResults.length,
			},
			courses: user.courseProgress.map(cp => ({
				id: cp.course.id,
				title: cp.course.title,
				description: cp.course.description,
				progress: cp.progress,
				totalXp: cp.totalXp,
				updatedAt: cp.updatedAt,
			})),
			recentActivity,
			achievements: user.achievements.map(a => ({
				id: a.achievement.id,
				title: a.achievement.title,
				description: a.achievement.description,
				icon: a.achievement.icon,
				earnedAt: a.earnedAt,
			})),
			certificates: user.certificates.map(c => ({
				id: c.id,
				courseId: c.course.id,
				courseTitle: c.course.title,
				issuedAt: c.issuedAt,
				certificateNumber: c.certificateNumber,
			})),
			testResults: user.testResults.map(tr => ({
				id: tr.id,
				testId: tr.test.id,
				testTitle: tr.test.title,
				courseTitle: tr.test.course?.title,
				score: tr.score,
				time: tr.time,
				totalQuestions: tr.totalQuestions,
				correctAnswers: tr.correctAnswers,
				passed: tr.passed,
				completedAt: tr.createdAt,
			})),
		}
	}
	async updateUser(id: string, dto: AdminUpdateUserDto) {
		const user = await this.prisma.$transaction(async tx => {
			const current = await tx.user.findUniqueOrThrow({
				where: { id },
				select: { status: true },
			})
			const statusChanged = dto.status !== undefined && dto.status !== current.status
			const updated = await tx.user.update({
				where: { id },
				data: {
					email: dto.email,
					name: dto.name,
					status: dto.status,
					rights: dto.rights,
					...(statusChanged ? { authVersion: { increment: 1 } } : {}),
				},
			})
			if (statusChanged) {
				await tx.refreshSession.updateMany({
					where: { userId: id, revokedAt: null },
					data: { revokedAt: new Date() },
				})
			}
			return updated
		})
		const { password, ...rest } = user
		return rest
	}
}
