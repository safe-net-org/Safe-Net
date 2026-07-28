import { ConfigService } from '@nestjs/config'
import { getRequiredJwtSecrets } from './jwt.constants'

describe('getRequiredJwtSecrets', () => {
	it.each([
		['missing access secret', { JWT_REFRESH_SECRET: 'refresh' }],
		['missing refresh secret', { JWT_SECRET: 'access' }],
		[
			'identical access and refresh secrets',
			{ JWT_SECRET: 'same', JWT_REFRESH_SECRET: 'same' },
		],
	])('rejects %s', (_label, config) => {
		expect(() => getRequiredJwtSecrets(new ConfigService(config))).toThrow()
	})

	it('returns two explicitly configured distinct secrets', () => {
		expect(
			getRequiredJwtSecrets(
				new ConfigService({
					JWT_SECRET: 'access',
					JWT_REFRESH_SECRET: 'refresh',
				})
			)
		).toEqual({ access: 'access', refresh: 'refresh' })
	})
})
