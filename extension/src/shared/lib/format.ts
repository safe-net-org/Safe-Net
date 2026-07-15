export function fmtTime(ms: number): string {
  return new Date(ms).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })
}

export function fmtDuration(ms: number): string {
  const d = Math.floor(ms / (24 * 60 * 60 * 1000))
  if (d >= 1) return `${d} ${d === 1 ? 'день' : d < 5 ? 'дня' : 'дней'}`
  const h = Math.floor(ms / (60 * 60 * 1000))
  if (h >= 1) return `${h} ч`
  const m = Math.floor(ms / (60 * 1000))
  return `${m} мин`
}

export function fmtNum(n: number): string {
  return n.toLocaleString('ru-RU')
}
