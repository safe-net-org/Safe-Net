import { Injectable, NotFoundException } from '@nestjs/common'
import { TaskType } from '@prisma/client'
import { PrismaService } from 'src/prisma.service'
import { SubmitTestDto } from '../dto/submit-test.dto'
import { TestDetailsDto, TestResultResponseDto } from '../dto/test-question.dto'
import { AchievementsService } from './achievements.service'
import { Locale, pickLocalized } from '../../i18n/locale'

@Injectable()
export class TestsService {
	constructor(
		private AchievementsService: AchievementsService,
		private prisma: PrismaService
	) {}

	async getTests() {
		return this.prisma.test.findMany({
			orderBy: { createdAt: 'desc' },
			select: {
				id: true,
				title: true,
				description: true,
				course: {
					select: {
						id: true,
						title: true,
					},
				},
			},
		})
	}

	async getTestById(id: string, locale: Locale): Promise<TestDetailsDto> {
		const test = await this.prisma.test.findUnique({
			where: { id },
			include: {
				course: {
					select: {
						id: true,
						title: true,
						slug: true,
					},
				},
				questions: {
					include: {
						options: true,
					},
				},
			},
		})

		if (!test) throw new NotFoundException('Test not found')

		return {
			id: test.id,
			title: pickLocalized(locale, test.title, test.titleRu),
			description: pickLocalized(locale, test.description, test.descriptionRu),
			course: test.course,
			passingScore: test.passingScore,
			courseTitle: test.course?.title ?? null,
			courseSlug: test.course?.slug ?? null,
			questions: test.questions.map(q => ({
				id: q.id,
				order: q.order,
				text: pickLocalized(locale, q.text, q.textRu),
				type: q.type,
				options:
					q.type === TaskType.SINGLE_CHOICE || q.type === TaskType.MULTI_CHOICE
						? q.options.map(o => ({
								id: o.id,
								text: pickLocalized(locale, o.text, o.textRu),
							}))
						: undefined,
			})),
		}
	}

	async submitTest(
		id: string,
		userId: string,
		dto: SubmitTestDto
	): Promise<TestResultResponseDto> {
		const test = await this.prisma.test.findUnique({
			where: { id },
			include: {
				questions: {
					include: {
						options: true,
					},
				},
				course: {
					select: {
						id: true,
					},
				},
			},
		})

		if (!test) throw new NotFoundException('Test not found')
		if (!dto.time) throw new NotFoundException('Time should be provided')
		if (!test.course) throw new NotFoundException('Course not found')

		const questionsMap = new Map(test.questions.map(q => [q.id, q]))

		let correct = 0

		// Count correct answers
		for (const answer of dto.answers) {
			const q = questionsMap.get(answer.questionId)
			if (!q) continue

			if (
				q.type === TaskType.SINGLE_CHOICE ||
				q.type === TaskType.MULTI_CHOICE
			) {
				const correctIds = q.options
					.filter(o => o.isCorrect)
					.map(o => o.id)
					.sort()

				const selected = [...(answer.selectedOptionIds || [])].sort()

				const ok =
					correctIds.length === selected.length &&
					correctIds.every((id0, i) => id0 === selected[i])

				if (ok) correct++
			}
		}

		const total = test.questions.length || 1
		const scorePercent = Math.round((correct / total) * 100)
		const passed = scorePercent >= test.passingScore

		// Create the test result
		const result = await this.prisma.testResult.create({
			data: {
				userId,
				testId: test.id,
				score: scorePercent,
				totalQuestions: total,
				correctAnswers: correct,
				time: dto.time,
				passed,
			},
		})

		// ✅ NEW: Check and issue certificate after passing the test
		let certificateIssued = false
		if (passed) {
			const certificateId = await this.checkAndIssueCertificate(
				userId,
				test.course.id
			)
			certificateIssued = !!certificateId

			const newAchievements =
				await this.AchievementsService.checkAndAwardAchievements(userId)
		}

		// Save detailed answer results
		const answerDetails = dto.answers.map(answer => {
			const q = questionsMap.get(answer.questionId)
			if (!q) return { questionId: answer.questionId, isCorrect: false }

			if (
				q.type === TaskType.SINGLE_CHOICE ||
				q.type === TaskType.MULTI_CHOICE
			) {
				const correctIds = q.options
					.filter(o => o.isCorrect)
					.map(o => o.id)
					.sort()

				const selected = [...(answer.selectedOptionIds || [])].sort()

				const isCorrect =
					correctIds.length === selected.length &&
					correctIds.every((id0, i) => id0 === selected[i])

				return {
					questionId: answer.questionId,
					isCorrect,
				}
			}

			return { questionId: answer.questionId, isCorrect: false }
		})

		return {
			testId: result.testId,
			score: result.score,
			totalQuestions: result.totalQuestions,
			correctAnswers: result.correctAnswers,
			passed: result.passed,
			certificateIssued, // ✅ Add the flag
		}
	}

	// ✅ FIXED LOGIC: Certificate only at 100% completion
	private async checkAndIssueCertificate(
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

		// ✅ FIXED: Check that all parts of the course are completed
		// 1. There must be lessons AND all must be completed
		if (totalLessons === 0 || completedLessons < totalLessons) {
			return null
		}

		// 2. There must be tasks AND all must be completed
		if (totalTasks === 0 || solvedTasks < totalTasks) {
			return null
		}

		// 3. If there are tests - all must be passed
		if (totalTests > 0 && passedTests < totalTests) {
			return null
		}

		// Check for an existing certificate
		const existingCertificate = await this.prisma.certificate.findFirst({
			where: { userId, courseId },
		})

		if (existingCertificate) {
			return existingCertificate.id
		}

		// Generate and create a new certificate
		const certificateNumber = await this.generateCertificateNumber()

		const certificate = await this.prisma.certificate.create({
			data: {
				userId,
				courseId,
				certificateNumber,
			},
		})

		return certificate.id
	}

	// ✅ Generate the certificate number
	private async generateCertificateNumber(): Promise<string> {
		let attempts = 0
		const maxAttempts = 10

		while (attempts < maxAttempts) {
			const date = new Date()
			const year = date.getFullYear()
			const month = String(date.getMonth() + 1).padStart(2, '0')
			const day = String(date.getDate()).padStart(2, '0')
			const random = Math.floor(Math.random() * 100000)
				.toString()
				.padStart(5, '0')

			const certificateNumber = `CERT-${year}${month}${day}-${random}`

			const exists = await this.prisma.certificate.findUnique({
				where: { certificateNumber },
			})

			if (!exists) {
				return certificateNumber
			}

			attempts++
		}

		throw new Error('Failed to generate unique certificate number')
	}
}
