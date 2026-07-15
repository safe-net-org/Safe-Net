import {
	DANGEROUS_EXTENSIONS,
	FREE_HOSTING_DOMAINS,
	SUSPICIOUS_SCHEMES,
	SUSPICIOUS_TLDS,
	SUSPICIOUS_WORDS,
	URL_SHORTENERS,
} from '../shared/brands'
import { punycodeToUnicode } from '../shared/punycode'
import {
	detectBrandToken,
	detectLeetSquat,
	hasBase64InPath,
	hasExcessiveEncoding,
} from './advanced'
import { detectBrandImpersonation } from './brand-impersonation'
import { detectIdnHomograph } from './idn-detector'
import { detectTyposquatting } from './typosquatting'
import type { UrlFeatures } from '../model/types'

const IP_REGEX = /^(\d{1,3}\.){3}\d{1,3}(:\d+)?$/
const HEX_REGEX = /%[0-9a-fA-F]{2}/g
const ENCODED_IP_REGEX = /^(0x[0-9a-f]+|\d{8,12})$/i

const CREDENTIAL_PARAMS = new Set([
	'token', 'password', 'passwd', 'pwd', 'auth', 'session', 'sessionid',
	'key', 'secret', 'access_token', 'api_key', 'apikey', 'otp', 'pin',
])

function shannonEntropy(str: string): number {
	const freq: Record<string, number> = {}
	for (const ch of str) freq[ch] = (freq[ch] ?? 0) + 1
	const len = str.length
	if (len === 0) return 0
	return -Object.values(freq).reduce((sum, count) => {
		const p = count / len
		return sum + p * Math.log2(p)
	}, 0)
}

function countMatches(str: string, pattern: RegExp): number {
	return (str.match(pattern) ?? []).length
}

function getSubdomainDepth(hostname: string): number {
	return Math.max(0, hostname.split('.').length - 2)
}

function getTld(hostname: string): string {
	return hostname.split('.').pop()!.toLowerCase()
}

function getRegistrableDomain(hostname: string): string {
	const parts = hostname.split('.')
	return parts.length >= 2 ? parts.slice(-2).join('.') : hostname
}

function hasFreeHostingDomain(hostname: string): boolean {
	return FREE_HOSTING_DOMAINS.some(h => hostname.endsWith(h))
}

