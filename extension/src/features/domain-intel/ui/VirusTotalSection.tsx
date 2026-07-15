import { FONT_MONO, T } from '@/src/shared/config/tokens'
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
  // No key configured — show a call-to-action instead of an empty section.
  if (noKey) {
    return (
      <IntelSection
        title="VirusTotal · 90+ движков"
        badge={<Pill color={T.textMuted} bg={T.surface2} border={T.border}>не подключён</Pill>}
      >
        <div style={{ fontSize: 11, color: T.textMuted, lineHeight: 1.5 }}>
          Добавь бесплатный API-ключ во вкладке «Настройки», чтобы проверять
          домен по 90+ антивирусным движкам VirusTotal.
        </div>
      </IntelSection>
    )
  }

  if (!vt) {
    return (
      <IntelSection
        title="VirusTotal · 90+ движков"
        badge={<Pill color={T.textMuted} bg={T.surface2} border={T.border}>недоступно</Pill>}
      >
        <InfoRow label="Статус" value="нет ответа" />
      </IntelSection>
    )
  }

  if (!vt.available) {
    return (
      <IntelSection
        title="VirusTotal · 90+ движков"
        badge={<Pill color={T.warn} bg="oklch(80% 0.16 80 / 0.1)" border="oklch(80% 0.16 80 / 0.3)">—</Pill>}
      >
        <InfoRow label="Статус" value={vt.error ?? 'нет данных'} color={T.warn} />
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
      title="VirusTotal · 90+ движков"
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
        label="Репутация"
        value={vt.reputation > 0 ? `+${vt.reputation}` : `${vt.reputation}`}
        color={reputationColor(vt.reputation)}
        mono
      />
      <InfoRow
        label="Голоса"
        value={`👍 ${vt.votesHarmless} · 👎 ${vt.votesMalicious}`}
        mono
      />
      {vt.topRank !== null && (
        <InfoRow label="Популярность" value={`#${vt.topRank.toLocaleString('ru-RU')}`} mono />
      )}
      {vt.categories.length > 0 && (
        <InfoRow label="Категории" value={vt.categories.join(', ')} />
      )}
      {vt.flaggedEngines.length > 0 && (
        <InfoRow
          label="Отметили"
          value={vt.flaggedEngines.slice(0, 4).join(', ') + (vt.flaggedEngines.length > 4 ? '…' : '')}
          color={T.danger}
        />
      )}
    </IntelSection>
  )
}
