import { TaskType } from '@prisma/client'

export class TestQuestionDto {
	id: string
	order: number
	text: string
	type: TaskType
	options?: { id: string; text: string }[]
}
export class TestDetailsDto {
	id: string
	title: string
	description?: string | null
	passingScore: number
	courseTitle: string
	courseSlug: string
	course?: { id: string; title: string } | null
	questions: TestQuestionDto[]
}
export class TestResultResponseDto {
	testId: string
	score: number
	totalQuestions: number
	correctAnswers: number
	passed: boolean
	certificateIssued: boolean
	answers: { questionId: string; isCorrect: boolean }[]
}
