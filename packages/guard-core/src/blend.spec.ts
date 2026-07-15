import { describe, expect, it } from 'bun:test'
import { analyzeUrl, blendWithMl, scoreUrl } from './index'

/**
 * These mirror ml-service/scripts/test_scoring.py. The blend must reach the
 * same verdict in TypeScript (extension) and Python (service) from the same
 * inputs — that is the whole point of it being one function.
 */
function local(url: string) {
	return scoreUrl(url, analyzeUrl(url))
}

describe('blendWithMl', () => {
	it('lets rules override a nervous net on a known brand', () => {
		// BERT screams phishing at Gmail; the rules recognise the brand and win.
		const result = blendWithMl(local('https://mail.google.com'), 0.98)
		expect(result.level).toBe('safe')
		expect(result.score).toBeLessThanOrEqual(20)
		expect(result.method).toBe('rule-override')
	})

	it('does the same for a plain known brand', () => {
		expect(blendWithMl(local('https://ozon.ru'), 0.99).level).toBe('safe')
		expect(blendWithMl(local('https://github.com'), 0.9).level).toBe('safe')
	})

	it('never lets the net argue a homograph down', () => {
		const result = blendWithMl(local('https://sberbа nk.ru/login'.replace(' ', '')), 0.0)
		expect(result.level).toBe('danger')
		expect(result.method).toBe('rule-override')
	})

	it('keeps leet-squatting dangerous regardless of the net', () => {
		expect(blendWithMl(local('https://paypa1.com'), 0.1).level).toBe('danger')
		expect(blendWithMl(local('https://micros0ft-alerts.com'), 0.1).level).toBe(
			'danger'
		)
	})

	it('trusts the net in the uncertain middle', () => {
		// A domain with no rule signal but a confident net verdict still rises.
		const result = blendWithMl(local('https://some-unknown-domain-xyz.com'), 0.95)
		expect(['ml', 'blend']).toContain(result.method)
		expect(result.score).toBeGreaterThan(40)
	})

	it('stays calm when both agree it is fine', () => {
		const result = blendWithMl(local('https://developer.mozilla.org'), 0.02)
		expect(result.level).toBe('safe')
	})
})
