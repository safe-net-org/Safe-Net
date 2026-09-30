import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { TaskType } from '@prisma/client'
import { PrismaService } from 'src/prisma.service'
import { SubmitTestDto } from '../dto/submit-test.dto'
import { TestDetailsDto, TestResultResponseDto } from '../dto/test-question.dto'
import { CertificatesService } from './certificates.service'
import { AchievementsService } from './achievements.service'
import { Locale, pickLocalized } from '../../i18n/locale'

@Injectable()
export class TestsService {
	constructor(
		private AchievementsService: AchievementsService,
		private prisma: PrismaService,
		private readonly certificatesService: CertificatesService
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
		if (dto.time === undefined) throw new BadRequestException('Time should be provided')
		if (!test.course) throw new NotFoundException('Course not found')

		const questionsMap = new Map(test.questions.map(q => [q.id, q]))
		const answeredIds = new Set<string>()
		for (const answer of dto.answers) {
			if (answeredIds.has(answer.questionId)) {
				throw new BadRequestException('A question may be answered only once')
			}
			answeredIds.add(answer.questionId)
			const question = questionsMap.get(answer.questionId)
			if (!question) throw new BadRequestException('Question does not belong to this test')
			if (question.type !== TaskType.SINGLE_CHOICE && question.type !== TaskType.MULTI_CHOICE) {
				throw new BadRequestException('Unsupported test question type')
			}
			const selected = answer.selectedOptionIds ?? []
			if (answer.textAnswer !== undefined ||
				(question.type === TaskType.SINGLE_CHOICE && selected.length > 1) ||
				new Set(selected).size !== selected.length ||
				selected.some(optionId => !question.options.some(option => option.id === optionId))) {
				throw new BadRequestException('Invalid answer options')
			}
		}

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
			const certificateId = await this.certificatesService.checkAndIssueCertificate(
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
			certificateIssued,
			answers: answerDetails,
		}
	}

}
