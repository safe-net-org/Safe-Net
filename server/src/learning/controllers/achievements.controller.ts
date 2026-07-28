import { Controller, Get, Param, UseGuards } from '@nestjs/common'
import { CurrentUser } from 'src/auth/decorators/user.decorator'
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard'
import { AchievementsService } from '../services/achievements.service'
import { CurrentLocale, Locale } from '../../i18n/locale'

@Controller('learning/achievements')
@UseGuards(JwtAuthGuard)
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
