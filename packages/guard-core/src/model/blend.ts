import type { AnalysisResult, RiskSignal, UrlFeatures } from './types'
import { riskLevelForScore } from './risk-level'

/**
 * Blend a local rule verdict with a neural-network probability.
 *
 * This is the exact counterpart of `ml-service/app/model.py::_blend`, kept here
 * so the extension and the Python service reach the same verdict from the same
 * inputs rather than each inventing its own weighting. The rules are high
 * precision but narrow; the net is broad but noisy. So the rules win at the
 * extremes — they floor the score when certain it is phishing and cap it when
 * it is plainly a known brand — and the net decides the uncertain middle.
 */

export type BlendMethod = 'rule-override' | 'rules' | 'ml' | 'blend'

export interface BlendResult {
	score: number
	level: 'safe' | 'suspicious' | 'danger'
	method: BlendMethod
}

const DANGER_RULE_FLOOR = 70
const KNOWN_BRAND_RULE_CAP = 31
const ML_WEIGHT = 0.6
const KNOWN_BRAND_SAFE_CAP = 20

/** Deterministic, high-precision signals: near-certainly malicious. */
function hardDanger(f: UrlFeatures): boolean {
	return (
		f.idnHomograph ||
		f.brandImpersonation ||
		f.isLeetSquat ||
		(f.isTyposquat && f.levenshteinDistance <= 2) ||
		(f.hasBrandToken && f.brandTokenViaLeet)
	)
}

/**
 * @param local          the rule verdict from `scoreUrl`
 * @param mlProbability  raw phishing probability from the net, 0..1
 */
export function blendWithMl(
	local: AnalysisResult,
	mlProbability: number
): BlendResult {
	const bertScore = Math.min(100, Math.round(mlProbability * 100))
	const rule = local.score
	const f = local.features

	if (hardDanger(f)) {
		// Rules are certain: never let the net argue a homograph down.
		const score = Math.max(rule, bertScore)
		return { score, level: riskLevelForScore(score), method: 'rule-override' }
	}

	if (f.registrableIsBrand && rule < KNOWN_BRAND_RULE_CAP) {
		// github.com, mail.google.com — the net's nervousness is overruled.
		const score = Math.min(bertScore, KNOWN_BRAND_SAFE_CAP)
		return { score, level: riskLevelForScore(score), method: 'rule-override' }
	}

	if (rule >= DANGER_RULE_FLOOR) {
		// Rules already say danger; the net can only raise it.
		const score = Math.max(rule, bertScore)
		return { score, level: riskLevelForScore(score), method: 'rules' }
	}

	// Uncertain middle — where the model earns its keep on novel phishing.
	const blended = Math.round(ML_WEIGHT * bertScore + (1 - ML_WEIGHT) * rule)
	const score = Math.max(blended, rule)
	const method: BlendMethod = bertScore > rule ? 'ml' : 'blend'
	return { score, level: riskLevelForScore(score), method }
}

/**
 * Apply a blended verdict to a local result, merging ML signals in. Used by the
 * extension; the /guard scanner reads the server's already-blended response.
 */
export function applyMlBlend(
	local: AnalysisResult,
	mlProbability: number,
	mlSignals: RiskSignal[] = []
): AnalysisResult {
	const { score, level } = blendWithMl(local, mlProbability)
	const mlKeys = new Set(mlSignals.map(s => s.key.replace(/^ml_/, '')))
	const keptLocal = local.signals.filter(s => !mlKeys.has(s.key))
	return {
		...local,
		score,
		level,
		signals: [...keptLocal, ...mlSignals],
		mlEnhanced: true,
	}
}
