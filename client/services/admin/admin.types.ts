import { UserRole } from '@/services/auth/auth.types'

export enum UserStatus {
	ACTIVE = 'ACTIVE',
	BLOCKED = 'BLOCKED',
}

/**
 * A const object plus a union type rather than a TS enum: values arriving from
 * forms and the API are plain strings, and a string literal is not assignable
 * to an enum member. `Difficulty.EASY` still works for callers that want it.
 */
export const Difficulty = {
	EASY: 'EASY',
	MEDIUM: 'MEDIUM',
	HARD: 'HARD',
} as const

export type Difficulty = (typeof Difficulty)[keyof typeof Difficulty]

export enum TaskType {
	SINGLE_CHOICE = 'SINGLE_CHOICE',
	MULTI_CHOICE = 'MULTI_CHOICE',
	SHORT_ANSWER = 'SHORT_ANSWER',
	PHISHING_EMAIL = 'PHISHING_EMAIL',
	PHISHING_SITE = 'PHISHING_SITE',
	TEXT_INPUT = 'TEXT_INPUT',
}

export enum BlockType {
	THEORY = 'THEORY',
}

export enum ActivityType {
	USER_REGISTERED = 'USER_REGISTERED',
	COURSE_COMPLETED = 'COURSE_COMPLETED',
	LESSON_COMPLETED = 'LESSON_COMPLETED',
	TEST_PASSED = 'TEST_PASSED',
	CERTIFICATE_ISSUED = 'CERTIFICATE_ISSUED',
	ACHIEVEMENT_UNLOCKED = 'ACHIEVEMENT_UNLOCKED',
}

// ✅ EXTENDED Stats Overview with chart data
export interface IAdminStats {
	users: {
		total: number
		active: number
		blocked: number
		admins: number
	}
	content: {
		courses: number
		lessons: number
		tasks: number
		tests: number
	}
	performance: {
		totalAttempts: number
		correctAttempts: number
		averageCorrectPercent: number
		certificates: number
	}
	registrations: {
		today: number
		week: number
		month: number
		data: { date: string; count: number }[] // For the line chart
	}
	topCourses: {
		id: string
		title: string
		enrolledUsers: number
		completionRate: number
		avgScore: number
	}[]
	recentActivity: {
		id: string
		type: ActivityType
		userName: string
		userEmail: string
		description: string
		timestamp: string
		metadata?: Record<string, any>
	}[]
	userGrowth: {
		period: string // "2024-01", "2024-02"
		total: number
		active: number
		new: number
	}[]
	courseStats: {
		difficulty: Difficulty
		count: number
		percentage: number
	}[]
}

// Users
export interface IUserListItem {
	id: string
	name: string
	email: string
	status: UserStatus
	rights: UserRole[]
	createdAt: string
	updatedAt?: string
	lastActive?: string
	stats?: {
		coursesCompleted: number
		totalXP: number
		achievements: number
	}
}

// ✅ FIXED: data structure from the server
export interface IUserDetail {
	id: string
	email: string
	name: string
	rights: UserRole[]
	status: UserStatus
	createdAt: string
	updatedAt: string
	statistics: {
		totalCourses: number
		completedCourses: number
		inProgressCourses: number
		totalLessons: number
		achievements: number
		certificates: number
		averageTestScore: number
		totalTests: number
	}
	courses: IUserDetailCourse[]
	recentActivity: IUserRecentActivity[]
	achievements: IUserAchievement[]
	certificates: IUserDetailCertificate[]
	testResults: IUserDetailTestResult[]
}

// ✅ NEW: Course in the user detail info
export interface IUserDetailCourse {
	id: string
	title: string
	description: string
	progress: number
	totalXp: number
	updatedAt: string
}

// ✅ NEW: User activity (actual structure from the server)
export interface IUserRecentActivity {
	type: 'lesson' | 'test' | 'course'
	title: string
	course: string
	score?: number
	date: string
}

// ✅ NEW: Certificate in the detail info
export interface IUserDetailCertificate {
	id: string
	courseId: string
	courseTitle: string
	issuedAt: string
	certificateNumber: string
}

