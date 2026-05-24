import { useCallback, useEffect, useMemo, useState } from 'react'
import type { EntryRow } from '../../../main/database'
import { BEHAVIOR_TAGS, EMOTIONS } from '../data/emotions'
import { buildEmotionLabelMap, resolveTagLists } from '../data/tagLists'
import { ZH } from '../i18n/zh'
import {
  buildPanoramaPoints,
  computeFrequencies,
  getRangeBounds,
  type FrequencyItem,
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

interface Props {
  onEditEntry?: (id: number) => void
}

/** 全景舱·分析页 */
export default function AnalysisPage({ onEditEntry }: Props): JSX.Element {
  const [range, setRange] = useState<PanoramaRange>('week')
  const [entries, setEntries] = useState<EntryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [highlightIds, setHighlightIds] = useState<number[] | null>(null)
  const [filterLabel, setFilterLabel] = useState<string | null>(null)
  const [emotionLabels, setEmotionLabels] = useState(() =>
    buildEmotionLabelMap(resolveTagLists(), EMOTIONS)
  )
  const [thoughtTags, setThoughtTags] = useState<string[]>(() => resolveTagLists().thoughtTags)

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
    const lists = resolveTagLists(settings.tagLists)
    setEmotionLabels(buildEmotionLabelMap(lists, EMOTIONS))
    setThoughtTags(lists.thoughtTags)
    setLoading(false)
  }, [range])

  useEffect(() => {
    void load()
  }, [load])

  // 切换时间范围时重置选中与筛选，避免「幽灵选中」
  useEffect(() => {
    setSelectedId(null)
    setHighlightIds(null)
    setFilterLabel(null)
  }, [range])

  const points: PanoramaPoint[] = useMemo(
    () => buildPanoramaPoints(entries, emotionLabels, behaviorLabels, range),
    [entries, emotionLabels, behaviorLabels, range]
  )

  const frequencies = useMemo(
    () => computeFrequencies(points, emotionLabels, entries),
    [points, emotionLabels, entries]
  )

  // 可导航的记录 id 列表（有筛选时仅在筛选集合内切换）
  const navigableIds = useMemo(() => {
    const pool =
      highlightIds != null
        ? points.filter((p) => highlightIds.includes(p.id))
        : points
    return pool.map((p) => p.id)
  }, [points, highlightIds])

  const selectedPoint = useMemo(
    () => points.find((p) => p.id === selectedId) ?? null,
    [points, selectedId]
  )

  const navIndex = selectedId != null ? navigableIds.indexOf(selectedId) : -1

  const handleToggleSelect = useCallback((id: number) => {
    setSelectedId((prev) => (prev === id ? null : id))
  }, [])

  const selectByOffset = useCallback(
    (delta: number) => {
      if (selectedId == null || navigableIds.length === 0) return
      const idx = navigableIds.indexOf(selectedId)
      const base = idx >= 0 ? idx : 0
      const next = Math.min(navigableIds.length - 1, Math.max(0, base + delta))
      setSelectedId(navigableIds[next] ?? null)
    },
    [selectedId, navigableIds]
  )

  const clearSelection = useCallback(() => {
    setSelectedId(null)
    setHighlightIds(null)
    setFilterLabel(null)
  }, [])

  const handleFreqItemClick = useCallback(
    (item: FrequencyItem) => {
      if (filterLabel === item.label) {
        clearSelection()
        return
      }
      setFilterLabel(item.label)
      setHighlightIds(item.entryIds)
      const matching = points
        .filter((p) => item.entryIds.includes(p.id))
        .sort((a, b) => b.ts - a.ts)
      setSelectedId(matching[0]?.id ?? null)
    },
    [filterLabel, points, clearSelection]
  )

  // 键盘 ← / → 切换记录，Esc 关闭
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      if (e.key === 'Escape') {
        if (selectedId != null || filterLabel != null) {
          e.preventDefault()
          clearSelection()
        }
        return
      }

      if (selectedId == null) return

      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        selectByOffset(-1)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        selectByOffset(1)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedId, filterLabel, clearSelection, selectByOffset])

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
              highlightIds={highlightIds}
              onToggleSelect={handleToggleSelect}
            />
            <div className="panorama-snapshot-panel">
              {filterLabel ? (
                <p className="hint panorama-filter-hint">
                  {ZH.panoramaFreqFilterHint(filterLabel, highlightIds?.length ?? 0)}
                </p>
              ) : null}
              {selectedPoint ? (
                <SnapshotCard
                  point={selectedPoint}
                  thoughtTagOptions={thoughtTags}
                  navIndex={navIndex >= 0 ? navIndex : 0}
                  navTotal={navigableIds.length}
                  canPrev={navIndex > 0}
                  canNext={navIndex >= 0 && navIndex < navigableIds.length - 1}
                  onPrev={() => selectByOffset(-1)}
                  onNext={() => selectByOffset(1)}
                  onClose={clearSelection}
                  onEdit={onEditEntry ? () => onEditEntry(selectedPoint.id) : undefined}
                />
              ) : (
                <p className="hint panorama-tip">{ZH.panoramaTip}</p>
              )}
            </div>
          </div>
          <FrequencyPanel
            frequencies={frequencies}
            activeLabel={filterLabel}
            onItemClick={handleFreqItemClick}
          />
        </div>
      )}
    </div>
  )
}
