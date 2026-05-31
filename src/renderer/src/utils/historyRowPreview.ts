import type { EntryRow } from '../../../main/database'
import type { FatigueCheck } from '../../../shared/types'
import { ZH } from '../i18n/zh'
import { isAvoidanceEntry } from './avoidanceEntry'
import { parseEntryRow, getQuadrantLabel } from './entryParse'
import { assignQuadrant } from './dayAnalytics'

/** 将 fatigue_check JSON 解析为摘要文字 */
function parseFatigueSummary(raw: string | null | undefined): { hasFatigue: boolean; fatigueLabel: string } {
  if (!raw) return { hasFatigue: false, fatigueLabel: '' }
  try {
    const d = JSON.parse(raw) as FatigueCheck
    const symptoms = [d.hesitate, d.escapeTendency, d.brainFog].filter(Boolean).length
    const symLabel = symptoms === 0 ? '无疲劳信号' : `${symptoms} 个疲劳信号`
    return {
      hasFatigue: true,
      fatigueLabel: `质量 ${d.decision_quality} 分 · 决策量${d.decision_load} · ${symLabel}`
    }
  } catch {
    return { hasFatigue: false, fatigueLabel: '' }
  }
}

const JOIN = '\u3001'
const TAG_SEP = '\uff0c'

export interface HistoryRowView {
  id: number
  time: string
  dateKey: string
  /** 象限名称，如"心流区" */
  quadrantLabel: string
  /** 情绪标签（用象限名代替，兼容当前无独立情绪字段的数据库） */
  emotionLabel: string
  /** 情绪强度 1~9（由 coordY 线性映射） */
  intensity: number
  /** 情绪极性，用于行颜色主题：positive / negative / neutral */
  polarity: 'positive' | 'negative' | 'neutral'
  /** 坐标摘要，如"心流区 (+3, -2)" */
  coreStatus: string
  /** 客观情境摘要，如"在 工作/学习" */
  contextSummary: string
  /** 场景标签原文（供 UI 芯片展示） */
  sceneText: string
  /** 事实补充说明 */
  factNoteText: string
  /** 预设想法摘要，如「[我不该有这种感受]」 */
  thoughtSummary: string
  /** 自由想法文本 */
  quoteText: string
  /** 身心反应摘要（body_tags + behavior_tags 合并展示） */
  bodySummary: string
  /** 是否为 Esc 稍后自动写入的逃避记录 */
  isAvoidance: boolean
  /** 悬停显示完整内容 */
  fullTitle: string
  /** 是否有疲劳检查数据 */
  hasFatigue: boolean
  /** 疲劳检查摘要文字，如"质量 7分 · 决策量正常 · 无疲劳信号" */
  fatigueLabel: string
}

export function splitThought(raw: string, knownTags: string[]): { tags: string[]; quote: string } {
  if (!raw.trim()) return { tags: [], quote: '' }
  const parts = raw.split(JOIN).map((p) => p.trim()).filter(Boolean)
  const known = new Set(knownTags)
  const tags: string[] = []
  const extras: string[] = []
  for (const p of parts) {
    if (known.has(p)) tags.push(p)
    else extras.push(p)
  }
  return { tags, quote: extras.join(JOIN) }
}

function joinPreview(parts: string[]): string {
  return parts.filter(Boolean).join(' · ')
}

/** 生成历史列表单行展示数据 */
export function buildHistoryRowView(
  row: EntryRow,
  _emotionLabels: Map<string, string>,
  thoughtTagOptions: string[]
): HistoryRowView {
  const parsed = parseEntryRow(row)
  const d = new Date(row.occurred_at)
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  const dateKey = row.occurred_at.slice(0, 10)

  const quadrantLabel = getQuadrantLabel(parsed.coordX, parsed.coordY)
  const xStr = parsed.coordX > 0 ? `+${parsed.coordX}` : String(parsed.coordX)
  const yStr = parsed.coordY > 0 ? `+${parsed.coordY}` : String(parsed.coordY)
  const coreStatus = `${quadrantLabel} (${xStr}, ${yStr})`

  // 情绪标签：用象限名称代替（当前版本数据库未独立存储情绪 ID）
  const emotionLabel = quadrantLabel
  // 强度 1~9：将 coordY(-4~+4) 线性映射为 1~9
  const intensity = Math.max(1, Math.min(9, Math.round(parsed.coordY + 5)))
  // 极性：根据象限 ID 决定行颜色主题
  const quadrantId = assignQuadrant(parsed.coordX, parsed.coordY)
  const polarity: 'positive' | 'negative' | 'neutral' =
    quadrantId === 'br' || quadrantId === 'tr' ? 'positive' :
    quadrantId === 'tl' ? 'negative' : 'neutral'

  const sceneText = parsed.factTags.join(TAG_SEP)
  const factNoteText = parsed.factSupplement.trim()
  const contextSummary = sceneText ? ZH.historyContextAt(sceneText) : ''

  const { tags: thoughtTags, quote } = splitThought(row.thought, thoughtTagOptions)
  const thoughtTagText = thoughtTags.join(TAG_SEP)
  const quoteText = quote.trim()
  const thoughtSummary = thoughtTagText ? `[${thoughtTagText}]` : ''

  // 身心反应摘要（body_tags + behavior_tags 合并，去空后用顿号连接）
  const bodySummary = [...parsed.bodyTags, ...parsed.behaviorIds].filter(Boolean).join(TAG_SEP)

  const avoidance = isAvoidanceEntry({ fact: row.fact })

  const thoughtText = joinPreview([thoughtSummary, quoteText ? `"${quoteText}"` : ''])

  const { hasFatigue, fatigueLabel } = parseFatigueSummary(row.fatigue_check)

  const previewParts: string[] = [time, coreStatus, contextSummary, factNoteText, thoughtText]
  if (hasFatigue) previewParts.push(`📊 ${fatigueLabel}`)

  return {
    id: row.id,
    time,
    dateKey,
    quadrantLabel,
    emotionLabel,
    intensity,
    polarity,
    coreStatus,
    contextSummary,
    sceneText,
    factNoteText,
    thoughtSummary,
    quoteText,
    bodySummary,
    isAvoidance: avoidance,
    fullTitle: joinPreview(previewParts),
    hasFatigue,
    fatigueLabel
  }
}

export const HISTORY_PAGE_SIZE = 10
