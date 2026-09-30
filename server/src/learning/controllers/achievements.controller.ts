import { Controller, Get, Param } from '@nestjs/common'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { CurrentUser } from 'src/auth/decorators/user.decorator'
import { AchievementsService } from '../services/achievements.service'
import { CurrentLocale, Locale } from '../../i18n/locale'

@Controller('learning/achievements')
@Auth()
export class AchievementsController {
	constructor(private readonly achievementsService: AchievementsService) {}

	@Get()
	async getUserAchievements(
		@CurrentUser('id') userId: string,
		@CurrentLocale() locale: Locale
	) {
		return this.achievementsService.getUserAchievements(userId, locale)
	}

	@Get('all')
	async getAllAchievements(@CurrentLocale() locale: Locale) {
		return this.achievementsService.getAllAchievements(locale)
	}

	@Get(':id')
	async getAchievementById(
		@Param('id') id: string,
		@CurrentLocale() locale: Locale
	) {
		return this.achievementsService.getAchievementById(id, locale)
	}
}