function hasMultipleDomainsInUrl(rawUrl: string): boolean {
	const domainPattern = /[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/g
	const matches = rawUrl.match(domainPattern) ?? []
	return matches.length > 1
}

function createDefaultFeatures(rawUrl: string): UrlFeatures {
	return {
		urlLength: rawUrl.length, domainLength: 0, pathLength: 0, queryLength: 0,
		dotCount: 0, hyphenCount: 0, atCount: 0, digitCount: 0, slashCount: 0,
		queryParamCount: 0, hasIp: false, hasHttps: false, hasPunycode: false,
		hasCyrillicInDomain: false, hasPort: false, hasHexEncoding: false,
		hasDoubleSlash: false, hasFreeHosting: false, domainEntropy: 0,
		subdomainDepth: 0, suspiciousWordCount: 0, suspiciousWords: [],
		levenshteinDistance: 999, nearestBrand: '', idnHomograph: false,
		idnDetails: null, isTyposquat: false, tldSuspicion: 0,
		hasDataUri: false, hasMultipleDomains: false,
		registrableDomain: '', brandImpersonation: false, impersonatedBrand: '',
		impersonationDetail: null, isUrlShortener: false,
		hasDangerousExtension: false, dangerousExtension: null,
		hasSuspiciousScheme: false, isEncodedIp: false, mixedScript: false,
		scripts: [], punycodeDecoded: null, isTldSwap: false,
		credentialInQuery: false, credentialParams: [], nonStandardPort: false,
		port: '',
		isLeetSquat: false, leetBrand: '', hasBrandToken: false, brandToken: '', brandTokenViaLeet: false,
		hasExcessiveEncoding: false, hasBase64InPath: false,
	}
}

export function analyzeUrl(rawUrl: string): UrlFeatures {
	if (rawUrl.startsWith('data:')) {
		const def = createDefaultFeatures(rawUrl)
		return { ...def, hasDataUri: true, hasSuspiciousScheme: true }
	}

	let parsed: URL
	try {
		parsed = new URL(rawUrl)
	} catch {
		return createDefaultFeatures(rawUrl)
	}

	const rawHost = parsed.hostname.toLowerCase()
	const hasPunycode = rawHost.includes('xn--')
	const unicodeHost = punycodeToUnicode(rawHost)
	const path = parsed.pathname
	const query = parsed.search
	const fullUrl = rawUrl
	const protocol = parsed.protocol

	const suspiciousMatches = SUSPICIOUS_WORDS.filter(w =>
		fullUrl.toLowerCase().includes(w),
	)
	const idnResult = detectIdnHomograph(unicodeHost, hasPunycode)
	const typosquatResult = detectTyposquatting(unicodeHost)
	const brandResult = detectBrandImpersonation(unicodeHost)
	const leetResult = detectLeetSquat(unicodeHost)
	const brandTokenResult = detectBrandToken(unicodeHost)

	const registrableDomain = getRegistrableDomain(unicodeHost)
	const tld = getTld(unicodeHost)
	const tldSuspicious = SUSPICIOUS_TLDS.has('.' + tld)

	const credentialParams: string[] = []
	parsed.searchParams.forEach((_value, keyName) => {
		if (CREDENTIAL_PARAMS.has(keyName.toLowerCase())) credentialParams.push(keyName)
	})

	const port = parsed.port
	const hasPort = port !== ''
	const nonStandardPort = hasPort && port !== '80' && port !== '443'

	const lowerPath = path.toLowerCase()
	const dangerousExtension =
		DANGEROUS_EXTENSIONS.find(ext => lowerPath.endsWith(ext)) ?? null

	const isEncodedIp = ENCODED_IP_REGEX.test(rawHost)
	const hasSuspiciousScheme =
		SUSPICIOUS_SCHEMES.has(protocol) ||
		(protocol !== 'http:' && protocol !== 'https:')
	const isUrlShortener = URL_SHORTENERS.has(registrableDomain)
	// Exact brand sitting on a suspicious TLD = likely TLD swap (sberbank.xyz).
	const isTldSwap = typosquatResult.distance === 0 && tldSuspicious

	return {
		urlLength: fullUrl.length,
		domainLength: unicodeHost.length,
		pathLength: path.length,
		queryLength: query.length,
		dotCount: countMatches(unicodeHost, /\./g),
		hyphenCount: countMatches(unicodeHost, /-/g),
		atCount: countMatches(fullUrl, /@/g),
		digitCount: countMatches(unicodeHost, /\d/g),
		slashCount: countMatches(path, /\//g),
		queryParamCount: query ? query.slice(1).split('&').length : 0,
		hasIp: IP_REGEX.test(rawHost),
		hasHttps: protocol === 'https:',
		hasPunycode,
		hasCyrillicInDomain: idnResult.hasCyrillic,
		hasPort,
		hasHexEncoding: HEX_REGEX.test(fullUrl),
		hasDoubleSlash: path.includes('//'),
		hasFreeHosting: hasFreeHostingDomain(unicodeHost),
		domainEntropy: shannonEntropy(unicodeHost.replace(/\./g, '')),
		subdomainDepth: getSubdomainDepth(unicodeHost),
		suspiciousWordCount: suspiciousMatches.length,
		suspiciousWords: suspiciousMatches,
		levenshteinDistance: typosquatResult.distance,
		nearestBrand: typosquatResult.nearestBrand,
		idnHomograph: idnResult.isHomograph,
		idnDetails: idnResult.details,
		isTyposquat: typosquatResult.isTyposquat,
		tldSuspicion: tldSuspicious ? 1 : 0,
		hasDataUri: false,
		hasMultipleDomains: hasMultipleDomainsInUrl(fullUrl),
		registrableDomain,
		brandImpersonation: brandResult.brandImpersonation,
		impersonatedBrand: brandResult.impersonatedBrand,
		impersonationDetail: brandResult.impersonationDetail,
		isUrlShortener,
		hasDangerousExtension: dangerousExtension !== null,
		dangerousExtension,
		hasSuspiciousScheme,
		isEncodedIp,
		mixedScript: idnResult.mixedScript,
		scripts: idnResult.scripts,
		punycodeDecoded: hasPunycode ? unicodeHost : null,
		isTldSwap,
		credentialInQuery: credentialParams.length > 0,
		credentialParams,
		nonStandardPort,
		port,
		isLeetSquat: leetResult.isLeetSquat,
		leetBrand: leetResult.brand,
		hasBrandToken: brandTokenResult.hasBrandToken,
		brandToken: brandTokenResult.brand,
		brandTokenViaLeet: brandTokenResult.viaLeet,
		hasExcessiveEncoding: hasExcessiveEncoding(fullUrl),
		hasBase64InPath: hasBase64InPath(path),
	}
}
