import { EMOTIONS, type EmotionPolarity } from '../data/emotions'
import type { ParsedEntry } from './entryParse'

export type QuadrantId = 'hn' | 'ln' | 'hp' | 'lp'

export interface CauseChainInsight {
  factPattern: string[]
  bodyPattern: string[]
  emotionIds: string[]
  avgIntensity: number
  triggerRate: number
  matchCount: number
  factCount: number
  /** 样本偏少时提示谨慎解读 */
  lowConfidence: boolean
}

export interface QuadrantDefinition {
  id: QuadrantId
  title: string
  axisLabel: string
  exampleEmotions: string
  bodyTraits: string
  advice: string
}

export interface QuadrantPlacement {
  quadrantId: QuadrantId
  time: string
  emotionLabel: string
  intensity: number
  bodySummary: string
  arousal: number
  valence: number
}

export interface DayQuadrantSummary {
  placements: QuadrantPlacement[]
  counts: Record<QuadrantId, number>
}

const HIGH_AROUSAL_BODY = new Set([
  '\u5fc3\u8df3\u52a0\u5feb',
  '\u547c\u5438\u6025\u4fc3',
  '\u51fa\u6c57',
  '\u808c\u8089\u7d27\u7ef7',
  '\u624b\u6296',
  '\u53d1\u70ed\u611f',
  '\u80f8\u95f7',
  '\u5934\u75db'
])

const LOW_AROUSAL_BODY = new Set([
  '\u53d1\u51b7',
  '\u80c3\u90e8\u4e0d\u9002'
])

export const QUADRANT_DEFINITIONS: QuadrantDefinition[] = [
  {
    id: 'hn',
    title: '\u9ad8\u5524\u9192 \u00b7 \u6d88\u6781',
    axisLabel: '\u654c\u610f\u3001\u7126\u8e81\u3001\u7126\u8651',
    exampleEmotions: '\u6124\u6012\u3001\u7126\u8e81\u3001\u7126\u8651',
    bodyTraits: '\u5fc3\u8df3\u52a0\u5feb\u3001\u51fa\u6c57\u3001\u808c\u8089\u7d27\u7ef7',
    advice:
      '\u9700\u8981\u5ba3\u6cc4\uff1a\u5efa\u8bae\u79bb\u5f00\u5f53\u524d\u5c01\u95ed\u7a7a\u95f4\uff0c\u8fdb\u884c\u5feb\u901f\u547c\u5438\u6216\u8eaf\u4f53\u62c9\u4f38\u3002'
  },
  {
    id: 'ln',
    title: '\u4f4e\u5524\u9192 \u00b7 \u6d88\u6781',
    axisLabel: '\u632b\u8d25\u3001\u59d4\u5c48\u3001\u5b64\u72ec',
    exampleEmotions: '\u632b\u8d25\u3001\u59d4\u5c48\u3001\u5b64\u72ec',
    bodyTraits: '\u53d1\u5446\u3001\u758f\u4f4f\u3001\u53d1\u51b7',
    advice:
      '\u9700\u8981\u5145\u80fd\uff1a\u6b64\u65f6\u4e0d\u5b9c\u5f3a\u884c\u601d\u8003\uff0c\u5efa\u8bae\u5bfb\u6c42\u8212\u9002\u73af\u5883\u6216\u6df1\u5ea6\u4f11\u606f\u3002'
  },
  {
    id: 'hp',
    title: '\u9ad8\u5524\u9192 \u00b7 \u79ef\u6781',
    axisLabel: '\u5174\u594b\u3001\u5f00\u5fc3\u3001\u6ee1\u8db3',
    exampleEmotions: '\u5174\u594b\u3001\u5f00\u5fc3\u3001\u6ee1\u8db3',
    bodyTraits: '\u7cbe\u529b\u5145\u6c9b\u3001\u8eab\u4f53\u8f7b\u76c8',
    advice:
      '\u53ef\u4ee5\u63a8\u8fdb\uff1a\u9002\u5408\u6253\u653b\u575a\u6218\uff0c\u5904\u7406\u9ad8\u96be\u5ea6\u3001\u9ad8\u521b\u9020\u6027\u7684\u5de5\u4f5c\u3002'
  },
  {
    id: 'lp',
    title: '\u4f4e\u5524\u9192 \u00b7 \u79ef\u6781',
    axisLabel: '\u653e\u677e\u3001\u5b89\u5b81\u3001\u611f\u6069',
    exampleEmotions: '\u653e\u677e\u3001\u5b89\u5b81\u3001\u611f\u6069',
    bodyTraits: '\u547c\u5438\u5e73\u7f13\u3001\u808c\u8089\u677e\u5f1b',
    advice:
      '\u9002\u5408\u590d\u76d8\uff1a\u6700\u597d\u7684\u6b63\u5ff5\u4e0e\u6df1\u5ea6\u601d\u8003\u3001\u77e5\u8bc6\u5185\u7701\u7684\u9ec4\u91d1\u65f6\u95f4\u3002'
  }
]

const emotionPolarity = new Map(EMOTIONS.map((e) => [e.id, e.polarity]))

export function getEmotionPolarity(emotionId: string): EmotionPolarity {
  return emotionPolarity.get(emotionId) ?? 'neutral'
}

