import type { EntryRow } from '../../../main/database'
import { computeValence, getEmotionPolarity, valenceDotColor } from './dayAnalytics'
import { parseEntries, parseFactField, type ParsedEntry } from './entryParse'

export type PanoramaRange = 'day' | 'week' | 'month'

/** 全景舱单点：四维度时序对齐 */
export interface PanoramaPoint {
  id: number
  ts: number
  occurredAt: Date
  timeLabel: string
  intensity: number
  /** 相对 5 分基准：1→-4，5→0，9→+4 */
  tideValue: number
  emotionLabels: string
  factTags: string[]
  factSupplement: string
  thoughtParts: string[]
  thoughtRaw: string
  bodyParts: string[]
  valence: number
  valenceColor: string
  polarity: 'positive' | 'negative' | 'neutral'
}

export interface FrequencyItem {
  label: string
  count: number
}

export interface PanoramaFrequencies {
  negativeEmotions: FrequencyItem[]
  thoughts: FrequencyItem[]
  bodyReactions: FrequencyItem[]
}

const JOIN = '\u3001'

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

function tideValueFromIntensity(intensity: number): number {
  return intensity - 5
}

function topCounts(map: Map<string, number>, limit: number): FrequencyItem[] {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }))
}

export function buildPanoramaPoints(
  rows: EntryRow[],
  emotionLabels: Map<string, string>,
  behaviorLabels: Map<string, string>,
  range: PanoramaRange
): PanoramaPoint[] {
  const parsed = parseEntries(rows)
  return parsed.map((e) => pointFromParsed(e, rows, emotionLabels, behaviorLabels, range))
}

function pointFromParsed(
  e: ParsedEntry,
  rows: EntryRow[],
  emotionLabels: Map<string, string>,
  behaviorLabels: Map<string, string>,
  range: PanoramaRange
): PanoramaPoint {
  const row = rows.find((r) => r.id === e.id)!
  const emotionIds = e.emotionIds
  const labels = emotionIds.map((id) => emotionLabels.get(id) ?? id).join(JOIN)
  const polarity = emotionIds[0] ? getEmotionPolarity(emotionIds[0]) : 'neutral'
  const valence = computeValence(emotionIds[0])
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
    intensity: e.intensity,
    tideValue: tideValueFromIntensity(e.intensity),
    emotionLabels: labels || '\u2014',
    factTags: tags,
    factSupplement: supplement,
    thoughtParts: parseThoughtField(row.thought),
    thoughtRaw: row.thought?.trim() ?? '',
    bodyParts,
    valence,
    valenceColor: valenceDotColor(valence),
    polarity
  }
}

export function computeFrequencies(
  points: PanoramaPoint[],
  emotionLabels: Map<string, string>,
  rows: EntryRow[]
): PanoramaFrequencies {
  const negEmo = new Map<string, number>()
  const thoughts = new Map<string, number>()
  const body = new Map<string, number>()

  for (const p of points) {
    const row = rows.find((r) => r.id === p.id)
    if (row) {
      const ids = JSON.parse(row.emotion_ids || '[]') as string[]
      for (const id of ids) {
        if (getEmotionPolarity(id) === 'negative') {
          const label = emotionLabels.get(id) ?? id
          negEmo.set(label, (negEmo.get(label) ?? 0) + 1)
        }
      }
    }
    for (const t of p.thoughtParts) {
      thoughts.set(t, (thoughts.get(t) ?? 0) + 1)
    }
    for (const b of p.bodyParts) {
      body.set(b, (body.get(b) ?? 0) + 1)
    }
  }

  return {
    negativeEmotions: topCounts(negEmo, 3),
    thoughts: topCounts(thoughts, 3),
    bodyReactions: topCounts(body, 3)
  }
}
