import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common'
import { Role } from '@prisma/client'
import { Auth } from 'src/auth/decorators/auth.decorator'
import {
	AdminFeedbackQueryDto,
	UpdateFeedbackDto,
} from './dto/feedback.dto'
import { FeedbackService } from './feedback.service'

@Controller('admin/feedback')
@Auth(Role.ADMIN)
export class AdminFeedbackController {
	constructor(private readonly feedbackService: FeedbackService) {}

	@Get()
	list(@Query() query: AdminFeedbackQueryDto) {
		return this.feedbackService.listForAdmin(query)
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() dto: UpdateFeedbackDto) {
		return this.feedbackService.update(id, dto)
	}
}
