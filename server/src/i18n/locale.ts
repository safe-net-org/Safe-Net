import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import type { Request } from 'express'

export type Locale = 'en' | 'ru'

/**
 * The client sends its chosen locale as `Accept-Language` (set by the same
 * axios instance that talks to this API — see client/api/axios.ts). Falls
 * back to English for any value that isn't exactly "ru" first, matching the
 * client's own `getServerLocale()` parsing in i18n/server.ts so a user never
 * sees the two disagree.
 */
function parseLocale(header: string | undefined): Locale {
	const first = header?.split(',')[0]?.trim().slice(0, 2).toLowerCase()
	return first === 'ru' ? 'ru' : 'en'
}

export const CurrentLocale = createParamDecorator((_: unknown, ctx: ExecutionContext): Locale => {
	const request = ctx.switchToHttp().getRequest<Request>()
	return parseLocale(request.headers['accept-language'])
})

/**
 * Returns the Russian value when the request is in Russian and a translation
 * exists, otherwise the English original. Content translation rolls out
 * per-item (see prisma/schema.prisma's `*Ru` columns), so a null/missing `ru`
 * value is expected, not an error — it just means that item shows English a
 * little longer.
 */
export function pickLocalized<T>(locale: Locale, en: T, ru: T | null | undefined): T {
	if (locale !== 'ru') return en
	return ru ?? en
}
