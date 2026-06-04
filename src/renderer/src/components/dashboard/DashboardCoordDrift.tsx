import { ZH } from '../../i18n/zh'
import {
  coordToSvg,
  type CoordDriftViewModel,
  type CoordPoint
} from '../../utils/coordDriftAnalytics'

const SIZE = 120

interface Props {
  drift: CoordDriftViewModel
}

const QUAD_FILL: Record<CoordPoint['quadrantId'], string> = {
  tl: 'rgba(248, 232, 239, 0.85)',
  tr: 'rgba(255, 240, 232, 0.85)',
  bl: 'rgba(232, 238, 245, 0.85)',
  br: 'rgba(232, 245, 238, 0.85)'
}

/** Layer 1 附属：近 7 日坐标漂移缩略图（纯 SVG） */
export default function DashboardCoordDrift({ drift }: Props): JSX.Element {
  if (!drift.hasData) {
    return (
      <div className="dashboard-v2__drift dashboard-v2__drift--empty" aria-hidden>
        <p className="dashboard-v2__drift-placeholder">{ZH.dashboardDriftEmpty}</p>
      </div>
    )
  }

  const mid = SIZE / 2
  const { sx: ax0, sy: ay0 } =
    drift.arrowFrom != null
      ? coordToSvg(drift.arrowFrom.x, drift.arrowFrom.y, SIZE)
      : { sx: mid, sy: mid }
  const to = drift.todayCentroid ?? drift.todayPoints[drift.todayPoints.length - 1]
  const { sx: ax1, sy: ay1 } = to
    ? coordToSvg(to.x, to.y, SIZE)
    : { sx: mid, sy: mid }

  const showArrow =
    drift.todayPoints.length > 0 &&
    (Math.abs(ax1 - ax0) > 2 || Math.abs(ay1 - ay0) > 2)

  return (
    <figure className="dashboard-v2__drift" aria-label={ZH.dashboardDriftTitle}>
      <figcaption className="dashboard-v2__drift-caption">{ZH.dashboardDriftTitle}</figcaption>
      <svg
        className="dashboard-v2__drift-svg"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        width={SIZE}
        height={SIZE}
        role="img"
      >
        <rect x="0" y="0" width={mid} height={mid} fill={QUAD_FILL.tl} />
        <rect x={mid} y="0" width={mid} height={mid} fill={QUAD_FILL.tr} />
        <rect x="0" y={mid} width={mid} height={mid} fill={QUAD_FILL.bl} />
        <rect x={mid} y={mid} width={mid} height={mid} fill={QUAD_FILL.br} />
        <line
          x1={mid}
          y1="4"
          x2={mid}
          y2={SIZE - 4}
          stroke="var(--border)"
          strokeWidth="0.5"
          opacity="0.6"
        />
        <line
          x1="4"
          y1={mid}
          x2={SIZE - 4}
          y2={mid}
          stroke="var(--border)"
          strokeWidth="0.5"
          opacity="0.6"
        />
        {drift.baselinePoints.map((p, i) => {
          const { sx, sy } = coordToSvg(p.x, p.y, SIZE)
          return (
            <circle
              key={`b-${i}-${p.dateKey}`}
              cx={sx}
              cy={sy}
              r="2.2"
              fill="var(--muted)"
              opacity="0.45"
            />
          )
        })}
        {drift.todayPoints.map((p, i) => {
          const { sx, sy } = coordToSvg(p.x, p.y, SIZE)
          return (
            <circle
              key={`t-${i}`}
              cx={sx}
              cy={sy}
              r="3.5"
              fill="var(--accent)"
              stroke="var(--card)"
              strokeWidth="1"
            />
          )
        })}
        {showArrow ? (
          <>
            <defs>
              <marker
                id="drift-arrowhead"
                markerWidth="6"
                markerHeight="6"
                refX="5"
                refY="3"
                orient="auto"
              >
                <path d="M0,0 L6,3 L0,6 Z" fill="var(--accent)" />
              </marker>
            </defs>
            <line
              x1={ax0}
              y1={ay0}
              x2={ax1}
              y2={ay1}
              stroke="var(--accent)"
              strokeWidth="1.5"
              markerEnd="url(#drift-arrowhead)"
              opacity="0.9"
            />
          </>
        ) : null}
      </svg>
      <p className="dashboard-v2__drift-legend">
        <span className="dashboard-v2__drift-legend-item dashboard-v2__drift-legend-item--base">
          {ZH.dashboardDriftBaseline}
        </span>
        <span className="dashboard-v2__drift-legend-item dashboard-v2__drift-legend-item--today">
          {ZH.dashboardDriftToday}
        </span>
      </p>
    </figure>
  )
}
