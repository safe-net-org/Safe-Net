/**
 * Health probe for the optional ML service.
 *
 * The settings store a /predict endpoint (or nothing), so the probe derives
 * the sibling /health URL from whatever the user typed — a bare origin, a
 * trailing slash, or the full /predict path all resolve to the same place.
 */

export const DEFAULT_ML_SERVICE_URL = 'http://localhost:8000/predict'
const PREDICT_PATH_SUFFIX = '/predict'

export interface MlHealth {
  status: string
  model_loaded: boolean
  version?: string
  model_architecture?: string
  model_id?: string
  model_revision?: string
}

function isLoopback(hostname: string): boolean {
  return hostname === 'localhost'
    || hostname === '127.0.0.1'
    || hostname === '[::1]'
}

/**
 * Returns a canonical prediction endpoint, or null when using it could expose
 * browsing data (non-HTTP scheme, credentials, remote plaintext HTTP, etc.).
 */
export function normalizeMlServiceUrl(rawEndpoint: string): string | null {
  try {
    const endpoint = new URL(rawEndpoint.trim() || DEFAULT_ML_SERVICE_URL)
    if (endpoint.protocol !== 'https:'
      && !(endpoint.protocol === 'http:' && isLoopback(endpoint.hostname))) {
      return null
    }
    if (!endpoint.hostname || endpoint.username || endpoint.password) return null
    if (endpoint.search || endpoint.hash) return null

    const path = endpoint.pathname.replace(/\/+$/, '')
    endpoint.pathname = path || '/predict'
    return endpoint.toString()
  } catch {
    return null
  }
}

export function healthUrlFrom(predictEndpoint: string): string | null {
  const normalized = normalizeMlServiceUrl(predictEndpoint)
  if (!normalized) return null

  const health = new URL(normalized)
  const path = health.pathname.replace(/\/+$/, '')
  health.pathname = path.endsWith(PREDICT_PATH_SUFFIX)
    ? `${path.slice(0, -PREDICT_PATH_SUFFIX.length)}/health`
    : `${path}/health`
  return health.toString()
}

export async function checkMlHealth(
  predictEndpoint: string,
  timeoutMs = 3000,
): Promise<MlHealth | null> {
  const healthUrl = healthUrlFrom(predictEndpoint)
  if (!healthUrl) return null

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(healthUrl, {
      signal: controller.signal,
    })
    if (!response.ok) return null
    const value = await response.json() as Partial<MlHealth>
    if (typeof value.status !== 'string' || typeof value.model_loaded !== 'boolean') return null
    return value as MlHealth
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}