// ✅ NEW: Test result in the detail info
export interface IUserDetailTestResult {
	id: string
	testId: string
	testTitle: string
	courseTitle: string
	score: number
	totalQuestions: number
	correctAnswers: number
	passed: boolean
	/** Seconds taken. Returned by the API; the type was simply missing it. */
	time: number
	completedAt: string
}

// ✅ KEPT for backward compatibility (legacy interfaces)
export interface IUserCourse {
	id: string
	title: string
	slug: string
	progress: number
	xp: number
	startedAt: string
	completedAt?: string
}

export interface IUserActivity {
	id: string
	type: ActivityType
	description: string
	timestamp: string
	metadata?: Record<string, any>
}

export interface IUserAchievement {
	id: string
	title: string
	description: string
	icon: string
	/** The API returns `earnedAt`; this was typed as a `unlockedAt` field that
	 * no endpoint has ever sent. */
	earnedAt: string
}

export interface IUserCertificate {
	id: string
	certificateNumber: string
	courseTitle: string
	courseSlug: string
	issuedAt: string
	downloadUrl?: string
}

export interface IUserTestResult {
	id: string
	testId: string
	testTitle: string
	score: number
	maxScore: number
	percentage: number
	passed: boolean
	completedAt: string
}

export interface UpdateUserDto {
	email?: string
	name?: string
	status?: UserStatus
	rights?: UserRole[]
}

// Content
export interface IStageWithCourses {
	id: string
	order: number
	slug: string
	title: string
	subtitle?: string
	icon?: string
	courses: ICourse[]
}

export interface ICourse {
	id: string
	stageId: string
	slug: string
	title: string
	description: string
	difficulty?: Difficulty
	lessons: ILesson[]
	tests?: ITest[]
}

export interface ILesson {
	id: string
	courseId: string
	order: number
	title: string
	estimatedDuration?: number
	blocks?: IBlock[]
	tasks?: ITask[]
}

export interface IBlock {
	id: string
	lessonId: string
	order: number
	type: BlockType
	title?: string
	content: string
}

export interface ITask {
	id: string
	lessonId: string
	order: number
	type: TaskType
	title: string
	question?: string
	explanation?: string
	points?: number
	difficulty?: Difficulty
	meta?: Record<string, any>
	options?: ITaskOption[]
}

export interface ITaskOption {
	id?: string
	text: string
	isCorrect: boolean
}

export interface ITest {
	id: string
	title: string
	description?: string
	courseId?: string
	/** Included by both admin test endpoints via `include: { course }`. */
	course?: { id?: string; title: string; slug?: string }
	passingScore: number
	questions?: ITestQuestion[]
}

export interface ITestQuestion {
	id: string
	testId: string
	order: number
	text: string
	type: TaskType
	options?: ITaskOption[]
}

// DTOs
export interface CreateStageDto {
	order: number
	slug: string
	title: string
	subtitle?: string
	icon?: string
}

export interface CreateCourseDto {
	stageId: string
	slug: string
	title: string
	description: string
	difficulty?: Difficulty
}

export interface CreateLessonDto {
	courseId: string
	order: number
	title: string
	estimatedDuration?: number
}

export interface CreateBlockDto {
	lessonId: string
	order: number
	type: BlockType
	title?: string
	content: string
}

export interface CreateTaskDto {
	lessonId: string
	order: number
	type: TaskType
	title: string
	question?: string
	explanation?: string
	points?: number
	difficulty?: Difficulty
	meta?: Record<string, any>
	options?: Omit<ITaskOption, 'id'>[]
}

export interface CreateTestDto {
	title: string
	description?: string
	courseId?: string
}

export interface CreateTestQuestionDto {
	testId: string
	order: number
	text: string
	type: TaskType
	options?: Omit<ITaskOption, 'id'>[]
}

export interface IAuthResponse {
	accessToken: string
	user: IUser
}

export interface IUser {
	id: string
	email: string
	name: string
	rights: UserRole[]
	isAdmin: boolean
}
