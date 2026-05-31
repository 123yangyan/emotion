import { EMOTIONS, type EmotionPolarity } from '../data/emotions'
import type { RecordTagEmotion, TagListsConfig } from '../../../shared/types'

const emotionMap = new Map(EMOTIONS.map((e) => [e.id, e]))
const polarityMap = new Map(EMOTIONS.map((e) => [e.id, e.polarity]))

/** 在完整光谱中的位置：0 = 真实充电，1 = 角色扮演 */
export function getEmotionValencePos(id: string, spectrum: RecordTagEmotion[]): number {
  const idx = spectrum.findIndex((e) => e.id === id)
  if (idx < 0 || spectrum.length <= 1) return 0.5
  return idx / (spectrum.length - 1)
}

export function getEmotionPolarityForId(id: string): EmotionPolarity {
  return polarityMap.get(id) ?? 'neutral'
}

function polarityFromIdPrefix(id: string): EmotionPolarity | null {
  if (id.startsWith('emo_positive_') || id.startsWith('zone_s_')) return 'positive'
  if (id.startsWith('emo_negative_') || id.startsWith('zone_h_')) return 'negative'
  if (id.startsWith('emo_neutral_') || id.startsWith('zone_0_')) return 'neutral'
  return null
}

function polarityFromTagLists(id: string, tagLists: TagListsConfig): EmotionPolarity | null {
  if (tagLists.emotionsPositive?.some((e) => e.id === id)) return 'positive'
  if (tagLists.emotionsNegative?.some((e) => e.id === id)) return 'negative'
  if (tagLists.emotionsNeutral?.some((e) => e.id === id)) return 'neutral'
  return null
}

/**
 * 解析系统状态标签所属 Zone
 * 优先级：id 前缀 → 内置词典 → 用户词表分组 → neutral
 */
export function resolveEmotionPolarity(
  id: string,
  tagLists?: TagListsConfig
): EmotionPolarity {
  const fromPrefix = polarityFromIdPrefix(id)
  if (fromPrefix) return fromPrefix

  if (emotionMap.has(id)) {
    return getEmotionPolarityForId(id)
  }

  if (tagLists) {
    const fromLists = polarityFromTagLists(id, tagLists)
    if (fromLists) return fromLists
  }

  return 'neutral'
}
