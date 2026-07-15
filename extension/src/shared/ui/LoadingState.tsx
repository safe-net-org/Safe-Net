import { FONT_MONO, T } from '@/src/shared/config/tokens'

export function LoadingState() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: 220, gap: 14,
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: '50%',
        border: `2.5px solid ${T.border}`,
        borderTopColor: T.accent,
        animation: 'spin 0.9s linear infinite',
        boxShadow: `0 0 16px oklch(78% 0.17 205 / 0.3)`,
      }} />
      <span style={{
        fontSize: 12, color: T.textDim, fontFamily: FONT_MONO,
        letterSpacing: '0.2em', textTransform: 'uppercase',
      }}>
        Анализ страницы
      </span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
