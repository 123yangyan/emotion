import type { EntryRow } from '../../../main/database'
import { parseEntryRow } from './entryParse'

const JOIN = '\u3001'

/** 把数据库记录还原为记录表单各字段（用于编辑） */
export function restoreEntryToForm(
  row: EntryRow,
  thoughtTagOptions: string[]
): {
  factTags: string[]
  factSupplement: string
  bodyTags: string[]
  behaviorTags: string[]
  coordX: number
  coordY: number
  thoughtTags: string[]
  thoughtNote: string
  occurredAt: string
} {
  const parsed = parseEntryRow(row)
  const thoughtParts = row.thought
    ? row.thought.split(JOIN).map((p) => p.trim()).filter(Boolean)
    : []
  const known = new Set(thoughtTagOptions)
  const thoughtTags: string[] = []
  const extras: string[] = []
  for (const p of thoughtParts) {
    if (known.has(p)) thoughtTags.push(p)
    else extras.push(p)
  }
  return {
    factTags: parsed.factTags,
    factSupplement: parsed.factSupplement,
    bodyTags: parsed.bodyTags,
    behaviorTags: parsed.behaviorIds,
    coordX: parsed.coordX,
    coordY: parsed.coordY,
    thoughtTags: thoughtTags.slice(0, 1),
    thoughtNote: extras.join(JOIN),
    occurredAt: row.occurred_at
  }
}
