/** 解析后的单条记录（供今日分析使用） */
export interface ParsedEntry {
  id: number
  occurredAt: Date
  factTags: string[]
  factSupplement: string
  bodyTags: string[]
  behaviorIds: string[]
  emotionIds: string[]
  intensity: number
}

export interface EntryRowLike {
  id: number
  fact: string
  body_tags: string
  behavior_tags: string
  emotion_ids: string
  intensity: number
  occurred_at: string
  reaction_note?: string
}

const FACT_JOIN = '\u3001'
const SUPPLEMENT_PREFIX = '\u8865\u5145\u8bf4\u660e:'

function parseJsonArray(raw: string): string[] {
  try {
    const v = JSON.parse(raw) as unknown
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

/** 将 fact 字段拆成场景标签与补充说明 */
export function parseFactField(fact: string): { tags: string[]; supplement: string } {
  if (!fact.trim()) return { tags: [], supplement: '' }
  const parts = fact.split(FACT_JOIN).map((p) => p.trim()).filter(Boolean)
  const tags: string[] = []
  let supplement = ''
  for (const p of parts) {
    if (p.startsWith(SUPPLEMENT_PREFIX)) {
      supplement = p.slice(SUPPLEMENT_PREFIX.length).trim()
    } else {
      tags.push(p)
    }
  }
  return { tags, supplement }
}

export function parseEntryRow(row: EntryRowLike): ParsedEntry {
  const { tags, supplement } = parseFactField(row.fact)
  return {
    id: row.id,
    occurredAt: new Date(row.occurred_at),
    factTags: tags,
    factSupplement: supplement || (row.reaction_note?.trim() ?? ''),
    bodyTags: parseJsonArray(row.body_tags),
    behaviorIds: parseJsonArray(row.behavior_tags),
    emotionIds: parseJsonArray(row.emotion_ids),
    intensity: row.intensity
  }
}

export function parseEntries(rows: EntryRowLike[]): ParsedEntry[] {
  return rows.map(parseEntryRow).sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime())
}
