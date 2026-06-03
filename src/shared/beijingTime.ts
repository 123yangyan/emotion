/** 应用统一使用北京时间（东八区，无夏令时） */
export const BEIJING_TZ = 'Asia/Shanghai'

type BeijingParts = {
  year: string
  month: string
  day: string
  hour: string
  minute: string
  second: string
}

function beijingParts(date: Date): BeijingParts {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: BEIJING_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
  const map: Record<string, string> = {}
  for (const p of fmt.formatToParts(date)) {
    if (p.type !== 'literal') map[p.type] = p.value
  }
  return {
    year: map.year,
    month: map.month,
    day: map.day,
    hour: map.hour,
    minute: map.minute,
    second: map.second
  }
}

function toDate(input?: string | Date): Date {
  if (input == null) return new Date()
  return typeof input === 'string' ? new Date(input) : input
}

/** 当前北京时间，ISO 带 +08:00（用于 occurred_at 等持久化字段） */
export function nowBeijingIso(date = new Date()): string {
  const p = beijingParts(date)
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}+08:00`
}

/** 北京时间日期键 YYYY-MM-DD */
export function beijingDateKey(isoOrDate?: string | Date): string {
  const p = beijingParts(toDate(isoOrDate))
  return `${p.year}-${p.month}-${p.day}`
}

/** 今日北京时间日期键 */
export function todayBeijingDateKey(): string {
  return beijingDateKey()
}

/** 某日北京时间起止（用于按日筛选） */
export function beijingDayBounds(dateKey: string): { startIso: string; endIso: string } {
  return {
    startIso: `${dateKey}T00:00:00+08:00`,
    endIso: `${dateKey}T23:59:59.999+08:00`
  }
}

/** 全景/统计时间范围（日 / 近 7 日 / 近 30 日，均按北京时间日历） */
export function getBeijingRangeBounds(
  range: 'day' | 'week' | 'month',
  now = new Date()
): { startIso: string; endIso: string } {
  const endIso = nowBeijingIso(now)
  const todayKey = beijingDateKey(now)
  if (range === 'day') {
    const { startIso } = beijingDayBounds(todayKey)
    return { startIso, endIso }
  }
  const daysBack = range === 'week' ? 6 : 29
  const anchor = new Date(`${todayKey}T12:00:00+08:00`)
  anchor.setTime(anchor.getTime() - daysBack * 24 * 60 * 60 * 1000)
  const startKey = beijingDateKey(anchor)
  const { startIso } = beijingDayBounds(startKey)
  return { startIso, endIso }
}

/** HH:mm */
export function formatBeijingHm(isoOrDate?: string | Date): string {
  const p = beijingParts(toDate(isoOrDate))
  return `${p.hour}:${p.minute}`
}

/** HH:mm:ss */
export function formatBeijingClock(isoOrDate?: string | Date): string {
  const p = beijingParts(toDate(isoOrDate))
  return `${p.hour}:${p.minute}:${p.second}`
}

/** yyyy/MM/dd */
export function formatBeijingDateShort(isoOrDate?: string | Date): string {
  const p = beijingParts(toDate(isoOrDate))
  return `${p.year}/${p.month}/${p.day}`
}

/** yyyy年MM月dd日 HH:mm:ss */
export function formatBeijingDateTime(isoOrDate?: string | Date): string {
  const p = beijingParts(toDate(isoOrDate))
  return `${p.year}年${p.month}月${p.day}日 ${p.hour}:${p.minute}:${p.second}`
}

/** M/d（月日，用于跨日时间轴标签） */
export function formatBeijingMonthDay(isoOrDate?: string | Date): string {
  const p = beijingParts(toDate(isoOrDate))
  return `${Number(p.month)}/${Number(p.day)}`
}
