const REDACTED_QUERY_VALUE = '[redacted]'

/**
 * Produces the least-data URL that still keeps useful phishing features:
 * scheme, host, port, path, query parameter names, and parameter count.
 *
 * Credentials, every query value, and the fragment are removed before the
 * value crosses the extension boundary. Null means the input is not an
 * absolute HTTP(S) URL and must never be transmitted.
 */
export function sanitizeUrlForMl(rawUrl: string): string | null {
  try {
    const sanitized = new URL(rawUrl)
    if (!['http:', 'https:'].includes(sanitized.protocol) || !sanitized.hostname) {
      return null
    }

    sanitized.username = ''
    sanitized.password = ''
    sanitized.hash = ''

    const redactedQuery = new URLSearchParams()
    for (const [name] of sanitized.searchParams) {
      redactedQuery.append(name, REDACTED_QUERY_VALUE)
    }
    sanitized.search = redactedQuery.toString()

    return sanitized.toString()
  } catch {
    return null
  }
}
