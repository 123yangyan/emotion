import { useCallback, useEffect, useRef, useState } from 'react'
import type { EntryRow } from '../../../main/database'
import { resolveTagLists, resolveEmotionSpectrum, type TagListsConfig } from '../data/tagLists'
import { formatClockLocal, formatDateShort } from '../utils/formatTime'
import { restoreEntryToForm } from '../utils/entryFormRestore'
import { getFactInputPlaceholder } from '../utils/factPlaceholder'
import { FACT_SUPPLEMENT_PREFIX } from '../utils/entryParse'
import { ZH } from '../i18n/zh'
import CheckInDualForm from './CheckInDualForm'
import EmotionSpectrumPicker from './EmotionSpectrumPicker'
import FactSceneSection from './FactSceneSection'
import IntensityEnergyBar from './IntensityEnergyBar'

interface Props {
  variant?: 'page' | 'popup' | 'modal'
  /** 传入则为编辑已有记录 */
  editEntryId?: number
  /** 历史列表已加载时可直传，跳过 getEntry 查库 */
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
  const isModal = variant === 'modal'
  const isEdit = editEntryId != null
  const [recordTimeLabel, setRecordTimeLabel] = useState('')
  const [dateLabel, setDateLabel] = useState(formatDateShort())
  const [factTags, setFactTags] = useState<string[]>([])
  const [factSupplement, setFactSupplement] = useState('')
  const [bodyTags, setBodyTags] = useState<string[]>([])
  const [behaviorTags, setBehaviorTags] = useState<string[]>([])
  const [emotionIds, setEmotionIds] = useState<string[]>([])
  const [intensity, setIntensity] = useState(5)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [closing, setClosing] = useState(false)
  const [tagLists, setTagLists] = useState<TagListsConfig>(() => resolveTagLists())
  const [error, setError] = useState('')
  const [thoughtTags, setThoughtTags] = useState<string[]>([])
  const [thoughtNote, setThoughtNote] = useState('')
  const [focusZone, setFocusZone] = useState<'emotion' | 'fact' | 'thought' | 'body' | null>(
    null
  )

  const thoughtRef = useRef<HTMLElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const [occurredAtIso, setOccurredAtIso] = useState(() => new Date().toISOString())
  const [editLoading, setEditLoading] = useState(isEdit)
  const [lastRecordTimeLabel, setLastRecordTimeLabel] = useState<string | null>(null)

  const emotionSpectrum = resolveEmotionSpectrum(tagLists)
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
    const tick = (): void => {
      setRecordTimeLabel(formatClockLocal())
      setDateLabel(formatDateShort())
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [isEdit])

  /** 把数据库记录回填到表单各字段（新建与编辑共用） */
  const fillForm = useCallback((row: EntryRow, thoughtTagsList: string[]) => {
    const restored = restoreEntryToForm(row, thoughtTagsList)
    setFactTags(restored.factTags)
    setFactSupplement(restored.factSupplement)
    setBodyTags(restored.bodyTags)
    setBehaviorTags(restored.behaviorTags)
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
    // 始终从已保存设置加载标签词表；编辑模式再额外回填记录
    void window.api.getSettings().then((s) => {
      const lists = resolveTagLists(s.tagLists)
      setTagLists(lists)
      if (!isEdit || editEntryId == null) return
      // 列表内存已有完整行数据时直接回填，避免多余查库
      if (initialData && initialData.id === editEntryId) {
        fillForm(initialData, lists.thoughtTags)
        return
      }
      // 分析页跳转等场景：内存无数据时再查库
      void window.api.getEntry(editEntryId).then((row) => {
        if (!row) {
          setError(ZH.historyEntryMissing)
          setEditLoading(false)
          return
        }
        fillForm(row, lists.thoughtTags)
      })
    })
    // 仅在打开/切换编辑目标时加载，避免 entries 刷新时覆盖用户输入
  }, [editEntryId, fillForm, initialData, isEdit])

  useEffect(() => {
    if (isEdit) return
    void loadLastRecordTime()
  }, [isEdit, loadLastRecordTime])

  /** 单选：再点同一项可取消；选新项会替换旧项 */
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

  /** 身心反应区共用一个「名额」：身体标签与行为标签互斥 */
  const pickBodyTag = (tag: string): void => {
    setBehaviorTags([])
    setBodyTags((prev) => pickSingle(prev, tag))
  }

  const pickBehaviorTag = (id: string): void => {
    setBodyTags([])
    setBehaviorTags((prev) => pickSingle(prev, id))
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
        bodyTags,
        behaviorTags,
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
        setBodyTags([])
        setBehaviorTags([])
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
    behaviorTags,
    bodyTags,
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
    if (!isPopup) return

    const onKey = (e: KeyboardEvent): void => {
      if (e.key >= '1' && e.key <= '9' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const tag = (e.target as HTMLElement)?.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA') return
        e.preventDefault()
        pickIntensity(Number(e.key))
        return
      }

      if (e.key === 'Escape') {
        e.preventDefault()
        snoozeAndExit()
        return
      }

      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        void submitForm()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isPopup, pickIntensity, snoozeAndExit, submitForm])

  const levels = [1, 2, 3, 4, 5, 6, 7, 8, 9]

