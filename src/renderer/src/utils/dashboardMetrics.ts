import type { AiInsightRow, AiRiskLevel } from '../../../main/database'
import {
  AI_INSIGHT_DASHBOARD_SCORE_KEYS,
  AI_INSIGHT_QUADRANT_KEYS,
  clampDashboardScore,
  normalizeGrowthPhaseLabel,
  normalizeMoodTrend,
  type AiDashboardScoreKey,
  type GrowthPhaseLabel,
  type MoodTrend
} from '../../../shared/aiInsightManifest'
import type { AiRelatedEntry } from '../../../shared/aiInsightManifest'
import {
  mergeInsightData,
  parseQuadrantStats,
  parseRelatedEntries,
  parseStringArray
} from './aiInsightParse'

export interface DashboardScores {
  ability_growth_score: number | null
  experience_richness_score: number | null
  mood_index: number | null
}

export type ScoreDeltaDirection = 'up' | 'down' | 'stable' | 'unknown'

export interface ScoreDelta {
  direction: ScoreDeltaDirection
  delta: number | null
}

export interface DashboardSeriesPoint {
  date: string
  value: number | null
}

export interface DashboardSeries {
  mood: DashboardSeriesPoint[]
  ability: DashboardSeriesPoint[]
  experience: DashboardSeriesPoint[]
}

export interface DashboardViewModel {
  date: string
  scores: DashboardScores
  moodTrend: MoodTrend
  moodContext: string
  riskLevel: AiRiskLevel | null
  riskReason: string
  growthContributors: string[]
  experienceHighlights: string[]
  valueEnergyTags: string[]
  guidancePrimary: string
  guidanceTargetTime: string | null
  growthPhaseLabel: GrowthPhaseLabel | null
  continuitySummary: string
  relatedEntries: AiRelatedEntry[]
  /** 至少有一个仪表分数字段 */
  hasScores: boolean
  /** 是否有可展示的三层内容 */
  hasContent: boolean
}

function readScore(merged: Record<string, unknown>, key: AiDashboardScoreKey): number | null {
  return clampDashboardScore(merged[key])
}

function shiftDateKey(dateKey: string, deltaDays: number): string {
  const [y, m, d] = dateKey.split('-').map(Number)
  const local = new Date(y, m - 1, d)
  local.setDate(local.getDate() + deltaDays)
  const yy = local.getFullYear()
  const mm = String(local.getMonth() + 1).padStart(2, '0')
  const dd = String(local.getDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}

function truncate(text: string, max: number): string {
  const t = text.trim()
  if (t.length <= max) return t
  return `${t.slice(0, max - 1)}…`
}

/** 从象限统计与 patterns 拼标签（回退） */
function fallbackValueEnergyTags(merged: Record<string, unknown>): string[] {
  const tags: string[] = []
  const stats = parseQuadrantStats(merged.quadrant_stats)
  for (const name of AI_INSIGHT_QUADRANT_KEYS) {
    const n = stats[name]
    if (n && n > 0) tags.push(`${name}·${n}次`)
  }
  const patterns = parseStringArray(merged.patterns).slice(0, 3)
  tags.push(...patterns)
  return [...new Set(tags)].slice(0, 6)
}

export function computeScoreDelta(
  current: number | null,
  previous: number | null
): ScoreDelta {
  if (current == null || previous == null) {
    return { direction: 'unknown', delta: null }
  }
  const delta = current - previous
  if (delta > 0) return { direction: 'up', delta }
  if (delta < 0) return { direction: 'down', delta }
  return { direction: 'stable', delta: 0 }
}

export function trendFromDelta(delta: ScoreDelta): MoodTrend {
  if (delta.direction === 'up') return 'up'
  if (delta.direction === 'down') return 'down'
  if (delta.direction === 'stable') return 'stable'
  return 'stable'
}

/** 近 N 日日期键（含 endDate，倒序取再正序） */
export function dateKeysEndingAt(endDate: string, days: number): string[] {
  const keys: string[] = []
  for (let i = days - 1; i >= 0; i--) {
    keys.push(shiftDateKey(endDate, -i))
  }
  return keys
}

function scoreFromRow(row: AiInsightRow | undefined, key: AiDashboardScoreKey): number | null {
  if (!row) return null
  return readScore(mergeInsightData(row), key)
}

/** 构建 7 日分数序列（缺日 value 为 null） */
export function buildDashboardSeries(
  insights: AiInsightRow[],
  endDate: string,
  days = 7
): DashboardSeries {
  const byDate = new Map(insights.map((r) => [r.date, r]))
  const keys = dateKeysEndingAt(endDate, days)
  const mood: DashboardSeriesPoint[] = []
  const ability: DashboardSeriesPoint[] = []
  const experience: DashboardSeriesPoint[] = []
  for (const date of keys) {
    const row = byDate.get(date)
    mood.push({ date, value: scoreFromRow(row, 'mood_index') })
    ability.push({ date, value: scoreFromRow(row, 'ability_growth_score') })
    experience.push({ date, value: scoreFromRow(row, 'experience_richness_score') })
  }
  return { mood, ability, experience }
}

/** 序列末位 N 日移动平均（仅统计非 null 值） */
export function computeMovingAverage(
  points: DashboardSeriesPoint[],
  window = 7
): number | null {
  const vals = points.map((p) => p.value).filter((v): v is number => v != null)
  if (vals.length === 0) return null
  const slice = vals.slice(-window)
  return Math.round(slice.reduce((a, b) => a + b, 0) / slice.length)
}

/** 逐日滚动移动平均曲线（窗口内无有效值则为 null） */
export function buildMaSeries(
  points: DashboardSeriesPoint[],
  window = 7
): DashboardSeriesPoint[] {
  return points.map((p, i) => {
    const slice = points.slice(Math.max(0, i - window + 1), i + 1)
    const nums = slice.map((x) => x.value).filter((v): v is number => v != null)
    return {
      date: p.date,
      value: nums.length > 0 ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length) : null
    }
  })
}

