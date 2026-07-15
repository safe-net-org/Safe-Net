/** Per-flag feedback for a phishing simulator attempt. */
export class RedFlagFeedbackDto {
	id: string
	span: string
	/** Why this span is suspicious — the actual teaching moment. */
	reason: string
	/** True if the learner spotted it, false if they walked past it. */
	found: boolean
}

export class AnswerResultDto {
	taskId: string
	isCorrect: boolean
	explanation?: string
	awardedXp: number
	totalXp: number
	courseProgress: number
	lessonCompleted: boolean
	certificateIssued: boolean
	newAchievements?: string[]

	/**
	 * Only present for PHISHING_EMAIL / PHISHING_SITE. Revealed after the
	 * attempt so a learner who missed a red flag is told which one and why —
	 * a bare "wrong" teaches nothing.
	 */
	redFlagFeedback?: RedFlagFeedbackDto[]
	/** Text the learner flagged that was not actually suspicious. */
	falsePositives?: { location: string; text: string }[]
}
