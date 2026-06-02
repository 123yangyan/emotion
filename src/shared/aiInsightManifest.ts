/** AI 洞察输出契约：Skill / 命令 / App 共用 */
export const AI_INSIGHT_MANIFEST_VERSION = 2

/** 展示分区 */
export type AiInsightZone = 'banner' | 'card_fold' | 'card_expand'

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
  { key: 'related_entries', label: '相关日记', zone: 'card_expand', renderType: 'entry_link_list' }
]

export function isCoreKey(key: string): key is AiInsightCoreKey {
  return (AI_INSIGHT_CORE_KEYS as readonly string[]).includes(key)
}