function factGroupKey(tags: string[]): string {
  if (tags.length === 0) return '__none__'
  return [...tags].sort().join('\u0001')
}

function bodyGroupKey(entry: ParsedEntry): string {
  const parts = [...entry.bodyTags, ...entry.behaviorIds]
  if (parts.length === 0) return '__none__'
  return [...parts].sort().join('\u0001')
}

function splitBodyKey(key: string): string[] {
  if (key === '__none__') return []
  return key.split('\u0001')
}

/** 身心反应展示文案（行为 id 映射为短标签） */
export function formatBodyPattern(
  parts: string[],
  behaviorLabels: Map<string, string>
): string[] {
  return parts.map((p) => {
    if (behaviorLabels.has(p)) {
      const full = behaviorLabels.get(p)!
      return full.split('\uFF1A')[0]
    }
    return p
  })
}

/**
 * 情境-成因链：在「同一事实情境」下统计身心与情绪的共现强度
 */
export function detectCauseChains(
  entries: ParsedEntry[],
  behaviorLabels: Map<string, string>
): CauseChainInsight[] {
  if (entries.length === 0) return []

  const groups = new Map<string, ParsedEntry[]>()
  for (const e of entries) {
    const key = factGroupKey(e.factTags)
    const list = groups.get(key) ?? []
    list.push(e)
    groups.set(key, list)
  }

  const insights: CauseChainInsight[] = []

  for (const [, group] of groups) {
    const factPattern =
      group[0].factTags.length > 0 ? [...group[0].factTags] : ['\u672a\u6807\u6ce8\u4e8b\u5b9e']

    const bodyFreq = new Map<string, number>()
    const emotionFreq = new Map<string, number>()
    let intensitySum = 0

    for (const e of group) {
      const bk = bodyGroupKey(e)
      bodyFreq.set(bk, (bodyFreq.get(bk) ?? 0) + 1)
      for (const em of e.emotionIds) {
        emotionFreq.set(em, (emotionFreq.get(em) ?? 0) + 1)
      }
      intensitySum += e.intensity
    }

    const topBody = [...bodyFreq.entries()].sort((a, b) => b[1] - a[1])[0]
    if (!topBody) continue

    const [bodyKey, matchCount] = topBody
    const triggerRate = Math.round((matchCount / group.length) * 100)
    const topEmotions = [...emotionFreq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([id]) => id)

    insights.push({
      factPattern,
      bodyPattern: formatBodyPattern(splitBodyKey(bodyKey), behaviorLabels),
      emotionIds: topEmotions,
      avgIntensity: Math.round((intensitySum / group.length) * 10) / 10,
      triggerRate,
      matchCount,
      factCount: group.length,
      lowConfidence: group.length < 2
    })
  }

  return insights
    .filter((i) => i.bodyPattern.length > 0 || i.emotionIds.length > 0)
    .sort((a, b) => b.triggerRate * b.matchCount - a.triggerRate * a.matchCount)
    .slice(0, 3)
}

export function computeArousal(entry: ParsedEntry): number {
  let score = 0.45
  for (const tag of entry.bodyTags) {
    if (HIGH_AROUSAL_BODY.has(tag)) score += 0.12
    if (LOW_AROUSAL_BODY.has(tag)) score -= 0.1
  }
  for (const id of entry.behaviorIds) {
    if (id === 'fight' || id === 'flight') score += 0.18
    if (id === 'freeze') score -= 0.2
  }
  score += (entry.intensity - 5) * 0.035
  return Math.max(0, Math.min(1, score))
}

export function computeValence(emotionId: string | undefined): number {
  if (!emotionId) return 0
  const p = getEmotionPolarity(emotionId)
  if (p === 'positive') return 1
  if (p === 'negative') return -1
  return 0
}

export function assignQuadrant(valence: number, arousal: number): QuadrantId {
  const high = arousal >= 0.5
  if (valence < 0) return high ? 'hn' : 'ln'
  if (valence > 0) return high ? 'hp' : 'lp'
  return high ? 'hp' : 'lp'
}

export function analyzeDayQuadrants(
  entries: ParsedEntry[],
  emotionLabels: Map<string, string>,
  behaviorLabels: Map<string, string>
): DayQuadrantSummary {
  const counts: Record<QuadrantId, number> = { hn: 0, ln: 0, hp: 0, lp: 0 }
  const placements: QuadrantPlacement[] = []

  for (const e of entries) {
    const arousal = computeArousal(e)
    const valence = computeValence(e.emotionIds[0])
    const quadrantId = assignQuadrant(valence, arousal)
    counts[quadrantId]++

    const d = e.occurredAt
    const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    const bodyParts = formatBodyPattern(
      [...e.bodyTags, ...e.behaviorIds],
      behaviorLabels
    )

    placements.push({
      quadrantId,
      time,
      emotionLabel: e.emotionIds.map((id) => emotionLabels.get(id) ?? id).join('\u3001') || '\u2014',
      intensity: e.intensity,
      bodySummary: bodyParts.join('\u3001') || '\u2014',
      arousal,
      valence
    })
  }

  return { placements, counts }
}

export function valenceDotColor(valence: number): string {
  if (valence > 0) return '#5a8f6a'
  if (valence < 0) return '#b87a7a'
  return '#9a8f7a'
}
