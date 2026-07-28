import { useEffect, useRef, useState } from 'react'
import type { AnalysisResult } from '@/src/entities/analysis'
import { EMPTY_STATS, type GlobalStats } from '@/src/entities/stats'
import { DomainTab } from '@/src/features/domain-intel'
import { recheckCurrentTab } from '@/src/features/recheck/ui/RecheckButton'
import { AboutTab } from '@/src/features/tabs/about/ui/AboutTab'
import { FeaturesTab } from '@/src/features/tabs/features/ui/FeaturesTab'
import { OverviewTab } from '@/src/features/tabs/overview/ui/OverviewTab'
import { SettingsTab } from '@/src/features/tabs/settings/ui/SettingsTab'
import { SignalsTab } from '@/src/features/tabs/signals/ui/SignalsTab'
import { StatsTab } from '@/src/features/tabs/stats/ui/StatsTab'
import { FONT_SANS, T } from '@/src/shared/config/tokens'
import { ExtensionLocaleProvider } from '@/src/shared/i18n/ExtensionLocaleProvider'
import { STORAGE_KEYS } from '@/src/shared/lib/storage-keys'
import { EmptyState } from '@/src/shared/ui/EmptyState'
import { LoadingState } from '@/src/shared/ui/LoadingState'
import { Header } from '@/src/widgets/header/ui/Header'
import { PopupFooter } from '@/src/widgets/popup-footer/ui/PopupFooter'
import { ScoreBlock } from '@/src/widgets/score-block/ui/ScoreBlock'
import { TabBar, type PopupTab } from '@/src/widgets/tab-bar/ui/TabBar'

type ResultState = AnalysisResult | null | 'loading'

export function PopupPage() {
  return (
    <ExtensionLocaleProvider>
      <PopupContent />
    </ExtensionLocaleProvider>
  )
}

function PopupContent() {
  const [result, setResult] = useState<ResultState>('loading')
  const [stats, setStats] = useState<GlobalStats>(EMPTY_STATS)
  const [animated, setAnimated] = useState(false)
  const [tab, setTab] = useState<PopupTab>('overview')
  const prevUrlRef = useRef<string>('')

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const [activeTab] = await browser.tabs.query({ active: true, currentWindow: true })
        const tabKey = activeTab?.id ? STORAGE_KEYS.tab(activeTab.id) : ''
        const store = await browser.storage.local.get([STORAGE_KEYS.globalStats, tabKey].filter(Boolean))

        if (!mounted) return
        const r = tabKey ? (store[tabKey] as AnalysisResult | undefined) : undefined
        setResult(r ?? null)
        setStats((store[STORAGE_KEYS.globalStats] as GlobalStats | undefined) ?? EMPTY_STATS)
        if (r && r.url !== prevUrlRef.current) {
          prevUrlRef.current = r.url
          setTimeout(() => setAnimated(true), 100)
        }
      } catch {
        if (mounted) setResult(null)
      }
    }

    load()
    const id = setInterval(load, 1500)
    return () => { mounted = false; clearInterval(id) }
  }, [])

  const handleRecheck = async () => {
    setResult('loading')
    setAnimated(false)
    await recheckCurrentTab()
  }

  return (
    <div style={{
      width: '100%', height: '100%',
      background: T.bg,
      color: T.text,
      fontFamily: FONT_SANS,
      fontFeatureSettings: '"ss01", "cv11"',
      display: 'flex', flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* AURORA — matches landing globals.css */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0, overflow: 'hidden',
        pointerEvents: 'none', zIndex: 0,
      }}>
        <div style={{
          position: 'absolute',
          top: '-22rem', left: '-10rem',
          width: '40rem', height: '40rem',
          borderRadius: '50%',
          filter: 'blur(90px)',
          background: `radial-gradient(circle, ${T.accentGlow} 0%, transparent 60%)`,
          opacity: 0.18,
          mixBlendMode: 'screen',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-22rem', right: '-10rem',
          width: '40rem', height: '40rem',
          borderRadius: '50%',
          filter: 'blur(90px)',
          background: `radial-gradient(circle, ${T.accentViolet} 0%, transparent 60%)`,
          opacity: 0.13,
          mixBlendMode: 'screen',
        }} />
      </div>

      {/* GRAIN texture */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0,
        pointerEvents: 'none', zIndex: 1, opacity: 0.04,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }} />

      <style>{`
        .tabular { font-variant-numeric: tabular-nums; }
        @keyframes pulse-dot { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }
        @keyframes fade-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .fade-in { animation: fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }
        button:hover { filter: brightness(1.12); }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 999px; }
        ::selection { background: ${T.accent}; color: ${T.bg}; }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <Header />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {result === 'loading' ? <LoadingState /> :
           result === null ? <EmptyState /> : (
            <>
              <ScoreBlock result={result} animated={animated} />
              <TabBar active={tab} signalCount={result.signals.length} onChange={setTab} />

              <div className="fade-in" key={tab} style={{ flex: 1, padding: 16, overflowY: 'auto', minHeight: 0 }}>
                {tab === 'overview' && <OverviewTab result={result} />}
                {tab === 'domain' && <DomainTab url={result.url} />}
                {tab === 'signals' && <SignalsTab result={result} />}
                {tab === 'features' && <FeaturesTab result={result} />}
                {tab === 'stats' && <StatsTab stats={stats} />}
                {tab === 'settings' && <SettingsTab />}
                {tab === 'about' && <AboutTab />}
              </div>

              <PopupFooter result={result} onRecheck={handleRecheck} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
