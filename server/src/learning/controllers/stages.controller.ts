import { Controller, Get } from '@nestjs/common'
import { StagesService } from '../services/stages.service'
import { CurrentLocale, Locale } from '../../i18n/locale'
@Controller('learning/stages')
export class StagesController {
	constructor(private readonly stagesService: StagesService) {}
	@Get()
	async getStages(@CurrentLocale() locale: Locale) {
		return this.stagesService.getStagesWithStats(locale)
	}
}
