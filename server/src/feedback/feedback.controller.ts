import { Body, Controller, HttpCode, Post } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { Role } from '@prisma/client'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { CurrentUser } from 'src/auth/decorators/user.decorator'
import { CreateFeedbackDto } from './dto/feedback.dto'
import { FeedbackService } from './feedback.service'

@Controller('feedback')
@Auth([Role.USER, Role.ADMIN])
export class FeedbackController {
	constructor(private readonly feedbackService: FeedbackService) {}

	@Post()
	@HttpCode(201)
	@Throttle({ default: { ttl: 60_000, limit: 5 } })
	create(
		@CurrentUser('id') userId: string,
		@Body() dto: CreateFeedbackDto
	) {
		return this.feedbackService.create(userId, dto)
	}
}
