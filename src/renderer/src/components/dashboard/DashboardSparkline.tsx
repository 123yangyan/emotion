import type { DashboardSeriesPoint } from '../../utils/dashboardMetrics'

interface Props {
  points: DashboardSeriesPoint[]
  /** 7 日移动平均虚线（可选） */
  maPoints?: DashboardSeriesPoint[]
  className?: string
  /** 折线颜色 */
  stroke?: string
}

const W = 120
const H = 36
const PAD = 2

function buildPath(
  points: DashboardSeriesPoint[],
  min: number,
  max: number,
  step: number
): string {
  const range = max - min || 1
  let pathD = ''
  let started = false
  for (let i = 0; i < points.length; i++) {
    const p = points[i]
    if (p.value == null) {
      started = false
      continue
    }
    const x = PAD + i * step
    const y = H - PAD - ((p.value - min) / range) * (H - PAD * 2)
    pathD += started ? ` L ${x} ${y}` : `M ${x} ${y}`
    started = true
  }
  return pathD
}

/** 7 日轻量 Sparkline：实线分数 + 可选虚线均线 */
export default function DashboardSparkline({
  points,
  maPoints,
  className = '',
  stroke = 'var(--accent)'
}: Props): JSX.Element {
  const allValues = [
    ...points.map((p) => p.value),
    ...(maPoints?.map((p) => p.value) ?? [])
  ].filter((v): v is number => v != null)

  if (allValues.length < 2) {
    return (
      <svg
        className={`dashboard-sparkline dashboard-sparkline--empty ${className}`}
        viewBox={`0 0 ${W} ${H}`}
        aria-hidden
      >
        <line
          x1={PAD}
          y1={H / 2}
          x2={W - PAD}
          y2={H / 2}
          stroke="var(--border)"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
      </svg>
    )
  }

  const min = Math.min(...allValues)
  const max = Math.max(...allValues)
  const step = (W - PAD * 2) / Math.max(points.length - 1, 1)

  const pathD = buildPath(points, min, max, step)
  const maPathD = maPoints ? buildPath(maPoints, min, max, step) : ''

  const coords = points.map((p, i) => {
    if (p.value == null) return { x: PAD + i * step, y: H / 2, ok: false }
    const range = max - min || 1
    const y = H - PAD - ((p.value - min) / range) * (H - PAD * 2)
    return { x: PAD + i * step, y, ok: true }
  })
  const lastOk = [...coords].reverse().find((c) => c.ok)

  return (
    <svg
      className={`dashboard-sparkline ${className}`}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      {maPathD ? (
        <path
          d={maPathD}
          fill="none"
          stroke="var(--muted)"
          strokeWidth="1.5"
          strokeDasharray="4 3"
          opacity="0.65"
        />
      ) : null}
      {pathD ? (
        <path d={pathD} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      ) : null}
      {lastOk ? <circle cx={lastOk.x} cy={lastOk.y} r="2.5" fill={stroke} /> : null}
    </svg>
  )
}
