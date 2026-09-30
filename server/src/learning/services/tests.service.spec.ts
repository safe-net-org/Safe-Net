import { BadRequestException } from '@nestjs/common'
import { TaskType } from '@prisma/client'
import { PrismaService } from 'src/prisma.service'
import { AchievementsService } from './achievements.service'
import { TestsService } from './tests.service'
import { CertificatesService } from './certificates.service'

describe('TestsService submission integrity', () => {
	const questions = Array.from({ length: 5 }, (_, index) => ({
		id: `q${index + 1}`,
		type: TaskType.SINGLE_CHOICE,
		options: [
			{ id: `correct${index + 1}`, isCorrect: true },
			{ id: `wrong${index + 1}`, isCorrect: false },
		],
	}))
	function makeService() {
		const prisma = {
			test: { findUnique: jest.fn().mockResolvedValue({
				id: 'test', passingScore: 80, questions, course: { id: 'course' },
			}) },
			testResult: { create: jest.fn().mockImplementation(async ({ data }) => data) },
		}
		return {
			service: new TestsService({} as AchievementsService, prisma as unknown as PrismaService, {} as CertificatesService),
			prisma,
		}
	}

	it('counts each test question at most once', async () => {
		const { service, prisma } = makeService()
		await expect(service.submitTest('test', 'user', {
			time: 20,
			answers: Array(5).fill({ questionId: 'q1', selectedOptionIds: ['correct1'] }),
		})).rejects.toBeInstanceOf(BadRequestException)
		expect(prisma.testResult.create).not.toHaveBeenCalled()
	})

	it('rejects foreign questions, options and duplicated options', async () => {
		const { service, prisma } = makeService()
		for (const answer of [
			{ questionId: 'foreign', selectedOptionIds: ['correct1'] },
			{ questionId: 'q1', selectedOptionIds: ['foreign'] },
			{ questionId: 'q1', selectedOptionIds: ['correct1', 'correct1'] },
		]) {
			await expect(service.submitTest('test', 'user', { time: 20, answers: [answer] }))
				.rejects.toBeInstanceOf(BadRequestException)
		}
		expect(prisma.testResult.create).not.toHaveBeenCalled()
	})

	it('scores an unanswered test question as incorrect', async () => {
		const { service } = makeService()
		const result = await service.submitTest('test', 'user', {
			time: 20,
			answers: [{ questionId: 'q1', selectedOptionIds: ['correct1'] }],
		})
		expect(result).toMatchObject({ score: 20, correctAnswers: 1, totalQuestions: 5, passed: false })
	})
})
