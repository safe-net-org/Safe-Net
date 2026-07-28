import { Controller, Get, Param, UseGuards } from '@nestjs/common'
import { CurrentUser } from 'src/auth/decorators/user.decorator'
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard'
import { CertificatesService } from '../services/certificates.service'
import { CurrentLocale, Locale } from '../../i18n/locale'

@Controller('learning/certificates')
@UseGuards(JwtAuthGuard)
export class CertificatesController {
	constructor(private readonly certificatesService: CertificatesService) {}

	@Get(':id')
	async getCertificate(
		@Param('id') id: string,
		@CurrentUser('id') userId: string,
		@CurrentUser('rights') userRights: string[],
		@CurrentLocale() locale: Locale
	) {
		return this.certificatesService.getCertificateById(id, userId, userRights, locale)
	}

	@Get()
	async getUserCertificates(
		@CurrentUser('id') userId: string,
		@CurrentLocale() locale: Locale
	) {
		return this.certificatesService.getUserCertificates(userId, locale)
	}
}
