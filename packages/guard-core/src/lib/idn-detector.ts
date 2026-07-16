import { CYRILLIC_TO_LATIN_MAP } from '../shared/brands'
import {
	hasConfusable,
	hasCyrillic,
	hasLatin,
	scriptsOf,
	visualNormalize,
} from '../shared/text'

export interface IdnResult {
	isHomograph: boolean
	details: string | null
	hasCyrillic: boolean
	hasPunycode: boolean
	lookalike: string | null
	mixedScript: boolean
	scripts: string[]
}

/**
 * Detects IDN homograph attacks on an already-Unicode host (the caller is
 * responsible for decoding punycode first via `punycodeToUnicode`).
 *
 * Two cases are flagged:
 *   1. Mixed-script inside a single label (Latin + Cyrillic) — e.g. `sberbаnk`.
 *   2. An all-Cyrillic label that is visually a pure-Latin string — e.g. a
 *      label made only of `а е о р с у х` look-alikes.
 */
export function detectIdnHomograph(
	unicodeHost: string,
	hasPunycode: boolean,
): IdnResult {
	const scripts = scriptsOf(unicodeHost)
	const cyr = hasCyrillic(unicodeHost)
	const confusable = hasConfusable(unicodeHost)

	if (!confusable && !hasPunycode) {
		return {
			isHomograph: false,
			details: null,
			hasCyrillic: false,
			hasPunycode: false,
			lookalike: null,
			mixedScript: false,
			scripts,
		}
	}

	const labels = unicodeHost.split('.')

	// Case 1 — a single label mixing real Latin with a confusable character
	// (Cyrillic, Greek, or fullwidth). This is the classic sberbаnk / paypαl.
	const mixedLabel = labels.find(l => hasConfusable(l) && hasLatin(l))
	if (mixedLabel) {
		const lookalike = visualNormalize(mixedLabel)
		const fakeChars = [...mixedLabel].filter(c => c in CYRILLIC_TO_LATIN_MAP)
		return {
			isHomograph: true,
			details: `Метка «${mixedLabel}» смешивает похожие символы (${fakeChars.join(' ')}) с латиницей — выглядит как «${lookalike}»`,
			hasCyrillic: cyr,
			hasPunycode,
			lookalike,
			mixedScript: true,
			scripts,
		}
	}

	// Case 2 — an all-confusable label that resolves to a pure-Latin look-alike.
	for (const label of labels) {
		if (hasConfusable(label) && !hasLatin(label)) {
			const norm = visualNormalize(label)
			if (norm !== label && /^[a-z0-9-]+$/.test(norm)) {
				return {
					isHomograph: true,
					details: `Домен «${label}» визуально читается как «${norm}», но набран похожими символами`,
					hasCyrillic: cyr,
					hasPunycode,
					lookalike: norm,
					mixedScript: false,
					scripts,
				}
			}
		}
	}

	return {
		isHomograph: false,
		details: null,
		hasCyrillic: cyr,
		hasPunycode,
		lookalike: null,
		mixedScript: false,
		scripts,
	}
}
