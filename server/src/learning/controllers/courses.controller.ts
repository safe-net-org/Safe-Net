import { Controller, Get, Param } from '@nestjs/common'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { CurrentUser } from 'src/auth/decorators/user.decorator'
import { TProtectUserData } from 'src/types/auth.types'
import { CoursesService } from '../services/courses.service'
import { CurrentLocale, Locale } from '../../i18n/locale'

@Auth()
@Controller('learning/courses')
export class CoursesController {
	constructor(private readonly coursesService: CoursesService) {}

	@Get('stage/:slug')
	async getCoursesByStage(
		@Param('slug') slug: string,
		@CurrentLocale() locale: Locale
	) {
		return this.coursesService.getCoursesByStage(slug, locale)
	}

	@Get(':slug')
	async getCourse(
		@Param('slug') slug: string,
		@CurrentUser() user: TProtectUserData,
		@CurrentLocale() locale: Locale
	) {
		return this.coursesService.getCourseBySlug(slug, user.id, locale)
	}
}