export function findInsightByDate(
  insights: AiInsightRow[],
  date: string
): AiInsightRow | undefined {
  return insights.find((r) => r.date === date)
}

/** 从洞察行构建仪表展示数据 */
export function buildDashboardView(
  row: AiInsightRow | undefined,
  insights: AiInsightRow[] = []
): DashboardViewModel | null {
  if (!row) return null
  const merged = mergeInsightData(row)
  const scores: DashboardScores = {
    ability_growth_score: readScore(merged, 'ability_growth_score'),
    experience_richness_score: readScore(merged, 'experience_richness_score'),
    mood_index: readScore(merged, 'mood_index')
  }
  const hasScores = AI_INSIGHT_DASHBOARD_SCORE_KEYS.some((k) => scores[k] != null)

  const prevRow = findInsightByDate(insights, shiftDateKey(row.date, -1))
  const moodDelta = computeScoreDelta(
    scores.mood_index,
    prevRow ? readScore(mergeInsightData(prevRow), 'mood_index') : null
  )
  const aiTrend = normalizeMoodTrend(merged.mood_trend)
  const moodTrend: MoodTrend =
    moodDelta.direction !== 'unknown' ? trendFromDelta(moodDelta) : aiTrend ?? 'stable'

  const riskSignals = parseStringArray(merged.risk_signals)
  const recs = parseStringArray(merged.recommendations)
  const themes = parseStringArray(merged.thought_themes)

  const moodContext =
    (typeof merged.mood_context === 'string' && merged.mood_context.trim()) ||
    truncate(row.key_insight, 40)

  const riskReason =
    (typeof merged.risk_reason === 'string' && merged.risk_reason.trim()) ||
    riskSignals[0] ||
    ''

  const guidancePrimary =
    (typeof merged.guidance_primary === 'string' && merged.guidance_primary.trim()) ||
    recs[0]?.trim() ||
    row.key_insight.trim()

  const guidanceTargetTime =
    typeof merged.guidance_target_time === 'string' && merged.guidance_target_time.trim()
      ? merged.guidance_target_time.trim()
      : null

  const growthPhaseLabel = normalizeGrowthPhaseLabel(merged.growth_phase_label)
  const continuitySummary =
    typeof merged.continuity_summary === 'string' ? merged.continuity_summary.trim().slice(0, 60) : ''

  const growthContributors = parseStringArray(merged.growth_contributors).slice(0, 3)
  const experienceHighlights = (
    parseStringArray(merged.experience_highlights).length > 0
      ? parseStringArray(merged.experience_highlights)
      : themes
  ).slice(0, 3)

  const valueEnergyTags = (
    parseStringArray(merged.value_energy_tags).length > 0
      ? parseStringArray(merged.value_energy_tags)
      : fallbackValueEnergyTags(merged)
  ).slice(0, 6)

  const relatedEntries = parseRelatedEntries(merged.related_entries)
  const entrySummaries = parseRelatedEntries(merged.entry_summaries)
  const linked =
    relatedEntries.length > 0
      ? relatedEntries
      : entrySummaries.map((e) => ({
          entry_id: e.entry_id,
          occurred_at: e.occurred_at,
          note: e.note
        }))

  const hasContent =
    hasScores ||
    Boolean(guidancePrimary) ||
    Boolean(row.risk_level) ||
    Boolean(moodContext)

  return {
    date: row.date,
    scores,
    moodTrend,
    moodContext,
    riskLevel: row.risk_level,
    riskReason,
    growthContributors,
    experienceHighlights,
    valueEnergyTags,
    guidancePrimary,
    guidanceTargetTime,
    growthPhaseLabel,
    continuitySummary,
    relatedEntries: linked,
    hasScores,
    hasContent
  }
}

/** 获取某日相对昨日的三分环比 */
export function buildScoreDeltas(
  view: DashboardViewModel,
  insights: AiInsightRow[]
): {
  ability: ScoreDelta
  experience: ScoreDelta
  mood: ScoreDelta
} {
  const prev = findInsightByDate(insights, shiftDateKey(view.date, -1))
  if (!prev) {
    const unknown: ScoreDelta = { direction: 'unknown', delta: null }
    return { ability: unknown, experience: unknown, mood: unknown }
  }
  const prevMerged = mergeInsightData(prev)
  return {
    ability: computeScoreDelta(
      view.scores.ability_growth_score,
      readScore(prevMerged, 'ability_growth_score')
    ),
    experience: computeScoreDelta(
      view.scores.experience_richness_score,
      readScore(prevMerged, 'experience_richness_score')
    ),
    mood: computeScoreDelta(view.scores.mood_index, readScore(prevMerged, 'mood_index'))
  }
}
