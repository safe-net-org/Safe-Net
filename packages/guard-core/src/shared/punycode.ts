/**
 * Minimal RFC 3492 punycode decoder.
 *
 * The browser hands us IDN hostnames in ASCII (`сбербанк.рф` → `xn--…`), which
 * hides the Cyrillic homoglyphs we specifically need to detect. This decodes
 * each `xn--` label back to Unicode so the homoglyph / transliteration logic
 * can run on the real characters. Encoding is intentionally omitted — we only
 * ever need to go ASCII → Unicode here.
 */

const BASE = 36
const TMIN = 1
const TMAX = 26
const SKEW = 38
const DAMP = 700
const INITIAL_BIAS = 72
const INITIAL_N = 128

function basicToDigit(codePoint: number): number {
	if (codePoint - 48 < 10) return codePoint - 22 // '0'-'9' → 26..35
	if (codePoint - 65 < 26) return codePoint - 65 // 'A'-'Z' → 0..25
	if (codePoint - 97 < 26) return codePoint - 97 // 'a'-'z' → 0..25
	return BASE
}

function adapt(delta: number, numPoints: number, firstTime: boolean): number {
	let d = firstTime ? Math.floor(delta / DAMP) : delta >> 1
	d += Math.floor(d / numPoints)
	let k = 0
	while (d > ((BASE - TMIN) * TMAX) >> 1) {
		d = Math.floor(d / (BASE - TMIN))
		k += BASE
	}
	return k + Math.floor(((BASE - TMIN + 1) * d) / (d + SKEW))
}

function decodeLabel(input: string): string {
	const output: number[] = []
	let n = INITIAL_N
	let i = 0
	let bias = INITIAL_BIAS

	const lastDelim = input.lastIndexOf('-')
	const basicEnd = lastDelim < 0 ? 0 : lastDelim
	for (let j = 0; j < basicEnd; j++) {
		const cp = input.charCodeAt(j)
		if (cp >= 0x80) throw new Error('punycode: non-basic code point')
		output.push(cp)
	}

	let index = basicEnd > 0 ? basicEnd + 1 : 0
	while (index < input.length) {
		const oldi = i
		let w = 1
		for (let k = BASE; ; k += BASE) {
			if (index >= input.length) throw new Error('punycode: bad input')
			const digit = basicToDigit(input.charCodeAt(index++))
			if (digit >= BASE) throw new Error('punycode: bad digit')
			i += digit * w
			const t = k <= bias ? TMIN : k >= bias + TMAX ? TMAX : k - bias
			if (digit < t) break
			w *= BASE - t
		}
		const outLen = output.length + 1
		bias = adapt(i - oldi, outLen, oldi === 0)
		n += Math.floor(i / outLen)
		i %= outLen
		output.splice(i, 0, n)
		i++
	}

	return String.fromCodePoint(...output)
}

/**
 * Decodes every `xn--` label in a host back to Unicode. Labels that fail to
 * decode are left untouched so the function never throws on real-world input.
 */
export function punycodeToUnicode(host: string): string {
	return host
		.split('.')
		.map(label => {
			if (!/^xn--/i.test(label)) return label
			try {
				return decodeLabel(label.slice(4))
			} catch {
				return label
			}
		})
		.join('.')
}
