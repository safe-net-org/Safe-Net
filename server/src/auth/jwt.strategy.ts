import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { UserStatus } from '@prisma/client'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { UserService } from 'src/user/services/user.service'
import {
	AuthTokenPayload,
	getRequiredJwtSecrets,
	JWT_AUDIENCE,
	JWT_ISSUER,
	JWT_TOKEN_TYPE,
} from './jwt.constants'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		configService: ConfigService,
		private readonly userService: UserService
	) {
		const { access } = getRequiredJwtSecrets(configService)

		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: access,
			issuer: JWT_ISSUER,
			audience: JWT_AUDIENCE,
			algorithms: ['HS256'],
		})
	}

	async validate(payload: AuthTokenPayload | null) {
		if (
			!payload ||
			payload.type !== JWT_TOKEN_TYPE.ACCESS ||
			typeof payload.id !== 'string' ||
			!payload.id
		) {
			throw new UnauthorizedException('Invalid access token')
		}

		const user = await this.userService.getById(payload.id)
		if (!user || user.status === UserStatus.BLOCKED) {
			throw new UnauthorizedException('Invalid access token')
		}

		const { password: _password, ...safeUser } = user
		return safeUser
	}
}
