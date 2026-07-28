export type RiskLevel = 'safe' | 'suspicious' | 'danger'

export type SignalCategory = 'identity' | 'transport' | 'reputation' | 'structure' | 'content'

export interface UrlFeatures {
  urlLength: number
  domainLength: number
  pathLength: number
  queryLength: number
  dotCount: number
  hyphenCount: number
  atCount: number
  digitCount: number
  slashCount: number
  queryParamCount: number
  hasIp: boolean
  hasHttps: boolean
  hasPunycode: boolean
  hasCyrillicInDomain: boolean
  hasPort: boolean
  hasHexEncoding: boolean
  hasDoubleSlash: boolean
  hasFreeHosting: boolean
  domainEntropy: number
  subdomainDepth: number
  suspiciousWordCount: number
  suspiciousWords: string[]
  levenshteinDistance: number
  nearestBrand: string
  idnHomograph: boolean
  idnDetails: string | null
  isTyposquat: boolean
  tldSuspicion: number
  hasDataUri: boolean
  hasMultipleDomains: boolean
  // extended detection
  registrableDomain: string
  /** The registrable domain is itself a recognised brand (github.com,
   *  google.com). Lets the ML blend refuse to let a nervous net block a site
   *  everyone uses. */
  registrableIsBrand: boolean
  brandImpersonation: boolean
  impersonatedBrand: string
  impersonationDetail: string | null
  isUrlShortener: boolean
  hasDangerousExtension: boolean
  dangerousExtension: string | null
  hasSuspiciousScheme: boolean
  isEncodedIp: boolean
  mixedScript: boolean
  scripts: string[]
  punycodeDecoded: string | null
  isTldSwap: boolean
  credentialInQuery: boolean
  credentialParams: string[]
  nonStandardPort: boolean
  port: string
  // advanced heuristics
  isLeetSquat: boolean
  leetBrand: string
  hasBrandToken: boolean
  brandToken: string
  /** The brand token only matched after de-leeting — deliberate evasion. */
  brandTokenViaLeet: boolean
  hasExcessiveEncoding: boolean
  hasBase64InPath: boolean
}

export interface RiskSignal {
  key: string
  message: string
  severity: 'high' | 'medium' | 'low'
  category?: SignalCategory
  advice?: string
}

export interface AnalysisResult {
  url: string
  score: number
  level: RiskLevel
  signals: RiskSignal[]
  features: UrlFeatures
  analyzedAt: number
  domScore?: number
  domSignals?: RiskSignal[]
  mlEnhanced?: boolean
  /** Host is on the user's trusted list — checks were skipped, verdict forced safe. */
  trusted?: boolean
}

export interface StoredResult extends AnalysisResult {
  urlHash: string
}

export interface DomFeatures {
  hasPasswordOnHttp: boolean
  hasExternalFormAction: boolean
  suspiciousBrandLogos: string[]
  hasObfuscatedJs: boolean
  hasClickjacking: boolean
  hasCryptoDrainer: boolean
}

export interface IntelThreatPayload {
  tabId: number
  domain: string
  listings: Array<{ source: string; listed: boolean }>
  ageDays: number | null
  vtMalicious?: number
  vtSuspicious?: number
}

export type ExtensionMessage =
  | { type: 'ANALYSIS_RESULT'; result: AnalysisResult }
  | { type: 'DOM_FEATURES'; features: DomFeatures }
  | { type: 'INTEL_THREAT'; payload: IntelThreatPayload }
  | { type: 'GET_CURRENT_RESULT' }
  | { type: 'CURRENT_RESULT'; result: AnalysisResult | null }
  | { type: 'TOGGLE_PANEL' }
  | { type: 'CLOSE_PANEL' }
  | { type: 'TRUST_SITE'; host: string }
