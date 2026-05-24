import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import { BEHAVIOR_TAGS, EMOTIONS } from '../data/emotions'
import { buildEmotionLabelMap, resolveTagLists } from '../data/tagLists'
import { ZH } from '../i18n/zh'
import { parseEntries } from '../utils/entryParse'
import {
  analyzeDayQuadrants,
  assignQuadrant,
  computeArousal,
  computeValence,
  detectCauseChains,
  QUADRANT_DEFINITIONS,
  valenceDotColor
} from '../utils/dayAnalytics'
import CauseChainCanvas from './CauseChainCanvas'
import EmotionQuadrantGrid from './EmotionQuadrantGrid'

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

interface ChartPoint {
  time: string
  intensity: number
  label: string
  fact: string
  thought: string
  valence: number
  valenceColor: string
  quadrantLabel: string
}

export default function DayChart() {
  const date = todayStr()
  const [entries, setEntries] = useState<Awaited<ReturnType<typeof window.api.listToday>>>([])
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [tagLists, setTagLists] = useState(() => resolveTagLists())
  const [emotionLabels, setEmotionLabels] = useState(() =>
    buildEmotionLabelMap(resolveTagLists(), EMOTIONS)
  )

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
      const lists = resolveTagLists(s.tagLists)
      setTagLists(lists)
      setEmotionLabels(buildEmotionLabelMap(lists, EMOTIONS))
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
    () => analyzeDayQuadrants(parsed, emotionLabels, behaviorLabels, tagLists),
    [parsed, emotionLabels, behaviorLabels, tagLists]
  )

  const chartData = useMemo((): ChartPoint[] => {
    return parsed.map((e) => {
      const d = e.occurredAt
      const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
      const label = e.emotionIds.map((id) => emotionLabels.get(id) ?? id).join(ZH.emotionJoin)
      const fact =
        e.factTags.join(ZH.emotionJoin) || (e.factSupplement ? e.factSupplement : '\u2014')
      const valence = computeValence(e.emotionIds[0], tagLists)
      const qId = assignQuadrant(valence, computeArousal(e))
      const quadrantLabel = QUADRANT_DEFINITIONS.find((q) => q.id === qId)?.title ?? ''
      const row = entries.find((r) => r.id === e.id)
      const thought = row?.thought?.trim() || '\u2014'
      return {
        time,
        intensity: e.intensity,
        label,
        fact,
        thought,
        valence,
        valenceColor: valenceDotColor(valence),
        quadrantLabel
      }
    })
  }, [parsed, emotionLabels, behaviorLabels, entries, tagLists])

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
                <i className="chart-legend__dot chart-legend__dot--neg" />
                {ZH.chartLegendNeg}
              </span>
              <span className="chart-legend__item">
                <i className="chart-legend__dot chart-legend__dot--pos" />
                {ZH.chartLegendPos}
              </span>
              <span className="chart-legend__item">
                <i className="chart-legend__dot chart-legend__dot--neu" />
                {ZH.chartLegendNeu}
              </span>
            </div>
            <ResponsiveContainer width="100%" height={340}>
              <LineChart data={chartData} margin={{ top: 16, right: 20, left: 4, bottom: 8 }}>
                <defs>
                  <linearGradient id="intensityBandLow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e8eef6" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#e8eef6" stopOpacity={0.08} />
                  </linearGradient>
                  <linearGradient id="intensityBandMid" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f5ebe0" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#f5ebe0" stopOpacity={0.06} />
                  </linearGradient>
                  <linearGradient id="intensityBandHigh" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f0e4e4" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#f0e4e4" stopOpacity={0.08} />
                  </linearGradient>
                </defs>
                <ReferenceArea y1={1} y2={3} fill="url(#intensityBandLow)" />
                <ReferenceArea y1={3} y2={7} fill="url(#intensityBandMid)" />
                <ReferenceArea y1={7} y2={9} fill="url(#intensityBandHigh)" />
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e4df" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis domain={[1, 9]} ticks={[1, 3, 5, 7, 9]} width={28} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null
                    const p = payload[0].payload as ChartPoint
                    return (
                      <div className="chart-tooltip">
                        <p className="chart-tooltip__time">{label}</p>
                        <p>{ZH.intensityLabel(p.intensity)}</p>
                        {p.label ? <p>{p.label}</p> : null}
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
                <Line
                  type="monotone"
                  dataKey="intensity"
                  stroke="#6b8fad"
                  strokeWidth={2.5}
                  dot={(props) => {
                    const { cx, cy, payload } = props
                    const p = payload as ChartPoint
                    if (cx == null || cy == null) return null
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={6}
                        fill={p.valenceColor}
                        stroke="#fffcfa"
                        strokeWidth={2}
                      />
                    )
                  }}
                  activeDot={{ r: 8, strokeWidth: 2, stroke: '#fffcfa' }}
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="hint chart-axis-hint">{ZH.chartAxis}</p>
          </div>

          <CauseChainCanvas insights={causeChains} emotionLabels={emotionLabels} />
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
