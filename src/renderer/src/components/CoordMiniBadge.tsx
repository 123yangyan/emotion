import { assignQuadrant } from '../utils/dayAnalytics'
import { getQuadrantLabel } from '../utils/entryParse'

interface Props {
  coordX: number
  coordY: number
}

const QUADRANT_COLORS: Record<string, string> = {
  tl: '#8b3a5a',
  tr: '#b05530',
  bl: '#4a6080',
  br: '#3a8f5a'
}

/** 历史卡片右侧：象限名 + 坐标 + 四象限色块高亮 */
export default function CoordMiniBadge({ coordX, coordY }: Props): JSX.Element {
  const quadrantId = assignQuadrant(coordX, coordY)
  const label = getQuadrantLabel(coordX, coordY)
  const xStr = coordX > 0 ? `+${coordX}` : String(coordX)
  const yStr = coordY > 0 ? `+${coordY}` : String(coordY)
  const intensity = Math.max(1, Math.min(9, Math.round(coordY + 5)))

  return (
    <div className="coord-mini-badge" style={{ '--quad-color': QUADRANT_COLORS[quadrantId] } as React.CSSProperties}>
      <div className="coord-mini-badge__quads" aria-hidden>
        {(['tl', 'tr', 'bl', 'br'] as const).map((id) => (
          <span
            key={id}
            className={`coord-mini-badge__quad coord-mini-badge__quad--${id}${id === quadrantId ? ' is-active' : ''}`}
          />
        ))}
      </div>
      <span className="coord-mini-badge__label">{label}</span>
      <span className="coord-mini-badge__coords">
        ({xStr}, {yStr})
      </span>
      <span className="coord-mini-badge__intensity">
        {intensity}
        {'\u5206'}
      </span>
    </div>
  )
}
