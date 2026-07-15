import { BlockType, Difficulty, TaskType } from '@prisma/client'

export class LessonBlockDto {
	id: string
	order: number
	type: BlockType
	title?: string | null
	content: string
}

export class LessonTaskOptionDto {
	id: string
	text: string
}

/**
 * The simulated message a learner inspects, with the answer key removed.
 *
 * `meta.redFlags` never appears here: it holds the exact spans that make the
 * message suspicious, so sending it would put the answers in the browser —
 * the same reason `TaskOption.isCorrect` is stripped above.
 */
export class SimulatedEmailDto {
	from: string
	displayName?: string
	subject: string
	body: string
}

export class SimulatedSiteDto {
	url: string
	title?: string
	page: string
}

export class LessonTaskDto {
	id: string
	order: number
	type: TaskType
	title: string
	question?: string | null
	points: number
	difficulty: Difficulty
	options: LessonTaskOptionDto[]

	/** Present only for PHISHING_EMAIL tasks. */
	email?: SimulatedEmailDto
	/** Present only for PHISHING_SITE tasks. */
	site?: SimulatedSiteDto
}

export class LessonDetailsDto {
	id: string
	courseTitle: string
	courseSlug: string
	order: number
	title: string
	estimatedDuration: number
	blocks: LessonBlockDto[]
	tasks: LessonTaskDto[]
}
