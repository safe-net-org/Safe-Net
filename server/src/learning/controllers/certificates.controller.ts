import { Controller, Get, Param } from '@nestjs/common'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { CurrentUser } from 'src/auth/decorators/user.decorator'
import { CertificatesService } from '../services/certificates.service'
import { CurrentLocale, Locale } from '../../i18n/locale'

@Controller('learning/certificates')
@Auth()
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
