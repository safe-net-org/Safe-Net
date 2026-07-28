import {
  healthUrlFrom,
  normalizeMlServiceUrl,
} from '../src/shared/lib/ml-health'
import { queryMlService } from '../src/features/analyze-url/model/ml-service'
import { fetchDomainIntel } from '../src/features/domain-intel/model/intel'
import {
  DEFAULT_SETTINGS,
  getSettings,
  normalizeSettings,
} from '../src/shared/lib/settings'
import { sanitizeUrlForMl } from '../src/shared/lib/url-privacy'

function equal<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${String(expected)}, got ${String(actual)}`)
  }
}

function ok(condition: boolean, label: string): void {
  if (!condition) throw new Error(label)
}

// Fresh installs make neither optional network layer eligible to run.
equal(DEFAULT_SETTINGS.intelEnabled, false, 'fresh threat-intel default')
equal(DEFAULT_SETTINGS.mlEnabled, false, 'fresh ML default')
equal(DEFAULT_SETTINGS.locale, 'en', 'deterministic locale default')
equal(normalizeSettings().mlEnabled, false, 'fresh normalized ML default')
equal(normalizeSettings(undefined, 'ru').locale, 'ru', 'browser locale fallback')
equal(normalizeSettings({ locale: 'en' }, 'ru').locale, 'en', 'saved locale wins')

// A saved pre-split setting keeps its old effective behaviour.
equal(
  normalizeSettings({ intelEnabled: true }).mlEnabled,
  true,
  'legacy enabled gate migration',
)
equal(
  normalizeSettings({ intelEnabled: false }).mlEnabled,
  false,
  'legacy disabled gate migration',
)
equal(
  normalizeSettings({ intelEnabled: true, mlEnabled: false }).mlEnabled,
  false,
  'explicit new ML setting wins',
)

const sanitized = sanitizeUrlForMl(
  'https://alice:super-secret@example.com:8443/account/login'
  + '?token=private-value&next=%2Fdashboard#session-secret',
)
equal(
  sanitized,
  'https://example.com:8443/account/login'
  + '?token=%5Bredacted%5D&next=%5Bredacted%5D',
  'URL sanitizer',
)
for (const secret of ['alice', 'super-secret', 'private-value', 'session-secret']) {
  ok(!sanitized?.includes(secret), `sanitizer leaked ${secret}`)
}
equal(
  sanitizeUrlForMl('https://example.com/check?id=one&id=two&flag'),
  'https://example.com/check'
  + '?id=%5Bredacted%5D&id=%5Bredacted%5D&flag=%5Bredacted%5D',
  'query names and multiplicity',
)
equal(sanitizeUrlForMl('file:///tmp/private'), null, 'non-HTTP URL')
equal(sanitizeUrlForMl('not a URL'), null, 'relative URL')

equal(
  normalizeMlServiceUrl(''),
  'http://localhost:8000/predict',
  'default local endpoint',
)
equal(
  normalizeMlServiceUrl('https://ml.example.com'),
  'https://ml.example.com/predict',
  'remote HTTPS endpoint',
)
equal(
  normalizeMlServiceUrl('http://ml.example.com/predict'),
  null,
  'remote plaintext endpoint',
)
equal(
  normalizeMlServiceUrl('https://user:secret@ml.example.com/predict'),
  null,
  'credential-bearing endpoint',
)
equal(
  normalizeMlServiceUrl('https://ml.example.com/predict?token=secret'),
  null,
  'endpoint query secret',
)
equal(
  healthUrlFrom('https://ml.example.com/v1/predict'),
  'https://ml.example.com/v1/health',
  'health endpoint',
)

// Exercise the real gates with fresh storage: neither optional layer may even
// reach fetch until the user opts in.
let fetchCalls = 0
let storageState: Record<string, unknown> = {}
Object.defineProperty(globalThis, 'browser', {
  configurable: true,
  value: {
    storage: {
      local: {
        get: async () => storageState,
        set: async (patch: Record<string, unknown>) => {
          storageState = { ...storageState, ...patch }
        },
      },
    },
  },
})
const originalFetch = globalThis.fetch
globalThis.fetch = (async () => {
  fetchCalls += 1
  throw new Error('fetch must not run with fresh defaults')
}) as typeof fetch

equal(await queryMlService('https://example.com/private?token=secret'), null, 'fresh ML gate')
await fetchDomainIntel('example.com')
equal(fetchCalls, 0, 'fresh install optional network calls')

// The real storage path performs and persists the legacy split.
storageState = {
  safenet_settings: {
    vtApiKey: '',
    intelEnabled: true,
    mlServiceUrl: '',
  },
}
const migrated = await getSettings()
equal(migrated.mlEnabled, true, 'persisted legacy ML migration')
equal(
  (storageState.safenet_settings as { mlEnabled?: boolean }).mlEnabled,
  true,
  'legacy migration write',
)

// Exercise the actual request boundary and assert that its JSON body contains
// the sanitized URL, never the original secrets.
let transmittedUrl = ''
globalThis.fetch = (async (_input, init) => {
  fetchCalls += 1
  transmittedUrl = JSON.parse(String(init?.body)).url as string
  return new Response(JSON.stringify({
    score: 10,
    level: 'safe',
    probability: 0.1,
    ml_probability: 0.1,
    signals: [],
  }), { status: 200 })
}) as typeof fetch
await queryMlService(
  'https://alice:super-secret@example.com/login'
  + '?token=private-value#session-secret',
)
equal(
  transmittedUrl,
  'https://example.com/login?token=%5Bredacted%5D',
  'request boundary sanitizer',
)
equal(fetchCalls, 1, 'opted-in ML request count')
globalThis.fetch = originalFetch

console.log('Extension privacy, migration, sanitizer, and endpoint checks passed.')
