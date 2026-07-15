import { TOP_RU_BRANDS } from '../shared/brands'
import { hasCyrillic, transliterate } from '../shared/text'

export interface BrandImpersonationResult {
	brandImpersonation: boolean
	impersonatedBrand: string
	impersonationDetail: string | null
}

const BRAND_SET = new Set<string>(TOP_RU_BRANDS)

function toLatinCore(label: string): string {
	return transliterate(label).toLowerCase().replace(/[^a-z0-9]/g, '')
}

/**
 * Detects deliberate brand impersonation that the visual homoglyph detector
 * misses:
 *   1. An exact brand written in Cyrillic — `сбербанк` → `sberbank`.
 *   2. A real brand placed in a sub-domain while the registrable domain is
 *      something else — `sberbank.secure-login.ru`.
 */
export function detectBrandImpersonation(
	unicodeHost: string,
): BrandImpersonationResult {
	const labels = unicodeHost.replace(/^www\./, '').split('.')
	const sld = labels.length >= 2 ? labels[labels.length - 2] : labels[0]
	const tld = labels.length >= 2 ? labels[labels.length - 1] : ''

	// Case 1 — exact brand spelled with Cyrillic letters.
	if (hasCyrillic(sld)) {
		const latinCore = toLatinCore(sld)
		if (BRAND_SET.has(latinCore)) {
			return {
				brandImpersonation: true,
				impersonatedBrand: latinCore,
				impersonationDetail: `Домен «${sld}» кириллицей читается как «${latinCore}» — подмена бренда`,
			}
		}
	}

	// Case 2 — brand used as a sub-domain, real domain is elsewhere.
	//
	// Skipped when the registrable domain is itself a known brand: `mail` is on
	// the list (for mail.ru), which made `mail.google.com` — one of the most
	// visited sites in the world — score 88/danger. A brand under a brand is
	// that brand's own subdomain (mail.google.com, login.microsoft.com), not
	// impersonation. The rule only holds when the real domain is a stranger.
	if (labels.length >= 3 && !BRAND_SET.has(toLatinCore(sld))) {
		for (const lbl of labels.slice(0, -2)) {
			const core = toLatinCore(lbl)
			if (BRAND_SET.has(core)) {
				return {
					brandImpersonation: true,
					impersonatedBrand: core,
					impersonationDetail: `Бренд «${core}» в поддомене, реальный домен — «${sld}.${tld}»`,
				}
			}
		}
	}

	return {
		brandImpersonation: false,
		impersonatedBrand: '',
		impersonationDetail: null,
	}
}
