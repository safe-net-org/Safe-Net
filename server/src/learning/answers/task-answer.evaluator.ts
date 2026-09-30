import { TaskType } from '@prisma/client'

/**
 * Pure answer-checking for every task type.
 *
 * Split out of `progress.service` so the rules can be unit-tested without a
 * database, and so the phishing simulator's grading lives next to the shape it
 * grades rather than inside a 400-line service method.
 *
 * Before this existed, `progress.service` hardcoded `isCorrect = false` for
 * PHISHING_EMAIL, PHISHING_SITE, SHORT_ANSWER and TEXT_INPUT with a comment
 * saying they needed "manual review" — a review process that did not exist.
 * Those tasks were therefore unanswerable, which also made course certificates
 * mathematically unreachable, since a certificate requires every task solved.
 */

export type RedFlagLocation = 'from' | 'subject' | 'body' | 'url' | 'page'

/** One thing wrong with a simulated email or site. Matches the content schema. */
export interface RedFlag {
	id: string
	location: RedFlagLocation
	span: string
	reason: string
}

export interface PhishingTaskMeta {
	redFlags?: RedFlag[]
	email?: { from: string; subject: string; body: string }
	site?: { url: string; page: string }
}

/**
 * What the learner highlighted, by location and offsets in the raw field.
 *
 * Deliberately *not* red flag ids: the client is never told which ids exist,
 * because the id list is the answer key. The server matches the submitted text
 * against the spans it alone holds — the same reason option `isCorrect` flags
 * are stripped before lesson content is sent out.
 */
export interface SelectedSpan {
	location: RedFlagLocation
	text: string
	start: number
	end: number
}

export interface PhishingEvaluation {
	isCorrect: boolean
	foundFlagIds: string[]
	missedFlagIds: string[]
	/** Highlights that matched no red flag — suspicion without cause. */
	falsePositives: SelectedSpan[]
}

/**
 * A phishing task is correct only on an exact match: every red flag found and
 * nothing innocent flagged.
 *
 * Requiring zero false positives is deliberate. A learner who highlights the
 * whole email would otherwise "find" every red flag without reading anything,
 * and the skill being taught is telling suspicious from ordinary — not blanket
 * suspicion.
 */
export function evaluatePhishingAnswer(
	meta: PhishingTaskMeta | null | undefined,
	selectedSpans: SelectedSpan[]
): PhishingEvaluation {
	const redFlags = meta?.redFlags ?? []

	const foundFlagIds: string[] = []
	const missedFlagIds: string[] = []
	const { valid, invalid } = mergeValidSelections(meta, selectedSpans)

	for (const flag of redFlags) {
		const wasFound = valid.some(selection =>
			spansMatch(flag, selection, meta)
		)
		if (wasFound) foundFlagIds.push(flag.id)
		else missedFlagIds.push(flag.id)
	}

	const falsePositives = [...invalid, ...valid.filter(
		selection => !redFlags.some(flag => spansMatch(flag, selection, meta))
	)]

	return {
		// A task with no red flags defined cannot be graded; treat it as wrong
		// rather than handing out a free pass for an empty answer.
		isCorrect:
			redFlags.length > 0 &&
			missedFlagIds.length === 0 &&
			falsePositives.length === 0,
		foundFlagIds,
		missedFlagIds,
		falsePositives,
	}
}

/** Compare intervals in the original field. Small imprecision around a flag is
 * accepted, but selecting an entire field or a common character is not. */
function spansMatch(flag: RedFlag, selection: SelectedSpan, meta?: PhishingTaskMeta | null): boolean {
	if (flag.location !== selection.location) return false
	const source = sourceField(meta, flag.location)
	if (!source) return false
	const flagStart = source.indexOf(flag.span)
	if (flagStart < 0 || source.indexOf(flag.span, flagStart + 1) >= 0) return false
	const overlap = Math.max(0, Math.min(flagStart + flag.span.length, selection.end) -
		Math.max(flagStart, selection.start))
	const needed = Math.min(flag.span.length, Math.max(4, Math.ceil(flag.span.length * 0.5)))
	const allowedExtra = Math.max(4, Math.ceil(flag.span.length * 0.2))
	return overlap >= needed && selection.end - selection.start - overlap <= allowedExtra
}

function sourceField(meta: PhishingTaskMeta | null | undefined, location: RedFlagLocation): string | undefined {
	if (location === 'from' || location === 'subject' || location === 'body') return meta?.email?.[location]
	return meta?.site?.[location]
}

function mergeValidSelections(meta: PhishingTaskMeta | null | undefined, selected: SelectedSpan[]) {
	const valid: SelectedSpan[] = []
	const invalid: SelectedSpan[] = []
	for (const selection of selected) {
		const source = sourceField(meta, selection.location)
		if (!source || !Number.isInteger(selection.start) || !Number.isInteger(selection.end) ||
			selection.start < 0 || selection.end <= selection.start ||
			selection.end > source.length || source.slice(selection.start, selection.end) !== selection.text) {
			invalid.push(selection)
			continue
		}
		valid.push(selection)
	}
	valid.sort((a, b) => a.location.localeCompare(b.location) || a.start - b.start)
	const merged: SelectedSpan[] = []
	for (const selection of valid) {
		const previous = merged.at(-1)
		if (previous && previous.location === selection.location && selection.start < previous.end) {
			previous.end = Math.max(previous.end, selection.end)
			previous.text = sourceField(meta, selection.location)!.slice(previous.start, previous.end)
		} else {
			merged.push({ ...selection })
		}
	}
	return { valid: merged, invalid }
}

/**
 * Text answers are compared case-insensitively with collapsed whitespace, so
 * "Two-Factor  Authentication" matches "two-factor authentication". Anything
 * stricter punishes typing, not understanding.
 */
export function evaluateTextAnswer(
	correctAnswer: string | null | undefined,
	textAnswer: string | null | undefined
): boolean {
	if (!correctAnswer || !textAnswer) return false
	return normalizeText(correctAnswer) === normalizeText(textAnswer)
}

function normalizeText(value: string): string {
	return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

/** Exact set match on option ids, order-independent. */
export function evaluateChoiceAnswer(
	correctOptionIds: string[],
	selectedOptionIds: string[]
): boolean {
	const correct = new Set(correctOptionIds)
	const selected = new Set(selectedOptionIds)
	if (correct.size === 0 || correct.size !== selected.size) return false
	for (const id of correct) {
		if (!selected.has(id)) return false
	}
	return true
}

export const SIMULATOR_TASK_TYPES: TaskType[] = [
	TaskType.PHISHING_EMAIL,
	TaskType.PHISHING_SITE,
]

export const TEXT_TASK_TYPES: TaskType[] = [
	TaskType.SHORT_ANSWER,
	TaskType.TEXT_INPUT,
]
