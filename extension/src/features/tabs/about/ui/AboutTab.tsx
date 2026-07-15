import { T } from '@/src/shared/config/tokens'

const ITEMS: ReadonlyArray<readonly [string, string, string]> = [
  ['🔒', 'Локальный анализ', 'Все проверки происходят прямо в браузере. Ни один URL не уходит на сервер.'],
  ['⚡', '< 5 мс на проверку', 'Эвристика прогоняется до того, как страница успеет загрузиться.'],
  ['🧠', '25+ признаков', 'Длина, энтропия, IDN-гомограф, тайпсквоттинг, brand-distance, TLD-риск, DOM-сигналы.'],
  ['✦', 'ML на BERT', 'Опциональная DL-модель уточняет вердикт. Работает рядом, без отправки данных.'],
  ['🌐', 'Поддержка кириллицы', 'Детектит подмену букв «а», «о», «р», «с», «е» в доменах русских банков.'],
  ['📖', 'MIT · open-source', 'Код полностью открыт. Аудит и форки приветствуются.'],
]

export function AboutTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {ITEMS.map(([icon, title, desc]) => (
        <div key={title} style={{
          display: 'flex', gap: 12, alignItems: 'flex-start',
          padding: '10px 12px',
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: T.radTile,
        }}>
          <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1 }}>{icon}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 12.5, fontWeight: 600, color: T.text,
              marginBottom: 3, letterSpacing: '-0.01em',
            }}>
              {title}
            </div>
            <div style={{ fontSize: 11.5, color: T.textMuted, lineHeight: 1.5 }}>{desc}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
