export enum Difficulty {
	EASY = 'EASY',
	MEDIUM = 'MEDIUM',
	HARD = 'HARD',
}

export function getDifficultyLabel(
	difficulty: Difficulty | 'EASY' | 'MEDIUM' | 'HARD' | undefined,
	labels: { easy: string; medium: string; hard: string }
): string {
	switch (difficulty) {
		case Difficulty.EASY:
			return labels.easy
		case Difficulty.HARD:
			return labels.hard
		case Difficulty.MEDIUM:
		default:
			return labels.medium
	}
}

export interface IStage {
	id: string
	slug: string
	title: string
	subtitle?: string | null
	icon?: string | null
	coursesCount: number
	totalLessons: number
}

export interface IUserCourse {
	id: string
	slug: string
	title: string
	description: string
	progress: number
	totalXp: number
	completed: boolean
	stageTitle?: string
}

export interface ICourseDetail {
	id: string
	slug: string
	title: string
	description: string
	difficulty: Difficulty
	progress: number
	totalXp: number
	stage: IStage
	lessons: Array<{
		id: string
		title: string
		order: number
		tasksCount: number
		completed: boolean
	}>
	tests: Array<{
		score: number | null
		id: string
		title: string
		passingScore: number
		time: number | null
		lastAttemptDate: string | null
	}>
}

export interface ILessonBlock {
	id: string
	order: number
	type: 'THEORY'
	title?: string | null
	content: string
}

export interface ILesson {
	id: string
	courseTitle: string
	courseSlug: string
	order: number
	title: string
	estimatedDuration: number
	blocks: ILessonBlock[]
	tasks?: Array<ITask>
}

export type TaskType =
	| 'SINGLE_CHOICE'
	| 'MULTI_CHOICE'
	| 'TEXT_INPUT'
	| 'SHORT_ANSWER'
	| 'PHISHING_EMAIL'
	| 'PHISHING_SITE'

/** The simulated message a phishing task asks about, minus its red flags. */
export interface ISimulatedEmail {
	from: string
	displayName?: string
	subject: string
	body: string
}

export interface ISimulatedSite {
	url: string
	title?: string
	page: string
}

export interface ITask {
	id: string
	order: number
	type: TaskType
	title: string
	question: string
	points: number
	difficulty: 'EASY' | 'MEDIUM' | 'HARD'
	explanation?: string
	options: Array<ITaskOption>
	completed?: boolean
	started?: boolean
	/** Present only on PHISHING_EMAIL tasks. */
	email?: ISimulatedEmail
	/** Present only on PHISHING_SITE tasks. */
	site?: ISimulatedSite
}

export interface ITaskOption {
	id: string
	text: string
}

// ✅ New interface for a task answer response
export interface ITaskAnswerResponse {
	taskId: string
	isCorrect: boolean
	explanation?: string // ✅ Added
	awardedXp: number
	totalXp: number
	courseProgress: number
	lessonCompleted: boolean
	certificateIssued: boolean
	newAchievements?: Array<{
		id: string
		code: string
		title: string
		description: string
		icon: string
	}>

	/**
	 * Only on PHISHING_EMAIL / PHISHING_SITE. Revealed after the attempt — the
	 * spans and reasons are the answer key, so they are never sent with the
	 * lesson content itself.
	 */
	redFlagFeedback?: Array<{
		id: string
		span: string
		reason: string
		found: boolean
	}>
	falsePositives?: Array<{ location: string; text: string }>
}

export interface ITestQuestion {
	id: string
	order: number
	type: 'SINGLE_CHOICE' | 'MULTI_CHOICE' | 'TEXT_INPUT' | 'SHORT_ANSWER'
	text: string
	options?: Array<{
		id: string
		text: string
	}>
}

export interface ITest {
	id: string
	title: string
	description?: string
	courseTitle?: string
	courseSlug?: string
	passingScore: number
	totalPoints?: number
	questions: ITestQuestion[]
	course?: {
		id: string
		title: string
		slug?: string
	}
}

export interface ITestResult {
	testId: string
	score: number
	totalPoints: number
	passed: boolean
	correctAnswers: number
	totalQuestions: number
	certificateIssued?: boolean
	answers: Array<{
		questionId: string
		isCorrect: boolean
		selectedOptions?: string[]
		correctOptions?: string[]
		explanation?: string // ✅ Added for the test
	}>
}

export interface ITestAnswer {
	questionId: string
	selectedOptionIds?: string[]
	textAnswer?: string
}

export interface ICertificateListItem {
	id: string
	certificateNumber: string
	courseId: string
	courseTitle: string
	courseSlug?: string
	issuedAt: string
}

export interface ICertificate {
	id: string
	certificateNumber: string
	userId: string
	courseId: string
	issuedAt: string
	user: {
		id: string
		name: string
		email: string
	}
	course: {
		id: string
		title: string
		description: string
		difficulty: Difficulty
	}
}

export type AchievementCategory =
	| 'SKILL'
	| 'PRECISION'
	| 'MASTERY'
	| 'PERSISTENCE'
	| 'MILESTONE'
	| 'SECRET'

export type AchievementTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM'

export interface IAchievement {
	id: string
	code: string
	title: string
	description: string
	icon: string
	category: AchievementCategory
	tier: AchievementTier
	xpReward: number
	isSecret: boolean
	order: number
	createdAt: string
}

export interface IUserAchievement {
	id: string
	earnedAt: string
	achievement: {
		id: string
		code: string
		title: string
		description: string
		icon: string
		category: AchievementCategory
		tier: AchievementTier
		xpReward: number
	}
}
