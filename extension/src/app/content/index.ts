import type { AnalysisResult, DomFeatures, ExtensionMessage } from '@/src/entities/analysis'
import {
  translate,
  translateRiskSignal,
  type ExtensionLocale,
} from '@/src/shared/i18n/messages'
import { getBrowserLocale, getSettings } from '@/src/shared/lib/settings'
import { createPanel } from './panel'

const BANK_KEYWORDS = ['sber', 'tinkoff', 'vtb', 'alfa', 'gosuslugi', 'nalog']

// "Всё равно войти" is remembered per tab session so the overlay does not
// reappear on every in-site navigation. sessionStorage is page-writable, but a
// page that wants the overlay gone can simply remove the node — this adds no
// new attack surface.
const DISMISS_KEY = 'safenet_guard_dismissed'

function isDismissed(): boolean {
  try { return sessionStorage.getItem(DISMISS_KEY) === '1' } catch { return false }
}

function rememberDismissed(): void {
  try { sessionStorage.setItem(DISMISS_KEY, '1') } catch { /* sandboxed page */ }
}

/** Signal messages and the URL end up in innerHTML — escape them. */
function esc(text: string): string {
  return text.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c,
  )
}

function requestTrust(): void {
  browser.runtime.sendMessage({
    type: 'TRUST_SITE',
    host: window.location.hostname,
  } satisfies ExtensionMessage).catch(() => { /* extension reloaded */ })
}

