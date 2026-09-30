import {
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'src/prisma.service'
import { Locale, pickLocalized } from '../../i18n/locale'

@Injectable()
export class CertificatesService {
	constructor(private readonly prisma: PrismaService) {}

	async getCertificateById(
		id: string,
		userId: string,
		userRights: string[] | undefined,
		locale: Locale
	) {
		const certificate = await this.prisma.certificate.findUnique({
			where: { id },
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				course: {
					select: {
						id: true,
						title: true,
						titleRu: true,
						description: true,
						descriptionRu: true,
						difficulty: true,
					},
				},
			},
		})

		if (!certificate) {
			throw new NotFoundException('Certificate not found')
		}

		// Check whether the user has admin rights
		const isAdmin =
			userRights?.includes('ADMIN') || userRights?.includes('admin')

		if (!isAdmin && certificate.userId !== userId) {
			throw new ForbiddenException('You do not have access to this certificate')
		}

		return {
			id: certificate.id,
			certificateNumber: certificate.certificateNumber,
			userId: certificate.userId,
			courseId: certificate.courseId,
			issuedAt: certificate.issuedAt.toISOString(),
			user: certificate.user,
			course: {
				id: certificate.course.id,
				title: pickLocalized(locale, certificate.course.title, certificate.course.titleRu),
				description: pickLocalized(
					locale,
					certificate.course.description,
					certificate.course.descriptionRu
				),
				difficulty: certificate.course.difficulty,
			},
		}
	}

	async getUserCertificates(userId: string, locale: Locale) {
		const certificates = await this.prisma.certificate.findMany({
			where: { userId },
			include: {
				course: {
					select: {
						id: true,
						title: true,
						titleRu: true,
						slug: true,
					},
				},
			},
			orderBy: {
				issuedAt: 'desc',
			},
		})

		return certificates.map(cert => ({
			id: cert.id,
			certificateNumber: cert.certificateNumber,
			courseId: cert.courseId,
			courseTitle: pickLocalized(locale, cert.course.title, cert.course.titleRu),
			courseSlug: cert.course.slug,
			issuedAt: cert.issuedAt.toISOString(),
		}))
	}

	async checkAndIssueCertificate(
		userId: string,
		courseId: string
	): Promise<string | null> {
		const [
			totalLessons,
			completedLessons,
			totalTasks,
			solvedTasksData,
			courseTests,
			passedTestResults,
		] = await this.prisma.$transaction([
			this.prisma.lesson.count({
				where: { courseId },
			}),
			this.prisma.completedLesson.count({
				where: {
					userId,
					lesson: { courseId },
				},
			}),
			this.prisma.task.count({
				where: {
					lesson: { courseId },
				},
			}),
			this.prisma.taskAttempt.findMany({
				where: {
					userId,
					task: {
						lesson: { courseId },
					},
					isCorrect: true,
				},
				distinct: ['taskId'],
				select: { taskId: true },
			}),
			this.prisma.test.findMany({
				where: { courseId },
				select: { id: true },
			}),
			this.prisma.testResult.findMany({
				where: {
					userId,
					test: { courseId },
					passed: true,
				},
				distinct: ['testId'],
				select: { testId: true },
			}),
		])

		const solvedTasks = solvedTasksData.length
		const totalTests = courseTests.length
		const passedTests = passedTestResults.length

		// Check full course completion
		if (totalLessons === 0 || completedLessons < totalLessons) {
			return null
		}

		if (totalTasks === 0 || solvedTasks < totalTasks) {
			return null
		}

		if (totalTests > 0 && passedTests < totalTests) {
			return null
		}

		const where = { userId_courseId: { userId, courseId } }
		try {
			const certificate = await this.prisma.certificate.upsert({
				where,
				update: {},
				create: {
					userId,
					courseId,
					certificateNumber: `CERT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${randomUUID()}`,
				},
			})
			return certificate.id
		} catch (error) {
			// Prisma may implement compound-key upserts as read + create. The
			// database unique constraint still makes the concurrent loser safe.
			if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
				const winner = await this.prisma.certificate.findUnique({ where })
				if (winner) return winner.id
			}
			throw error
		}
	}
}
