import { useCallback, useEffect, useMemo, useState } from 'react'
import type { EntryRow } from '../../../main/database'
import { BEHAVIOR_TAGS, EMOTIONS } from '../data/emotions'
import { buildEmotionLabelMap, resolveTagLists } from '../data/tagLists'
import { ZH } from '../i18n/zh'
import {
  buildPanoramaPoints,
  computeFrequencies,
  getRangeBounds,
  type PanoramaPoint,
  type PanoramaRange
} from '../utils/panoramaAnalytics'
import FrequencyPanel from './panorama/FrequencyPanel'
import PanoramaTimeline from './panorama/PanoramaTimeline'
import SnapshotCard from './panorama/SnapshotCard'

const RANGES: { id: PanoramaRange; label: string }[] = [
  { id: 'day', label: ZH.panoramaRangeDay },
  { id: 'week', label: ZH.panoramaRangeWeek },
  { id: 'month', label: ZH.panoramaRangeMonth }
]

/** \u5168\u666f\u8231\u00b7\u5206\u6790\u9875 */
export default function AnalysisPage(): JSX.Element {
  const [range, setRange] = useState<PanoramaRange>('week')
  const [entries, setEntries] = useState<EntryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [emotionLabels, setEmotionLabels] = useState(() =>
    buildEmotionLabelMap(resolveTagLists(), EMOTIONS)
  )

  const behaviorLabels = useMemo(() => {
    const lists = resolveTagLists()
    return new Map([...BEHAVIOR_TAGS, ...lists.behaviorTags].map((b) => [b.id, b.label]))
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    const { startIso, endIso } = getRangeBounds(range)
    const rows = await window.api.listEntriesBetween(startIso, endIso)
    setEntries(rows)
    const settings = await window.api.getSettings()
    setEmotionLabels(buildEmotionLabelMap(resolveTagLists(settings.tagLists), EMOTIONS))
    setLoading(false)
  }, [range])

  useEffect(() => {
    void load()
  }, [load])

  const points: PanoramaPoint[] = useMemo(
    () => buildPanoramaPoints(entries, emotionLabels, behaviorLabels, range),
    [entries, emotionLabels, behaviorLabels, range]
  )

  const frequencies = useMemo(
    () => computeFrequencies(points, emotionLabels, entries),
    [points, emotionLabels, entries]
  )

  const selectedPoint = useMemo(
    () => points.find((p) => p.id === selectedId) ?? null,
    [points, selectedId]
  )

  return (
    <div className="analysis-page panorama-page">
      <header className="panorama-header">
        <div>
          <h2>{ZH.panoramaTitle}</h2>
          <p className="hint">{ZH.panoramaSubtitle}</p>
        </div>
        <div className="panorama-range-tabs" role="tablist">
          {RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              role="tab"
              aria-selected={range === r.id}
              className={`panorama-range-tab ${range === r.id ? 'is-active' : ''}`}
              onClick={() => setRange(r.id)}
            >
              {r.label}
            </button>
          ))}
        </div>
        <button type="button" className="btn secondary" onClick={() => void load()}>
          {ZH.refresh}
        </button>
      </header>

      {loading ? (
        <p className="hint">{ZH.loading}</p>
      ) : points.length === 0 ? (
        <p className="empty">{ZH.panoramaEmpty}</p>
      ) : (
        <div className="panorama-layout">
          <div className="panorama-main">
            <PanoramaTimeline
              points={points}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
            {selectedPoint ? (
              <SnapshotCard point={selectedPoint} onClose={() => setSelectedId(null)} />
            ) : (
              <p className="hint panorama-tip">{ZH.panoramaTip}</p>
            )}
          </div>
          <FrequencyPanel frequencies={frequencies} />
        </div>
      )}
    </div>
  )
}