function analyzeDom(): DomFeatures {
  const currentOrigin = window.location.origin
  const protocol = window.location.protocol

  const hasPasswordOnHttp =
    protocol === 'http:' &&
    document.querySelectorAll('input[type="password"]').length > 0

  const hasExternalFormAction = Array.from(document.querySelectorAll('form')).some((form) => {
    const action = form.action
    if (!action) return false
    try {
      return new URL(action).origin !== currentOrigin
    } catch {
      return false
    }
  })

  const suspiciousBrandLogos: string[] = []
  document.querySelectorAll('img').forEach((img) => {
    const src = (img.src ?? '').toLowerCase()
    const alt = (img.alt ?? '').toLowerCase()
    BANK_KEYWORDS.forEach((keyword) => {
      if ((src.includes(keyword) || alt.includes(keyword)) && !currentOrigin.includes(keyword)) {
        suspiciousBrandLogos.push(keyword)
      }
    })
  })

  const scripts = Array.from(document.querySelectorAll('script'))
  const hasObfuscatedJs = scripts.some((s) => {
    const text = s.textContent ?? ''
    return (text.match(/eval\s*\(/g) ?? []).length > 2 || (text.includes('atob(') && text.length > 500)
  })

  const hasClickjacking = Array.from(document.querySelectorAll('a, button')).some((el) => {
    const style = window.getComputedStyle(el)
    return style.opacity === '0' && style.position === 'absolute'
  })

  // Crypto-wallet drainer: page asks for a seed phrase / private key.
  const SEED_RE = /seed[\s-]?phrase|recovery phrase|мнемоническ|сид[\s-]?фраз|приватн\w* ключ|private key|secret recovery/i
  const bodyText = (document.body?.innerText ?? '').slice(0, 20000)
  const hasSeedText = SEED_RE.test(bodyText)
  const hasManyWordInputs =
    document.querySelectorAll('input').length >= 12 &&
    /wallet|crypto|metamask|trust ?wallet|phantom|ledger|кошел/i.test(bodyText)
  const hasCryptoDrainer = hasSeedText || hasManyWordInputs

  return {
    hasPasswordOnHttp,
    hasExternalFormAction,
    suspiciousBrandLogos: [...new Set(suspiciousBrandLogos)],
    hasObfuscatedJs,
    hasClickjacking,
    hasCryptoDrainer,
  }
}

function showBanner(
  result: AnalysisResult,
  locale: ExtensionLocale,
  onClose: () => void,
): HTMLElement {
  const isDanger = result.level === 'danger'
  const banner = document.createElement('div')
  banner.id = 'safenet-guard-banner'
  banner.setAttribute('style', [
    'position: fixed', 'top: 0', 'left: 0', 'right: 0',
    'z-index: 2147483647',
    `background: linear-gradient(135deg, ${isDanger ? '#7f1d1d, #991b1b' : '#78350f, #92400e'})`,
    `color: ${isDanger ? '#fee2e2' : '#fef3c7'}`,
    'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    'font-size: 14px',
    'padding: 12px 16px',
    'box-shadow: 0 4px 24px rgba(0,0,0,0.4)',
    'display: flex',
    'align-items: flex-start',
    'gap: 12px',
    'animation: safenet-slide-down 0.3s ease',
  ].join('; '))

  const signalsHtml = result.signals.slice(0, 2)
    .map((s) => `<div style="font-size:12px;opacity:0.85;margin-top:3px">⚠ ${esc(translateRiskSignal(s, locale))}</div>`)
    .join('')

  banner.innerHTML = `
    <style>
      @keyframes safenet-slide-down {
        from { transform: translateY(-100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    </style>
    <div style="flex:1">
      <div style="font-weight:700;font-size:15px">${isDanger ? '🔴' : '🟡'} SafeNet Guard — ${translate(locale, isDanger ? 'content.dangerSite' : 'content.suspiciousSite')}</div>
      ${signalsHtml}
    </div>
    <button id="safenet-trust-btn" style="
      background:transparent;border:1px solid rgba(255,255,255,0.25);color:inherit;
      padding:6px 14px;border-radius:6px;cursor:pointer;font-size:13px;
      flex-shrink:0;margin-top:2px;opacity:0.8
    ">${translate(locale, 'content.trust')}</button>
    <button id="safenet-close-btn" style="
      background:rgba(255,255,255,0.15);border:none;color:inherit;
      padding:6px 14px;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;
      flex-shrink:0;margin-top:2px
    ">✕ ${translate(locale, 'content.close')}</button>
  `

  document.body.prepend(banner)
  banner.querySelector('#safenet-trust-btn')?.addEventListener('click', () => {
    requestTrust()
    banner.remove()
    onClose()
  })
  banner.querySelector('#safenet-close-btn')?.addEventListener('click', () => {
    banner.remove()
    onClose()
  })
  return banner
}

function showOverlay(
  result: AnalysisResult,
  locale: ExtensionLocale,
  onDismiss: () => void,
): HTMLElement {
  const overlay = document.createElement('div')
  overlay.id = 'safenet-guard-overlay'
  overlay.setAttribute('style', [
    'position: fixed', 'inset: 0',
    'z-index: 2147483647',
    'background: rgba(15, 5, 5, 0.97)',
    'color: #fef2f2',
    'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    'display: flex',
    'align-items: center',
    'justify-content: center',
    'animation: safenet-fade-in 0.25s ease',
  ].join('; '))

  const signalsHtml = result.signals.slice(0, 5).map((s) => `
    <div style="
      display:flex;gap:10px;align-items:flex-start;
      background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.3);
      border-radius:8px;padding:10px 14px;margin-bottom:8px
    ">
      <span style="color:#f87171;font-size:16px;flex-shrink:0">${s.severity === 'high' ? '🔴' : '🟡'}</span>
      <span style="font-size:14px;line-height:1.4">${esc(translateRiskSignal(s, locale))}</span>
    </div>
  `).join('')

  overlay.innerHTML = `
    <style>
      @keyframes safenet-fade-in { from { opacity: 0; } to { opacity: 1; } }
    </style>
    <div style="max-width:560px;width:90%;padding:32px">
      <div style="text-align:center;margin-bottom:28px">
        <div style="font-size:56px;margin-bottom:12px">🔴</div>
        <div style="font-size:26px;font-weight:800;color:#fca5a5;margin-bottom:8px">${translate(locale, 'content.dangerTitle')}</div>
        <div style="font-size:15px;opacity:0.7;word-break:break-all">
          ${esc(result.url.slice(0, 80))}${result.url.length > 80 ? '…' : ''}
        </div>
        <div style="
          display:inline-block;margin-top:12px;
          background:rgba(239,68,68,0.2);border:1px solid rgba(239,68,68,0.5);
          border-radius:20px;padding:4px 16px;font-size:13px;font-weight:600;color:#fca5a5
        ">${translate(locale, 'content.riskScore', { score: result.score })}</div>
      </div>

      <div style="margin-bottom:24px">
        <div style="font-size:13px;font-weight:600;opacity:0.5;margin-bottom:10px;text-transform:uppercase;letter-spacing:0.5px">
          ${translate(locale, 'content.threats')}
        </div>
        ${signalsHtml}
      </div>

      <div style="display:flex;gap:12px">
        <button id="safenet-leave-btn" style="
          flex:1;background:#dc2626;border:none;color:white;
          padding:14px;border-radius:10px;cursor:pointer;font-size:15px;font-weight:700;
        ">← ${translate(locale, 'content.leave')}</button>
        <button id="safenet-stay-btn" style="
          background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);
          color:rgba(255,255,255,0.5);padding:14px 20px;border-radius:10px;
          cursor:pointer;font-size:14px;
        ">${translate(locale, 'content.stay')}</button>
      </div>

      <div style="text-align:center;margin-top:14px">
        <button id="safenet-trust-btn" style="
          background:none;border:none;cursor:pointer;font-size:12px;
          color:rgba(255,255,255,0.35);text-decoration:underline;padding:4px;
        ">${translate(locale, 'content.falsePositive')}</button>
      </div>

      <div style="text-align:center;margin-top:8px;font-size:12px;opacity:0.35">
        SafeNet Guard • ${translate(locale, 'content.localAnalysis')}
      </div>
    </div>
  `

  document.body.appendChild(overlay)
  overlay.querySelector('#safenet-leave-btn')?.addEventListener('click', () => {
    window.history.back()
    setTimeout(() => window.close(), 300)
  })
  overlay.querySelector('#safenet-stay-btn')?.addEventListener('click', () => {
    rememberDismissed()
    overlay.remove()
    onDismiss()
  })
  overlay.querySelector('#safenet-trust-btn')?.addEventListener('click', () => {
    requestTrust()
    overlay.remove()
    onDismiss()
  })
  return overlay
}

// SPAs build phishing forms long after `load` — a single scan misses them.
// Mutations re-trigger the scan, debounced and capped so a busy page costs a
// bounded number of sweeps; identical results are not re-sent.
const DOM_RESCAN_DEBOUNCE_MS = 1500
const DOM_RESCAN_LIMIT = 8

export function registerContent(): void {
  let locale = getBrowserLocale()
  void getSettings().then((settings) => { locale = settings.locale }).catch(() => {})
  let bannerEl: HTMLElement | null = null
  let overlayEl: HTMLElement | null = null

  function removeWarnings() {
    bannerEl?.remove()
    overlayEl?.remove()
    bannerEl = null
    overlayEl = null
  }

  let lastDomFingerprint = ''
  let lastResultUrl = ''
  let rescanCount = 0
  let rescanTimer: ReturnType<typeof setTimeout> | undefined

  function sendDomFeatures() {
    const features = analyzeDom()
    const fingerprint = JSON.stringify(features)
    if (fingerprint === lastDomFingerprint) return
    lastDomFingerprint = fingerprint
    browser.runtime.sendMessage({
      type: 'DOM_FEATURES',
      features,
    } satisfies ExtensionMessage).catch(() => { /* extension reloaded */ })
  }

  const domObserver = new MutationObserver(() => {
    if (rescanCount >= DOM_RESCAN_LIMIT) {
      domObserver.disconnect()
      return
    }
    clearTimeout(rescanTimer)
    rescanTimer = setTimeout(() => {
      rescanCount++
      sendDomFeatures()
    }, DOM_RESCAN_DEBOUNCE_MS)
  })

  async function handleResult(result: AnalysisResult) {
    locale = (await getSettings().catch(() => null))?.locale ?? locale
    // SPA route change: the background re-analyzed a new URL, so the previous
    // DOM verdict no longer applies — rescan and allow a fresh warning budget.
    if (result.url !== lastResultUrl) {
      lastResultUrl = result.url
      lastDomFingerprint = ''
      rescanCount = 0
    }
    removeWarnings()
    if (result.level === 'suspicious') {
      bannerEl = showBanner(result, locale, () => { bannerEl = null })
    } else if (result.level === 'danger') {
      // Once the user has chosen to proceed in this tab session, further
      // in-site navigations get the red banner instead of the full overlay.
      if (isDismissed()) {
        bannerEl = showBanner(result, locale, () => { bannerEl = null })
        return
      }
      overlayEl = showOverlay(result, locale, () => {
        overlayEl = null
        bannerEl = showBanner(result, locale, () => { bannerEl = null })
      })
    }
  }

  browser.runtime.sendMessage({ type: 'GET_CURRENT_RESULT' } satisfies ExtensionMessage)
    .then((response: ExtensionMessage) => {
      if (response?.type === 'CURRENT_RESULT' && response.result) {
        void handleResult(response.result)
      }
    })
    .catch(() => { /* extension reloaded */ })

  const panel = createPanel(() => locale)

  browser.runtime.onMessage.addListener((message: ExtensionMessage) => {
    if (message.type === 'ANALYSIS_RESULT') void handleResult(message.result)
    if (message.type === 'TOGGLE_PANEL') panel.toggle()
    if (message.type === 'CLOSE_PANEL') panel.hide()
  })

  window.addEventListener('load', sendDomFeatures)
  domObserver.observe(document.documentElement, { childList: true, subtree: true })
}
