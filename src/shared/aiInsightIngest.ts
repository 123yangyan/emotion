import { nowBeijingIso } from './beijingTime'
import {
  AI_INSIGHT_MANIFEST_VERSION,
  isCoreKey,
  type AiInsightCoreKey
} from './aiInsightManifest'
import type { AiInsightInput, AiRiskLevel } from '../main/database'

export function normalizeRiskLevel(value: unknown): AiRiskLevel {
  if (value === 'high' || value === 'medium' || value === 'low') return value
  return 'low'
}

/** 从 ai-results JSON 拆出 core 与 payload */
export function splitAiResult(raw: Record<string, unknown>): {
  core: Record<AiInsightCoreKey, string | AiRiskLevel>
  payload: Record<string, unknown>
} {
  const core: Record<AiInsightCoreKey, string | AiRiskLevel> = {
    date: typeof raw.date === 'string' ? raw.date : '',
    analyzed_at:
      typeof raw.analyzed_at === 'string' ? raw.analyzed_at : nowBeijingIso(),
    risk_level: normalizeRiskLevel(raw.risk_level),
    key_insight: typeof raw.key_insight === 'string' ? raw.key_insight : ''
  }

  const payload: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(raw)) {
    if (isCoreKey(key) || key === 'schema_version') continue
    payload[key] = value
  }

  return { core, payload }
}

export function parseAiResultToInput(raw: Record<string, unknown>): AiInsightInput | null {
  const { core, payload } = splitAiResult(raw)
  if (!core.date || !/^\d{4}-\d{2}-\d{2}$/.test(String(core.date))) return null

  const patterns = Array.isArray(raw.patterns) ? raw.patterns.map(String) : []
  const recommendations = Array.isArray(raw.recommendations) ? raw.recommendations.map(String) : []
  const keyInsight = String(core.key_insight).trim()
  const partialOnly = !keyInsight && Object.keys(payload).length > 0

  if (!keyInsight && !partialOnly) return null

  /** 全量分析含 summary / 象限统计 / 仪表指数；增量命令只改部分字段 */
  const isFullAnalysis = Boolean(
    keyInsight &&
      (payload.summary ||
        payload.quadrant_stats ||
        payload.entry_count ||
        payload.ability_growth_score != null ||
        payload.mood_index != null ||
        payload.guidance_primary ||
        payload.mood_trend)
  )

  return {
    date: String(core.date),
    analyzed_at: String(core.analyzed_at),
    risk_level: core.risk_level as AiRiskLevel,
    key_insight: keyInsight,
    patterns,
    recommendations,
    payload,
    manifest_version: AI_INSIGHT_MANIFEST_VERSION,
    merge: !isFullAnalysis
  }
}
