import { useEffect, useState } from 'react'
import { FONT_MONO, T } from '@/src/shared/config/tokens'
import { DEFAULT_SETTINGS, getSettings, saveSettings, type Settings } from '@/src/shared/lib/settings'

type SaveState = 'idle' | 'saved'

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
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [save, setSave] = useState<SaveState>('idle')
  const [revealKey, setRevealKey] = useState(false)

  useEffect(() => {
    getSettings().then(setSettings).catch(() => {})
  }, [])

  async function persist(patch: Partial<Settings>) {
    const next = await saveSettings(patch)
    setSettings(next)
    setSave('saved')
    setTimeout(() => setSave('idle'), 1600)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* VIRUSTOTAL */}
      <section style={{
        background: T.surface, border: `1px solid ${T.border}`,
        borderRadius: T.radTile, padding: '14px 14px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 16 }}>🛡️</span>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: T.text }}>VirusTotal API</span>
        </div>

        <label style={labelStyle}>API-ключ (v3)</label>
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            type={revealKey ? 'text' : 'password'}
            value={settings.vtApiKey}
            placeholder="вставь свой ключ VirusTotal"
            spellCheck={false}
            autoComplete="off"
            onChange={(e) => setSettings({ ...settings, vtApiKey: e.target.value })}
            onBlur={() => persist({ vtApiKey: settings.vtApiKey })}
            style={inputStyle}
          />
          <button
            onClick={() => setRevealKey((v) => !v)}
            title={revealKey ? 'скрыть' : 'показать'}
            style={{
              flexShrink: 0, background: T.surface2, border: `1px solid ${T.borderStrong}`,
              borderRadius: 10, color: T.textMuted, cursor: 'pointer', padding: '0 11px', fontSize: 14,
            }}
          >
            {revealKey ? '🙈' : '👁'}
          </button>
        </div>
        <div style={hintStyle}>
          Бесплатный ключ: <span style={{ color: T.accentSoft, fontFamily: FONT_MONO }}>virustotal.com → API key</span>.
          Ключ хранится только в этом браузере и шлётся напрямую в VirusTotal. Лимит free-тарифа — 4 запроса/мин.
        </div>
      </section>

      {/* INTEL TOGGLE */}
      <section style={{
        background: T.surface, border: `1px solid ${T.border}`,
        borderRadius: T.radTile, padding: '12px 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>Внешние threat-feeds</div>
          <div style={{ fontSize: 10.5, color: T.textMuted, lineHeight: 1.5, marginTop: 3 }}>
            RDAP, DoH-блоклисты, crt.sh, URLhaus, VirusTotal. Выключи для полностью офлайн-режима.
          </div>
        </div>
        <button
          role="switch"
          aria-checked={settings.intelEnabled}
          onClick={() => persist({ intelEnabled: !settings.intelEnabled })}
          style={{
            flexShrink: 0, width: 44, height: 24, borderRadius: 999,
            border: 'none', cursor: 'pointer', position: 'relative',
            background: settings.intelEnabled ? T.ok : T.border,
            transition: 'background 0.18s',
          }}
        >
          <span style={{
            position: 'absolute', top: 2, left: settings.intelEnabled ? 22 : 2,
            width: 20, height: 20, borderRadius: '50%', background: '#fff',
            transition: 'left 0.18s',
          }} />
        </button>
      </section>

      {/* ML SERVICE */}
      <section style={{
        background: T.surface, border: `1px solid ${T.border}`,
        borderRadius: T.radTile, padding: '14px 14px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 16 }}>🧠</span>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: T.text }}>ML-сервис</span>
        </div>
        <label style={labelStyle}>URL (необязательно)</label>
        <input
          type="text"
          value={settings.mlServiceUrl}
          placeholder="http://localhost:8000/predict"
          spellCheck={false}
          autoComplete="off"
          onChange={(e) => setSettings({ ...settings, mlServiceUrl: e.target.value })}
          onBlur={() => persist({ mlServiceUrl: settings.mlServiceUrl })}
          style={inputStyle}
        />
        <div style={hintStyle}>
          Оставь пустым для адреса по умолчанию. BERT-сервис необязателен — без него работает локальная эвристика.
        </div>
      </section>

      <div style={{
        textAlign: 'center', fontSize: 10.5, fontFamily: FONT_MONO,
        letterSpacing: '0.1em', color: save === 'saved' ? T.ok : T.textDim,
        height: 14, transition: 'color 0.2s',
      }}>
        {save === 'saved' ? '✓ сохранено' : 'изменения сохраняются автоматически'}
      </div>
    </div>
  )
}
