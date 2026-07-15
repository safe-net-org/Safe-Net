import { describe, expect, it } from 'bun:test'
import { analyzeUrl, scoreUrl } from './index'

/**
 * The engine is graded on two axes, and both matter equally.
 *
 * Catching phishing is the obvious one. Not crying wolf is the other: a
 * detector that flags mail.google.com gets uninstalled within a day, and then
 * it protects nobody. These suites lock in both.
 */
const DANGER_THRESHOLD = 70
const WARN_THRESHOLD = 40

function score(url: string): number {
	return scoreUrl(url, analyzeUrl(url)).score
}

function signalsOf(url: string): string[] {
	return scoreUrl(url, analyzeUrl(url)).signals.map(s => s.key)
}

describe('phishing is caught', () => {
	// The Cyrillic 'а' homograph — the attack the whole project opens with.
	it('flags an IDN homograph', () => {
		expect(score('https://sberbа nk.ru/login'.replace(' ', ''))).toBeGreaterThanOrEqual(
			DANGER_THRESHOLD
		)
	})

	it('flags typosquatting', () => {
		expect(score('https://tinkkoff.ru')).toBeGreaterThanOrEqual(DANGER_THRESHOLD)
	})

	it('flags leet-squatting', () => {
		expect(score('https://sb3rbank.ru')).toBeGreaterThanOrEqual(DANGER_THRESHOLD)
	})

	// Regression: `paypal` was absent from the brand list, so the exact domain
	// the courses teach as phishing scored 8/100 "safe".
	it('flags paypa1.com — the example the courses teach', () => {
		expect(score('https://paypa1.com')).toBeGreaterThanOrEqual(DANGER_THRESHOLD)
	})

	// Regression: leet and a suffix used to cancel out. detectBrandToken did not
	// de-leet its tokens, and detectLeetSquat's edit-distance threshold rejected
	// the suffix — each assumed the other would catch it, so it scored 0.
	it('flags micros0ft-alerts.com — leet brand plus a suffix', () => {
		expect(score('https://micros0ft-alerts.com')).toBeGreaterThanOrEqual(
			DANGER_THRESHOLD
		)
		expect(signalsOf('https://micros0ft-alerts.com')).toContain('brand_token_leet')
	})

	// The exact pattern lesson 03-dangerous-links/01-url-analysis teaches:
	// read the registrable domain right to left.
	it('flags a brand buried in a subdomain', () => {
		expect(
			score('https://sberbank.com.verify-account.info/login')
		).toBeGreaterThanOrEqual(DANGER_THRESHOLD)
		expect(score('https://google.com.secure-login.net')).toBeGreaterThanOrEqual(
			DANGER_THRESHOLD
		)
	})
})

describe('legitimate sites are left alone', () => {
	// Regression: `mail` is on the brand list for mail.ru, which made every
	// mail.* subdomain look like brand impersonation. Gmail scored 88/danger.
	it('does not flag a brand subdomain of that same brand', () => {
		expect(score('https://mail.google.com')).toBeLessThan(WARN_THRESHOLD)
		expect(score('https://accounts.google.com')).toBeLessThan(WARN_THRESHOLD)
		expect(score('https://drive.google.com')).toBeLessThan(WARN_THRESHOLD)
	})

	it.each([
		'https://sberbank.ru',
		'https://mail.ru',
		'https://ozon.ru',
		'https://github.com',
		'https://www.apple.com',
		'https://www.microsoft.com',
		'https://web.telegram.org',
		'https://en.wikipedia.org/wiki/Phishing',
		'https://developer.mozilla.org',
	])('does not flag %s', url => {
		expect(score(url)).toBeLessThan(WARN_THRESHOLD)
	})
})

describe('scoring contract', () => {
	it('always returns a score within 0-100', () => {
		for (const url of [
			'https://sberbа nk.ru'.replace(' ', ''),
			'https://a.com',
			'https://sberbank.com.verify-account.info/login',
		]) {
			const result = scoreUrl(url, analyzeUrl(url))
			expect(result.score).toBeGreaterThanOrEqual(0)
			expect(result.score).toBeLessThanOrEqual(100)
		}
	})

	it('agrees with its own level thresholds', () => {
		for (const url of ['https://paypa1.com', 'https://github.com']) {
			const result = scoreUrl(url, analyzeUrl(url))
			const expected =
				result.score >= DANGER_THRESHOLD
					? 'danger'
					: result.score >= WARN_THRESHOLD
						? 'suspicious'
						: 'safe'
			expect(result.level).toBe(expected)
		}
	})

	it('does not throw on malformed input', () => {
		for (const url of ['', 'not a url', 'javascript:alert(1)', 'http://']) {
			expect(() => scoreUrl(url, analyzeUrl(url))).not.toThrow()
		}
	})
})
