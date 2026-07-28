import { Controller, Get } from '@nestjs/common'
import { PublicService, PublicStatsResponse } from './public.service'

@Controller('public')
export class PublicController {
	constructor(private readonly publicService: PublicService) {}

	@Get('stats')
	async getPublicStats(): Promise<PublicStatsResponse> {
		return this.publicService.getStats()
	}

	@Get('feedback')
	async getFeaturedFeedback() {
		return this.publicService.getFeaturedFeedback()
	}
}
