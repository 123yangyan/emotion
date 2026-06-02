import type { EntryRow } from '../../../main/database'
import type { TagListsConfig } from '../../../shared/types'
import { isAvoidanceEntry } from './avoidanceEntry'
import { parseEntries, parseFactField, getQuadrantLabel, getDiaryDisplayText, type ParsedEntry } from './entryParse'
import { assignQuadrant, type QuadrantId } from './dayAnalytics'

export type PanoramaRange = 'day' | 'week' | 'month'

/** 全景舱单点 */
export interface PanoramaPoint {
  id: number
  ts: number
  occurredAt: Date
  timeLabel: string
  coordX: number
  coordY: number
  quadrantId: QuadrantId
  /** 潮汐值：使用 coordX 直接表示（正=价值/愉悦，负=排斥/内耗） */
  tideValue: number
  /** 象限名称 */
  quadrantLabel: string
  /** 象限颜色（供折线图点着色） */
  quadrantColor: string
  factTags: string[]
  factSupplement: string
  /** 日记正文（展示与统计用） */
  diaryText: string
  thoughtParts: string[]
  thoughtRaw: string
  bodyParts: string[]
  behaviorIds: string[]
}

export interface FrequencyItem {
  label: string
  count: number
  /** 包含该标签的记录 id（供高频榜反查） */
  entryIds: number[]
}

export interface PanoramaFrequencies {
  /** 高耗低值 Top3 外部触发器（内耗陷阱关联场景） */
  painTriggers: FrequencyItem[]
  /** 低耗高值 Top3 场景（心流区关联场景） */
  rechargeHavens: FrequencyItem[]
  thoughts: FrequencyItem[]
  bodyReactions: FrequencyItem[]
  /** 本时段 Esc 稍后自动写入的逃避记录次数 */
  avoidanceCount: number
  /** Zone-S（正向/真实自我）情绪 Top3（当前版本暂未独立存储情绪 ID，保留扩展） */
  pleasantEmotions: FrequencyItem[]
  /** Zone-0（中性/待机）情绪 Top3 */
  steadyEmotions: FrequencyItem[]
  /** Zone-H（负向/角色扮演）情绪 Top3 */
  lowEmotions: FrequencyItem[]
}

const JOIN = '\u3001'

/** 象限对应颜色 */
function quadrantColor(id: QuadrantId): string {
  if (id === 'br') return '#3a8f5a'  // 心流区：绿
  if (id === 'tr') return '#b05530'  // 攻坚区：橙红
  if (id === 'bl') return '#4a6080'  // 机械区：灰蓝
  return '#8b3a5a'                   // 内耗陷阱：紫红
}

export function getRangeBounds(
  range: PanoramaRange,
  now: Date = new Date()
): { start: Date; end: Date; startIso: string; endIso: string } {
  const end = new Date(now)
  const start = new Date(now)
  if (range === 'day') {
    start.setHours(0, 0, 0, 0)
  } else if (range === 'week') {
    start.setDate(start.getDate() - 6)
    start.setHours(0, 0, 0, 0)
  } else {
    start.setDate(start.getDate() - 29)
    start.setHours(0, 0, 0, 0)
  }
  return {
    start,
    end,
    startIso: start.toISOString(),
    endIso: end.toISOString()
  }
}

function formatTimeLabel(d: Date, range: PanoramaRange): string {
  if (range === 'day') {
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }
  const md = `${d.getMonth() + 1}/${d.getDate()}`
  const hm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  return `${md} ${hm}`
}

function parseThoughtField(raw: string): string[] {
  if (!raw.trim()) return []
  return raw.split(JOIN).map((p) => p.trim()).filter(Boolean)
}

type FreqAcc = Map<string, { count: number; entryIds: number[] }>

function bumpFreq(map: FreqAcc, label: string, entryId: number): void {
  const cur = map.get(label)
  if (cur) {
    cur.count += 1
    if (!cur.entryIds.includes(entryId)) cur.entryIds.push(entryId)
  } else {
    map.set(label, { count: 1, entryIds: [entryId] })
  }
}

function topCounts(map: FreqAcc, limit: number): FrequencyItem[] {
  return [...map.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, limit)
    .map(([label, { count, entryIds }]) => ({ label, count, entryIds }))
}

