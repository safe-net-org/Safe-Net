import { useEffect, useState } from 'react'
import { FONT_MONO, T } from '@/src/shared/config/tokens'
import { useExtensionI18n } from '@/src/shared/i18n/ExtensionLocaleProvider'
import { getTrustedHosts, untrustHost } from '@/src/shared/lib/allowlist'
import {
  checkMlHealth,
  normalizeMlServiceUrl,
  type MlHealth,
} from '@/src/shared/lib/ml-health'
import { DEFAULT_SETTINGS, getSettings, saveSettings, type Settings } from '@/src/shared/lib/settings'

type SaveState = 'idle' | 'saved'

type MlProbe =
  | { state: 'idle' }
  | { state: 'checking' }
  | { state: 'invalid' }
  | { state: 'offline' }
  | { state: 'online'; health: MlHealth }

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  background: T.bg,
  border: `1px solid ${T.borderStrong}`,
  borderRadius: 10,
  padding: '9px 11px',
  color: T.text,
  fontSize: 12,
  fontFamily: FONT_MONO,
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, color: T.text,
  marginBottom: 6, display: 'block', letterSpacing: '-0.01em',
}

const hintStyle: React.CSSProperties = {
  fontSize: 10.5, color: T.textMuted, lineHeight: 1.5, marginTop: 6,
}

