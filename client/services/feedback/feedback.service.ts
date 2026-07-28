import { axiosClassic, instance } from '@/api/axios'

export type FeedbackStatus = 'NEW' | 'REVIEWED' | 'ARCHIVED'

export interface PublicFeedback {
	id: string
	rating: number
	message: string
	createdAt: string
	authorName: string
}

export interface AdminFeedback {
	id: string
	rating: number
	message: string
	sourcePage?: string
	status: FeedbackStatus
	featured: boolean
	createdAt: string
	user: { id: string; name: string; email: string }
}

export interface AdminFeedbackPage {
	items: AdminFeedback[]
	total: number
	page: number
	totalPages: number
}

class FeedbackService {
	async create(data: { rating: number; message: string; sourcePage?: string }) {
		return (await instance.post('/feedback', data)).data as {
			id: string
			createdAt: string
		}
	}

	async getFeatured() {
		return (await axiosClassic.get('/public/feedback')).data as PublicFeedback[]
	}

	async getAdmin(params: {
		status?: FeedbackStatus
		rating?: number
		featured?: boolean
		search?: string
		page?: number
	}) {
		return (await instance.get('/admin/feedback', { params }))
			.data as AdminFeedbackPage
	}

	async updateAdmin(
		id: string,
		data: { status?: FeedbackStatus; featured?: boolean }
	) {
		return (await instance.patch(`/admin/feedback/${id}`, data))
			.data as AdminFeedback
	}
}

export const feedbackService = new FeedbackService()
