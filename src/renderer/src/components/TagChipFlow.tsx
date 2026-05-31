import { useEffect, useRef, useState, type DragEvent, type ReactNode } from 'react'
import { ZH } from '../i18n/zh'

export type ChipTone = 'negative' | 'positive' | 'neutral' | 'scene' | 'thought' | 'behavior'

type InsertPosition = 'before' | 'after'

interface TagChipFlowProps {
  items: string[]
  onChange: (items: string[]) => void
  onRestore: () => void
  tone?: ChipTone
  placeholder?: string
}

/** 松手后按目标标签的 before/after 重排数组 */
function reorderOnDrop<T>(
  items: T[],
  draggedIndex: number,
  targetIndex: number,
  insertPosition: InsertPosition
): T[] {
  let finalInsertIndex = insertPosition === 'before' ? targetIndex : targetIndex + 1
  if (draggedIndex < finalInsertIndex) finalInsertIndex--
  if (finalInsertIndex === draggedIndex) return items
  const next = [...items]
  const [removed] = next.splice(draggedIndex, 1)
  next.splice(finalInsertIndex, 0, removed)
  return next
}

/** 标签级拖拽：draggedIndex + targetIndex + insertPosition */
function useChipDragReorder<T>(items: T[], onChange: (items: T[]) => void) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [targetIndex, setTargetIndex] = useState<number | null>(null)
  const [insertPosition, setInsertPosition] = useState<InsertPosition | null>(null)
  const targetIndexRef = useRef<number | null>(null)

  useEffect(() => {
    targetIndexRef.current = targetIndex
  }, [targetIndex])

  const resetDrag = (): void => {
    setDraggedIndex(null)
    setTargetIndex(null)
    setInsertPosition(null)
  }

  const handleDragStart = (index: number) => (e: DragEvent<HTMLElement>): void => {
    setDraggedIndex(index)
    setTargetIndex(null)
    setInsertPosition(null)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
    const chip = e.currentTarget.closest('.tag-chip')
    if (chip instanceof HTMLElement) {
      e.dataTransfer.setDragImage(chip, chip.offsetWidth / 2, chip.offsetHeight / 2)
    }
  }

  const handleTagDragOver = (index: number) => (e: DragEvent<HTMLElement>): void => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (draggedIndex === null || index === draggedIndex) return

    const rect = e.currentTarget.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const position: InsertPosition = mouseX < rect.width / 2 ? 'before' : 'after'

    setTargetIndex(index)
    setInsertPosition(position)
  }

  const handleTagDragLeave = (index: number) => (e: DragEvent<HTMLElement>): void => {
    const related = e.relatedTarget
    if (related instanceof Node && e.currentTarget.contains(related)) return
    if (targetIndexRef.current === index) {
      setTargetIndex(null)
      setInsertPosition(null)
    }
  }

  const handleTagDrop = (index: number) => (e: DragEvent<HTMLElement>): void => {
    e.preventDefault()
    if (draggedIndex === null || index === draggedIndex) {
      resetDrag()
      return
    }

    const rect = e.currentTarget.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const position: InsertPosition = mouseX < rect.width / 2 ? 'before' : 'after'
    onChange(reorderOnDrop(items, draggedIndex, index, position))
    resetDrag()
  }

  const handleDragEnd = (): void => {
    resetDrag()
  }

  return {
    draggedIndex,
    targetIndex,
    insertPosition,
    handleDragStart,
    handleTagDragOver,
    handleTagDragLeave,
    handleTagDrop,
    handleDragEnd
  }
}

function ChipDragSlot({
  index,
  draggedIndex,
  targetIndex,
  insertPosition,
  onDragOver,
  onDragLeave,
  onDrop,
  children
}: {
  index: number
  draggedIndex: number | null
  targetIndex: number | null
  insertPosition: InsertPosition | null
  onDragOver: (e: DragEvent<HTMLElement>) => void
  onDragLeave: (e: DragEvent<HTMLElement>) => void
  onDrop: (e: DragEvent<HTMLElement>) => void
  children: ReactNode
}): JSX.Element {
  const showBefore = draggedIndex !== null && targetIndex === index && insertPosition === 'before'
  const showAfter = draggedIndex !== null && targetIndex === index && insertPosition === 'after'

  return (
    <span
      className="tag-chip-slot"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {showBefore ? <span className="tag-chip-insert-line tag-chip-insert-line--before" aria-hidden /> : null}
      {children}
      {showAfter ? <span className="tag-chip-insert-line tag-chip-insert-line--after" aria-hidden /> : null}
    </span>
  )
}

/** 流式胶囊：展示、拖拽排序、× 删除、点击文字可改、末尾 + 添加 */
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
  const drag = useChipDragReorder(items, onChange)

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
          <ChipDragSlot
            key={`${label}-${index}`}
            index={index}
            draggedIndex={drag.draggedIndex}
            targetIndex={drag.targetIndex}
            insertPosition={drag.insertPosition}
            onDragOver={drag.handleTagDragOver(index)}
            onDragLeave={drag.handleTagDragLeave(index)}
            onDrop={drag.handleTagDrop(index)}
          >
            <EditableChip
              label={label}
              tone={tone}
              isDragging={drag.draggedIndex === index}
              onDragStart={drag.handleDragStart(index)}
              onDragEnd={drag.handleDragEnd}
              onRemove={() => removeAt(index)}
              onRename={(next) => renameAt(index, next)}
            />
          </ChipDragSlot>
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
  isDragging,
  onDragStart,
  onDragEnd,
  onRemove,
  onRename
}: {
  label: string
  tone: ChipTone
  isDragging: boolean
  onDragStart: (e: DragEvent<HTMLElement>) => void
  onDragEnd: () => void
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
    <span className={`tag-chip tag-chip--${tone} ${isDragging ? 'is-dragging' : ''}`}>
      <button
        type="button"
        className="tag-chip-drag-handle"
        draggable
        aria-label={ZH.tagDragReorder}
        title={ZH.tagDragReorder}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        ⋮⋮
      </button>
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
  const drag = useChipDragReorder(items, onChange)

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
          <ChipDragSlot
            key={item.id}
            index={index}
            draggedIndex={drag.draggedIndex}
            targetIndex={drag.targetIndex}
            insertPosition={drag.insertPosition}
            onDragOver={drag.handleTagDragOver(index)}
            onDragLeave={drag.handleTagDragLeave(index)}
            onDrop={drag.handleTagDrop(index)}
          >
            <EditableChip
              label={item.label}
              tone={tone}
              isDragging={drag.draggedIndex === index}
              onDragStart={drag.handleDragStart(index)}
              onDragEnd={drag.handleDragEnd}
              onRemove={() => removeAt(index)}
              onRename={(next) => renameAt(index, next)}
            />
          </ChipDragSlot>
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
