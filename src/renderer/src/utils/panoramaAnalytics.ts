import type { EntryRow } from '../../../main/database'
import {
  formatBeijingHm,
  formatBeijingMonthDay,
  getBeijingRangeBounds
} from '../../../shared/beijingTime'
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
  const { startIso, endIso } = getBeijingRangeBounds(range, now)
  return {
    start: new Date(startIso),
    end: new Date(endIso),
    startIso,
    endIso
  }
}

function formatTimeLabel(d: Date, range: PanoramaRange): string {
  if (range === 'day') {
    return formatBeijingHm(d)
  }
  return `${formatBeijingMonthDay(d)} ${formatBeijingHm(d)}`
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
