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
}

/**
 * What the learner highlighted, by location and raw text.
 *
 * Deliberately *not* red flag ids: the client is never told which ids exist,
 * because the id list is the answer key. The server matches the submitted text
 * against the spans it alone holds — the same reason option `isCorrect` flags
 * are stripped before lesson content is sent out.
 */
export interface SelectedSpan {
	location: RedFlagLocation
	text: string
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

	for (const flag of redFlags) {
		const wasFound = selectedSpans.some(selection =>
			spansMatch(flag, selection)
		)
		if (wasFound) foundFlagIds.push(flag.id)
		else missedFlagIds.push(flag.id)
	}

	const falsePositives = selectedSpans.filter(
		selection => !redFlags.some(flag => spansMatch(flag, selection))
	)

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

/**
 * A highlight counts if it is in the right part of the message and overlaps the
 * flagged text in either direction — selecting `paypa1.com` matches a flag on
 * `paypa1`, and selecting just `paypa1` matches a flag on `paypa1.com`.
 * Learners drag imprecise selections; demanding a character-exact match would
 * grade mouse accuracy rather than understanding.
 */
function spansMatch(flag: RedFlag, selection: SelectedSpan): boolean {
	if (flag.location !== selection.location) return false

	const flagText = normalizeText(flag.span)
	const selectedText = normalizeText(selection.text)
	if (!flagText || !selectedText) return false

	return flagText.includes(selectedText) || selectedText.includes(flagText)
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
