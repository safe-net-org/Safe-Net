import { cookies, headers } from 'next/headers'

import { LOCALE_COOKIE, LOCALES, messages, type Locale, type Messages } from './messages'

function parseAcceptLanguage(header: string | null): Locale {
	const first = header?.split(',')[0]?.trim().slice(0, 2).toLowerCase()
	return first === 'ru' ? 'ru' : 'en'
}

/** The locale to render on the server: cookie set by a prior client choice, else the browser's Accept-Language. */
export async function getServerLocale(): Promise<Locale> {
	const cookieStore = await cookies()
	const fromCookie = cookieStore.get(LOCALE_COOKIE)?.value
	if (fromCookie && (LOCALES as string[]).includes(fromCookie)) {
		return fromCookie as Locale
	}
	const headerList = await headers()
	return parseAcceptLanguage(headerList.get('accept-language'))
}

export async function getServerMessages(): Promise<{ locale: Locale; t: Messages }> {
	const locale = await getServerLocale()
	return { locale, t: messages[locale] }
}
