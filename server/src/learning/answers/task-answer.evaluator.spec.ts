import {
	evaluateChoiceAnswer,
	evaluatePhishingAnswer,
	evaluateTextAnswer,
	PhishingTaskMeta,
	RedFlagLocation,
} from './task-answer.evaluator'

const phishingMeta: PhishingTaskMeta = {
	email: {
		from: 'alerts@paypa1.com',
		subject: 'Account notice',
		body: 'Act within 24 hours and confirm your password now. Dear customer',
	},
	redFlags: [
		{
			id: 'sender-domain',
			location: 'from',
			span: 'paypa1.com',
			reason: 'Typosquatting: digit 1 instead of the letter l',
		},
		{
			id: 'urgency',
			location: 'body',
			span: 'within 24 hours',
			reason: 'Manufactured time pressure',
		},
		{
			id: 'credential-request',
			location: 'body',
			span: 'confirm your password',
			reason: 'A real provider never asks for your password by email',
		},
	],
}

function select(meta: PhishingTaskMeta, location: RedFlagLocation, text: string) {
	const source = location === 'from' || location === 'subject' || location === 'body'
		? meta.email?.[location] : meta.site?.[location]
	const start = source?.indexOf(text) ?? -1
	if (start < 0) throw new Error(`Missing selection: ${location} ${text}`)
	return { location, text, start, end: start + text.length }
}

describe('evaluatePhishingAnswer', () => {
	it('rejects highlighting the entire field or one common character', () => {
		const meta: PhishingTaskMeta = {
			email: {
				from: 'alerts@paypa1.com',
				subject: 'Account notice',
				body: 'Hello. Act within 24 hours and confirm your password. Thanks.',
			},
			redFlags: phishingMeta.redFlags,
		}
		const whole = evaluatePhishingAnswer(meta, [
			select(meta, 'from', 'alerts@paypa1.com'),
			select(meta, 'body', meta.email!.body),
		])
		expect(whole.isCorrect).toBe(false)
		expect(whole.falsePositives).toHaveLength(2)
		expect(evaluatePhishingAnswer(meta, [
			select(meta, 'from', 'a'),
			select(meta, 'body', 'a'),
		]).isCorrect).toBe(false)
	})

	it('accepts slight selection imprecision in the original field', () => {
		const meta: PhishingTaskMeta = {
			email: {
				from: 'alerts@paypa1.com',
				subject: 'Account notice',
				body: 'Act within 24 hours and confirm your password now.',
			},
			redFlags: phishingMeta.redFlags,
		}
		expect(evaluatePhishingAnswer(meta, [
			select(meta, 'from', 'paypa1.com'),
			select(meta, 'body', 'within 24 hours and'),
			select(meta, 'body', 'confirm your password'),
		]).isCorrect).toBe(true)
	})
	it('marks a clean sweep correct', () => {
		const result = evaluatePhishingAnswer(phishingMeta, [
			select(phishingMeta, 'from', 'paypa1.com'),
			select(phishingMeta, 'body', 'within 24 hours'),
			select(phishingMeta, 'body', 'confirm your password'),
		])

		expect(result.isCorrect).toBe(true)
		expect(result.missedFlagIds).toEqual([])
		expect(result.falsePositives).toEqual([])
	})

	it('fails when a red flag is missed, and reports which one', () => {
		const result = evaluatePhishingAnswer(phishingMeta, [
			select(phishingMeta, 'from', 'paypa1.com'),
			select(phishingMeta, 'body', 'within 24 hours'),
		])

		expect(result.isCorrect).toBe(false)
		expect(result.missedFlagIds).toEqual(['credential-request'])
	})

	// The whole point of the design: flagging everything must not pass.
	it('fails when innocent text is flagged, even if all red flags are found', () => {
		const result = evaluatePhishingAnswer(phishingMeta, [
			select(phishingMeta, 'from', 'paypa1.com'),
			select(phishingMeta, 'body', 'within 24 hours'),
			select(phishingMeta, 'body', 'confirm your password'),
			select(phishingMeta, 'body', 'Dear customer'),
		])

		expect(result.isCorrect).toBe(false)
		expect(result.foundFlagIds).toHaveLength(3)
		expect(result.falsePositives).toEqual([select(phishingMeta, 'body', 'Dear customer')])
	})

	it('accepts an imprecise selection that overlaps the flagged span', () => {
		const result = evaluatePhishingAnswer(phishingMeta, [
			select(phishingMeta, 'from', 'paypa1'),
			select(phishingMeta, 'body', 'within 24 hours and'),
			select(phishingMeta, 'body', 'confirm your password'),
		])

		expect(result.isCorrect).toBe(true)
	})

	it('does not credit the right text found in the wrong place', () => {
		const result = evaluatePhishingAnswer(phishingMeta, [
			{ location: 'subject', text: 'paypa1.com', start: 0, end: 10 },
			select(phishingMeta, 'body', 'within 24 hours'),
			select(phishingMeta, 'body', 'confirm your password'),
		])

		expect(result.isCorrect).toBe(false)
		expect(result.missedFlagIds).toContain('sender-domain')
	})

	it('never passes an ungradeable task with no red flags', () => {
		expect(evaluatePhishingAnswer({ redFlags: [] }, []).isCorrect).toBe(false)
		expect(evaluatePhishingAnswer(null, []).isCorrect).toBe(false)
	})
})

describe('evaluateTextAnswer', () => {
	it('ignores case and extra whitespace', () => {
		expect(
			evaluateTextAnswer('two-factor authentication', '  Two-Factor   Authentication ')
		).toBe(true)
	})

	it('rejects a different answer', () => {
		expect(evaluateTextAnswer('phishing', 'malware')).toBe(false)
	})

	it('rejects empty input rather than passing it', () => {
		expect(evaluateTextAnswer('phishing', '')).toBe(false)
		expect(evaluateTextAnswer(null, 'phishing')).toBe(false)
	})
})

describe('evaluateChoiceAnswer', () => {
	it('accepts the right set regardless of order', () => {
		expect(evaluateChoiceAnswer(['a', 'b'], ['b', 'a'])).toBe(true)
	})

	it('rejects a partial answer', () => {
		expect(evaluateChoiceAnswer(['a', 'b'], ['a'])).toBe(false)
	})

	it('rejects selecting everything', () => {
		expect(evaluateChoiceAnswer(['a'], ['a', 'b', 'c'])).toBe(false)
	})

	it('never passes a task with no correct option configured', () => {
		expect(evaluateChoiceAnswer([], [])).toBe(false)
	})
})
