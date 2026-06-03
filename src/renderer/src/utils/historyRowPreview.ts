import type { EntryRow } from '../../../main/database'
import type { FatigueCheck } from '../../../shared/types'
import { ZH } from '../i18n/zh'
import { isAvoidanceEntry } from './avoidanceEntry'
import {
  parseEntryRow,
  getQuadrantLabel,
  getDiaryDisplayText,
  splitThoughtField
} from './entryParse'
import { beijingDateKey, formatBeijingHm } from '../../../shared/beijingTime'
import { assignQuadrant } from './dayAnalytics'

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

const TAG_SEP = '\uff0c'

export interface HistoryRowView {
  id: number
  time: string
  dateKey: string
  quadrantLabel: string
  coordX: number
  coordY: number
  intensity: number
  polarity: 'positive' | 'negative' | 'neutral'
  /** 日记正文（合并旧版 fact 格式） */
  diaryBody: string
  /** 旧版 thought 字段，仅展示用 */
  legacyThoughtNote: string
  bodySummary: string
  isAvoidance: boolean
  fullTitle: string
  hasFatigue: boolean
  fatigueLabel: string
}

export function splitThought(raw: string, knownTags: string[]): { tags: string[]; quote: string } {
  return splitThoughtField(raw, knownTags)
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
  const time = formatBeijingHm(row.occurred_at)
  const dateKey = beijingDateKey(row.occurred_at)

  const quadrantLabel = getQuadrantLabel(parsed.coordX, parsed.coordY)
  const intensity = Math.max(1, Math.min(9, Math.round(parsed.coordY + 5)))
  const quadrantId = assignQuadrant(parsed.coordX, parsed.coordY)
  const polarity: 'positive' | 'negative' | 'neutral' =
    quadrantId === 'br' || quadrantId === 'tr'
      ? 'positive'
      : quadrantId === 'tl'
        ? 'negative'
        : 'neutral'

  const diaryBody = getDiaryDisplayText(row)
  const { tags: thoughtTags, quote } = splitThoughtField(row.thought ?? '', thoughtTagOptions)
  const legacyThoughtParts = [...thoughtTags, quote].filter(Boolean)
  const legacyThoughtNote = legacyThoughtParts.join(TAG_SEP)

  const bodySummary = [...parsed.bodyTags, ...parsed.behaviorIds].filter(Boolean).join(TAG_SEP)
  const avoidance = isAvoidanceEntry({ fact: row.fact })
  const { hasFatigue, fatigueLabel } = parseFatigueSummary(row.fatigue_check)

  const previewParts: string[] = [time, diaryBody]
  if (legacyThoughtNote) previewParts.push(legacyThoughtNote)
  if (hasFatigue) previewParts.push(fatigueLabel)

  return {
    id: row.id,
    time,
    dateKey,
    quadrantLabel,
    coordX: parsed.coordX,
    coordY: parsed.coordY,
    intensity,
    polarity,
    diaryBody,
    legacyThoughtNote,
    bodySummary,
    isAvoidance: avoidance,
    fullTitle: joinPreview(previewParts),
    hasFatigue,
    fatigueLabel
  }
}

export const HISTORY_PAGE_SIZE = 10

/** 日记风格日期头：6月2日 · 周一 */
export function formatDiaryDateLabel(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${m}月${d}日 · ${weekdays[date.getDay()]}`
}