  const factSection = (
    <FactSceneSection
      factScenes={tagLists.factScenes}
      factTags={factTags}
      onPickFact={pickFact}
      factSupplement={factSupplement}
      setFactSupplement={setFactSupplement}
      factPlaceholder={factPlaceholder}
    />
  )

  const thoughtSection = (
    <section
      ref={thoughtRef}
      className={`zone zone-thought thought-panel ${isPopup ? 'checkin-zone-focus' : ''} ${focusZone === 'thought' ? 'is-focused' : ''}`}
      tabIndex={isPopup ? 0 : undefined}
      onFocus={isPopup ? () => setFocusZone('thought') : undefined}
      onBlur={
        isPopup ? () => setFocusZone((z) => (z === 'thought' ? null : z)) : undefined
      }
    >
      <h2>{ZH.subjectiveThought}</h2>
      {!isPopup && <p className="hint zone-subhint">{ZH.thoughtHint}</p>}
      <div className="chip-wrap thought-chips">
        {tagLists.thoughtTags.map((tag) => (
          <button
            key={tag}
            type="button"
            className={`chip sm thought ${thoughtTags[0] === tag ? 'active' : ''}`}
            onClick={() => pickThought(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
      <input
        type="text"
        className="thought-inline-input"
        value={thoughtNote}
        onChange={(e) => setThoughtNote(e.target.value)}
        placeholder={ZH.thoughtNotePh}
      />
    </section>
  )

  if (editLoading) {
    return <p className="hint">{ZH.loading}</p>
  }

  if (isPopup) {
    return (
      <CheckInDualForm
        formRef={formRef}
        closing={closing}
        dateLabel={dateLabel}
        intensity={intensity}
        levels={levels}
        onPickIntensity={pickIntensity}
        emotionIds={emotionIds}
        onPickEmotion={pickEmotion}
        emotionSpectrum={emotionSpectrum}
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
        bodyTags={bodyTags}
        behaviorTags={behaviorTags}
        onPickBodyTag={pickBodyTag}
        onPickBehaviorTag={pickBehaviorTag}
        error={error}
        saving={saving}
        saveSuccess={saveSuccess}
        onSubmit={handleSubmit}
      />
    )
  }

  return (
    <form
      className={`record-compact${isPopup ? ' record-compact--popup' : ''}${isModal ? ' record-compact--modal' : ''}`}
      onSubmit={handleSubmit}
    >
      {!isModal ? (
        <p className="record-compact__bar" aria-live="polite">
          <span className="record-compact__time">
            {isEdit ? ZH.historyEditAt(recordTimeLabel) : recordTimeLabel}
          </span>
          {!isEdit ? (
            <span className="record-compact__last">
              {lastRecordTimeLabel ? ZH.lastRecordAt(lastRecordTimeLabel) : ZH.lastRecordNone}
            </span>
          ) : null}
        </p>
      ) : null}

      <div className="record-compact__grid">
        <section
          className="zone zone-intensity checkin-energy"
          data-intensity={intensity}
          aria-label={ZH.moodIntensity}
        >
          <h2>{ZH.moodIntensity}</h2>
          <IntensityEnergyBar
            intensity={intensity}
            levels={levels}
            onPick={setIntensity}
          />
        </section>

        <section className="zone zone-emotion zone-emotion-spectrum">
          <h2 className="zone-emotion-title">{ZH.emotionCore}</h2>
          <p className="hint zone-subhint">{ZH.emotionHint}</p>
          <EmotionSpectrumPicker
            emotions={emotionSpectrum}
            selectedId={emotionIds[0]}
            onPick={pickEmotion}
          />
        </section>

        {thoughtSection}

        <section className="zone zone-fact">
          <h2>{ZH.factSceneTitle}</h2>
          <p className="hint zone-subhint">{ZH.factSceneHint}</p>
          {factSection}
        </section>

        <section className="zone zone-body zone-body-unified">
          <h2>{ZH.bodyMind}</h2>
          <div className="chip-wrap">
            {tagLists.bodyTags.map((tag) => (
              <button
                key={tag}
                type="button"
                className={`chip sm ${bodyTags[0] === tag ? 'active' : ''}`}
                onClick={() => pickBodyTag(tag)}
              >
                {tag}
              </button>
            ))}
            {tagLists.behaviorTags.map((b) => (
              <button
                key={b.id}
                type="button"
                className={`chip sm behavior ${behaviorTags[0] === b.id ? 'active' : ''}`}
                onClick={() => pickBehaviorTag(b.id)}
              >
                {b.label.split('\uFF1A')[0]}
              </button>
            ))}
          </div>
        </section>
      </div>

      {error && <p className="error record-compact__error">{error}</p>}

      <footer className="record-compact__footer record-compact__footer--split">
        {isEdit && onCancel ? (
          <button type="button" className="btn ghost" onClick={onCancel} disabled={saving}>
            {ZH.historyCancelEdit}
          </button>
        ) : null}
        <button type="submit" className="btn primary record-save-btn" disabled={saving}>
          {saving ? ZH.saving : isEdit ? ZH.historySaveEdit : ZH.saveRecord}
        </button>
      </footer>
    </form>
  )
}
