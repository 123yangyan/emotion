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
/** 写入 fact 字段的补充说明前缀（与 UI 标签文案分离，便于稳定解析） */
export const FACT_SUPPLEMENT_PREFIX = '\u8865\u5145\u8bf4\u660e:'
const SUPPLEMENT_PREFIX_LEGACY = '\u8865\u5145\u8bf4\u660e\uff08\u53ef\u9009\uff09:'
const SUPPLEMENT_PREFIX_RE = /^补充说明(?:（可选）)?:(.*)$/

function parseSupplementPart(part: string): string | null {
  if (part.startsWith(FACT_SUPPLEMENT_PREFIX)) {
    return part.slice(FACT_SUPPLEMENT_PREFIX.length).trim()
  }
  if (part.startsWith(SUPPLEMENT_PREFIX_LEGACY)) {
    return part.slice(SUPPLEMENT_PREFIX_LEGACY.length).trim()
  }
  const match = part.match(SUPPLEMENT_PREFIX_RE)
  return match ? match[1].trim() : null
}

/** 将 fact 字段拆成场景标签与补充说明 */
export function parseFactField(fact: string): { tags: string[]; supplement: string } {
  if (!fact.trim()) return { tags: [], supplement: '' }
  const parts = fact.split(FACT_JOIN).map((p) => p.trim()).filter(Boolean)
  const tags: string[] = []
  let supplement = ''
  for (const p of parts) {
    const parsed = parseSupplementPart(p)
    if (parsed != null) {
      supplement = parsed
    } else {
      tags.push(p)
    }
  }
  return { tags, supplement }
}

function parseJsonArray(raw: string): string[] {
  try {
    const v = JSON.parse(raw) as unknown
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

export function parseEntryRow(row: EntryRowLike): ParsedEntry {
  const { tags, supplement } = parseFactField(row.fact)
  const reactionNote = row.reaction_note?.trim() ?? ''
  return {
    id: row.id,
    occurredAt: new Date(row.occurred_at),
    factTags: tags,
    // 优先用 fact 内解析出的补充；reaction_note 仅作旧数据兜底，且避免与已解析内容重复
    factSupplement: supplement || (reactionNote && !tags.some((t) => t.includes(reactionNote)) ? reactionNote : ''),
    bodyTags: parseJsonArray(row.body_tags),
    behaviorIds: parseJsonArray(row.behavior_tags),
    emotionIds: parseJsonArray(row.emotion_ids),
    intensity: row.intensity
  }
}

export function parseEntries(rows: EntryRowLike[]): ParsedEntry[] {
  return rows.map(parseEntryRow).sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime())
}
