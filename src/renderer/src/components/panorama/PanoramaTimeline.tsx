import { useCallback, useMemo } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import type { CategoricalChartState } from 'recharts/types/chart/types'
import type { PanoramaPoint } from '../../utils/panoramaAnalytics'
import { ZH } from '../../i18n/zh'

interface Props {
  points: PanoramaPoint[]
  selectedId: number | null
  /** 非 null 时仅高亮这些 id，其余点降透明度 */
  highlightIds: number[] | null
  onToggleSelect: (id: number) => void
}

/** 从 Recharts 点击事件中取出最近的数据点（利用内置 Voronoi 热区，避免手写 SVG 抢焦点） */
function pickPointFromChartEvent(
  state: CategoricalChartState | undefined,
  chartData: PanoramaPoint[]
): PanoramaPoint | null {
  if (!state) return null
  const idx = state.activeTooltipIndex
  if (typeof idx === 'number' && chartData[idx]) return chartData[idx]
  const payload = state.activePayload?.[0]?.payload as PanoramaPoint | undefined
  return payload ?? null
}

/** 双向情绪潮汐图 */
export default function PanoramaTimeline({
  points,
  selectedId,
  highlightIds,
  onToggleSelect
}: Props): JSX.Element {
  const chartData = useMemo(() => points.map((p) => ({ ...p, displayTs: p.ts })), [points])

  const tickFormatter = (ts: number): string => {
    const p = points.find((pt) => pt.ts === ts)
    return p?.timeLabel ?? ''
  }

  const handleChartClick = useCallback(
    (state: CategoricalChartState) => {
      const p = pickPointFromChartEvent(state, chartData)
      if (p) onToggleSelect(p.id)
    },
    [chartData, onToggleSelect]
  )

  return (
    <div className="panorama-timeline">
      <div className="panorama-tide">
        <div className="panorama-tide__legend">
          <span>
            <i className="panorama-legend__bar panorama-legend__bar--pos" />
            {ZH.panoramaLegendPos}
          </span>
          <span>
            <i className="panorama-legend__bar panorama-legend__bar--neg" />
            {ZH.panoramaLegendNeg}
          </span>
        </div>
        <div className="panorama-tide__chart">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart
              data={chartData}
              margin={{ top: 12, right: 16, left: 8, bottom: 8 }}
              onClick={handleChartClick}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e4df" vertical={false} />
              <XAxis
                dataKey="displayTs"
                type="number"
                domain={['dataMin', 'dataMax']}
                tickFormatter={tickFormatter}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                domain={[-4, 4]}
                ticks={[-4, -2, 0, 2, 4]}
                width={32}
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => String(5 + Number(v))}
              />
              <ReferenceLine y={0} stroke="#9ca3af" strokeWidth={1.5} strokeDasharray="4 4" />
              <Tooltip
                content={({ active: on, payload }) => {
                  if (!on || !payload?.length) return null
                  const p = payload[0].payload as PanoramaPoint
                  return (
                    <div className="chart-tooltip panorama-tooltip">
                      <p className="chart-tooltip__time">{p.timeLabel}</p>
                      <p>{ZH.intensityLabel(p.intensity)}</p>
                      <p>{p.emotionLabels}</p>
                      {p.factTags.length > 0 ? (
                        <p>
                          {ZH.chartTooltipFact}：{p.factTags.join(ZH.emotionJoin)}
                        </p>
                      ) : null}
                      {p.thoughtRaw ? (
                        <p>
                          {ZH.chartTooltipThought}：{p.thoughtRaw}
                        </p>
                      ) : null}
                      {p.bodyParts.length > 0 ? (
                        <p>
                          {ZH.chartTooltipBody}：{p.bodyParts.join(ZH.emotionJoin)}
                        </p>
                      ) : null}
                      <p className="hint">{ZH.panoramaClickHint}</p>
                    </div>
                  )
                }}
              />
              <Line
                type="monotone"
                dataKey="tideValue"
                stroke="#6b8fad"
                strokeWidth={2}
                dot={(props) => {
                  const { cx, cy, payload } = props
                  const p = payload as PanoramaPoint
                  if (cx == null || cy == null) return null
                  const selected = p.id === selectedId
                  const filtered = highlightIds != null
                  const dimmed = filtered && !highlightIds.includes(p.id)
                  const r = selected ? 9 : 6
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={r}
                      fill={p.valenceColor}
                      stroke={selected ? '#3d4549' : '#fffcfa'}
                      strokeWidth={selected ? 2.5 : 2}
                      opacity={dimmed ? 0.22 : 1}
                      style={{ cursor: 'pointer', pointerEvents: 'none' }}
                      aria-hidden
                    />
                  )
                }}
                activeDot={{
                  r: 9,
                  stroke: '#3d4549',
                  strokeWidth: 2,
                  fill: '#fffcfa',
                  style: { cursor: 'pointer' }
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
