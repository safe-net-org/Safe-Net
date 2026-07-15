import type { AnalysisResult, DomFeatures, ExtensionMessage } from '@/src/entities/analysis'
import { createPanel } from './panel'

const BANK_KEYWORDS = ['sber', 'tinkoff', 'vtb', 'alfa', 'gosuslugi', 'nalog']

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

function showBanner(result: AnalysisResult, onClose: () => void): HTMLElement {
  const banner = document.createElement('div')
  banner.id = 'safenet-guard-banner'
  banner.setAttribute('style', [
    'position: fixed', 'top: 0', 'left: 0', 'right: 0',
    'z-index: 2147483647',
    'background: linear-gradient(135deg, #78350f, #92400e)',
    'color: #fef3c7',
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
    .map((s) => `<div style="font-size:12px;opacity:0.85;margin-top:3px">⚠ ${s.message}</div>`)
    .join('')

  banner.innerHTML = `
    <style>
      @keyframes safenet-slide-down {
        from { transform: translateY(-100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    </style>
    <div style="flex:1">
      <div style="font-weight:700;font-size:15px">🟡 SafeNet Guard — Подозрительный сайт</div>
      ${signalsHtml}
    </div>
    <button id="safenet-close-btn" style="
      background:rgba(255,255,255,0.15);border:none;color:inherit;
      padding:6px 14px;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;
      flex-shrink:0;margin-top:2px
    ">✕ Закрыть</button>
  `

  document.body.prepend(banner)
  banner.querySelector('#safenet-close-btn')?.addEventListener('click', () => {
    banner.remove()
    onClose()
  })
  return banner
}

function showOverlay(result: AnalysisResult, onDismiss: () => void): HTMLElement {
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
      <span style="font-size:14px;line-height:1.4">${s.message}</span>
    </div>
  `).join('')

  overlay.innerHTML = `
    <style>
      @keyframes safenet-fade-in { from { opacity: 0; } to { opacity: 1; } }
    </style>
    <div style="max-width:560px;width:90%;padding:32px">
      <div style="text-align:center;margin-bottom:28px">
        <div style="font-size:56px;margin-bottom:12px">🔴</div>
        <div style="font-size:26px;font-weight:800;color:#fca5a5;margin-bottom:8px">Опасный сайт!</div>
        <div style="font-size:15px;opacity:0.7;word-break:break-all">
          ${result.url.slice(0, 80)}${result.url.length > 80 ? '…' : ''}
        </div>
        <div style="
          display:inline-block;margin-top:12px;
          background:rgba(239,68,68,0.2);border:1px solid rgba(239,68,68,0.5);
          border-radius:20px;padding:4px 16px;font-size:13px;font-weight:600;color:#fca5a5
        ">Оценка риска: ${result.score}/100</div>
      </div>

      <div style="margin-bottom:24px">
        <div style="font-size:13px;font-weight:600;opacity:0.5;margin-bottom:10px;text-transform:uppercase;letter-spacing:0.5px">
          Обнаруженные угрозы
        </div>
        ${signalsHtml}
      </div>

      <div style="display:flex;gap:12px">
        <button id="safenet-leave-btn" style="
          flex:1;background:#dc2626;border:none;color:white;
          padding:14px;border-radius:10px;cursor:pointer;font-size:15px;font-weight:700;
        ">← Уйти со страницы</button>
        <button id="safenet-stay-btn" style="
          background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);
          color:rgba(255,255,255,0.5);padding:14px 20px;border-radius:10px;
          cursor:pointer;font-size:14px;
        ">Всё равно войти</button>
      </div>

      <div style="text-align:center;margin-top:16px;font-size:12px;opacity:0.35">
        SafeNet Guard • Анализ выполнен локально
      </div>
    </div>
  `

  document.body.appendChild(overlay)
  overlay.querySelector('#safenet-leave-btn')?.addEventListener('click', () => {
    window.history.back()
    setTimeout(() => window.close(), 300)
  })
  overlay.querySelector('#safenet-stay-btn')?.addEventListener('click', () => {
    overlay.remove()
    onDismiss()
  })
  return overlay
}

export function registerContent(): void {
  let bannerEl: HTMLElement | null = null
  let overlayEl: HTMLElement | null = null

  function removeWarnings() {
    bannerEl?.remove()
    overlayEl?.remove()
    bannerEl = null
    overlayEl = null
  }

  function handleResult(result: AnalysisResult) {
    removeWarnings()
    if (result.level === 'suspicious') {
      bannerEl = showBanner(result, () => { bannerEl = null })
    } else if (result.level === 'danger') {
      overlayEl = showOverlay(result, () => {
        overlayEl = null
        bannerEl = showBanner({ ...result, level: 'suspicious' }, () => { bannerEl = null })
      })
    }
  }

  browser.runtime.sendMessage({ type: 'GET_CURRENT_RESULT' } satisfies ExtensionMessage)
    .then((response: ExtensionMessage) => {
      if (response?.type === 'CURRENT_RESULT' && response.result) {
        handleResult(response.result)
      }
    })
    .catch(() => { /* extension reloaded */ })

  const panel = createPanel()

  browser.runtime.onMessage.addListener((message: ExtensionMessage) => {
    if (message.type === 'ANALYSIS_RESULT') handleResult(message.result)
    if (message.type === 'TOGGLE_PANEL') panel.toggle()
    if (message.type === 'CLOSE_PANEL') panel.hide()
  })

  window.addEventListener('load', () => {
    const domFeatures = analyzeDom()
    browser.runtime.sendMessage({
      type: 'DOM_FEATURES',
      features: domFeatures,
    } satisfies ExtensionMessage).catch(() => { /* ignore */ })
  })
}
