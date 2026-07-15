export interface RdapInfo {
  registrar: string | null
  createdAt: number | null
  expiresAt: number | null
  updatedAt: number | null
  status: string[]
  nameservers: string[]
}

export interface DnsInfo {
  a: string[]
  aaaa: string[]
  mx: string[]
  ns: string[]
  txt: string[]
  dnssecValid: boolean
  resolved: boolean
}

export interface GeoInfo {
  ip: string
  country: string | null
  countryCode: string | null
  city: string | null
  org: string | null
  asn: string | null
}

export interface CertInfo {
  issuer: string | null
  totalCerts: number
  firstSeen: number | null
  lastSeen: number | null
  wildcardCount: number
}

export interface ThreatHit {
  source: string
  listed: boolean
  detail?: string
}

export interface ThreatInfo {
  hits: ThreatHit[]
  totalSourcesChecked: number
  totalListings: number
}

export interface VirusTotalInfo {
  /** false when domain unscanned, key invalid, rate-limited, or error. */
  available: boolean
  malicious: number
  suspicious: number
  harmless: number
  undetected: number
  total: number
  /** Community reputation score (can be negative). */
  reputation: number
  votesHarmless: number
  votesMalicious: number
  categories: string[]
  /** Best (lowest) popularity rank across providers, null if unranked. */
  topRank: number | null
  flaggedEngines: string[]
  scannedAt: number | null
  error: string | null
}

export interface DomainIntel {
  domain: string
  fetchedAt: number
  rdap: RdapInfo | null
  dns: DnsInfo | null
  geo: GeoInfo | null
  cert: CertInfo | null
  threats: ThreatInfo | null
  virusTotal: VirusTotalInfo | null
  errors: string[]
}

export type IntelStatus = 'idle' | 'loading' | 'ready' | 'error'
