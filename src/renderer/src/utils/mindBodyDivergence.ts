import type { PanoramaPoint } from './panoramaAnalytics'

/** 抗拒型身体信号（与角色扮演区叠加时标记身心背离） */
const RESISTANCE_BODY = new Set(['胸闷', '烦躁', '肌肉紧绷', '呼吸急促', '想逃离'])

const RESISTANCE_BEHAVIOR = new Set(['flight'])

/**
 * 身心背离：Zone-H 标签 + 身体/行为抗拒信号
 * 思想上觉得「应该做」，身体却在极力抗拒
 */
export function detectMindBodyDivergence(point: PanoramaPoint): boolean {
  if (point.polarity !== 'negative') return false
  const hasBodySignal = point.bodyParts.some((b) => RESISTANCE_BODY.has(b))
  const hasFlight = point.behaviorIds.some((id) => RESISTANCE_BEHAVIOR.has(id))
  return hasBodySignal || hasFlight
}
