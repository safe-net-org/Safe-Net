import { instance } from '@/api/axios'
import {
    IAchievement,
    ICertificate,
    ICertificateListItem,
    ICourseDetail,
    ILesson,
    IStage,
    ITaskAnswerResponse, // ✅ New type import
    ITest,
    ITestResult,
    IUserAchievement,
    IUserCourse,
} from './learning.types'

class LearningService {
	async getStages(): Promise<IStage[]> {
		const { data } = await instance.get('/learning/stages')
		return data
	}

	async getMyCourses(): Promise<IUserCourse[]> {
		const { data } = await instance.get('/user/courses')
		return data
	}

	async getUserCourses(): Promise<IUserCourse[]> {
		const { data } = await instance.get('/user/courses')
		return data
	}

	async getCompletedCourses(): Promise<IUserCourse[]> {
		const { data } = await instance.get('/user/courses/completed')
		return data
	}

	async getCourseDetail(slug: string): Promise<ICourseDetail> {
		const { data } = await instance.get(`/learning/courses/${slug}`)
		return data
	}

	async getLessonDetail(id: string): Promise<ILesson> {
		const { data } = await instance.get(`/learning/lessons/${id}`)
		return data
	}

	// ✅ Updated return type
	async answerTask(
		taskId: string,
		payload: {
			selectedOptionIds: string[]
			textAnswer?: string
			selectedSpans?: { location: string; text: string }[]
		}
	): Promise<ITaskAnswerResponse> {
		const { data } = await instance.post(
			`/learning/tasks/${taskId}/answer`,
			payload
		)
		return data
	}

	async getTestDetail(id: string): Promise<ITest> {
		const { data } = await instance.get(`/learning/tests/${id}`)
		return data
	}

	async submitTest(
		testId: string,
		answers: Array<{
			questionId: string
			selectedOptionIds?: string[]
			textAnswer?: string
		}>,
		time: number
	): Promise<ITestResult> {
		const { data } = await instance.post(`/learning/tests/${testId}/submit`, {
			answers,
			time,
		})
		return data
	}

	async getCertificate(id: string): Promise<ICertificate> {
		const { data } = await instance.get(`/learning/certificates/${id}`)
		return data
	}

	async getUserCertificates(): Promise<ICertificateListItem[]> {
		const { data } = await instance.get('/learning/certificates')
		return data
	}

	async getUserAchievements(): Promise<IUserAchievement[]> {
		const { data } = await instance.get('/learning/achievements')
		return data
	}

	async getAllAchievements(): Promise<IAchievement[]> {
		const { data } = await instance.get('/learning/achievements/all')
		return data
	}

	async getAchievementById(id: string): Promise<IAchievement> {
		const { data } = await instance.get(`/learning/achievements/${id}`)
		return data
	}
}

export const learningService = new LearningService()
export * from './learning.types'
