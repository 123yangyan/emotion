import type { EntryRow } from '../../../main/database'
import { beijingDateKey } from '../../../shared/beijingTime'

/** 某日全部记录（按 occurred_at 升序） */
export function entriesOnDate(all: EntryRow[], dateKey: string): EntryRow[] {
  return all
    .filter((e) => beijingDateKey(e.occurred_at) === dateKey)
    .sort((a, b) => a.occurred_at.localeCompare(b.occurred_at))
}

export interface DailyEntryIndexMeta {
  /** 1-based 序号 */
  index: number
  total: number
}

/** 某条记录在当日的序号（编辑态） */
export function getDailyEntryIndex(
  all: EntryRow[],
  entryId: number,
  dateKey: string
): DailyEntryIndexMeta | null {
  const day = entriesOnDate(all, dateKey)
  const idx = day.findIndex((e) => e.id === entryId)
  if (idx < 0) return null
  return { index: idx + 1, total: day.length }
}

/** 新建下一条：当日已有 n 条则新记录为第 n+1 条 */
export function getNextDailyEntryIndex(all: EntryRow[], dateKey: string): DailyEntryIndexMeta {
  const total = entriesOnDate(all, dateKey).length
  return { index: total + 1, total: total + 1 }
}

/** 为历史列表批量计算同日序号 */
export function buildDailyIndexMap(all: EntryRow[]): Map<number, DailyEntryIndexMeta> {
  const byDate = new Map<string, EntryRow[]>()
  for (const e of all) {
    const dk = beijingDateKey(e.occurred_at)
    const list = byDate.get(dk) ?? []
    list.push(e)
    byDate.set(dk, list)
  }
  const out = new Map<number, DailyEntryIndexMeta>()
  for (const list of byDate.values()) {
    list.sort((a, b) => a.occurred_at.localeCompare(b.occurred_at))
    const total = list.length
    list.forEach((e, i) => {
      out.set(e.id, { index: i + 1, total })
    })
  }
  return out
}
