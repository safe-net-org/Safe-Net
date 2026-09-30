import type { RiskLevel } from './types'

/** One score-to-verdict contract for local rules and optional ML blending. */
export function riskLevelForScore(score: number): RiskLevel {
	if (score <= 30) return 'safe'
	if (score < 70) return 'suspicious'
	return 'danger'
}
