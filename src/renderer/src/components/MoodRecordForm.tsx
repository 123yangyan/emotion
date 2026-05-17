import { useCallback, useEffect, useRef, useState } from 'react'
import { POLARITY_LABEL } from '../data/emotions'
import { resolveTagLists, type TagListsConfig } from '../data/tagLists'
import { formatDateShort, formatNowLocal } from '../utils/formatTime'
import { restoreEntryToForm } from '../utils/entryFormRestore'
import { ZH } from '../i18n/zh'
import CheckInDualForm from './CheckInDualForm'
import IntensityEnergyBar from './IntensityEnergyBar'

interface Props {
  variant?: 'page' | 'popup'
  /** 传入则为编辑已有记录 */
  editEntryId?: number
  onSaved: () => void
  onCancel?: () => void
}

export default function MoodRecordForm({
  variant = 'page',
  editEntryId,
  onSaved,
  onCancel
}: Props): JSX.Element {
  const isPopup = variant === 'popup'
  const isEdit = editEntryId != null
  const [recordTimeLabel, setRecordTimeLabel] = useState('')
  const [dateLabel, setDateLabel] = useState(formatDateShort())
  const [factTags, setFactTags] = useState<string[]>([])
  const [factSupplement, setFactSupplement] = useState('')
  const [factNoteEditing, setFactNoteEditing] = useState(false)
  const factNoteInputRef = useRef<HTMLInputElement>(null)
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

  const emotionRef = useRef<HTMLElement>(null)
  const factRef = useRef<HTMLElement>(null)
  const thoughtRef = useRef<HTMLElement>(null)
  const bodyRef = useRef<HTMLElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const [occurredAtIso, setOccurredAtIso] = useState(() => new Date().toISOString())
  const [editLoading, setEditLoading] = useState(isEdit)

  useEffect(() => {
    if (isEdit) return
    const tick = (): void => {
      setRecordTimeLabel(formatNowLocal())
      setDateLabel(formatDateShort())
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [isEdit])

  useEffect(() => {
    void window.api.getSettings().then((s) => {
      const lists = resolveTagLists(s.tagLists)
      setTagLists(lists)
      if (!isEdit || editEntryId == null) return
      void window.api.getEntry(editEntryId).then((row) => {
        if (!row) {
          setError(ZH.historyEntryMissing)
          setEditLoading(false)
          return
        }
        const restored = restoreEntryToForm(row, lists.thoughtTags)
        setFactTags(restored.factTags)
        setFactSupplement(restored.factSupplement)
        setBodyTags(restored.bodyTags)
        setBehaviorTags(restored.behaviorTags)
        setEmotionIds(restored.emotionIds)
        setIntensity(restored.intensity)
        setThoughtTags(restored.thoughtTags)
        setThoughtNote(restored.thoughtNote)
        setOccurredAtIso(restored.occurredAt)
        setRecordTimeLabel(formatNowLocal(new Date(restored.occurredAt)))
        setDateLabel(formatDateShort(new Date(restored.occurredAt)))
        setEditLoading(false)
      })
    })
  }, [editEntryId, isEdit])

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

  const openFactNoteInput = (): void => {
    setFactNoteEditing(true)
    requestAnimationFrame(() => factNoteInputRef.current?.focus())
  }

  const closeFactNoteInput = (): void => {
    setFactNoteEditing(false)
    if (!factSupplement.trim()) setFactSupplement('')
  }

  const confirmFactNote = (): void => {
    setFactSupplement((v) => v.trim())
    setFactNoteEditing(false)
  }

  const buildFactText = (): string => {
    const parts = [...factTags]
    const extra = factSupplement.trim()
    if (extra) parts.push(`${ZH.factSupplement}:${extra}`)
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
      if (isEdit && editEntryId != null) {
        await window.api.updateEntry(editEntryId, payload)
      } else {
        await window.api.createEntry(payload)
        setFactTags([])
        setFactSupplement('')
        setFactNoteEditing(false)
        setBodyTags([])
        setBehaviorTags([])
        setThoughtTags([])
        setThoughtNote('')
        setEmotionIds([])
        setIntensity(5)
      }
      onSaved()
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
    thoughtTags
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
        if (factNoteEditing) {
          closeFactNoteInput()
          return
        }
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
  }, [factNoteEditing, isPopup, pickIntensity, snoozeAndExit, submitForm])

  const levels = [1, 2, 3, 4, 5, 6, 7, 8, 9]

  const factChips = (
    <div className="chip-wrap">
      {tagLists.factScenes.map((tag) => (
        <button
          key={tag}
          type="button"
          className={`chip sm scene ${factTags[0] === tag ? 'active' : ''}`}
          onClick={() => pickFact(tag)}
        >
          {tag}
        </button>
      ))}
      {factNoteEditing ? (
        <input
          ref={factNoteInputRef}
          type="text"
          className="chip-inline-input"
          value={factSupplement}
          onChange={(e) => setFactSupplement(e.target.value)}
          placeholder={ZH.factSupplementPh}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              confirmFactNote()
            }
            if (e.key === 'Escape') {
              e.preventDefault()
              e.stopPropagation()
              closeFactNoteInput()
            }
          }}
          onBlur={() => confirmFactNote()}
        />
      ) : factSupplement.trim() ? (
        <button
          type="button"
          className="chip sm scene active chip-note"
          onClick={openFactNoteInput}
          title={ZH.factAddNote}
        >
          {factSupplement.trim()}
        </button>
      ) : (
        <button
          type="button"
          className="chip sm chip-add"
          aria-label={ZH.factAddNote}
          onClick={openFactNoteInput}
        >
          +
        </button>
      )}
    </div>
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

  const bodyChips = (
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
        tagLists={tagLists}
        focusZone={focusZone}
        setFocusZone={setFocusZone}
        factTags={factTags}
        onPickFact={pickFact}
        factSupplement={factSupplement}
        setFactSupplement={setFactSupplement}
        factNoteEditing={factNoteEditing}
        setFactNoteEditing={setFactNoteEditing}
        onConfirmFactNote={confirmFactNote}
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
    <form className="record-compact" onSubmit={handleSubmit}>
      <p className="record-compact__bar" aria-live="polite">
        <span className="record-compact__time">
          {isEdit ? ZH.historyEditAt(recordTimeLabel) : recordTimeLabel}
        </span>
      </p>

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

        <section className="zone zone-emotion zone-emotion-split">
          <h2 className="zone-emotion-title">{ZH.emotion}</h2>
          <div className="emotion-columns">
            <div className="emotion-col emotion-col--negative">
              <span className="emotion-col-label">{POLARITY_LABEL.negative}</span>
              <div className="emotion-col-chips">
                {tagLists.emotionsNegative.map((em) => (
                  <button
                    key={em.id}
                    type="button"
                    className={`chip sm negative ${emotionIds[0] === em.id ? 'active' : ''}`}
                    onClick={() => pickEmotion(em.id)}
                  >
                    {em.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="emotion-col emotion-col--positive">
              <span className="emotion-col-label">{POLARITY_LABEL.positive}</span>
              <div className="emotion-col-chips">
                {tagLists.emotionsPositive.map((em) => (
                  <button
                    key={em.id}
                    type="button"
                    className={`chip sm positive ${emotionIds[0] === em.id ? 'active' : ''}`}
                    onClick={() => pickEmotion(em.id)}
                  >
                    {em.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {thoughtSection}

        <section className="zone zone-fact">
          <h2>{ZH.objectiveFact}</h2>
          {factChips}
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