/** 按象限 ID 统计日记正文出现频次（相同文本合并计数） */
function computeQuadrantFactFrequencies(
  points: PanoramaPoint[],
  targetId: QuadrantId
): FrequencyItem[] {
  const acc: FreqAcc = new Map()
  for (const p of points) {
    if (p.quadrantId !== targetId) continue
    const text = p.diaryText.trim()
    if (text) bumpFreq(acc, text.length > 40 ? `${text.slice(0, 40)}…` : text, p.id)
  }
  return topCounts(acc, 3)
}

export function buildPanoramaPoints(
  rows: EntryRow[],
  _emotionLabels: Map<string, string>,
  behaviorLabels: Map<string, string>,
  range: PanoramaRange,
  _tagLists?: TagListsConfig
): PanoramaPoint[] {
  const parsed = parseEntries(rows)
  return parsed.map((e) => pointFromParsed(e, rows, behaviorLabels, range))
}

function pointFromParsed(
  e: ParsedEntry,
  rows: EntryRow[],
  behaviorLabels: Map<string, string>,
  range: PanoramaRange
): PanoramaPoint {
  const row = rows.find((r) => r.id === e.id)!
  const quadrantId = assignQuadrant(e.coordX, e.coordY)
  const bodyParts = [
    ...e.bodyTags,
    ...e.behaviorIds.map((id) => {
      const full = behaviorLabels.get(id) ?? id
      return full.split('\uFF1A')[0]
    })
  ]
  const { tags, supplement } = parseFactField(row.fact)
  return {
    id: e.id,
    ts: e.occurredAt.getTime(),
    occurredAt: e.occurredAt,
    timeLabel: formatTimeLabel(e.occurredAt, range),
    coordX: e.coordX,
    coordY: e.coordY,
    quadrantId,
    tideValue: e.coordX,
    quadrantLabel: getQuadrantLabel(e.coordX, e.coordY),
    quadrantColor: quadrantColor(quadrantId),
    factTags: tags,
    factSupplement: supplement,
    diaryText: getDiaryDisplayText(row),
    thoughtParts: parseThoughtField(row.thought),
    thoughtRaw: row.thought?.trim() ?? '',
    bodyParts,
    behaviorIds: e.behaviorIds
  }
}

export function computeFrequencies(
  points: PanoramaPoint[],
  _emotionLabels: Map<string, string>,
  rows: EntryRow[],
  _tagLists?: TagListsConfig
): PanoramaFrequencies {
  const thoughts: FreqAcc = new Map()
  const body: FreqAcc = new Map()
  let avoidanceCount = 0

  for (const p of points) {
    const row = rows.find((r) => r.id === p.id)
    if (row && isAvoidanceEntry(row)) {
      avoidanceCount += 1
    }
    for (const t of p.thoughtParts) {
      bumpFreq(thoughts, t, p.id)
    }
    for (const b of p.bodyParts) {
      bumpFreq(body, b, p.id)
    }
  }

  return {
    painTriggers: computeQuadrantFactFrequencies(points, 'tl'),
    rechargeHavens: computeQuadrantFactFrequencies(points, 'br'),
    thoughts: topCounts(thoughts, 3),
    bodyReactions: topCounts(body, 3),
    avoidanceCount,
    // 情绪 ID 当前版本未独立存储，暂返回空数组，UI 会显示"暂无"
    pleasantEmotions: [],
    steadyEmotions: [],
    lowEmotions: []
  }
}

// ── 能量审计（阶段五）用到的三个分析函数 ──

/** 提取第四象限（内耗陷阱：低价值+高耗能）的所有记录点 */
export function extractDrainPoints(points: PanoramaPoint[]): PanoramaPoint[] {
  return points.filter((p) => p.quadrantId === 'tl')
}

/** 高频日记摘要统计（按出现次数降序，取前 N 条） */
export function topFactTags(points: PanoramaPoint[], limit = 3): FrequencyItem[] {
  const acc: FreqAcc = new Map()
  for (const p of points) {
    const text = p.diaryText.trim()
    if (!text) continue
    const label = text.length > 40 ? `${text.slice(0, 40)}…` : text
    bumpFreq(acc, label, p.id)
  }
  return topCounts(acc, limit)
}

/**
 * 净能量值：本周所有记录的 coordX 总和 − coordY 总和。
 * 正值代表本周整体倾向高价值低耗，负值代表高耗低值。
 */
export function calcNetEnergy(points: PanoramaPoint[]): number {
  let sum = 0
  for (const p of points) {
    sum += p.coordX - p.coordY
  }
  return sum
}
