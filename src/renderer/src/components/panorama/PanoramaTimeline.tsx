import { useMemo } from 'react'
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
import type { PanoramaPoint } from '../../utils/panoramaAnalytics'
import { ZH } from '../../i18n/zh'

interface Props {
  points: PanoramaPoint[]
  selectedId: number | null
  onSelect: (id: number) => void
}

/** \u53cc\u5411\u60c5\u7eea\u6f6e\u6c50\u56fe */
export default function PanoramaTimeline({ points, selectedId, onSelect }: Props): JSX.Element {
  const chartData = useMemo(() => points.map((p) => ({ ...p, displayTs: p.ts })), [points])

  const tickFormatter = (ts: number): string => {
    const p = points.find((pt) => pt.ts === ts)
    return p?.timeLabel ?? ''
  }

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
          <span className="hint">{ZH.panoramaBaseline}</span>
        </div>
        <div className="panorama-tide__chart">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 12, right: 16, left: 8, bottom: 8 }}>
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
                          {ZH.chartTooltipFact}\uff1a{p.factTags.join(ZH.emotionJoin)}
                        </p>
                      ) : null}
                      {p.thoughtRaw ? (
                        <p>
                          {ZH.chartTooltipThought}\uff1a{p.thoughtRaw}
                        </p>
                      ) : null}
                      {p.bodyParts.length > 0 ? (
                        <p>
                          {ZH.chartTooltipBody}\uff1a{p.bodyParts.join(ZH.emotionJoin)}
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
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={selected ? 9 : 6}
                      fill={p.valenceColor}
                      stroke={selected ? '#3d4549' : '#fffcfa'}
                      strokeWidth={selected ? 2.5 : 2}
                      style={{ cursor: 'pointer' }}
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelect(p.id)
                      }}
                    />
                  )
                }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
