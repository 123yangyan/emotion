/** Esc 稍后提醒时静默写入的「逃避记录」标识（主进程与渲染进程共用） */
export const AVOIDANCE_EMOTION_ID = 'zone_h_avoidance'
export const AVOIDANCE_FACT = '\u9003\u907f\u8bb0\u5f55'
export const AVOIDANCE_THOUGHT = '\u4e0d\u60f3\u9762\u5bf9\u6b64\u523b\u7684\u72b6\u6001'

export function isAvoidanceEmotionId(id: string): boolean {
  return id === AVOIDANCE_EMOTION_ID
}

/** 判断一条记录是否为系统自动写入的逃避记录 */
export function isAvoidanceEntry(input: {
  fact?: string
  emotionIds?: string[]
  emotion_ids?: string
}): boolean {
  if (input.fact === AVOIDANCE_FACT) return true
  const ids = input.emotionIds ?? parseEmotionIds(input.emotion_ids)
  return ids.some((id) => isAvoidanceEmotionId(id))
}

function parseEmotionIds(raw?: string): string[] {
  if (!raw) return []
  try {
    const v = JSON.parse(raw) as unknown
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}
