/**
 * Script / transliteration helpers shared by the IDN, typosquat and
 * brand-impersonation detectors.
 */

import { CYRILLIC_TO_LATIN_MAP, CYRILLIC_TRANSLIT } from './brands'

const CYRILLIC_RE = /[Ѐ-ӿԀ-ԯ]/
const LATIN_RE = /[a-z]/i
const GREEK_RE = /[Ͱ-Ͽ]/

export function hasCyrillic(text: string): boolean {
	return CYRILLIC_RE.test(text)
}

export function hasLatin(text: string): boolean {
	return LATIN_RE.test(text)
}

/** Distinct alphabets present in the string (e.g. ['latin', 'cyrillic']). */
export function scriptsOf(text: string): string[] {
	const set = new Set<string>()
	for (const ch of text) {
		if (LATIN_RE.test(ch)) set.add('latin')
		else if (CYRILLIC_RE.test(ch)) set.add('cyrillic')
		else if (GREEK_RE.test(ch)) set.add('greek')
	}
	return [...set]
}

/** Phonetic Cyrillic → Latin (сбербанк → sberbank). For brand matching. */
export function transliterate(text: string): string {
	let out = ''
	for (const ch of text) out += CYRILLIC_TRANSLIT[ch] ?? ch
	return out
}

/** Visual look-alike normalization (Cyrillic homoglyph → Latin). For display. */
export function visualNormalize(text: string): string {
	let out = ''
	for (const ch of text) out += CYRILLIC_TO_LATIN_MAP[ch] ?? ch
	return out
}

/** Classic Levenshtein edit distance. */
export function levenshtein(a: string, b: string): number {
	const m = a.length
	const n = b.length
	if (m === 0) return n
	if (n === 0) return m
	const prev = Array.from({ length: n + 1 }, (_, i) => i)
	for (let i = 1; i <= m; i++) {
		let diag = prev[0]
		prev[0] = i
		for (let j = 1; j <= n; j++) {
			const tmp = prev[j]
			const cost = a[i - 1] === b[j - 1] ? 0 : 1
			prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + cost)
			diag = tmp
		}
	}
	return prev[n]
}
