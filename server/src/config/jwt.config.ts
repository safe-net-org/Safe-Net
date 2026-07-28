import { ConfigService } from '@nestjs/config'
import { JwtModuleOptions } from '@nestjs/jwt'
import {
	getRequiredJwtSecrets,
	JWT_AUDIENCE,
	JWT_ISSUER,
} from 'src/auth/jwt.constants'

export const getJwtConfig = async (
	configService: ConfigService
): Promise<JwtModuleOptions> => {
	const { access } = getRequiredJwtSecrets(configService)

	return {
		secret: access,
		signOptions: {
			issuer: JWT_ISSUER,
			audience: JWT_AUDIENCE,
		},
	}
}
