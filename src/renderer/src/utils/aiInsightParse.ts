import type { AiInsightRow } from '../../../main/database'
import {
  AI_INSIGHT_FIELDS,
  AI_INSIGHT_QUADRANT_KEYS,
  type AiCognitiveDistortion,
  type AiInsightFieldDef,
  type AiInsightZone,
  type AiQuadrantStats,
  type AiRelatedEntry
} from '../../../shared/aiInsightManifest'

export interface AiInsightSectionView {
  def: AiInsightFieldDef
  value: unknown
}

function parseJsonObject(raw: string | undefined): Record<string, unknown> {
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw) as unknown
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {}
  } catch {
    return {}
  }
}

function parseStringArray(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean)
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw) as unknown
      return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : raw.trim() ? [raw] : []
    } catch {
      return raw.trim() ? [raw] : []
    }
  }
  return []
}

/** 解析 payload JSON；v1 记录无 payload 时返回空对象 */
export function parsePayload(raw: string | undefined): Record<string, unknown> {
  return parseJsonObject(raw)
}

/** 合并 payload 与 v1 patterns/recommendations 列 */
export function mergeInsightData(row: AiInsightRow): Record<string, unknown> {
  const payload = parsePayload(row.payload)
  const merged: Record<string, unknown> = { ...payload }

  if (!hasValue(merged.patterns)) {
    merged.patterns = parseStringArray(row.patterns)
  }
  if (!hasValue(merged.recommendations)) {
    merged.recommendations = parseStringArray(row.recommendations)
  }
  if (!hasValue(merged.key_insight)) {
    merged.key_insight = row.key_insight
  }

  return merged
}

export function hasValue(value: unknown): boolean {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (typeof value === 'number') return true
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'object') return Object.keys(value as object).length > 0
  return true
}

export function parseQuadrantStats(value: unknown): AiQuadrantStats {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const stats: AiQuadrantStats = {}
  for (const key of AI_INSIGHT_QUADRANT_KEYS) {
    const n = (value as Record<string, unknown>)[key]
    if (typeof n === 'number' && n > 0) stats[key] = n
  }
  return stats
}

export function parseDistortions(value: unknown): AiCognitiveDistortion[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      const type = typeof row.type === 'string' ? row.type : ''
      const quote = typeof row.quote === 'string' ? row.quote : ''
      if (!type && !quote) return null
      const entryId = typeof row.entry_id === 'number' ? row.entry_id : undefined
      return { type, quote, entry_id: entryId }
    })
    .filter((x): x is AiCognitiveDistortion => x !== null)
}

export function parseRelatedEntries(value: unknown): AiRelatedEntry[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      if (typeof row.entry_id !== 'number') return null
      return {
        entry_id: row.entry_id,
        occurred_at: typeof row.occurred_at === 'string' ? row.occurred_at : undefined,
        note: typeof row.note === 'string' ? row.note : undefined
      }
    })
    .filter((x): x is AiRelatedEntry => x !== null)
}

export function buildSectionViews(
  row: AiInsightRow,
  zone: AiInsightZone,
  options?: { skipKeys?: string[] }
): AiInsightSectionView[] {
  const merged = mergeInsightData(row)
  const skip = new Set(options?.skipKeys ?? [])

  return AI_INSIGHT_FIELDS.filter((def) => def.zone === zone && !skip.has(def.key))
    .map((def) => ({ def, value: merged[def.key] }))
    .filter(({ def, value }) => {
      if (def.key === 'key_insight') return false
      return hasValue(value)
    })
}

export function hasExpandContent(row: AiInsightRow): boolean {
  return buildSectionViews(row, 'card_expand').length > 0
}

export function riskClass(level: AiInsightRow['risk_level']): string {
  if (level === 'high') return 'ai-insight-risk--high'
  if (level === 'medium') return 'ai-insight-risk--medium'
  return 'ai-insight-risk--low'
}

/** 象限条颜色（与记录页四象限、AI 洞察 CSS 变量一致） */
export const QUADRANT_BAR_COLORS: Record<(typeof AI_INSIGHT_QUADRANT_KEYS)[number], string> = {
  心流区: 'var(--insight-q-flow)',
  攻坚区: 'var(--insight-q-grind)',
  机械区: 'var(--insight-q-mech)',
  内耗陷阱: 'var(--insight-q-drain)'
}
