import type { RiskSignal, UrlFeatures } from '@safe-net/guard-core'

import type { Locale } from './messages'

export const guardSignalMessages = {
	en: {
		idn_homograph: 'The domain mixes look-alike characters from different writing systems.',
		brand_impersonation: 'The domain visually impersonates “{brand}”.',
		typosquat: 'The domain is {distance} edit(s) away from “{brand}”.',
		leet_squat: 'The domain imitates “{brand}” by replacing letters with numbers or symbols.',
		brand_token_leet:
			'“{brand}” is embedded in a longer domain with letter-to-number substitutions.',
		brand_token: 'The brand name “{brand}” is embedded in a different registrable domain.',
		encoded_ip: 'The host is encoded as a number or hexadecimal value instead of a domain name.',
		ip_domain: 'The link uses an IP address instead of a named domain.',
		punycode: 'The domain contains Punycode (xn--), which can hide look-alike characters.',
		credential_in_query: 'The URL exposes credential-like query fields: {params}.',
		dangerous_file: 'The link points to an executable or high-risk file ({extension}).',
		data_uri: 'The link embeds its content directly in a data: URL.',
		suspicious_scheme: 'The URL uses a scheme other than HTTP or HTTPS.',
		tld_swap: '“{brand}” appears under a suspicious top-level domain.',
		no_https: 'The site does not use HTTPS, so traffic is not protected in transit.',
		url_shortener: 'A URL shortener hides the final destination.',
		deep_subdomain: 'The address has an unusually deep subdomain chain ({depth} levels).',
		suspicious_words: 'The URL contains several pressure or account words: {words}.',
		suspicious_word: 'The URL contains a potentially manipulative word: “{words}”.',
		suspicious_tld: 'This top-level domain is frequently abused in phishing campaigns.',
		free_hosting: 'The site is hosted on a free hosting platform.',
		cyrillic_domain: 'The domain contains Cyrillic characters.',
		nonstandard_port: 'The URL uses a non-standard port ({port}).',
		long_url: 'The URL is unusually long ({length} characters).',
		high_entropy: 'The domain contains a sequence that looks randomly generated.',
		at_sign: 'The URL contains @, which can disguise the real destination.',
		hex_encoding: 'The URL contains hexadecimal character encoding.',
		excessive_encoding: 'The URL uses excessive or repeated percent-encoding.',
		base64_path: 'The path contains a long Base64-like sequence that may hide a redirect.',
		multiple_domains: 'The URL text contains more than one domain.',
		many_hyphens: 'The domain contains an unusual number of hyphens ({count}).',
		unknown: 'The local engine detected an additional risk signal ({key}).',
	},
	ru: {
		idn_homograph: 'В домене смешаны похожие символы из разных систем письма.',
		brand_impersonation: 'Домен визуально имитирует «{brand}».',
		typosquat: 'Домен отличается от «{brand}» на {distance} символа.',
		leet_squat: 'Домен имитирует «{brand}», заменяя буквы цифрами или символами.',
		brand_token_leet:
			'«{brand}» встроен в более длинный домен с заменой букв на цифры.',
		brand_token: 'Название бренда «{brand}» встроено в другой регистрируемый домен.',
		encoded_ip: 'Хост записан числом или hex-значением вместо доменного имени.',
		ip_domain: 'В ссылке используется IP-адрес вместо доменного имени.',
		punycode: 'Домен содержит Punycode (xn--), который может скрывать похожие символы.',
		credential_in_query: 'В URL есть параметры, похожие на учётные данные: {params}.',
		dangerous_file: 'Ссылка ведёт на исполняемый или рискованный файл ({extension}).',
		data_uri: 'Ссылка встраивает содержимое прямо в data: URL.',
		suspicious_scheme: 'URL использует схему, отличную от HTTP или HTTPS.',
		tld_swap: '«{brand}» расположен в подозрительной доменной зоне.',
		no_https: 'Сайт не использует HTTPS, поэтому трафик не защищён при передаче.',
		url_shortener: 'Сокращатель ссылок скрывает конечный адрес.',
		deep_subdomain: 'В адресе необычно глубокая цепочка поддоменов ({depth} уровня).',
		suspicious_words: 'URL содержит несколько слов давления или аккаунта: {words}.',
		suspicious_word: 'URL содержит потенциально манипулятивное слово: «{words}».',
		suspicious_tld: 'Эта доменная зона часто используется в фишинговых кампаниях.',
		free_hosting: 'Сайт размещён на бесплатной хостинг-платформе.',
		cyrillic_domain: 'Домен содержит кириллические символы.',
		nonstandard_port: 'URL использует нестандартный порт ({port}).',
		long_url: 'URL необычно длинный ({length} символов).',
		high_entropy: 'Домен содержит последовательность, похожую на случайно сгенерированную.',
		at_sign: 'URL содержит @, который может маскировать настоящий адрес.',
		hex_encoding: 'URL содержит шестнадцатеричное кодирование символов.',
		excessive_encoding: 'URL использует чрезмерное или повторное %-кодирование.',
		base64_path: 'Путь содержит длинную Base64-последовательность, которая может скрывать редирект.',
		multiple_domains: 'В тексте URL обнаружено несколько доменов.',
		many_hyphens: 'Домен содержит необычно много дефисов ({count}).',
		unknown: 'Локальный движок обнаружил дополнительный сигнал риска ({key}).',
	},
} as const

function interpolate(template: string, values: Record<string, string | number>): string {
	return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? key))
}

export function translateRiskSignal(
	locale: Locale,
	signal: RiskSignal,
	features: UrlFeatures
): string {
	const catalog = guardSignalMessages[locale] as Record<string, string>
	const template = catalog[signal.key] ?? catalog.unknown

	return interpolate(template, {
		key: signal.key,
		brand:
			features.impersonatedBrand ||
			features.leetBrand ||
			features.brandToken ||
			features.nearestBrand ||
			'brand',
		distance: features.levenshteinDistance,
		params: features.credentialParams.slice(0, 3).join(', '),
		extension: features.dangerousExtension ?? 'file',
		depth: features.subdomainDepth,
		words: features.suspiciousWords.slice(0, 3).join(', '),
		port: features.port,
		length: features.urlLength,
		count: features.hyphenCount,
	})
}
