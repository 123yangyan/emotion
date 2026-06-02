import type { EntryRow } from '../../../main/database'
import { restoreDiaryTextForForm } from './entryParse'

/** 把数据库记录还原为记录表单各字段（用于编辑） */
export function restoreEntryToForm(
  row: EntryRow,
  thoughtTagOptions: string[]
): {
  diaryText: string
  coordX: number
  coordY: number
  occurredAt: string
} {
  return {
    diaryText: restoreDiaryTextForForm(row, thoughtTagOptions),
    coordX: row.coord_x ?? 0,
    coordY: row.coord_y ?? 0,
    occurredAt: row.occurred_at
  }
}
