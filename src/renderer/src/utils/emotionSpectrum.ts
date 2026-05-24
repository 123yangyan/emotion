import { EMOTIONS, type EmotionPolarity } from '../data/emotions'
import type { RecordTagEmotion } from '../../../shared/types'

const polarityMap = new Map(EMOTIONS.map((e) => [e.id, e.polarity]))

/** 在完整光谱中的位置：0 = 最积极，1 = 最消极 */
export function getEmotionValencePos(id: string, spectrum: RecordTagEmotion[]): number {
  const idx = spectrum.findIndex((e) => e.id === id)
  if (idx < 0 || spectrum.length <= 1) return 0.5
  return idx / (spectrum.length - 1)
}

export function getEmotionPolarityForId(id: string): EmotionPolarity {
  return polarityMap.get(id) ?? 'neutral'
}
