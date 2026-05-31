import { useCallback, useEffect, useRef, useState } from 'react'
import type { EntryRow } from '../../../main/database'
import type { FatigueCheck } from '../../../shared/types'
import { resolveTagLists, type TagListsConfig } from '../data/tagLists'
import { formatClockLocal, formatDateShort } from '../utils/formatTime'
import { restoreEntryToForm } from '../utils/entryFormRestore'
import { getFactInputPlaceholder } from '../utils/factPlaceholder'
import { FACT_SUPPLEMENT_PREFIX, getQuadrantLabel } from '../utils/entryParse'
import { ZH } from '../i18n/zh'
import RecordViewportForm from './RecordViewportForm'

/**
 * 根据疲劳检查数据自动推算能量坐标。
 * 质量 ≥5 → coordX 正值（愿意投入），≤4 → 负值（排斥）
 * 决策负荷 + 症状数量决定 coordY（耗能度）
 */
function calcFatigueCoord(data: FatigueCheck): { x: number; y: number } {
  const x = Math.max(-4, Math.min(4, Math.round((data.decision_quality - 4) * 0.6)))
  const loadBase = data.decision_load === '极多' ? 3 : data.decision_load === '少' ? -1 : 1
  const symptoms = [data.hesitate, data.escapeTendency, data.brainFog].filter(Boolean).length
  const y = Math.min(4, Math.max(-4, loadBase + symptoms))
  return { x, y }
}

interface Props {
  variant?: 'page' | 'popup' | 'modal'
  /** 疲劳检查模式：底部追加疲劳检查区块 */
  isFatigueCheck?: boolean
  editEntryId?: number
  initialData?: EntryRow
  onSaved: (updated?: EntryRow) => void
  onCancel?: () => void
}

