const HOST_ID = 'safenet-guard-panel-host'
const PANEL_WIDTH = 440
const ANIMATION_MS = 360

interface PanelHandle {
  show: () => void
  hide: () => void
  toggle: () => void
  isOpen: () => boolean
}

function createHostElement(): HTMLElement {
  const host = document.createElement('div')
  host.id = HOST_ID
  host.setAttribute('style', [
    'all: initial',
    'position: fixed',
    'top: 0',
    'right: 0',
    'width: 0',
    'height: 100vh',
    'z-index: 2147483647',
    'pointer-events: none',
  ].join('; '))
  return host
}

function buildPanelDom(shadow: ShadowRoot, iframeSrc: string): { panel: HTMLElement; backdrop: HTMLElement; iframe: HTMLIFrameElement } {
  const style = document.createElement('style')
  style.textContent = `
    :host, * { box-sizing: border-box; }
    .backdrop {
      position: fixed; inset: 0;
      background: oklch(8% 0.008 250 / 0.5);
      opacity: 0; pointer-events: none;
      transition: opacity ${ANIMATION_MS}ms cubic-bezier(0.16, 1, 0.3, 1);
      backdrop-filter: blur(2px);
    }
    .backdrop.open { opacity: 1; pointer-events: auto; }

    .panel {
      position: fixed;
      top: 16px;
      right: 16px;
      bottom: 16px;
      width: ${PANEL_WIDTH}px;
      max-width: calc(100vw - 32px);
      transform: translateX(calc(100% + 24px));
      transition: transform ${ANIMATION_MS}ms cubic-bezier(0.16, 1, 0.3, 1);
      background: oklch(8% 0.008 250);
      border-radius: 22px;
      overflow: hidden;
      box-shadow:
        0 24px 70px oklch(0% 0 0 / 0.5),
        0 0 0 1px oklch(22% 0.014 250),
        inset 0 1px 0 oklch(100% 0 0 / 0.04);
      pointer-events: auto;
      display: flex; flex-direction: column;
    }
    .panel.open { transform: translateX(0); }

    .grip {
      position: absolute;
      top: 14px; left: 14px;
      width: 28px; height: 28px;
      border-radius: 8px;
      background: oklch(13% 0.012 250);
      border: 1px solid oklch(22% 0.014 250);
      color: oklch(62% 0.012 250);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      font-family: ui-monospace, SF Mono, monospace;
      font-size: 14px; font-weight: 700;
      z-index: 10;
      transition: background 0.2s, color 0.2s, transform 0.2s;
    }
    .grip:hover { background: oklch(16% 0.014 250); color: oklch(98% 0 0); transform: scale(1.04); }

    iframe {
      flex: 1; width: 100%; height: 100%;
      border: 0; background: transparent;
      display: block;
    }

    /* aurora glow on panel edge */
    .panel::before {
      content: '';
      position: absolute;
      inset: -1px;
      border-radius: inherit;
      background: linear-gradient(135deg,
        oklch(78% 0.17 205 / 0.18) 0%,
        transparent 30%,
        transparent 70%,
        oklch(65% 0.22 285 / 0.12) 100%);
      pointer-events: none;
      mix-blend-mode: screen;
    }
  `

  const backdrop = document.createElement('div')
  backdrop.className = 'backdrop'

  const panel = document.createElement('div')
  panel.className = 'panel'

  const closeBtn = document.createElement('button')
  closeBtn.className = 'grip'
  closeBtn.setAttribute('aria-label', 'Закрыть SafeNet Guard')
  closeBtn.textContent = '✕'

  const iframe = document.createElement('iframe')
  iframe.src = iframeSrc
  iframe.setAttribute('title', 'SafeNet Guard')
  iframe.setAttribute('allow', 'clipboard-write')

  panel.appendChild(closeBtn)
  panel.appendChild(iframe)
  shadow.appendChild(style)
  shadow.appendChild(backdrop)
  shadow.appendChild(panel)

  closeBtn.addEventListener('click', () => {
    panel.classList.remove('open')
    backdrop.classList.remove('open')
  })
  backdrop.addEventListener('click', () => {
    panel.classList.remove('open')
    backdrop.classList.remove('open')
  })

  return { panel, backdrop, iframe }
}

export function createPanel(): PanelHandle {
  let host: HTMLElement | null = null
  let shadow: ShadowRoot | null = null
  let panel: HTMLElement | null = null
  let backdrop: HTMLElement | null = null
  let opened = false

  function ensureMounted() {
    if (host) return
    host = createHostElement()
    document.documentElement.appendChild(host)
    shadow = host.attachShadow({ mode: 'open' })
    const dom = buildPanelDom(shadow, browser.runtime.getURL('/sidebar.html'))
    panel = dom.panel
    backdrop = dom.backdrop
  }

  function show() {
    ensureMounted()
    requestAnimationFrame(() => {
      panel?.classList.add('open')
      backdrop?.classList.add('open')
      opened = true
    })
  }

  function hide() {
    panel?.classList.remove('open')
    backdrop?.classList.remove('open')
    opened = false
  }

  function toggle() { opened ? hide() : show() }

  return { show, hide, toggle, isOpen: () => opened }
}
