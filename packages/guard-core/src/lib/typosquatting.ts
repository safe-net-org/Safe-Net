import { TOP_RU_BRANDS } from '../shared/brands'
import { levenshtein, transliterate } from '../shared/text'

export interface TyposquatResult {
	isTyposquat: boolean
	nearestBrand: string
	distance: number
}

function extractCoreDomain(hostname: string): string {
	const parts = hostname.replace(/^www\./, '').split('.')
	return parts.length >= 2 ? parts[parts.length - 2] : parts[0]
}

/**
 * Detects typosquatting against the brand list. The core label is phonetically
 * transliterated first (so a Cyrillic-spoofed `sbербank` compares as
 * `sberbank` against the Latin brand list). An exact match returns
 * `isTyposquat: false` — exact Cyrillic spoofs are handled separately by
 * the brand-impersonation detector.
 */
export function detectTyposquatting(hostname: string): TyposquatResult {
	const rawCore = extractCoreDomain(hostname).toLowerCase()
	const core = transliterate(rawCore).toLowerCase().replace(/[^a-z0-9]/g, '')

	let minDistance = Infinity
	let nearestBrand = ''

	for (const brand of TOP_RU_BRANDS) {
		if (core === brand) {
			return { isTyposquat: false, nearestBrand: brand, distance: 0 }
		}
		const dist = levenshtein(core, brand)
		if (dist < minDistance) {
			minDistance = dist
			nearestBrand = brand
		}
	}

	const threshold = nearestBrand.length <= 5 ? 1 : 2
	const isTyposquat = minDistance <= threshold && minDistance > 0 && core.length >= 4

	return { isTyposquat, nearestBrand, distance: minDistance }
}
