import { useEffect, useRef, useState } from 'react'
import { ZH } from '../i18n/zh'

export type ChipTone = 'negative' | 'positive' | 'neutral' | 'scene' | 'thought' | 'behavior'

interface TagChipFlowProps {
  items: string[]
  onChange: (items: string[]) => void
  onRestore: () => void
  tone?: ChipTone
  placeholder?: string
}

/** 流式胶囊：展示、× 删除、点击文字可改、末尾 + 添加 */
export function TagChipFlow({
  items,
  onChange,
  onRestore,
  tone = 'neutral',
  placeholder
}: TagChipFlowProps): JSX.Element {
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState('')
  const addInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (adding) addInputRef.current?.focus()
  }, [adding])

  const commitAdd = (): void => {
    const label = draft.trim()
    if (label && !items.includes(label)) {
      onChange([...items, label])
    }
    setDraft('')
    setAdding(false)
  }

  const removeAt = (index: number): void => {
    onChange(items.filter((_, i) => i !== index))
  }

  const renameAt = (index: number, label: string): void => {
    const trimmed = label.trim()
    if (!trimmed) {
      removeAt(index)
      return
    }
    const next = [...items]
    next[index] = trimmed
    onChange(next)
  }

  return (
    <div className="tag-chip-flow">
      <div className="tag-chip-wrap">
        {items.map((label, index) => (
          <EditableChip
            key={`${label}-${index}`}
            label={label}
            tone={tone}
            onRemove={() => removeAt(index)}
            onRename={(next) => renameAt(index, next)}
          />
        ))}
        {adding ? (
          <input
            ref={addInputRef}
            type="text"
            className="tag-chip-input"
            value={draft}
            placeholder={placeholder ?? ZH.tagAddPlaceholder}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                commitAdd()
              }
              if (e.key === 'Escape') {
                e.preventDefault()
                setDraft('')
                setAdding(false)
              }
            }}
            onBlur={() => commitAdd()}
          />
        ) : (
          <button
            type="button"
            className="tag-chip tag-chip--add"
            onClick={() => setAdding(true)}
          >
            {ZH.tagAddChip}
          </button>
        )}
      </div>
      <button type="button" className="tag-edit-restore" onClick={onRestore}>
        {ZH.tagRestoreDefault}
      </button>
    </div>
  )
}

function EditableChip({
  label,
  tone,
  onRemove,
  onRename
}: {
  label: string
  tone: ChipTone
  onRemove: () => void
  onRename: (label: string) => void
}): JSX.Element {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(label)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  useEffect(() => {
    setDraft(label)
  }, [label])

  const commit = (): void => {
    onRename(draft)
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        className="tag-chip-input tag-chip-input--edit"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            commit()
          }
          if (e.key === 'Escape') {
            e.preventDefault()
            setDraft(label)
            setEditing(false)
          }
        }}
        onBlur={() => commit()}
      />
    )
  }

  return (
    <span className={`tag-chip tag-chip--${tone}`}>
      <button type="button" className="tag-chip-label" onClick={() => setEditing(true)} title={ZH.tagClickEdit}>
        {label}
      </button>
      <button
        type="button"
        className="tag-chip-remove"
        aria-label={ZH.tagDelete}
        onClick={onRemove}
      >
        ×
      </button>
    </span>
  )
}

/** 情绪 / 行为：保留 id，只改展示文字 */
export function IdChipFlow({
  items,
  onChange,
  onRestore,
  tone,
  placeholder,
  makeId
}: {
  items: { id: string; label: string }[]
  onChange: (items: { id: string; label: string }[]) => void
  onRestore: () => void
  tone: ChipTone
  placeholder?: string
  makeId: (label: string) => string
}): JSX.Element {
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState('')
  const addInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (adding) addInputRef.current?.focus()
  }, [adding])

  const commitAdd = (): void => {
    const label = draft.trim()
    if (!label) {
      setAdding(false)
      setDraft('')
      return
    }
    const id = makeId(label)
    if (!items.some((e) => e.id === id || e.label === label)) {
      onChange([...items, { id, label }])
    }
    setDraft('')
    setAdding(false)
  }

  const removeAt = (index: number): void => {
    onChange(items.filter((_, i) => i !== index))
  }

  const renameAt = (index: number, label: string): void => {
    const trimmed = label.trim()
    if (!trimmed) {
      removeAt(index)
      return
    }
    const next = [...items]
    next[index] = { ...next[index], label: trimmed }
    onChange(next)
  }

  return (
    <div className="tag-chip-flow">
      <div className="tag-chip-wrap">
        {items.map((item, index) => (
          <EditableChip
            key={item.id}
            label={item.label}
            tone={tone}
            onRemove={() => removeAt(index)}
            onRename={(next) => renameAt(index, next)}
          />
        ))}
        {adding ? (
          <input
            ref={addInputRef}
            type="text"
            className="tag-chip-input"
            value={draft}
            placeholder={placeholder ?? ZH.tagAddPlaceholder}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                commitAdd()
              }
              if (e.key === 'Escape') {
                e.preventDefault()
                setDraft('')
                setAdding(false)
              }
            }}
            onBlur={() => commitAdd()}
          />
        ) : (
          <button
            type="button"
            className="tag-chip tag-chip--add"
            onClick={() => setAdding(true)}
          >
            {ZH.tagAddChip}
          </button>
        )}
      </div>
      <button type="button" className="tag-edit-restore" onClick={onRestore}>
        {ZH.tagRestoreDefault}
      </button>
    </div>
  )
}
