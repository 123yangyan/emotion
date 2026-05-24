import type { EntryRow } from '../../../main/database'

import type { EmotionPolarity } from '../data/emotions'

import { ZH } from '../i18n/zh'

import { getEmotionPolarity } from './dayAnalytics'

import { isAvoidanceEntry } from './avoidanceEntry'

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

  /** 核心情绪与能量，如「5分 · 压力大」 */

  coreStatus: string

  /** 客观情境摘要，如「在 工作/学习」 */

  contextSummary: string

  /** 场景标签原文（供 UI 芯片展示） */

  sceneText: string

  /** 事实补充说明 */

  factNoteText: string

  /** 预设想法摘要，如「[我不该有这种感受]」 */

  thoughtSummary: string

  /** 自由想法文本 */

  quoteText: string

  /** 是否为 Esc 稍后自动写入的逃避记录 */

  isAvoidance: boolean

  /** 悬停显示完整内容 */

  fullTitle: string

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



  const sceneText = parsed.factTags.join(TAG_SEP)

  const factNoteText = parsed.factSupplement.trim()

  const contextSummary = sceneText ? ZH.historyContextAt(sceneText) : ''



  const { tags: thoughtTags, quote } = splitThought(row.thought, thoughtTagOptions)

  const thoughtTagText = thoughtTags.join(TAG_SEP)

  const quoteText = quote.trim()

  const thoughtSummary = thoughtTagText ? `[${thoughtTagText}]` : ''



  const coreStatus = ZH.historyCoreStatus(parsed.intensity, emotionLabel)

  const avoidance = isAvoidanceEntry({

    fact: row.fact,

    emotionIds: parsed.emotionIds

  })



  const thoughtText = joinPreview([thoughtSummary, quoteText ? `"${quoteText}"` : ''])



  const previewParts: string[] = [

    time,

    coreStatus,

    contextSummary,

    factNoteText,

    thoughtText

  ]



  return {

    id: row.id,

    time,

    dateKey,

    intensity: parsed.intensity,

    emotionLabel,

    polarity,

    coreStatus,

    contextSummary,

    sceneText,

    factNoteText,

    thoughtSummary,

    quoteText,

    isAvoidance: avoidance,

    fullTitle: joinPreview(previewParts)

  }

}



export const HISTORY_PAGE_SIZE = 10

