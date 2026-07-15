import type { ReactNode } from 'react'
import type { AnalysisResult } from '@/src/entities/analysis'
import { T } from '@/src/shared/config/tokens'
import { StatTile } from '@/src/shared/ui/StatTile'

interface FeaturesTabProps {
  result: AnalysisResult
}

type Row = readonly [string, ReactNode, string]

export function FeaturesTab({ result }: FeaturesTabProps) {
  const f = result.features
  const rows: Row[] = [
    ['HTTPS', f.hasHttps ? '✓ Да' : '✗ Нет', f.hasHttps ? T.ok : T.danger],
    ['IP вместо домена', f.hasIp ? '⚠ Да' : '✓ Нет', f.hasIp ? T.danger : T.ok],
    ['IDN-гомограф', f.idnHomograph ? '⚠ Да' : '✓ Нет', f.idnHomograph ? T.danger : T.ok],
    ['Тайпсквот', f.isTyposquat ? '⚠ Да' : '✓ Нет', f.isTyposquat ? T.danger : T.ok],
    ['Punycode', f.hasPunycode ? '⚠ Да' : '✓ Нет', f.hasPunycode ? T.warn : T.ok],
    ['Кириллица в домене', f.hasCyrillicInDomain ? '⚠ Да' : '✓ Нет', f.hasCyrillicInDomain ? T.danger : T.ok],
    ['Слов-ловушек', f.suspiciousWordCount, f.suspiciousWordCount > 0 ? T.warn : T.text],
    ['Free hosting', f.hasFreeHosting ? '⚠ Да' : '✓ Нет', f.hasFreeHosting ? T.warn : T.ok],
    ['Дефисов', f.hyphenCount, f.hyphenCount > 3 ? T.warn : T.text],
    ['Цифр', f.digitCount, T.text],
    ['Длина домена', f.domainLength, T.text],
    ['TLD-риск', `${(f.tldSuspicion * 100).toFixed(0)}%`, f.tldSuspicion > 0.5 ? T.warn : T.text],
    ['Leet-подмена', f.isLeetSquat ? '⚠ Да' : '✓ Нет', f.isLeetSquat ? T.danger : T.ok],
    ['Бренд в домене', f.hasBrandToken ? '⚠ Да' : '✓ Нет', f.hasBrandToken ? T.danger : T.ok],
    ['Энтропия', f.domainEntropy.toFixed(2), f.domainEntropy > 4 ? T.warn : T.text],
    ['Поддоменов', f.subdomainDepth, f.subdomainDepth >= 3 ? T.warn : T.text],
    ['Двойное кодир.', f.hasExcessiveEncoding ? '⚠ Да' : '✓ Нет', f.hasExcessiveEncoding ? T.warn : T.ok],
    ['Base64 в пути', f.hasBase64InPath ? '⚠ Да' : '✓ Нет', f.hasBase64InPath ? T.warn : T.ok],
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {rows.map(([label, value, color]) => (
        <StatTile key={label} label={label} value={value} accent={color} />
      ))}
    </div>
  )
}
