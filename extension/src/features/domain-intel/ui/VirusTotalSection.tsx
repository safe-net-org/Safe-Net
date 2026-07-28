import { FONT_MONO, T } from '@/src/shared/config/tokens'
import { useExtensionI18n } from '@/src/shared/i18n/ExtensionLocaleProvider'
import { Pill } from '@/src/shared/ui/Pill'
import type { VirusTotalInfo } from '../model/types'
import { InfoRow } from './InfoRow'
import { IntelSection } from './IntelSection'

interface VirusTotalSectionProps {
  vt: VirusTotalInfo | null
  /** true when the user has not configured an API key. */
  noKey: boolean
}

function reputationColor(rep: number): string {
  if (rep < 0) return T.danger
  if (rep > 0) return T.ok
  return T.textMuted
}

export function VirusTotalSection({ vt, noKey }: VirusTotalSectionProps) {
  const { locale, t } = useExtensionI18n()
  const localizedError = (error: string | null): string => {
    if (!error || locale === 'ru') return error ?? t('vt.noData')
    const errors: Record<string, string> = {
      'домен ещё не сканировался': 'domain has not been scanned yet',
      'неверный API-ключ': 'invalid API key',
      'лимит запросов исчерпан': 'request limit exceeded',
      'пустой ответ': 'empty response',
    }
    return errors[error] ?? error
  }

  // No key configured — show a call-to-action instead of an empty section.
  if (noKey) {
    return (
      <IntelSection
        title={t('vt.title')}
        badge={<Pill color={T.textMuted} bg={T.surface2} border={T.border}>{t('vt.notConnected')}</Pill>}
      >
        <div style={{ fontSize: 11, color: T.textMuted, lineHeight: 1.5 }}>
          {t('vt.connectHint')}
        </div>
      </IntelSection>
    )
  }

  if (!vt) {
    return (
      <IntelSection
        title={t('vt.title')}
        badge={<Pill color={T.textMuted} bg={T.surface2} border={T.border}>{t('domain.unavailable')}</Pill>}
      >
        <InfoRow label={t('domain.status')} value={t('vt.noResponse')} />
      </IntelSection>
    )
  }

  if (!vt.available) {
    return (
      <IntelSection
        title={t('vt.title')}
        badge={<Pill color={T.warn} bg="oklch(80% 0.16 80 / 0.1)" border="oklch(80% 0.16 80 / 0.3)">—</Pill>}
      >
        <InfoRow label={t('domain.status')} value={localizedError(vt.error)} color={T.warn} />
      </IntelSection>
    )
  }

  const flagged = vt.malicious + vt.suspicious
  const verdictColor = vt.malicious > 0 ? T.danger : vt.suspicious > 0 ? T.warn : T.ok
  const verdictBg = vt.malicious > 0 ? 'oklch(65% 0.24 25 / 0.1)'
    : vt.suspicious > 0 ? 'oklch(80% 0.16 80 / 0.1)' : 'oklch(72% 0.18 155 / 0.1)'
  const verdictBorder = vt.malicious > 0 ? 'oklch(65% 0.24 25 / 0.3)'
    : vt.suspicious > 0 ? 'oklch(80% 0.16 80 / 0.3)' : 'oklch(72% 0.18 155 / 0.3)'

  return (
    <IntelSection
      title={t('vt.title')}
      badge={
        <Pill color={verdictColor} bg={verdictBg} border={verdictBorder}>
          {flagged > 0 ? `⚠ ${flagged}/${vt.total}` : `✓ clean ${vt.harmless}/${vt.total}`}
        </Pill>
      }
    >
      {/* detection ratio bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 4 }}>
        <div style={{
          height: 5, borderRadius: 999, background: T.border, overflow: 'hidden', display: 'flex',
        }}>
          {vt.total > 0 && (
            <>
              <div style={{ width: `${(vt.malicious / vt.total) * 100}%`, background: T.danger }} />
              <div style={{ width: `${(vt.suspicious / vt.total) * 100}%`, background: T.warn }} />
              <div style={{ width: `${(vt.harmless / vt.total) * 100}%`, background: T.ok }} />
            </>
          )}
        </div>
        <div style={{
          display: 'flex', gap: 10, fontSize: 9.5, fontFamily: FONT_MONO,
          letterSpacing: '0.06em', color: T.textDim,
        }}>
          <span style={{ color: T.danger }}>● malicious {vt.malicious}</span>
          <span style={{ color: T.warn }}>● suspicious {vt.suspicious}</span>
          <span style={{ color: T.ok }}>● harmless {vt.harmless}</span>
        </div>
      </div>

      <InfoRow
        label={t('vt.reputation')}
        value={vt.reputation > 0 ? `+${vt.reputation}` : `${vt.reputation}`}
        color={reputationColor(vt.reputation)}
        mono
      />
      <InfoRow
        label={t('vt.votes')}
        value={`👍 ${vt.votesHarmless} · 👎 ${vt.votesMalicious}`}
        mono
      />
      {vt.topRank !== null && (
        <InfoRow label={t('vt.popularity')} value={`#${vt.topRank.toLocaleString(locale === 'ru' ? 'ru-RU' : 'en-US')}`} mono />
      )}
      {vt.categories.length > 0 && (
        <InfoRow label={t('vt.categories')} value={vt.categories.join(', ')} />
      )}
      {vt.flaggedEngines.length > 0 && (
        <InfoRow
          label={t('vt.flaggedBy')}
          value={vt.flaggedEngines.slice(0, 4).join(', ') + (vt.flaggedEngines.length > 4 ? '…' : '')}
          color={T.danger}
        />
      )}
    </IntelSection>
  )
}
