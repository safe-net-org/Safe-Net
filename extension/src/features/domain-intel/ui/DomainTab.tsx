import { useEffect, useState } from 'react'
import type { ExtensionMessage } from '@/src/entities/analysis'
import { FONT_MONO, T } from '@/src/shared/config/tokens'
import { Pill } from '@/src/shared/ui/Pill'
import { flagEmoji } from '../model/geo'
import { getSettings } from '@/src/shared/lib/settings'
import { extractDomain, loadIntel } from '../model/intel'
import { computeTrust, type TrustBreakdown } from '../model/trust'
import type { DomainIntel } from '../model/types'
import { InfoRow } from './InfoRow'
import { IntelSection } from './IntelSection'
import { VirusTotalSection } from './VirusTotalSection'

async function pushIntelToBackground(intel: DomainIntel): Promise<void> {
  try {
    const [activeTab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (!activeTab?.id) return
    const created = intel.rdap?.createdAt ?? intel.cert?.firstSeen ?? null
    const ageDays = created
      ? Math.floor((Date.now() - created) / (24 * 60 * 60 * 1000))
      : null
    await browser.runtime.sendMessage({
      type: 'INTEL_THREAT',
      payload: {
        tabId: activeTab.id,
        domain: intel.domain,
        listings: (intel.threats?.hits ?? []).map((h) => ({ source: h.source, listed: h.listed })),
        ageDays,
        vtMalicious: intel.virusTotal?.malicious ?? 0,
        vtSuspicious: intel.virusTotal?.suspicious ?? 0,
      },
    } satisfies ExtensionMessage)
  } catch { /* background may be asleep */ }
}

interface DomainTabProps {
  url: string
}

type Status = 'idle' | 'loading' | 'ready' | 'error'

function fmtDate(ms: number | null): string {
  if (!ms) return '—'
  return new Date(ms).toLocaleDateString('ru-RU', { year: 'numeric', month: 'short', day: 'numeric' })
}

function fmtAge(ms: number | null): string {
  if (!ms) return '—'
  const days = Math.floor((Date.now() - ms) / (24 * 60 * 60 * 1000))
  if (days < 30) return `${days} дн.`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} мес.`
  const years = Math.floor(days / 365)
  const remMonths = Math.floor((days - years * 365) / 30)
  return remMonths ? `${years} г. ${remMonths} мес.` : `${years} г.`
}

function ageRiskColor(createdMs: number | null): string {
  if (!createdMs) return T.textMuted
  const days = (Date.now() - createdMs) / (24 * 60 * 60 * 1000)
  if (days < 90) return T.danger
  if (days < 365) return T.warn
  return T.ok
}

function trustColor(level: TrustBreakdown['level']): string {
  return level === 'high' ? T.ok : level === 'medium' ? T.warn : T.danger
}

export function DomainTab({ url }: DomainTabProps) {
  const domain = extractDomain(url)
  const [intel, setIntel] = useState<DomainIntel | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [reloadKey, setReloadKey] = useState(0)
  const [noVtKey, setNoVtKey] = useState(false)

  useEffect(() => {
    getSettings().then((s) => setNoVtKey(s.vtApiKey.length === 0)).catch(() => {})
  }, [reloadKey])

  useEffect(() => {
    if (!domain) { setStatus('error'); return }
    let cancelled = false
    setStatus('loading')
    const force = reloadKey > 0
    loadIntel(domain, force).then((data) => {
      if (cancelled) return
      setIntel(data)
      setStatus('ready')
      void pushIntelToBackground(data)
    }).catch(() => { if (!cancelled) setStatus('error') })
    return () => { cancelled = true }
  }, [domain, reloadKey])

  if (!domain) {
    return <div style={{ padding: 20, textAlign: 'center', color: T.textDim, fontSize: 12 }}>Не удалось распознать домен.</div>
  }

  if (status === 'loading' || status === 'idle') {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '30px 16px',
      }}>
        <div style={{
          width: 26, height: 26, borderRadius: '50%',
          border: `2px solid ${T.border}`, borderTopColor: T.accent,
          animation: 'spin 0.9s linear infinite',
        }} />
        <span style={{
          fontSize: 11, color: T.textDim, fontFamily: FONT_MONO,
          letterSpacing: '0.18em', textTransform: 'uppercase',
        }}>
          опрос открытых баз…
        </span>
        <span style={{ fontSize: 10.5, color: T.textDim, textAlign: 'center', lineHeight: 1.6, maxWidth: 240 }}>
          RDAP · DoH · crt.sh CT · ipapi · Quad9 · AdGuard · URLhaus · VirusTotal
        </span>
      </div>
    )
  }

  if (status === 'error' || !intel) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: T.textDim, fontSize: 12 }}>
        Не удалось загрузить данные.
      </div>
    )
  }

  const { rdap, dns, geo, cert, threats, virusTotal } = intel
  const createdAt = rdap?.createdAt ?? cert?.firstSeen ?? null
  const createdApprox = !rdap?.createdAt && Boolean(cert?.firstSeen)
  const isHttps = url.startsWith('https')
  const trust = computeTrust(intel, isHttps)
  const threatCount = threats?.totalListings ?? 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* HERO */}
      <div style={{
        background: `linear-gradient(135deg, ${T.surface}, ${T.surface2})`,
        border: `1px solid ${T.border}`,
        borderRadius: T.radTile,
        padding: '14px 16px',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 32, lineHeight: 1, flexShrink: 0 }}>
            {flagEmoji(geo?.countryCode ?? null)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 14, fontWeight: 700, color: T.text,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              letterSpacing: '-0.01em',
            }}>
              {domain}
            </div>
            <div style={{
              fontSize: 11, color: T.textDim, fontFamily: FONT_MONO,
              letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 3,
            }}>
              {geo?.country ?? 'страна неизвестна'} · {geo?.city ?? '—'}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="tabular" style={{
              fontSize: 16, fontWeight: 700, color: ageRiskColor(createdAt),
              lineHeight: 1, letterSpacing: '-0.02em',
            }}>
              {createdApprox ? '≈ ' : ''}{fmtAge(createdAt)}
            </div>
            <div style={{
              fontSize: 9.5, color: T.textDim, fontFamily: FONT_MONO,
              letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 3,
            }}>
              возраст
            </div>
          </div>
        </div>

        {/* TRUST BAR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontSize: 10.5, fontFamily: FONT_MONO,
            letterSpacing: '0.14em', textTransform: 'uppercase', color: T.textDim,
          }}>
            <span>trust score</span>
            <span className="tabular" style={{ color: trustColor(trust.level), fontWeight: 700 }}>
              {trust.score} / 100
            </span>
          </div>
          <div style={{
            height: 5, borderRadius: 999, background: T.border, overflow: 'hidden',
          }}>
            <div style={{
              width: `${trust.score}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${trustColor(trust.level)}, ${trustColor(trust.level)})`,
              boxShadow: `0 0 8px ${trustColor(trust.level)}`,
            }} />
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 2 }}>
            {trust.factors.map((f) => (
              <span
                key={f.key}
                title={`${f.label} · вес ${f.weight}`}
                style={{
                  padding: '2px 6px', borderRadius: 999,
                  fontSize: 9.5, fontFamily: FONT_MONO,
                  border: `1px solid ${f.ok ? 'oklch(72% 0.18 155 / 0.3)' : 'oklch(65% 0.24 25 / 0.3)'}`,
                  background: f.ok ? 'oklch(72% 0.18 155 / 0.08)' : 'oklch(65% 0.24 25 / 0.08)',
                  color: f.ok ? T.ok : T.danger,
                  letterSpacing: '0.06em',
                }}
              >
                {f.ok ? '✓' : '✗'} {f.key}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* THREAT ALERT */}
      {threatCount > 0 && (
        <div style={{
          padding: '12px 14px', borderRadius: T.radTile,
          background: 'oklch(65% 0.24 25 / 0.1)',
          border: '1px solid oklch(65% 0.24 25 / 0.35)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 22 }}>🚨</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: T.danger, fontWeight: 700, marginBottom: 3 }}>
              Домен в {threatCount} threat-feed
            </div>
            <div style={{ fontSize: 11, color: T.textMuted, lineHeight: 1.4 }}>
              Резолверы безопасности блокируют этот домен. Не вводи здесь данные.
            </div>
          </div>
        </div>
      )}

      {/* THREAT INTEL */}
      <IntelSection
        title="Угрозы · открытые базы"
        badge={
          <Pill
            color={threatCount > 0 ? T.danger : T.ok}
            bg={threatCount > 0 ? 'oklch(65% 0.24 25 / 0.1)' : 'oklch(72% 0.18 155 / 0.1)'}
            border={threatCount > 0 ? 'oklch(65% 0.24 25 / 0.3)' : 'oklch(72% 0.18 155 / 0.3)'}
          >
            {threatCount > 0 ? `⚠ ${threatCount}/${threats?.totalSourcesChecked}` : `✓ clean 0/${threats?.totalSourcesChecked ?? 0}`}
          </Pill>
        }
      >
        {threats?.hits.map((h) => (
          <InfoRow
            key={h.source}
            label={h.source}
            value={h.listed ? '⚠ в списке' : '✓ не найден'}
            color={h.listed ? T.danger : T.ok}
          />
        )) ?? <InfoRow label="DNS-блоклисты" value="недоступно" />}
      </IntelSection>

      {/* VIRUSTOTAL */}
      <VirusTotalSection vt={virusTotal} noKey={noVtKey} />

      {/* WHOIS / RDAP */}
      <IntelSection title="Whois · RDAP">
        <InfoRow label="Регистратор" value={rdap?.registrar ?? '—'} />
        <InfoRow
          label="Создан"
          value={
            rdap?.createdAt
              ? fmtDate(rdap.createdAt)
              : cert?.firstSeen
                ? `≈ ${fmtDate(cert.firstSeen)} · по CT`
                : '—'
          }
          mono
        />
        <InfoRow label="Истекает" value={fmtDate(rdap?.expiresAt ?? null)} mono />
        <InfoRow label="Обновлён" value={fmtDate(rdap?.updatedAt ?? null)} mono />
        {rdap?.status && rdap.status.length > 0 && (
          <InfoRow label="Статус" value={rdap.status.slice(0, 2).join(', ')} />
        )}
        {rdap?.nameservers && rdap.nameservers.length > 0 && (
          <InfoRow label="NS" value={rdap.nameservers[0]} mono />
        )}
        {!rdap && (
          <InfoRow label="RDAP" value="нет публичного RDAP для зоны (.ru/.рф)" />
        )}
      </IntelSection>

      {/* HOSTING */}
      <IntelSection title="Хостинг · IP">
        <InfoRow label="IPv4" value={dns?.a?.[0] ?? '—'} mono />
        {dns?.aaaa?.[0] && <InfoRow label="IPv6" value={dns.aaaa[0]} mono />}
        <InfoRow label="ASN" value={geo?.asn ?? '—'} mono />
        <InfoRow label="Провайдер" value={geo?.org ?? '—'} />
        <InfoRow label="Страна" value={geo?.country ? `${flagEmoji(geo.countryCode)} ${geo.country}` : '—'} />
      </IntelSection>

      {/* DNS */}
      <IntelSection
        title="DNS · резолвинг"
        badge={
          <Pill
            color={dns?.dnssecValid ? T.ok : T.textMuted}
            bg={dns?.dnssecValid ? 'oklch(72% 0.18 155 / 0.1)' : T.surface2}
            border={dns?.dnssecValid ? 'oklch(72% 0.18 155 / 0.3)' : T.border}
          >
            {dns?.dnssecValid ? '🔐 DNSSEC' : 'без DNSSEC'}
          </Pill>
        }
      >
        <InfoRow label="A-записи" value={dns?.a?.length ?? 0} mono />
        <InfoRow label="MX" value={dns?.mx?.length ?? 0} mono />
        <InfoRow label="NS" value={dns?.ns?.length ?? 0} mono />
        <InfoRow label="TXT" value={dns?.txt?.length ?? 0} mono />
      </IntelSection>

      {/* TLS / CERT TRANSPARENCY */}
      <IntelSection
        title="TLS · Certificate Transparency"
        badge={
          <Pill color={T.accentSoft} bg="oklch(72% 0.12 205 / 0.1)" border="oklch(72% 0.12 205 / 0.3)">
            crt.sh
          </Pill>
        }
      >
        <InfoRow label="Issuer" value={cert?.issuer ?? '—'} />
        <InfoRow label="Сертификатов" value={cert?.totalCerts ?? 0} mono />
        <InfoRow label="Wildcard" value={cert?.wildcardCount ?? 0} mono />
        <InfoRow label="Первый" value={fmtDate(cert?.firstSeen ?? null)} mono />
        <InfoRow label="Последний" value={fmtDate(cert?.lastSeen ?? null)} mono />
      </IntelSection>

      {/* FOOTER */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '4px 4px 8px',
      }}>
        <span style={{
          fontSize: 10, color: T.textDim,
          fontFamily: FONT_MONO, letterSpacing: '0.14em', textTransform: 'uppercase',
        }}>
          {new Date(intel.fetchedAt).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })} · кэш 6 ч
        </span>
        <button
          onClick={() => setReloadKey((k) => k + 1)}
          style={{
            background: 'transparent',
            border: `1px solid ${T.borderStrong}`,
            color: T.textMuted,
            padding: '5px 10px',
            borderRadius: 999,
            fontSize: 10.5,
            fontWeight: 600,
            fontFamily: FONT_MONO,
            cursor: 'pointer',
            letterSpacing: '0.08em',
          }}
        >
          ↻ обновить
        </button>
      </div>
    </div>
  )
}
