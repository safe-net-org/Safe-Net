import { FeedbackStatus } from '@prisma/client'
import { FeedbackService } from './feedback.service'

describe('FeedbackService', () => {
	const prisma = {
		feedback: {
			create: jest.fn(),
			findUnique: jest.fn(),
			update: jest.fn(),
		},
	}
	const service = new FeedbackService(prisma as never)

	beforeEach(() => jest.clearAllMocks())

	it('stores a private new feedback item for the authenticated user', async () => {
		prisma.feedback.create.mockResolvedValue({ id: 'feedback-1' })

		await service.create('user-1', {
			rating: 5,
			message: '  A genuinely useful course.  ',
			sourcePage: '/dashboard/courses',
		})

		expect(prisma.feedback.create).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({
					userId: 'user-1',
					rating: 5,
					message: 'A genuinely useful course.',
				}),
			})
		)
	})

	it('marks featured feedback as reviewed automatically', async () => {
		prisma.feedback.findUnique.mockResolvedValue({
			id: 'feedback-1',
			reviewedAt: null,
		})
		prisma.feedback.update.mockResolvedValue({ id: 'feedback-1' })

		await service.update('feedback-1', { featured: true })

		expect(prisma.feedback.update).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({
					status: FeedbackStatus.REVIEWED,
					featured: true,
					reviewedAt: expect.any(Date),
				}),
			})
		)
	})

	it('removes archived feedback from the landing selection', async () => {
		prisma.feedback.findUnique.mockResolvedValue({
			id: 'feedback-1',
			reviewedAt: new Date(),
		})
		prisma.feedback.update.mockResolvedValue({ id: 'feedback-1' })

		await service.update('feedback-1', { status: FeedbackStatus.ARCHIVED })

		expect(prisma.feedback.update).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({
					status: FeedbackStatus.ARCHIVED,
					featured: false,
				}),
			})
		)
	})
})
