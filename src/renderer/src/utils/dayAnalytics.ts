import type { ParsedEntry } from './entryParse'
import { getQuadrantLabel } from './entryParse'
import type { TagListsConfig } from '../data/tagLists'
import { resolveEmotionSpectrum } from '../data/tagLists'

export type QuadrantId = 'tl' | 'tr' | 'bl' | 'br'

export interface QuadrantDefinition {
  id: QuadrantId
  title: string
  advice: string
}

export interface QuadrantPlacement {
  quadrantId: QuadrantId
  time: string
  coordX: number
  coordY: number
  bodySummary: string
}

export interface DayQuadrantSummary {
  placements: QuadrantPlacement[]
  counts: Record<QuadrantId, number>
}

export const QUADRANT_DEFINITIONS: QuadrantDefinition[] = [
  {
    id: 'tl',
    title: '\u5185\u8017\u9677\u9631',
    advice: '\u8bc6\u522b\u89e6\u53d1\u5668\uff0c\u5efa\u7acb\u8fb9\u754c\uff0c\u8bbe\u8ba1\u9632\u5fa1\u6027 SOP\u3002'
  },
  {
    id: 'tr',
    title: '\u653b\u575a\u533a',
    advice: '\u5b89\u6392\u5728\u7cbe\u529b\u5cf0\u5024\uff0c\u4e25\u683c\u9650\u65f6\uff0c\u5b8c\u6210\u540e\u7ed9\u4e88\u6b63\u5411\u53cd\u9988\u3002'
  },
  {
    id: 'bl',
    title: '\u673a\u68b0\u533a',
    advice: '\u81ea\u52a8\u5316\u6216\u6253\u5305\u5904\u7406\uff0c\u96c6\u4e2d\u5728\u4e00\u4e2a\u65f6\u95f4\u5757\u5185\u5feb\u901f\u6e05\u7a7a\u3002'
  },
  {
    id: 'br',
    title: '\u5fc3\u6d41\u533a',
    advice: '\u6700\u5927\u5316\u505c\u7559\uff0c\u4fdd\u62a4\u8fd9\u6bb5\u9ec4\u91d1\u65f6\u95f4\uff0c\u505a\u9ad8\u521b\u9020\u529b\u7684\u4e8b\u3002'
  }
]

/** 根据坐标判断象限 ID */
export function assignQuadrant(coordX: number, coordY: number): QuadrantId {
  if (coordX <= 0 && coordY > 0) return 'tl'
  if (coordX > 0 && coordY > 0) return 'tr'
  if (coordX <= 0 && coordY <= 0) return 'bl'
  return 'br'
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

export function analyzeDayQuadrants(
  entries: ParsedEntry[],
  _emotionLabels: Map<string, string>,
  behaviorLabels: Map<string, string>,
  _tagLists?: TagListsConfig
): DayQuadrantSummary {
  const counts: Record<QuadrantId, number> = { tl: 0, tr: 0, bl: 0, br: 0 }
  const placements: QuadrantPlacement[] = []

  for (const e of entries) {
    const quadrantId = assignQuadrant(e.coordX, e.coordY)
    counts[quadrantId]++

    const d = e.occurredAt
    const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    const bodyParts = formatBodyPattern([...e.bodyTags, ...e.behaviorIds], behaviorLabels)

    placements.push({
      quadrantId,
      time,
      coordX: e.coordX,
      coordY: e.coordY,
      bodySummary: bodyParts.join('\u3001') || '\u2014'
    })
  }

  return { placements, counts }
}

/** 供历史/分析页兼容调用：返回象限名 */
export function getQuadrantName(coordX: number, coordY: number): string {
  return getQuadrantLabel(coordX, coordY)
}

// ─── 新增：图表分析辅助函数 ───────────────────────────────────────────────────

/**
 * 根据情绪 ID 在光谱中的位置推断价值感（-4 ~ +4）。
 * 光谱头部为正向情绪（愉悦），尾部为负向情绪（低落）。
 * 若找不到对应 ID，返回 0（中性）。
 */
export function computeValence(emotionId: string | undefined, tagLists: TagListsConfig): number {
  if (!emotionId) return 0
  const spectrum = resolveEmotionSpectrum(tagLists)
  const idx = spectrum.findIndex((e) => e.id === emotionId)
  if (idx === -1) return 0
  // 将下标线性映射到 4 ~ -4（头部最正，尾部最负）
  const ratio = idx / Math.max(spectrum.length - 1, 1)
  return Math.round((0.5 - ratio) * 8)
}

/**
 * 计算情绪唤醒度（直接使用 coordY 耗能度字段，-4 ~ +4）。
 * coordY 越高代表越耗能/越活跃，映射为高唤醒。
 */
export function computeArousal(entry: ParsedEntry): number {
  return entry.coordY
}

/**
 * 根据价值感返回折线图点颜色：
 * 正向（> 0）→ 绿色，负向（< 0）→ 红色，中性 → 灰色
 */
export function valenceDotColor(valence: number): string {
  if (valence > 0) return '#7ab87c'
  if (valence < 0) return '#c47a7a'
  return '#a0a0a0'
}

/** 因果链洞察：描述某个场景标签重复触发情绪模式的规律 */
export interface CauseChainInsight {
  /** 触发情绪的场景标签组合 */
  factPattern: string[]
  /** 关联的情绪 ID（旧记录为空数组） */
  emotionIds: string[]
  /** 该模式下记录的平均强度 */
  avgIntensity: number
  /** 负面/高耗能触发率（0 ~ 1） */
  triggerRate: number
  /** 匹配到该场景的记录条数 */
  matchCount: number
  /** 场景标签数量 */
  factCount: number
  /** 样本量较少时标记为低置信度 */
  lowConfidence?: boolean
}

/**
 * 检测因果链：统计重复出现的场景-情绪模式。
 * 找出出现次数 ≥ 2 的场景标签，计算其平均强度和负面触发率，
 * 按触发率降序排列，最多返回 5 条。
 */
export function detectCauseChains(
  entries: ParsedEntry[],
  _behaviorLabels: Map<string, string>
): CauseChainInsight[] {
  // 只分析有场景标签的记录
  const withFacts = entries.filter((e) => e.factTags.length > 0)
  if (withFacts.length < 2) return []

  // 按单个场景标签分组，统计出现次数
  const factMap = new Map<string, ParsedEntry[]>()
  for (const e of withFacts) {
    for (const tag of e.factTags) {
      if (!factMap.has(tag)) factMap.set(tag, [])
      factMap.get(tag)!.push(e)
    }
  }

  const results: CauseChainInsight[] = []
  for (const [tag, matched] of factMap) {
    // 至少出现 2 次才有规律可循
    if (matched.length < 2) continue

    const avgIntensity = matched.reduce((s, e) => s + e.intensity, 0) / matched.length
    // 负面触发率：coordX < 0（排斥/低价值）或 coordY > 1（高耗能）的比例
    const negCount = matched.filter((e) => e.coordX < 0 || e.coordY > 1).length
    const triggerRate = negCount / matched.length

    // 收集关联的情绪 ID（去重）
    const emotionIds = [...new Set(matched.flatMap((e) => e.emotionIds))]

    results.push({
      factPattern: [tag],
      emotionIds,
      avgIntensity,
      triggerRate,
      matchCount: matched.length,
      factCount: 1,
      lowConfidence: matched.length < 3
    })
  }

  // 按触发率降序，相同时按出现次数降序，取前 5 条
  return results
    .sort((a, b) => b.triggerRate - a.triggerRate || b.matchCount - a.matchCount)
    .slice(0, 5)
}
