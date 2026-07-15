import type { AnalysisResult, RiskLevel } from '@/src/entities/analysis'

const COLORS: Record<RiskLevel, string> = {
  safe: '#22c55e',
  suspicious: '#f59e0b',
  danger: '#ef4444',
}
const TEXTS: Record<RiskLevel, string> = {
  safe: '',
  suspicious: '!',
  danger: '!!',
}

export async function updateBadge(tabId: number, result: AnalysisResult): Promise<void> {
  await browser.action.setBadgeBackgroundColor({ color: COLORS[result.level], tabId })
  await browser.action.setBadgeText({ text: TEXTS[result.level], tabId })
}
