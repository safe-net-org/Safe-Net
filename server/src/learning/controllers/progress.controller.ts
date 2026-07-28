import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { CurrentUser } from 'src/auth/decorators/user.decorator'
import { TProtectUserData } from 'src/types/auth.types'
import { AnswerTaskDto } from '../dto/answer-task.dto'
import { ProgressService } from '../services/progress.service'
import { CurrentLocale, Locale } from '../../i18n/locale'

@Auth()
@Controller('learning')
export class ProgressController {
	constructor(private readonly progressService: ProgressService) {}

	@Get('lessons/:id')
	async getLesson(
		@Param('id') id: string,
		@CurrentUser() user: TProtectUserData,
		@CurrentLocale() locale: Locale
	) {
		return this.progressService.getLessonWithTasks(id, user.id, locale)
	}

	@HttpCode(200)
	@Post('tasks/:id/answer')
	async answerTask(
		@Param('id') id: string,
		@Body() dto: AnswerTaskDto,
		@CurrentUser() user: TProtectUserData,
		@CurrentLocale() locale: Locale
	) {
		return this.progressService.answerTask(id, user.id, dto, locale)
	}
}
