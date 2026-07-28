export function normalizeEmail(value: string): string
export function normalizeEmail(value: unknown): unknown
export function normalizeEmail(value: unknown): unknown {
	return typeof value === 'string' ? value.trim().toLowerCase() : value
}
