import { legalMessages } from '../i18n/legal-messages'
import { guardSignalMessages } from '../i18n/guard-signal-messages'
import { messages } from '../i18n/messages'

type Catalog = Record<string, unknown>

function leafPaths(value: unknown, path = ''): string[] {
	if (Array.isArray(value)) {
		return value.flatMap((item, index) => leafPaths(item, `${path}[${index}]`))
	}

	if (value !== null && typeof value === 'object') {
		return Object.entries(value as Catalog).flatMap(([key, item]) =>
			leafPaths(item, path ? `${path}.${key}` : key)
		)
	}

	return [path]
}

function emptyStringPaths(value: unknown, path = ''): string[] {
	if (Array.isArray(value)) {
		return value.flatMap((item, index) => emptyStringPaths(item, `${path}[${index}]`))
	}

	if (value !== null && typeof value === 'object') {
		return Object.entries(value as Catalog).flatMap(([key, item]) =>
			emptyStringPaths(item, path ? `${path}.${key}` : key)
		)
	}

	return typeof value === 'string' && value.trim().length === 0 ? [path] : []
}

function compareCatalog(name: string, en: unknown, ru: unknown): string[] {
	const enPaths = new Set(leafPaths(en))
	const ruPaths = new Set(leafPaths(ru))
	const errors: string[] = []

	for (const path of enPaths) {
		if (!ruPaths.has(path)) errors.push(`${name}: missing Russian value at ${path}`)
	}

	for (const path of ruPaths) {
		if (!enPaths.has(path)) errors.push(`${name}: missing English value at ${path}`)
	}

	for (const path of emptyStringPaths(en)) {
		errors.push(`${name}: empty English value at ${path}`)
	}

	for (const path of emptyStringPaths(ru)) {
		errors.push(`${name}: empty Russian value at ${path}`)
	}

	return errors
}

const errors = [
	...compareCatalog('interface', messages.en, messages.ru),
	...compareCatalog('legal', legalMessages.en, legalMessages.ru),
	...compareCatalog('guard signals', guardSignalMessages.en, guardSignalMessages.ru),
]

if (errors.length > 0) {
	console.error(`Localization contract failed with ${errors.length} issue(s):`)
	for (const error of errors) console.error(`- ${error}`)
	process.exit(1)
}

console.log(
	`Localization contract passed: ${leafPaths(messages.en).length} interface values, ${leafPaths(legalMessages.en).length} legal values, and ${leafPaths(guardSignalMessages.en).length} Guard signal values per locale.`
)