/** 疲劳检查区块组件（重设计：质量→负荷→症状，实时象限预览） */
function FatigueSection({
  data,
  onChange
}: {
  data: FatigueCheck
  onChange: (next: FatigueCheck) => void
}): JSX.Element {
  const setField = <K extends keyof FatigueCheck>(key: K, value: FatigueCheck[K]): void => {
    onChange({ ...data, [key]: value })
  }

  const { x, y } = calcFatigueCoord(data)
  const quadrantName = getQuadrantLabel(x, y)
  const coordStr = `(${x > 0 ? `+${x}` : x}, ${y > 0 ? `+${y}` : y})`
  const symptoms = [data.hesitate, data.escapeTendency, data.brainFog].filter(Boolean).length

  return (
    <div className="fatigue-section record-viewport__card">
      <div className="fatigue-section__header">
        <p className="fatigue-section__title">{ZH.fatigueTitle}</p>
        <p className="fatigue-section__subtitle">{ZH.fatigueSubtitle}</p>
      </div>

      {/* 1. 决策质量打分（最重要，置顶） */}
      <div className="fatigue-section__field">
        <span className="fatigue-section__label">{ZH.fatigueQuality}</span>
        <div className="fatigue-section__quality-row">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button
              key={n}
              type="button"
              className={`fatigue-quality-btn fatigue-quality-btn--${n <= 3 ? 'low' : n >= 7 ? 'high' : 'mid'}${data.decision_quality === n ? ' is-active' : ''}`}
              onClick={() => setField('decision_quality', n)}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="fatigue-quality-legend">
          <span>极差</span><span>极优</span>
        </div>
      </div>

      {/* 2. 决策负荷 */}
      <div className="fatigue-section__field">
        <span className="fatigue-section__label">{ZH.fatigueDecisionLoad}</span>
        <div className="fatigue-section__radio-group">
          {(['少', '正常', '极多'] as const).map((v) => (
            <button
              key={v}
              type="button"
              className={`fatigue-section__radio-btn${data.decision_load === v ? ' is-active' : ''}`}
              onClick={() => setField('decision_load', v)}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* 3. 疲劳症状 */}
      <div className="fatigue-section__field">
        <span className="fatigue-section__label">{ZH.fatigueChecks}</span>
        <label className="fatigue-section__checkbox-row">
          <input
            type="checkbox"
            checked={data.hesitate}
            onChange={(e) => setField('hesitate', e.target.checked)}
          />
          {ZH.fatigueHesitate}
        </label>
        <label className="fatigue-section__checkbox-row">
          <input
            type="checkbox"
            checked={data.escapeTendency}
            onChange={(e) => setField('escapeTendency', e.target.checked)}
          />
          {ZH.fatigueEscape}
        </label>
        <label className="fatigue-section__checkbox-row">
          <input
            type="checkbox"
            checked={data.brainFog}
            onChange={(e) => setField('brainFog', e.target.checked)}
          />
          {ZH.fatigueBrainFog}
        </label>
      </div>

      {/* 4. 实时象限推算提示 */}
      <p className="fatigue-section__auto-hint">
        {ZH.fatigueAutoCoord(symptoms, quadrantName, coordStr)}
      </p>
    </div>
  )
}

const DEFAULT_FATIGUE: FatigueCheck = {
  decision_load: '正常',
  hesitate: false,
  escapeTendency: false,
  brainFog: false,
  decision_quality: 5
}

export default function MoodRecordForm({
  variant = 'page',
  isFatigueCheck = false,
  editEntryId,
  initialData,
  onSaved,
  onCancel
}: Props): JSX.Element {
  const isPopup = variant === 'popup'
  const isEdit = editEntryId != null

  const [recordTimeLabel, setRecordTimeLabel] = useState('')
  const [dateLabel, setDateLabel] = useState(formatDateShort())
  const [factTags, setFactTags] = useState<string[]>([])
  const [factSupplement, setFactSupplement] = useState('')
  const [coordX, setCoordX] = useState(0)
  const [coordY, setCoordY] = useState(0)
  const [hasCoordSelection, setHasCoordSelection] = useState(false)
  const [fatigueData, setFatigueData] = useState<FatigueCheck>(DEFAULT_FATIGUE)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [closing, setClosing] = useState(false)
  const [tagLists, setTagLists] = useState<TagListsConfig>(() => resolveTagLists())
  const [error, setError] = useState('')
  const [thoughtTags, setThoughtTags] = useState<string[]>([])
  const [thoughtNote, setThoughtNote] = useState('')
  const [focusZone, setFocusZone] = useState<'coord' | 'fact' | 'thought' | null>(null)

  const formRef = useRef<HTMLFormElement>(null)
  const [occurredAtIso, setOccurredAtIso] = useState(() => new Date().toISOString())
  const [editLoading, setEditLoading] = useState(isEdit)
  const [lastRecordTimeLabel, setLastRecordTimeLabel] = useState<string | null>(null)

  const factPlaceholder = getFactInputPlaceholder(factTags[0])

  const loadLastRecordTime = useCallback(async (): Promise<void> => {
    const all = await window.api.listAllEntries()
    const latest = all.find((e) => !(isEdit && editEntryId != null && e.id === editEntryId))
    if (!latest) {
      setLastRecordTimeLabel(null)
      return
    }
    setLastRecordTimeLabel(formatClockLocal(new Date(latest.occurred_at)))
  }, [editEntryId, isEdit])

  useEffect(() => {
    if (isEdit) return
    setDateLabel(formatDateShort())
  }, [isEdit])

  const fillForm = useCallback((row: EntryRow, thoughtTagsList: string[]) => {
    const restored = restoreEntryToForm(row, thoughtTagsList)
    setFactTags(restored.factTags)
    setFactSupplement(restored.factSupplement)
    setCoordX(restored.coordX)
    setCoordY(restored.coordY)
    setHasCoordSelection(true)
    setThoughtTags(restored.thoughtTags)
    setThoughtNote(restored.thoughtNote)
    setOccurredAtIso(restored.occurredAt)
    setRecordTimeLabel(formatClockLocal(new Date(restored.occurredAt)))
    setDateLabel(formatDateShort(new Date(restored.occurredAt)))
    setEditLoading(false)
  }, [])

  useEffect(() => {
    if (isEdit && editEntryId != null) setEditLoading(true)
    void window.api.getSettings().then((s) => {
      const lists = resolveTagLists(s.tagLists)
      setTagLists(lists)
      if (!isEdit || editEntryId == null) return
      if (initialData && initialData.id === editEntryId) {
        fillForm(initialData, lists.thoughtTags)
        return
      }
      void window.api.getEntry(editEntryId).then((row) => {
        if (!row) {
          setError(ZH.historyEntryMissing)
          setEditLoading(false)
          return
        }
        fillForm(row, lists.thoughtTags)
      })
    })
  }, [editEntryId, fillForm, initialData, isEdit])

  useEffect(() => {
    if (isEdit) return
    void loadLastRecordTime()
  }, [isEdit, loadLastRecordTime])

  const pickSingle = (current: string[], value: string): string[] =>
    current[0] === value ? [] : [value]

  const pickFact = (tag: string): void => {
    setFactTags((prev) => pickSingle(prev, tag))
  }

  const pickThought = (tag: string): void => {
    setThoughtTags((prev) => pickSingle(prev, tag))
  }

  const pickCoord = useCallback((x: number, y: number): void => {
    setCoordX(x)
    setCoordY(y)
    setHasCoordSelection(true)
  }, [])

  const buildFactText = (): string => {
    const parts = [...factTags]
    const extra = factSupplement.trim()
    if (extra) parts.push(`${FACT_SUPPLEMENT_PREFIX}${extra}`)
    return parts.join(ZH.emotionJoin)
  }

  const buildThoughtText = (): string => {
    const parts = [...thoughtTags]
    const extra = thoughtNote.trim()
    if (extra) parts.push(extra)
    return parts.join(ZH.emotionJoin)
  }

  const submitForm = useCallback(async (): Promise<void> => {
    setError('')
    // 疲劳检查模式下，坐标由 calcFatigueCoord 自动推算，无需手动选择
    if (!isFatigueCheck && !hasCoordSelection) {
      setError(ZH.selectCoord)
      return
    }
    const autoCoord = isFatigueCheck ? calcFatigueCoord(fatigueData) : null
    const finalX = autoCoord ? autoCoord.x : coordX
    const finalY = autoCoord ? autoCoord.y : coordY

    setSaving(true)
    try {
      const payload = {
        fact: buildFactText(),
        thought: buildThoughtText(),
        bodyTags: [],
        behaviorTags: [],
        reactionNote: factSupplement.trim(),
        coordX: finalX,
        coordY: finalY,
        fatigueCheck: isFatigueCheck ? JSON.stringify(fatigueData) : null,
        occurredAt: isEdit ? occurredAtIso : new Date().toISOString()
      }
      let updated: EntryRow | undefined
      if (isEdit && editEntryId != null) {
        const row = await window.api.updateEntry(editEntryId, payload)
        if (!row) {
          setError(ZH.saveFail)
          return
        }
        updated = row
      } else {
        await window.api.createEntry(payload)
        setFactTags([])
        setFactSupplement('')
        setThoughtTags([])
        setThoughtNote('')
        setCoordX(0)
        setCoordY(0)
        setHasCoordSelection(false)
        setFatigueData(DEFAULT_FATIGUE)
        void loadLastRecordTime()
      }
      onSaved(updated)
      if (isPopup) {
        setSaveSuccess(true)
        await new Promise((r) => setTimeout(r, 320))
        setClosing(true)
        await new Promise((r) => setTimeout(r, 280))
        window.close()
      }
    } catch {
      setError(ZH.saveFail)
    } finally {
      setSaving(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    hasCoordSelection,
    coordX,
    coordY,
    fatigueData,
    factSupplement,
    factTags,
    editEntryId,
    isEdit,
    isFatigueCheck,
    isPopup,
    occurredAtIso,
    onSaved,
    thoughtNote,
    thoughtTags,
    loadLastRecordTime
  ])

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    void submitForm()
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (isPopup && e.key === 'Escape') {
        e.preventDefault()
        void window.api.snoozeCheckIn()
        return
      }

      const inTextField =
        (e.target as HTMLElement)?.tagName === 'INPUT' ||
        (e.target as HTMLElement)?.tagName === 'TEXTAREA'

      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        void submitForm()
        return
      }

      if (!isPopup && e.key === 'Enter' && !inTextField && !e.shiftKey) {
        e.preventDefault()
        void submitForm()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isPopup, submitForm])

  if (editLoading) {
    return <p className="hint">{ZH.loading}</p>
  }

  const fatigueExtra = isFatigueCheck ? (
    <FatigueSection data={fatigueData} onChange={setFatigueData} />
  ) : undefined

  return (
    <RecordViewportForm
      formRef={formRef}
      variant={variant}
      closing={closing}
      recordTimeLabel={recordTimeLabel}
      dateLabel={dateLabel}
      lastRecordTimeLabel={lastRecordTimeLabel}
      isEdit={isEdit}
      coordX={coordX}
      coordY={coordY}
      hasCoordSelection={hasCoordSelection}
      onPickCoord={pickCoord}
      tagLists={tagLists}
      focusZone={focusZone}
      setFocusZone={setFocusZone}
      factTags={factTags}
      onPickFact={pickFact}
      factSupplement={factSupplement}
      setFactSupplement={setFactSupplement}
      factPlaceholder={factPlaceholder}
      thoughtTags={thoughtTags}
      onPickThought={pickThought}
      thoughtNote={thoughtNote}
      setThoughtNote={setThoughtNote}
      isFatigueCheck={isFatigueCheck}
      fatigueExtra={fatigueExtra}
      error={error}
      saving={saving}
      saveSuccess={saveSuccess}
      onCancel={onCancel}
      onSubmit={handleSubmit}
    />
  )
}
