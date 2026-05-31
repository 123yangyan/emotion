/** 解析后的单条记录（供今日分析使用） */
export interface ParsedEntry {
  id: number
  occurredAt: Date
  factTags: string[]
  factSupplement: string
  bodyTags: string[]
  behaviorIds: string[]
  /** 价值感 -4 ~ +4 */
  coordX: number
  /** 耗能度 -4 ~ +4 */
  coordY: number
  /**
   * 情绪 ID 列表（当前版本暂未独立存储，保留供后续扩展）
   * 旧记录默认为空数组
   */
  emotionIds: string[]
  /**
   * 情绪强度 1~9（由耗能度 coordY 线性映射：-4→1, 0→5, +4→9）
   * 作为折线图 Y 轴值使用
   */
  intensity: number
}

export interface EntryRowLike {
  id: number
  fact: string
  body_tags: string
  behavior_tags: string
  coord_x: number
  coord_y: number
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

/** 根据坐标返回象限名称 */
export function getQuadrantLabel(coordX: number, coordY: number): string {
  if (coordX > 0 && coordY > 0) return '\u653b\u575a\u533a'
  if (coordX > 0 && coordY <= 0) return '\u5fc3\u6d41\u533a'
  if (coordX <= 0 && coordY <= 0) return '\u673a\u68b0\u533a'
  return '\u5185\u8017\u9677\u9631'
}

export function parseEntryRow(row: EntryRowLike): ParsedEntry {
  const { tags, supplement } = parseFactField(row.fact)
  const reactionNote = row.reaction_note?.trim() ?? ''
  const coordX = row.coord_x ?? 0
  const coordY = row.coord_y ?? 0
  return {
    id: row.id,
    occurredAt: new Date(row.occurred_at),
    factTags: tags,
    factSupplement: supplement || (reactionNote && !tags.some((t) => t.includes(reactionNote)) ? reactionNote : ''),
    bodyTags: parseJsonArray(row.body_tags),
    behaviorIds: parseJsonArray(row.behavior_tags),
    coordX,
    coordY,
    // 旧记录无独立情绪 ID，暂存为空数组
    emotionIds: [],
    // 将 coordY（-4~+4）线性映射为 1~9 的强度值
    intensity: Math.max(1, Math.min(9, Math.round(coordY + 5)))
  }
}

export function parseEntries(rows: EntryRowLike[]): ParsedEntry[] {
  return rows.map(parseEntryRow).sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime())
}
