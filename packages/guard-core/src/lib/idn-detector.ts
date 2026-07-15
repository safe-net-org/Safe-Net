import {
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

	if (!cyr && !hasPunycode) {
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

	// Case 1 — mixed script within one label.
	const mixedLabel = labels.find(l => hasCyrillic(l) && hasLatin(l))
	if (mixedLabel) {
		const lookalike = visualNormalize(mixedLabel)
		const cyrChars = [...mixedLabel].filter(c => hasCyrillic(c))
		return {
			isHomograph: true,
			details: `Метка «${mixedLabel}» смешивает кириллицу (${cyrChars.join(' ')}) и латиницу — выглядит как «${lookalike}»`,
			hasCyrillic: true,
			hasPunycode,
			lookalike,
			mixedScript: true,
			scripts,
		}
	}

	// Case 2 — all-Cyrillic label that is a pure-Latin look-alike.
	for (const label of labels) {
		if (hasCyrillic(label) && !hasLatin(label)) {
			const norm = visualNormalize(label)
			if (norm !== label && /^[a-z0-9-]+$/.test(norm)) {
				return {
					isHomograph: true,
					details: `Домен «${label}» визуально читается как «${norm}», но набран кириллицей`,
					hasCyrillic: true,
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
