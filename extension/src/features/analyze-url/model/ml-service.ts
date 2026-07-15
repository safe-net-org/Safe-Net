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
  const hasLocalSignals = local.signals.length > 0 && local.score >= 15
  let merged: number
  if (!hasLocalSignals) {
    merged = Math.min(35, Math.round(ml.score * 0.35))
  } else {
    const weighted = Math.round(local.score * 0.4 + ml.score * 0.6)
    merged = Math.max(local.score, weighted)
  }
  const level = merged >= 70 ? 'danger' : merged >= 40 ? 'suspicious' : 'safe'

  const mlSignals: RiskSignal[] = ml.signals
    .filter((s) => Math.abs(s.shap_value) > 0.05)
    .slice(0, 5)
    .map((s) => ({
      key: `ml_${s.feature}`,
      message: `[ML] ${s.label}`,
      severity: s.severity,
    }))

  const mlKeys = new Set(mlSignals.map((s) => s.key.replace(/^ml_/, '')))
  const filteredLocal = local.signals.filter((s) => !mlKeys.has(s.key))

  return {
    ...local,
    score: merged,
    level,
    signals: [...filteredLocal, ...mlSignals],
    mlEnhanced: true,
  }
}
