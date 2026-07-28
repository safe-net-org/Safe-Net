export const MOTION = {
	// A calm ease with zero initial velocity. The previous curve moved most of
	// the distance in its first frames, so scroll reveals looked like a jump
	// even when their duration was close to a second.
	ease: [0.25, 0.1, 0.25, 1] as const,
	hover: 0.28,
	standard: 0.48,
	reveal: 0.62,
	landing: 0.82,
	carousel: 0.58,
	page: 0.56,
	dialog: 0.42,
	stagger: 0.08,
} as const
