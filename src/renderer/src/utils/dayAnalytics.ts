import { type EmotionPolarity } from '../data/emotions'
import type { TagListsConfig } from '../../../shared/types'
import type { ParsedEntry } from './entryParse'
import { resolveEmotionPolarity } from './emotionSpectrum'

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
    title: '\u865a\u5047\u7e41\u8363\u533a',
    axisLabel: '\u9022\u5408\u5916\u754c\u6807\u51c6 \u00b7 \u6253\u9e21\u8840',
    exampleEmotions: '\u5f3a\u6491\u4eba\u8bbe\u3001\u8fc7\u9ad8\u671f\u8bb8\u3001\u6025\u8e81\u50ac\u4fc3',
    bodyTraits: '\u8868\u9762\u5174\u594b\u3001\u5185\u91cc\u7d27\u7ef7\u3001\u547c\u5438\u6025\u4fc3',
    advice:
      '\u8b66\u60d5\u300c\u4e3a\u4e86\u4ed6\u4eba\u800c\u620f\u594b\u300d\u2014\u2014\u8fd9\u662f\u6d88\u8017\uff0c\u4e0d\u662f\u5145\u7535\u3002'
  },
  {
    id: 'ln',
    title: '\u4e25\u91cd\u78e8\u635f\u533a',
    axisLabel: '\u9022\u5408\u5916\u754c \u00b7 \u6781\u5ea6\u5185\u8017\u6389\u7535',
    exampleEmotions: '\u88ab\u903c\u8feb\u611f\u3001\u65e0\u610f\u4e49\u6d88\u8017\u3001\u5954\u5408\u5916\u754c',
    bodyTraits: '\u80f8\u95f7\u3001\u7126\u8e81\u3001\u60f3\u9003\u79bb\u3001\u808c\u8089\u7d27\u7ef7',
    advice:
      '\u4f18\u5148\u4f18\u5316\uff1a\u8bc6\u522b\u89e6\u53d1\u5668\uff0c\u5efa\u7acb\u8fb9\u754c\uff0c\u505a\u6700\u5c0f\u53ef\u884c\u7684\u5207\u6362\u3002'
  },
  {
    id: 'hp',
    title: '\u7edd\u5bf9\u8212\u9002\u533a',
    axisLabel: '\u987a\u5e94\u5185\u5728\u771f\u6211 \u00b7 \u6781\u5ea6\u4e13\u6ce8\u5145\u7535',
    exampleEmotions: '\u7eaf\u7cb9\u5fc3\u6d41\u3001\u638c\u63a7\u611f\u3001\u597d\u5947\u9a71\u52a8',
    bodyTraits: '\u7cbe\u529b\u5145\u6c9b\u3001\u8eab\u4f53\u8f7b\u76c8\u3001\u547c\u5438\u7a33\u5b9a',
    advice:
      '\u4fdd\u62a4\u8fd9\u6bb5\u9ec4\u91d1\u65f6\u95f4\uff0c\u505a\u9ad8\u521b\u9020\u529b\u3001\u987a\u7740\u672c\u6027\u7684\u4e8b\u3002'
  },
  {
    id: 'lp',
    title: '\u4f4e\u80fd\u91cf\u771f\u6211\u533a',
    axisLabel: '\u987a\u5e94\u771f\u6211 \u00b7 \u4f4e\u5524\u9192\u6062\u590d',
    exampleEmotions: '\u5fc3\u5982\u6b62\u6c34\u3001\u65c1\u89c2\u8005\u6a21\u5f0f\u3001\u6309\u90e8\u5c31\u73ed',
    bodyTraits: '\u547c\u5438\u5e73\u7f13\u3001\u808c\u8089\u677e\u5f1b\u3001\u6e05\u6670\u4f46\u4e0d\u7528\u529b',
    advice:
      '\u9002\u5408\u590d\u76d8\u4e0e\u5185\u7701\uff0c\u4e0d\u5b9c\u5f3a\u884c\u63a8\u8fdb\u6216\u8865\u507f\u6027\u52b3\u52a8\u3002'
  }
]

export function getEmotionPolarity(emotionId: string, tagLists?: TagListsConfig): EmotionPolarity {
  return resolveEmotionPolarity(emotionId, tagLists)
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

export function computeValence(emotionId: string | undefined, tagLists?: TagListsConfig): number {
  if (!emotionId) return 0
  const p = getEmotionPolarity(emotionId, tagLists)
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
  behaviorLabels: Map<string, string>,
  tagLists?: TagListsConfig
): DayQuadrantSummary {
  const counts: Record<QuadrantId, number> = { hn: 0, ln: 0, hp: 0, lp: 0 }
  const placements: QuadrantPlacement[] = []

  for (const e of entries) {
    const arousal = computeArousal(e)
    const valence = computeValence(e.emotionIds[0], tagLists)
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
