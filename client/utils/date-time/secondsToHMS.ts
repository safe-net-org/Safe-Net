import type { Locale } from '@/i18n/messages'

const UNITS: Record<Locale, { h: string; m: string; s: string; invalid: string }> = {
	en: { h: 'h', m: 'm', s: 's', invalid: 'Invalid time' },
	ru: { h: 'ч', m: 'мин', s: 'с', invalid: 'Неверное время' },
}

export function secondsToHMS(seconds: number, locale: Locale = 'en'): string {
	const unit = UNITS[locale]
	if (isNaN(seconds)) {
		return unit.invalid
	}

	const hours = Math.floor(seconds / 3600)
	const minutes = Math.floor((seconds % 3600) / 60)
	const remainingSeconds = seconds % 60

	if (hours > 0) {
		return `${hours}${unit.h} ${minutes.toString().padStart(2, '0')}${unit.m} ${remainingSeconds.toString().padStart(2, '0')}${unit.s}`
	} else if (minutes > 0) {
		return `${minutes}${unit.m} ${remainingSeconds.toString().padStart(2, '0')}${unit.s}`
	} else {
		return `${remainingSeconds}${unit.s}`
	}
}