export function SettingsTab() {
  const { locale, setLocale, t } = useExtensionI18n()
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [save, setSave] = useState<SaveState>('idle')
  const [revealKey, setRevealKey] = useState(false)
  const [mlProbe, setMlProbe] = useState<MlProbe>({ state: 'idle' })
  const [trustedHosts, setTrustedHosts] = useState<string[]>([])
  const normalizedMlEndpoint = normalizeMlServiceUrl(settings.mlServiceUrl)

  useEffect(() => {
    getSettings().then(setSettings).catch(() => {})
    getTrustedHosts().then(setTrustedHosts).catch(() => {})
  }, [])

  async function removeTrusted(host: string) {
    setTrustedHosts(await untrustHost(host))
  }

  async function persist(patch: Partial<Settings>) {
    const next = await saveSettings(patch)
    setSettings(next)
    setSave('saved')
    setTimeout(() => setSave('idle'), 1600)
  }

  async function probeMl() {
    if (!settings.mlEnabled || !normalizedMlEndpoint) {
      setMlProbe({ state: 'invalid' })
      return
    }
    setMlProbe({ state: 'checking' })
    const health = await checkMlHealth(settings.mlServiceUrl)
    setMlProbe(health ? { state: 'online', health } : { state: 'offline' })
  }

  async function toggleMl() {
    if (!settings.mlEnabled && !normalizedMlEndpoint) {
      setMlProbe({ state: 'invalid' })
      return
    }
    if (settings.mlEnabled) setMlProbe({ state: 'idle' })
    await persist({ mlEnabled: !settings.mlEnabled })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <section style={{
        background: T.surface, border: `1px solid ${T.border}`,
        borderRadius: T.radTile, padding: '14px 14px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: T.text }}>
              {t('settings.language')}
            </div>
            <div style={hintStyle}>{t('settings.languageHint')}</div>
          </div>
          <div style={{
            display: 'flex', padding: 3, gap: 2,
            borderRadius: 10, border: `1px solid ${T.border}`,
            background: T.bg,
          }}>
            {(['en', 'ru'] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={locale === value}
                onClick={() => {
                  setSettings((current) => ({ ...current, locale: value }))
                  void setLocale(value)
                }}
                style={{
                  border: 'none', borderRadius: 7, padding: '6px 10px',
                  background: locale === value ? T.surface2 : 'transparent',
                  color: locale === value ? T.text : T.textDim,
                  fontFamily: FONT_MONO, fontSize: 10.5, fontWeight: 700,
                  cursor: 'pointer', transition: 'background 0.18s, color 0.18s',
                }}
              >
                {value.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* THREAT INTELLIGENCE */}
      <section style={{
        background: T.surface, border: `1px solid ${T.border}`,
        borderRadius: T.radTile, padding: '14px 14px',
      }}>
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          gap: 12, marginBottom: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>🌐</span>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: T.text }}>
              {t('settings.intel.title')}
            </span>
          </div>
          <button
            type="button"
            role="switch"
            aria-label={t('settings.intel.title')}
            aria-checked={settings.intelEnabled}
            onClick={() => persist({ intelEnabled: !settings.intelEnabled })}
            style={{
              flexShrink: 0, width: 44, height: 24, borderRadius: 999,
              border: 'none', cursor: 'pointer', position: 'relative',
              background: settings.intelEnabled ? T.ok : T.border,
              transition: 'background 0.18s cubic-bezier(.22, 1, .36, 1)',
            }}
          >
            <span style={{
              position: 'absolute', top: 2, left: settings.intelEnabled ? 22 : 2,
              width: 20, height: 20, borderRadius: '50%', background: '#fff',
              transition: 'left 0.18s cubic-bezier(.22, 1, .36, 1)',
            }} />
          </button>
        </div>
        <div style={{ fontSize: 10.5, color: T.textMuted, lineHeight: 1.5 }}>
          {t('settings.intel.purpose')}
        </div>
        <div style={{
          ...hintStyle,
          padding: '9px 10px',
          background: T.bg,
          border: `1px solid ${T.border}`,
          borderRadius: 9,
        }}>
          <strong style={{ color: T.text }}>{t('settings.deviceData')}</strong>
          {t('settings.intel.data')}
        </div>
        <div style={{
          marginTop: 7, fontSize: 9.5, color: settings.intelEnabled ? T.ok : T.textDim,
          fontFamily: FONT_MONO, letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          {settings.intelEnabled ? t('settings.on') : t('settings.offDefault')}
        </div>

        <div style={{ height: 1, background: T.border, margin: '12px 0' }} />
        <label style={labelStyle}>{t('settings.vt.title')}</label>
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            type={revealKey ? 'text' : 'password'}
            value={settings.vtApiKey}
            placeholder={t('settings.vt.placeholder')}
            spellCheck={false}
            autoComplete="off"
            disabled={!settings.intelEnabled}
            aria-label={t('settings.vt.title')}
            onChange={(e) => setSettings({ ...settings, vtApiKey: e.target.value })}
            onBlur={() => persist({ vtApiKey: settings.vtApiKey })}
            style={{ ...inputStyle, opacity: settings.intelEnabled ? 1 : 0.55 }}
          />
          <button
            type="button"
            onClick={() => setRevealKey((v) => !v)}
            title={t(revealKey ? 'settings.hide' : 'settings.show')}
            aria-label={t(revealKey ? 'settings.hide' : 'settings.show')}
            disabled={!settings.intelEnabled}
            style={{
              flexShrink: 0, background: T.surface2, border: `1px solid ${T.borderStrong}`,
              borderRadius: 10, color: T.textMuted,
              cursor: settings.intelEnabled ? 'pointer' : 'default',
              opacity: settings.intelEnabled ? 1 : 0.55,
              padding: '0 11px', fontSize: 14,
            }}
          >
            {revealKey ? '🙈' : '👁'}
          </button>
        </div>
        <div style={hintStyle}>
          {t('settings.vt.data')}
        </div>
      </section>

      {/* ML SERVICE */}
      <section style={{
        background: T.surface, border: `1px solid ${T.border}`,
        borderRadius: T.radTile, padding: '14px 14px',
      }}>
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          gap: 12, marginBottom: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>🧠</span>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: T.text }}>
              {t('settings.ml.title')}
            </span>
          </div>
          <button
            type="button"
            role="switch"
            aria-label={t('settings.ml.title')}
            aria-checked={settings.mlEnabled}
            onClick={toggleMl}
            style={{
              flexShrink: 0, width: 44, height: 24, borderRadius: 999,
              border: 'none', cursor: 'pointer', position: 'relative',
              background: settings.mlEnabled ? T.ok : T.border,
              transition: 'background 0.18s cubic-bezier(.22, 1, .36, 1)',
            }}
          >
            <span style={{
              position: 'absolute', top: 2, left: settings.mlEnabled ? 22 : 2,
              width: 20, height: 20, borderRadius: '50%', background: '#fff',
              transition: 'left 0.18s cubic-bezier(.22, 1, .36, 1)',
            }} />
          </button>
        </div>
        <div style={{ fontSize: 10.5, color: T.textMuted, lineHeight: 1.5 }}>
          {t('settings.ml.purpose')}
        </div>
        <div style={{
          ...hintStyle,
          padding: '9px 10px',
          background: T.bg,
          border: `1px solid ${T.border}`,
          borderRadius: 9,
        }}>
          <strong style={{ color: T.text }}>{t('settings.deviceData')}</strong>
          {t('settings.ml.data')}
        </div>
        <div style={{
          marginTop: 7, marginBottom: 11,
          fontSize: 9.5, color: settings.mlEnabled ? T.ok : T.textDim,
          fontFamily: FONT_MONO, letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          {settings.mlEnabled ? t('settings.on') : t('settings.offDefault')}
        </div>
        <label style={labelStyle}>{t('settings.ml.endpoint')}</label>
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            type="url"
            value={settings.mlServiceUrl}
            placeholder="http://localhost:8000/predict"
            spellCheck={false}
            autoComplete="off"
            aria-invalid={!normalizedMlEndpoint}
            aria-describedby="ml-endpoint-help"
            onChange={(e) => {
              setMlProbe({ state: 'idle' })
              setSettings({ ...settings, mlServiceUrl: e.target.value })
            }}
            onBlur={() => persist({ mlServiceUrl: settings.mlServiceUrl })}
            style={inputStyle}
          />
          <button
            type="button"
            onClick={probeMl}
            disabled={!settings.mlEnabled || !normalizedMlEndpoint || mlProbe.state === 'checking'}
            title={t('settings.ml.check')}
            aria-label={t('settings.ml.check')}
            style={{
              flexShrink: 0, background: T.surface2, border: `1px solid ${T.borderStrong}`,
              borderRadius: 10, color: T.textMuted,
              cursor: mlProbe.state === 'checking'
                ? 'wait'
                : settings.mlEnabled && normalizedMlEndpoint ? 'pointer' : 'default',
              opacity: settings.mlEnabled && normalizedMlEndpoint ? 1 : 0.55,
              padding: '0 11px', fontSize: 11, fontFamily: FONT_MONO,
            }}
          >
            {mlProbe.state === 'checking' ? '…' : 'ping'}
          </button>
        </div>
        {mlProbe.state !== 'idle' && (
          <div style={{
            marginTop: 6, fontSize: 10.5, fontFamily: FONT_MONO,
            color: mlProbe.state === 'online'
              ? T.ok
              : mlProbe.state === 'offline' || mlProbe.state === 'invalid'
                ? T.danger
                : T.textMuted,
          }}>
            {mlProbe.state === 'checking' && t('settings.ml.checking')}
            {mlProbe.state === 'invalid' && `✗ ${t('settings.ml.invalid')}`}
            {mlProbe.state === 'offline' && `✗ ${t('settings.ml.offline')}`}
            {mlProbe.state === 'online' && (
              mlProbe.health.model_loaded
                ? `✓ ${t('settings.ml.onlineModel', {
                    model: mlProbe.health.model_architecture ?? 'BERT-large',
                    version: mlProbe.health.version ? ` · v${mlProbe.health.version}` : '',
                  })}`
                : `✓ ${t('settings.ml.onlineRules')}`
            )}
          </div>
        )}
        <div id="ml-endpoint-help" style={{
          ...hintStyle,
          color: normalizedMlEndpoint ? T.textMuted : T.danger,
        }}>
          {normalizedMlEndpoint
            ? t('settings.ml.endpointHint')
            : t('settings.ml.invalid')}
        </div>
      </section>

      {/* TRUSTED HOSTS */}
      <section style={{
        background: T.surface, border: `1px solid ${T.border}`,
        borderRadius: T.radTile, padding: '14px 14px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 16 }}>✅</span>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: T.text }}>{t('settings.trusted.title')}</span>
        </div>
        {trustedHosts.length === 0 ? (
          <div style={hintStyle}>
            {t('settings.trusted.empty')}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {trustedHosts.map((host) => (
              <div key={host} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                background: T.bg, border: `1px solid ${T.border}`,
                borderRadius: 10, padding: '7px 11px',
              }}>
                <span style={{
                  fontSize: 12, fontFamily: FONT_MONO, color: T.text,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {host}
                </span>
                <button
                  onClick={() => removeTrusted(host)}
                  title={t('settings.trusted.remove')}
                  aria-label={`${t('settings.trusted.remove')}: ${host}`}
                  style={{
                    flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer',
                    color: T.textMuted, fontSize: 13, padding: '2px 4px',
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
            <div style={hintStyle}>
              {t('settings.trusted.hint')}
            </div>
          </div>
        )}
      </section>

      <div style={{
        textAlign: 'center', fontSize: 10.5, fontFamily: FONT_MONO,
        letterSpacing: '0.1em', color: save === 'saved' ? T.ok : T.textDim,
        height: 14, transition: 'color 0.2s',
      }} aria-live="polite">
        {save === 'saved' ? `✓ ${t('settings.saved')}` : t('settings.autoSave')}
      </div>
    </div>
  )
}
