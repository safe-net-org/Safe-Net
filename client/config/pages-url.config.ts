interface DashboardPages {
	readonly HOME: string
	readonly COURSES: string
	readonly TESTS: string
	readonly CERTIFICATES: string
	readonly ACHIEVEMENTS: string
	readonly ADMIN: {
		readonly ROOT: string
		readonly USERS: string
		readonly FEEDBACK: string
		readonly LEARNING: {
			readonly COURSES: string
			readonly LESSONS: string
			readonly TESTS: string
		}
		readonly STATS: string
	}
}

class Dashboard implements DashboardPages {
	private readonly root = '/dashboard'

	readonly HOME = this.root
	readonly COURSES = `${this.root}/courses`
	readonly TESTS = `${this.root}/tests`
	readonly CERTIFICATES = `${this.root}/certificates`
	readonly ACHIEVEMENTS = `${this.root}/achievements`

	readonly ADMIN = {
		ROOT: `${this.root}/admin`,
		USERS: `${this.root}/admin/users`,
		FEEDBACK: `${this.root}/admin/feedback`,
		LEARNING: {
			COURSES: `${this.root}/admin/learning/courses`,
			LESSONS: `${this.root}/admin/learning/lessons`,
			TESTS: `${this.root}/admin/learning/tests`,
		},
		STATS: `${this.root}/admin/stats/overview`,
	} as const

	constructor() {
		Object.freeze(this.ADMIN)
	}
}

export const ROUTES = new Dashboard()
