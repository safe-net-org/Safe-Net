import type { ReactNode } from 'react'
import type { AnalysisResult } from '@/src/entities/analysis'
import { T } from '@/src/shared/config/tokens'
import { useExtensionI18n } from '@/src/shared/i18n/ExtensionLocaleProvider'
import { StatTile } from '@/src/shared/ui/StatTile'

interface FeaturesTabProps {
  result: AnalysisResult
}

type Row = readonly [string, ReactNode, string]

export function FeaturesTab({ result }: FeaturesTabProps) {
  const { t } = useExtensionI18n()
  const f = result.features
  const bool = (value: boolean, warning = false) =>
    `${value && warning ? '⚠' : value ? '✓' : warning ? '✓' : '✗'} ${t(value ? 'feature.yes' : 'feature.no')}`
  const rows: Row[] = [
    ['HTTPS', bool(f.hasHttps), f.hasHttps ? T.ok : T.danger],
    [t('feature.ip'), bool(f.hasIp, true), f.hasIp ? T.danger : T.ok],
    [t('feature.homograph'), bool(f.idnHomograph, true), f.idnHomograph ? T.danger : T.ok],
    [t('feature.typosquat'), bool(f.isTyposquat, true), f.isTyposquat ? T.danger : T.ok],
    ['Punycode', bool(f.hasPunycode, true), f.hasPunycode ? T.warn : T.ok],
    [t('feature.cyrillic'), bool(f.hasCyrillicInDomain, true), f.hasCyrillicInDomain ? T.danger : T.ok],
    [t('feature.trapWords'), f.suspiciousWordCount, f.suspiciousWordCount > 0 ? T.warn : T.text],
    [t('feature.freeHosting'), bool(f.hasFreeHosting, true), f.hasFreeHosting ? T.warn : T.ok],
    [t('feature.hyphens'), f.hyphenCount, f.hyphenCount > 3 ? T.warn : T.text],
    [t('feature.digits'), f.digitCount, T.text],
    [t('feature.domainLength'), f.domainLength, T.text],
    [t('feature.tldRisk'), `${(f.tldSuspicion * 100).toFixed(0)}%`, f.tldSuspicion > 0.5 ? T.warn : T.text],
    [t('feature.leet'), bool(f.isLeetSquat, true), f.isLeetSquat ? T.danger : T.ok],
    [t('feature.brand'), bool(f.hasBrandToken, true), f.hasBrandToken ? T.danger : T.ok],
    [t('feature.entropy'), f.domainEntropy.toFixed(2), f.domainEntropy > 4 ? T.warn : T.text],
    [t('feature.subdomains'), f.subdomainDepth, f.subdomainDepth >= 3 ? T.warn : T.text],
    [t('feature.encoding'), bool(f.hasExcessiveEncoding, true), f.hasExcessiveEncoding ? T.warn : T.ok],
    [t('feature.base64'), bool(f.hasBase64InPath, true), f.hasBase64InPath ? T.warn : T.ok],
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {rows.map(([label, value, color]) => (
        <StatTile key={label} label={label} value={value} accent={color} />
      ))}
    </div>
  )
}
