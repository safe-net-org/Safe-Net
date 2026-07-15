import type { AnalysisResult, RiskLevel, RiskSignal, UrlFeatures } from './types'

function level(score: number): RiskLevel {
	if (score <= 30) return 'safe'
	if (score <= 70) return 'suspicious'
	return 'danger'
}

export function scoreUrl(url: string, features: UrlFeatures): AnalysisResult {
	let score = 0
	const signals: RiskSignal[] = []

	if (features.idnHomograph) {
		score = Math.max(score, 90)
		signals.push({
			key: 'idn_homograph',
			message: features.idnDetails ?? 'IDN-гомограф: визуально похожие символы',
			severity: 'high',
		})
	}

	if (features.brandImpersonation) {
		score = Math.max(score, 88)
		signals.push({
			key: 'brand_impersonation',
			message:
				features.impersonationDetail ??
				`Подмена бренда «${features.impersonatedBrand}»`,
			severity: 'high',
		})
	}

	if (
		features.isTyposquat &&
		features.levenshteinDistance >= 1 &&
		features.levenshteinDistance <= 2
	) {
		score = Math.max(score, 75)
		signals.push({
			key: 'typosquat',
			message: `Домен похож на «${features.nearestBrand}» — расстояние Левенштейна ${features.levenshteinDistance}`,
			severity: 'high',
		})
	}

	if (features.isLeetSquat) {
		score = Math.max(score, 80)
		signals.push({
			key: 'leet_squat',
			message: `Домен имитирует «${features.leetBrand}» подменой букв на цифры/символы`,
			severity: 'high',
		})
	}

	if (features.hasBrandToken && !features.brandImpersonation && !features.isTyposquat) {
		if (features.brandTokenViaLeet) {
			// A leeted brand inside a longer domain (`micros0ft-alerts.com`) is
			// unambiguous: a real owner never spells their brand with a zero.
			// Scored like leet-squatting rather than as a mere +35 signal — as an
			// additive bonus it landed at 35/100 and was reported "safe", which is
			// the verdict the courses' own phishing example would have received.
			score = Math.max(score, 80)
			signals.push({
				key: 'brand_token_leet',
				message: `Бренд «${features.brandToken}» вшит в домен с подменой букв на цифры — намеренный обход фильтров`,
				severity: 'high',
			})
		} else {
			score += 35
			signals.push({
				key: 'brand_token',
				message: `Имя бренда «${features.brandToken}» вшито в составной домен — типичная фишинг-схема`,
				severity: 'high',
			})
		}
	}

	if (features.isEncodedIp) {
		score += 40
		signals.push({
			key: 'encoded_ip',
			message: 'Домен записан как число/hex вместо имени — маскировка адреса',
			severity: 'high',
		})
	}

	if (features.hasIp) {
		score += 35
		signals.push({ key: 'ip_domain', message: 'Домен — IP-адрес вместо названия сайта', severity: 'high' })
	}

	if (features.hasPunycode) {
		score += 30
		const decoded = features.punycodeDecoded ? ` → «${features.punycodeDecoded}»` : ''
		signals.push({
			key: 'punycode',
			message: `Домен содержит punycode (xn--)${decoded} — подозрение на visual spoofing`,
			severity: 'high',
		})
	}

	if (features.credentialInQuery) {
		score += 30
		signals.push({
			key: 'credential_in_query',
			message: `Учётные данные прямо в параметрах URL: ${features.credentialParams.slice(0, 3).join(', ')}`,
			severity: 'high',
		})
	}

	if (features.hasDangerousExtension) {
		score += 30
		signals.push({
			key: 'dangerous_file',
			message: `Ссылка ведёт на исполняемый файл (${features.dangerousExtension})`,
			severity: 'high',
		})
	}

	if (features.hasDataUri) {
		score += 25
		signals.push({
			key: 'data_uri',
			message: 'data:-URL — содержимое встроено прямо в ссылку',
			severity: 'medium',
		})
	}

	if (features.hasSuspiciousScheme && !features.hasDataUri) {
		score += 20
		signals.push({
			key: 'suspicious_scheme',
			message: 'Необычная схема URL (не http/https)',
			severity: 'medium',
		})
	}

	if (features.isTldSwap) {
		score += 25
		signals.push({
			key: 'tld_swap',
			message: `Бренд «${features.nearestBrand}» в подозрительной TLD-зоне`,
			severity: 'medium',
		})
	}

	if (!features.hasHttps && !features.hasSuspiciousScheme) {
		score += 20
		signals.push({ key: 'no_https', message: 'Сайт не использует HTTPS — данные передаются незащищённо', severity: 'medium' })
	}

	if (features.isUrlShortener) {
		score += 15
		signals.push({
			key: 'url_shortener',
			message: 'Сокращатель ссылок скрывает настоящий адрес назначения',
			severity: 'medium',
		})
	}

	if (features.subdomainDepth >= 3) {
		score += 15
		signals.push({ key: 'deep_subdomain', message: `Подозрительно глубокие поддомены (${features.subdomainDepth} уровней)`, severity: 'medium' })
	}

	if (features.suspiciousWordCount >= 2) {
		score += features.suspiciousWordCount * 8
		signals.push({ key: 'suspicious_words', message: `Подозрительные слова в URL: ${features.suspiciousWords.slice(0, 3).join(', ')}`, severity: 'medium' })
	} else if (features.suspiciousWordCount === 1) {
		score += 8
		signals.push({ key: 'suspicious_word', message: `Подозрительное слово в URL: «${features.suspiciousWords[0]}»`, severity: 'low' })
	}

	if (features.tldSuspicion > 0 && !features.isTldSwap) {
		score += 15
		signals.push({ key: 'suspicious_tld', message: 'TLD-зона часто используется для фишинга', severity: 'medium' })
	}

	if (features.hasFreeHosting) {
		score += 20
		signals.push({ key: 'free_hosting', message: 'Сайт размещён на бесплатном хостинге', severity: 'medium' })
	}

	if (
		features.hasCyrillicInDomain &&
		!features.idnHomograph &&
		!features.brandImpersonation
	) {
		score += 10
		signals.push({ key: 'cyrillic_domain', message: 'Домен содержит кириллические символы', severity: 'low' })
	}

	if (features.nonStandardPort) {
		score += 10
		signals.push({ key: 'nonstandard_port', message: `Нестандартный порт (${features.port})`, severity: 'low' })
	}

	if (features.urlLength > 100) {
		score += 10
		signals.push({ key: 'long_url', message: `Необычно длинный URL (${features.urlLength} символов)`, severity: 'low' })
	}

	if (features.domainEntropy > 4.0) {
		score += 12
		signals.push({ key: 'high_entropy', message: 'Домен содержит случайно сгенерированную последовательность символов', severity: 'medium' })
	}

	if (features.atCount > 0) {
		score += 20
		signals.push({ key: 'at_sign', message: 'URL содержит символ @ — маскировка реального домена', severity: 'high' })
	}

	if (features.hasHexEncoding) {
		score += 10
		signals.push({ key: 'hex_encoding', message: 'URL содержит hex-кодирование символов', severity: 'low' })
	}

	if (features.hasExcessiveEncoding) {
		score += 15
		signals.push({ key: 'excessive_encoding', message: 'Чрезмерное или двойное %-кодирование — попытка скрыть реальный адрес', severity: 'medium' })
	}

	if (features.hasBase64InPath) {
		score += 12
		signals.push({ key: 'base64_path', message: 'В пути URL длинная base64-строка — возможен скрытый редирект', severity: 'medium' })
	}

	if (features.hasMultipleDomains) {
		score += 15
		signals.push({ key: 'multiple_domains', message: 'В URL обнаружено несколько доменов', severity: 'medium' })
	}

	if (features.hyphenCount >= 4) {
		score += 8
		signals.push({ key: 'many_hyphens', message: `Много дефисов в домене (${features.hyphenCount})`, severity: 'low' })
	}

	const finalScore = Math.min(Math.round(score), 100)
	const order: Record<RiskSignal['severity'], number> = { high: 0, medium: 1, low: 2 }

	return {
		url,
		score: finalScore,
		level: level(finalScore),
		signals: signals.sort((a, b) => order[a.severity] - order[b.severity]),
		features,
		analyzedAt: Date.now(),
	}
}
