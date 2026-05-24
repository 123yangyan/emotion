import { useCallback, useEffect, useRef, useState } from 'react'
import type { EntryRow } from '../../../main/database'
import { resolveTagLists, type TagListsConfig } from '../data/tagLists'
import { formatClockLocal, formatDateShort } from '../utils/formatTime'
import { restoreEntryToForm } from '../utils/entryFormRestore'
import { getFactInputPlaceholder } from '../utils/factPlaceholder'
import { FACT_SUPPLEMENT_PREFIX } from '../utils/entryParse'
import { tierToIntensity } from '../utils/intensityTier'
import { ZH } from '../i18n/zh'
import RecordViewportForm from './RecordViewportForm'

interface Props {
  variant?: 'page' | 'popup' | 'modal'
  editEntryId?: number
  initialData?: EntryRow
  onSaved: (updated?: EntryRow) => void
  onCancel?: () => void
}

export default function MoodRecordForm({
  variant = 'page',
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
  const [emotionIds, setEmotionIds] = useState<string[]>([])
  const [intensity, setIntensity] = useState(5)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [closing, setClosing] = useState(false)
  const [tagLists, setTagLists] = useState<TagListsConfig>(() => resolveTagLists())
  const [error, setError] = useState('')
  const [thoughtTags, setThoughtTags] = useState<string[]>([])
  const [thoughtNote, setThoughtNote] = useState('')
  const [focusZone, setFocusZone] = useState<'emotion' | 'fact' | 'thought' | null>(null)

  const formRef = useRef<HTMLFormElement>(null)
  const [occurredAtIso, setOccurredAtIso] = useState(() => new Date().toISOString())
  const [editLoading, setEditLoading] = useState(isEdit)
  const [lastRecordTimeLabel, setLastRecordTimeLabel] = useState<string | null>(null)

  const emotionZoneGroups = {
    positive: tagLists.emotionsPositive,
    neutral: tagLists.emotionsNeutral ?? [],
    negative: tagLists.emotionsNegative
  }
  const factPlaceholder = getFactInputPlaceholder(factTags[0], emotionIds[0], tagLists)

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
    setEmotionIds(restored.emotionIds)
    setIntensity(restored.intensity)
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

  const pickEmotion = (id: string): void => {
    setEmotionIds((prev) => pickSingle(prev, id))
  }

  const pickFact = (tag: string): void => {
    setFactTags((prev) => pickSingle(prev, tag))
  }

  const pickThought = (tag: string): void => {
    setThoughtTags((prev) => pickSingle(prev, tag))
  }

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

  const pickIntensity = useCallback((n: number): void => {
    setIntensity(n)
  }, [])

  const pickIntensityTier = useCallback((tier: number): void => {
    setIntensity(tierToIntensity(tier))
  }, [])

  const snoozeAndExit = useCallback((): void => {
    void window.api.snoozeCheckIn()
  }, [])

  const submitForm = useCallback(async (): Promise<void> => {
    setError('')
    if (emotionIds.length === 0) {
      setError(ZH.selectEmotion)
      return
    }
    setSaving(true)
    try {
      const payload = {
        fact: buildFactText(),
        thought: buildThoughtText(),
        bodyTags: [],
        behaviorTags: [],
        reactionNote: factSupplement.trim(),
        emotionIds,
        intensity,
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
        setEmotionIds([])
        setIntensity(5)
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
  }, [
    emotionIds,
    factSupplement,
    factTags,
    intensity,
    editEntryId,
    isEdit,
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
      if (e.key >= '1' && e.key <= '5' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const tag = (e.target as HTMLElement)?.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA') return
        e.preventDefault()
        pickIntensityTier(Number(e.key))
        return
      }

      if (isPopup && e.key === 'Escape') {
        e.preventDefault()
        snoozeAndExit()
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
  }, [isPopup, pickIntensityTier, snoozeAndExit, submitForm])

  if (editLoading) {
    return <p className="hint">{ZH.loading}</p>
  }

  return (
    <RecordViewportForm
      formRef={formRef}
      variant={variant}
      closing={closing}
      recordTimeLabel={recordTimeLabel}
      dateLabel={dateLabel}
      lastRecordTimeLabel={lastRecordTimeLabel}
      isEdit={isEdit}
      intensity={intensity}
      onPickIntensity={pickIntensity}
      emotionIds={emotionIds}
      onPickEmotion={pickEmotion}
      emotionZoneGroups={emotionZoneGroups}
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
      error={error}
      saving={saving}
      saveSuccess={saveSuccess}
      onCancel={onCancel}
      onSubmit={handleSubmit}
    />
  )
}
