import type { EntryRow } from '../../../main/database'
import type { EmotionPolarity } from '../data/emotions'
import { getEmotionPolarity } from './dayAnalytics'
import { parseEntryRow } from './entryParse'

const JOIN = '\u3001'
const TAG_SEP = '\uff0c'

export interface HistoryRowView {
  id: number
  time: string
  dateKey: string
  intensity: number
  emotionLabel: string
  polarity: EmotionPolarity
  /** 事实等离散标签，逗号连接 */
  tagText: string
  /** 自定义想法（非预设胶囊） */
  quoteText: string
  /** 悬停显示完整内容 */
  fullTitle: string
}

function splitThought(raw: string, knownTags: string[]): { tags: string[]; quote: string } {
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

/** 生成历史列表单行展示数据 */
export function buildHistoryRowView(
  row: EntryRow,
  emotionLabels: Map<string, string>,
  thoughtTagOptions: string[]
): HistoryRowView {
  const parsed = parseEntryRow(row)
  const d = new Date(row.occurred_at)
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  const dateKey = row.occurred_at.slice(0, 10)

  const emotionId = parsed.emotionIds[0]
  const emotionLabel = emotionId
    ? (emotionLabels.get(emotionId) ?? emotionId)
    : '\u672a\u6807\u6ce8'
  const polarity = emotionId ? getEmotionPolarity(emotionId) : 'neutral'

  const tagParts = [...parsed.factTags]
  if (parsed.factSupplement.trim()) tagParts.push(parsed.factSupplement.trim())
  const tagText = tagParts.join(TAG_SEP)

  const { quote } = splitThought(row.thought, thoughtTagOptions)

  const previewParts: string[] = [
    time,
    `${parsed.intensity}\u5206`,
    emotionLabel
  ]
  if (tagText) previewParts.push(tagText)
  if (quote) previewParts.push(quote)

  return {
    id: row.id,
    time,
    dateKey,
    intensity: parsed.intensity,
    emotionLabel,
    polarity,
    tagText,
    quoteText: quote,
    fullTitle: previewParts.join(' \u00b7 ')
  }
}

export const HISTORY_PAGE_SIZE = 10
