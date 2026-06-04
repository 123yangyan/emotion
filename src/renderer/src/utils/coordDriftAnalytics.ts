import type { EntryRow } from '../../../main/database'
import { beijingDateKey } from '../../../shared/beijingTime'
import { assignQuadrant, type QuadrantId } from './dayAnalytics'
import { dateKeysEndingAt } from './dashboardMetrics'

/** 单条坐标点（用于漂移缩略图） */
export interface CoordPoint {
  x: number
  y: number
  quadrantId: QuadrantId
  dateKey: string
}

export interface CoordCentroid {
  x: number
  y: number
}

/** 7 日坐标漂移视图数据 */
export interface CoordDriftViewModel {
  hasData: boolean
  /** 近 7 日（不含选中当日）散点 */
  baselinePoints: CoordPoint[]
  /** 选中当日散点 */
  todayPoints: CoordPoint[]
  centroid7d: CoordCentroid | null
  todayCentroid: CoordCentroid | null
  /** 今日重心相对 7 日重心的位移 */
  driftVector: { dx: number; dy: number } | null
  /** 箭头起点：优先 7 日重心，无则昨日最后一点 */
  arrowFrom: CoordCentroid | null
}

function meanCentroid(points: CoordPoint[]): CoordCentroid | null {
  if (points.length === 0) return null
  const x = points.reduce((s, p) => s + p.x, 0) / points.length
  const y = points.reduce((s, p) => s + p.y, 0) / points.length
  return { x, y }
}

function entryToPoint(row: EntryRow): CoordPoint {
  const x = row.coord_x ?? 0
  const y = row.coord_y ?? 0
  return {
    x,
    y,
    quadrantId: assignQuadrant(x, y),
    dateKey: beijingDateKey(row.occurred_at)
  }
}

/** 由近 7 日日记构建坐标漂移数据（以 endDate 为「今日」） */
export function buildCoordDriftView(
  entries: EntryRow[],
  endDate: string,
  days = 7
): CoordDriftViewModel {
  const keys = dateKeysEndingAt(endDate, days)
  const todayKey = endDate
  const baselineKeys = new Set(keys.filter((k) => k !== todayKey))

  const baselinePoints: CoordPoint[] = []
  const todayPoints: CoordPoint[] = []

  for (const row of entries) {
    const pt = entryToPoint(row)
    if (pt.dateKey === todayKey) {
      todayPoints.push(pt)
    } else if (baselineKeys.has(pt.dateKey)) {
      baselinePoints.push(pt)
    }
  }

  const all7d = [...baselinePoints, ...todayPoints]
  const centroid7d = meanCentroid(all7d)
  const todayCentroid = meanCentroid(todayPoints)

  let driftVector: { dx: number; dy: number } | null = null
  if (centroid7d && todayCentroid) {
    driftVector = {
      dx: todayCentroid.x - centroid7d.x,
      dy: todayCentroid.y - centroid7d.y
    }
  }

  let arrowFrom: CoordCentroid | null = centroid7d
  if (!arrowFrom && baselinePoints.length > 0) {
    const sorted = [...entries]
      .filter((r) => baselineKeys.has(beijingDateKey(r.occurred_at)))
      .sort((a, b) => a.occurred_at.localeCompare(b.occurred_at))
    const last = sorted[sorted.length - 1]
    if (last) {
      arrowFrom = { x: last.coord_x ?? 0, y: last.coord_y ?? 0 }
    }
  }

  return {
    hasData: all7d.length > 0,
    baselinePoints,
    todayPoints,
    centroid7d,
    todayCentroid,
    driftVector,
    arrowFrom
  }
}

/** 将 -4~+4 坐标映射到 SVG viewBox（中心 60,60，半边长 50） */
export function coordToSvg(x: number, y: number, size = 120, pad = 10): { sx: number; sy: number } {
  const inner = size - pad * 2
  const mid = size / 2
  const scale = inner / 2 / 4
  return {
    sx: mid + x * scale,
    sy: mid - y * scale
  }
}
