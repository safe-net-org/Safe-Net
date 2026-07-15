import { applyMlBlend } from '@/src/entities/analysis'
import type { AnalysisResult, RiskSignal } from '@/src/entities/analysis'
import { getSettings } from '@/src/shared/lib/settings'

const DEFAULT_ML_SERVICE_URL = 'http://localhost:8000/predict'
const ML_TIMEOUT_MS = 2000

export interface MlSignal {
  feature: string
  label: string
  value: number
  shap_value: number
  severity: 'high' | 'medium' | 'low'
}

export interface MlResponse {
  score: number
  level: 'safe' | 'suspicious' | 'danger'
  probability: number
  signals: MlSignal[]
  /** Raw neural-net probability, before server-side blending. */
  ml_probability?: number
  rule_score?: number
  method?: string
}

export async function queryMlService(url: string): Promise<MlResponse | null> {
  try {
    const settings = await getSettings()
    if (!settings.intelEnabled) return null
    const endpoint = settings.mlServiceUrl || DEFAULT_ML_SERVICE_URL

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), ML_TIMEOUT_MS)

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
      signal: controller.signal,
    })

    clearTimeout(timeout)
    if (!response.ok) return null
    return (await response.json()) as MlResponse
  } catch {
    return null
  }
}

export function mergeWithMl(local: AnalysisResult, ml: MlResponse): AnalysisResult {
  const mlSignals: RiskSignal[] = ml.signals
    .filter((s) => Math.abs(s.shap_value) > 0.05)
    .slice(0, 5)
    .map((s) => ({
      key: `ml_${s.feature}`,
      message: `[ML] ${s.label}`,
      severity: s.severity,
    }))

  // Blend with the shared guard-core function, not a second ad-hoc weighting:
  // the ml-service already blends server-side with the same rules, and doing a
  // *different* blend here would double-count them. `ml_probability` is the raw
  // net output; the extension trusts its own local rule score and applies the
  // one canonical blend. Falls back to the pre-blend probability for older
  // service versions that did not return ml_probability.
  const mlProbability = ml.ml_probability ?? ml.probability
  return applyMlBlend(local, mlProbability, mlSignals)
}
