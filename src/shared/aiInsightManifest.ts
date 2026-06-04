/** AI 洞察输出契约：Skill / 命令 / App 共用 */
export const AI_INSIGHT_MANIFEST_VERSION = 5

/** 展示分区（dashboard 仅仪表页读取，洞察卡片不渲染） */
export type AiInsightZone = 'banner' | 'card_fold' | 'card_expand' | 'dashboard'

/** 仪表页三个 0–100 指数（由 /analyze-records 输出） */
export const AI_INSIGHT_DASHBOARD_SCORE_KEYS = [
  'ability_growth_score',
  'experience_richness_score',
  'mood_index'
] as const

export type AiDashboardScoreKey = (typeof AI_INSIGHT_DASHBOARD_SCORE_KEYS)[number]

/** v4+ 仪表结构化字段（扁平 JSON，存入 payload） */
export const AI_INSIGHT_DASHBOARD_V4_KEYS = [
  'mood_trend',
  'mood_context',
  'risk_reason',
  'growth_contributors',
  'experience_highlights',
  'value_energy_tags',
  'guidance_primary',
  'guidance_target_time'
] as const

/** v5 跨日连贯字段 */
export const AI_INSIGHT_DASHBOARD_V5_KEYS = [
  'growth_phase_label',
  'continuity_summary'
] as const

export const GROWTH_PHASE_LABELS = ['筑底期', '突破期', '高原期', '回落期'] as const
export type GrowthPhaseLabel = (typeof GROWTH_PHASE_LABELS)[number]

export type MoodTrend = 'up' | 'down' | 'stable'

/** 仪表 payload 类型（解析用，非 DB 列） */
export interface DashboardInsightPayload {
  mood_index?: number
  mood_trend?: MoodTrend
  mood_context?: string
  risk_reason?: string
  ability_growth_score?: number
  growth_contributors?: string[]
  experience_richness_score?: number
  experience_highlights?: string[]
  value_energy_tags?: string[]
  guidance_primary?: string
  guidance_target_time?: string
  growth_phase_label?: GrowthPhaseLabel
  continuity_summary?: string
}

/** App 内置渲染类型；Skill 只能选用已注册类型 */
export type AiInsightRenderType =
  | 'text'
  | 'paragraph'
  | 'string_list'
  | 'quadrant_bar'
  | 'distortion_list'
  | 'entry_link_list'

export interface AiInsightFieldDef {
  key: string
  label: string
  zone: AiInsightZone
  renderType: AiInsightRenderType
  required?: boolean
}

/** 入库 core 列 + banner 固定字段 */
export const AI_INSIGHT_CORE_KEYS = [
  'date',
  'analyzed_at',
  'risk_level',
  'key_insight'
] as const

export type AiInsightCoreKey = (typeof AI_INSIGHT_CORE_KEYS)[number]

/** 象限统计键顺序（与导出 quadrant 标签一致） */
export const AI_INSIGHT_QUADRANT_KEYS = ['攻坚区', '心流区', '机械区', '内耗陷阱'] as const

export type AiQuadrantStats = Partial<Record<(typeof AI_INSIGHT_QUADRANT_KEYS)[number], number>>

export interface AiCognitiveDistortion {
  type: string
  quote: string
  entry_id?: number
}

export interface AiRelatedEntry {
  entry_id: number
  occurred_at?: string
  note?: string
}

/** 字段展示定义；增删字段时主要改此数组 */
export const AI_INSIGHT_FIELDS: AiInsightFieldDef[] = [
  {
    key: 'key_insight',
    label: '摘要',
    zone: 'card_fold',
    renderType: 'paragraph',
    required: true
  },
  { key: 'entry_count', label: '分析条数', zone: 'card_fold', renderType: 'text' },
  { key: 'summary', label: '详细分析', zone: 'card_expand', renderType: 'paragraph' },
  { key: 'quadrant_stats', label: '象限分布', zone: 'card_expand', renderType: 'quadrant_bar' },
  {
    key: 'cognitive_distortions',
    label: '认知扭曲',
    zone: 'card_expand',
    renderType: 'distortion_list'
  },
  { key: 'risk_signals', label: '风险信号', zone: 'card_expand', renderType: 'string_list' },
  { key: 'patterns', label: '识别模式', zone: 'card_expand', renderType: 'string_list' },
  { key: 'recommendations', label: '建议行动', zone: 'card_expand', renderType: 'string_list' },
  { key: 'related_entries', label: '相关日记', zone: 'card_expand', renderType: 'entry_link_list' },
  { key: 'data_quality', label: '数据质量', zone: 'card_fold', renderType: 'text' },
  { key: 'thought_themes', label: '今日主题', zone: 'card_expand', renderType: 'string_list' },
  { key: 'entry_summaries', label: '逐条速览', zone: 'card_expand', renderType: 'entry_link_list' },
  { key: 'writing_feedback', label: '记录建议', zone: 'card_expand', renderType: 'string_list' },
  {
    key: 'ability_growth_score',
    label: '能力增长点',
    zone: 'dashboard',
    renderType: 'text',
    required: true
  },
  {
    key: 'experience_richness_score',
    label: '经历丰富点',
    zone: 'dashboard',
    renderType: 'text',
    required: true
  },
  { key: 'mood_index', label: '心情指数', zone: 'dashboard', renderType: 'text', required: true },
  { key: 'mood_trend', label: '心情趋势', zone: 'dashboard', renderType: 'text' },
  { key: 'mood_context', label: '心情情境', zone: 'dashboard', renderType: 'text' },
  { key: 'risk_reason', label: '风险主因', zone: 'dashboard', renderType: 'text' },
  { key: 'growth_contributors', label: '能力贡献', zone: 'dashboard', renderType: 'string_list' },
  { key: 'experience_highlights', label: '经历高光', zone: 'dashboard', renderType: 'string_list' },
  { key: 'value_energy_tags', label: '价值耗能标签', zone: 'dashboard', renderType: 'string_list' },
  { key: 'guidance_primary', label: '主指导', zone: 'dashboard', renderType: 'paragraph' },
  { key: 'guidance_target_time', label: '建议时间', zone: 'dashboard', renderType: 'text' },
  { key: 'growth_phase_label', label: '发展阶段', zone: 'dashboard', renderType: 'text' },
  { key: 'continuity_summary', label: '跨日连贯', zone: 'dashboard', renderType: 'text' }
]

/** 将 AI 输出的分数钳制到 0–100 整数 */
export function clampDashboardScore(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null
  return Math.max(0, Math.min(100, Math.round(value)))
}

export function normalizeMoodTrend(value: unknown): MoodTrend | null {
  if (value === 'up' || value === 'down' || value === 'stable') return value
  return null
}

export function normalizeGrowthPhaseLabel(value: unknown): GrowthPhaseLabel | null {
  if (typeof value !== 'string') return null
  const t = value.trim()
  return (GROWTH_PHASE_LABELS as readonly string[]).includes(t) ? (t as GrowthPhaseLabel) : null
}

export function isCoreKey(key: string): key is AiInsightCoreKey {
  return (AI_INSIGHT_CORE_KEYS as readonly string[]).includes(key)
}
