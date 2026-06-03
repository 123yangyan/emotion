import { useCallback, useEffect, useMemo, useState } from 'react'
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
import { BEHAVIOR_TAGS } from '../data/emotions'
import { resolveTagLists } from '../data/tagLists'
import { ZH } from '../i18n/zh'
import { parseEntries } from '../utils/entryParse'
import {
  analyzeDayQuadrants,
  assignQuadrant,
  detectCauseChains,
  QUADRANT_DEFINITIONS,
  type QuadrantId
} from '../utils/dayAnalytics'
import { todayBeijingDateKey, formatBeijingHm } from '../../../shared/beijingTime'
import CauseChainCanvas from './CauseChainCanvas'
import EmotionQuadrantGrid from './EmotionQuadrantGrid'

function todayStr(): string {
  return todayBeijingDateKey()
}

/** 按象限返回落点颜色 */
function quadrantDotColor(qId: QuadrantId): string {
  if (qId === 'br') return '#5a9f6a'  // 心流区：绿
  if (qId === 'tr') return '#c4893a'  // 攻坚区：橙
  if (qId === 'bl') return '#8a9ab0'  // 机械区：灰蓝
  return '#c47a7a'                    // 内耗陷阱：红
}

interface ChartPoint {
  time: string
  coordX: number
  coordY: number
  fact: string
  thought: string
  quadrantLabel: string
  dotColor: string
}

export default function DayChart() {
  const date = todayStr()
  const [entries, setEntries] = useState<Awaited<ReturnType<typeof window.api.listToday>>>([])
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [tagLists, setTagLists] = useState(() => resolveTagLists())

  const load = useCallback(async () => {
    setLoading(true)
    const list = await window.api.listToday(date)
    setEntries(list)
    const t = await window.api.getDailyTitle(date)
    setTitle(t)
    setLoading(false)
  }, [date])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    void window.api.getSettings().then((s) => {
      setTagLists(resolveTagLists(s.tagLists))
    })
  }, [])

  const behaviorLabels = useMemo(
    () => new Map([...BEHAVIOR_TAGS, ...tagLists.behaviorTags].map((b) => [b.id, b.label])),
    [tagLists.behaviorTags]
  )

  const parsed = useMemo(() => parseEntries(entries), [entries])

  const causeChains = useMemo(
    () => detectCauseChains(parsed, behaviorLabels),
    [parsed, behaviorLabels]
  )

  const quadrantSummary = useMemo(
    () => analyzeDayQuadrants(parsed, new Map(), behaviorLabels, tagLists),
    [parsed, behaviorLabels, tagLists]
  )

  const chartData = useMemo((): ChartPoint[] => {
    return parsed.map((e) => {
      const time = formatBeijingHm(e.occurredAt)
      const fact =
        e.factTags.join(ZH.emotionJoin) || (e.factSupplement ? e.factSupplement : '\u2014')
      const row = entries.find((r) => r.id === e.id)
      const thought = row?.thought?.trim() || '\u2014'
      const qId = assignQuadrant(e.coordX, e.coordY)
      const quadrantLabel = QUADRANT_DEFINITIONS.find((q) => q.id === qId)?.title ?? ''
      return {
        time,
        coordX: e.coordX,
        coordY: e.coordY,
        fact,
        thought,
        quadrantLabel,
        dotColor: quadrantDotColor(qId)
      }
    })
  }, [parsed, entries])

  const saveTitle = async (): Promise<void> => {
    await window.api.setDailyTitle(date, title)
  }

  if (loading) {
    return <p className="hint">{ZH.loading}</p>
  }

  return (
    <div className="chart-page">
      <h2>{ZH.chartTitle}</h2>
      <p className="hint">{ZH.chartSubtitle(chartData.length)}</p>

      {chartData.length === 0 ? (
        <p className="empty">{ZH.chartEmpty}</p>
      ) : (
        <>
          <div className="chart-wrap chart-wrap--enhanced">
            <div className="chart-legend" aria-hidden>
              <span className="chart-legend__item">
                <i className="chart-legend__line chart-legend__line--solid" />
                {ZH.chartLegendPos}
              </span>
              <span className="chart-legend__item">
                <i className="chart-legend__line chart-legend__line--dashed" />
                {ZH.chartLegendNeg}
              </span>
              <span className="chart-legend__item chart-legend__item--dots">
                {ZH.chartLegendNeu}
              </span>
            </div>
            <ResponsiveContainer width="100%" height={340}>
              <LineChart data={chartData} margin={{ top: 16, right: 20, left: 4, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e4df" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis domain={[-4, 4]} ticks={[-4, -2, 0, 2, 4]} width={28} />
                {/* 基准线：坐标零点 */}
                <ReferenceLine y={0} stroke="#9ca3af" strokeWidth={1.5} strokeDasharray="4 4" />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null
                    const p = payload[0].payload as ChartPoint
                    const xStr = p.coordX > 0 ? `+${p.coordX}` : String(p.coordX)
                    const yStr = p.coordY > 0 ? `+${p.coordY}` : String(p.coordY)
                    return (
                      <div className="chart-tooltip">
                        <p className="chart-tooltip__time">{label}</p>
                        <p>价值感 {xStr} · 耗能度 {yStr}</p>
                        <p>
                          {ZH.chartTooltipFact}：{p.fact}
                        </p>
                        <p>
                          {ZH.chartTooltipThought}：{p.thought}
                        </p>
                        <p className="chart-tooltip__quadrant">
                          {ZH.chartTooltipQuadrant}：{p.quadrantLabel}
                        </p>
                      </div>
                    )
                  }}
                />
                {/* 实线：价值感 coordX（正=愿意/负=排斥），点色按象限 */}
                <Line
                  type="monotone"
                  dataKey="coordX"
                  stroke="#6b8fad"
                  strokeWidth={2.5}
                  dot={(props) => {
                    const { cx, cy, payload } = props
                    const p = payload as ChartPoint
                    if (cx == null || cy == null) return <g />
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={6}
                        fill={p.dotColor}
                        stroke="#fffcfa"
                        strokeWidth={2}
                      />
                    )
                  }}
                  activeDot={{ r: 8, strokeWidth: 2, stroke: '#fffcfa' }}
                />
                {/* 虚线：耗能度 coordY（正=高耗/负=轻松），仅画线不画点 */}
                <Line
                  type="monotone"
                  dataKey="coordY"
                  stroke="#c9a87c"
                  strokeWidth={1.5}
                  strokeDasharray="5 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="hint chart-axis-hint">{ZH.chartAxis}</p>
          </div>

          <CauseChainCanvas insights={causeChains} emotionLabels={new Map()} />
          <EmotionQuadrantGrid summary={quadrantSummary} />
        </>
      )}

      <section className="section">
        <h3>{ZH.weatherTitle}</h3>
        <div className="row">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={ZH.weatherPlaceholder}
          />
          <button type="button" className="btn secondary" onClick={() => void saveTitle()}>
            {ZH.saveTitle}
          </button>
        </div>
      </section>

      <button type="button" className="btn secondary" onClick={() => void load()}>
        {ZH.refresh}
      </button>
    </div>
  )
}
