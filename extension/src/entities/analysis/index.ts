/**
 * Re-export of the shared rule engine.
 *
 * These heuristics used to live here in full, and were implemented a second
 * time inside the Guard landing page — two copies that had already drifted
 * apart (the extension had leet-squatting detection, the landing's copy did
 * not). They now live in `packages/guard-core`, which the web app imports too,
 * so a rule fixed once is fixed everywhere.
 *
 * This file stays so the extension's existing `@/src/entities/analysis`
 * imports keep resolving.
 */
export type {
	AnalysisResult,
	DomFeatures,
	ExtensionMessage,
	IntelThreatPayload,
	RiskLevel,
	RiskSignal,
	StoredResult,
	UrlFeatures,
} from '@safe-net/guard-core'

export {
	analyzeUrl,
	applyMlBlend,
	blendWithMl,
	detectIdnHomograph,
	detectTyposquatting,
	scoreUrl,
} from '@safe-net/guard-core'
