import {

  existsSync,

  mkdirSync,

  readFileSync,

  readdirSync,

  writeFileSync,

  watch,

  type FSWatcher

} from 'fs'

import { app } from 'electron'

import { join } from 'path'

import { beijingDateKey, todayBeijingDateKey } from '../shared/beijingTime'

import { parseAiResultToInput } from '../shared/aiInsightIngest'

import {

  listEntriesByDate,

  saveAiInsight,

  parseJsonArraySafe,

  type EntryRow

} from './database'
import { notifyAiInsightsChanged } from './renderer-notify'

let exportDir = ''

let resultsDir = ''

let resultsWatcher: FSWatcher | null = null



function getQuadrantLabel(coordX: number, coordY: number): string {

  if (coordX > 0 && coordY > 0) return '\u653b\u575a\u533a'

  if (coordX > 0 && coordY <= 0) return '\u5fc3\u6d41\u533a'

  if (coordX <= 0 && coordY <= 0) return '\u673a\u68b0\u533a'

  return '\u5185\u8017\u9677\u9631'

}



function getDataDir(): string {

  return join(app.getPath('userData'), 'data')

}



function ensureAiDirs(): void {

  mkdirSync(exportDir, { recursive: true })

  mkdirSync(resultsDir, { recursive: true })

}



function parseFatigueCheck(raw: string | null): unknown {

  if (!raw) return null

  try {

    return JSON.parse(raw) as unknown

  } catch {

    return null

  }

}



function entryToExportItem(row: EntryRow): Record<string, unknown> {

  return {

    id: row.id,

    occurred_at: row.occurred_at,

    quadrant: getQuadrantLabel(row.coord_x, row.coord_y),

    coord_x: row.coord_x,

    coord_y: row.coord_y,

    fact: row.fact,

    thought: row.thought,

    body_tags: parseJsonArraySafe(row.body_tags),

    behavior_tags: parseJsonArraySafe(row.behavior_tags),

    reaction_note: row.reaction_note,

    fatigue_check: parseFatigueCheck(row.fatigue_check)

  }

}



function ingestResultFile(filePath: string): void {

  if (!existsSync(filePath) || !filePath.endsWith('.json')) return



  let raw: Record<string, unknown>

  try {

    raw = JSON.parse(readFileSync(filePath, 'utf-8')) as Record<string, unknown>

  } catch {

    return

  }



  const dateFromName = filePath.split(/[/\\]/).pop()?.replace('.json', '')

  if (typeof raw.date !== 'string' && dateFromName && /^\d{4}-\d{2}-\d{2}$/.test(dateFromName)) {

    raw.date = dateFromName

  }



  const input = parseAiResultToInput(raw)

  if (!input) return



  const saved = saveAiInsight(input)
  if (saved) notifyAiInsightsChanged()

}



function scanExistingResults(): void {

  if (!existsSync(resultsDir)) return

  for (const name of readdirSync(resultsDir)) {

    if (!name.endsWith('.json')) continue

    ingestResultFile(join(resultsDir, name))

  }

}



/** 导出指定日期的 entries 到 ai-export/YYYY-MM-DD.json */

export function exportEntriesForDate(dateStr?: string): { ok: true; path: string; count: number } {

  ensureAiDirs()

  const date = dateStr ?? todayBeijingDateKey()

  const entries = listEntriesByDate(date)

  const payload = {

    export_date: date,

    entries: entries.map(entryToExportItem)

  }

  const filePath = join(exportDir, `${date}.json`)

  writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf-8')

  return { ok: true, path: filePath, count: entries.length }

}



/** 记录保存/修改/删除后，按北京时间日期重写 ai-export 快照 */

export function autoExportForOccurredAt(occurredAt: string): void {

  try {

    exportEntriesForDate(beijingDateKey(occurredAt))

  } catch (err) {

    console.warn('[ai-export] auto export failed:', err)

  }

}



export function watchForResults(): void {

  ensureAiDirs()

  scanExistingResults()



  if (resultsWatcher) {

    resultsWatcher.close()

    resultsWatcher = null

  }



  resultsWatcher = watch(resultsDir, (_event, filename) => {

    if (!filename || !filename.endsWith('.json')) return

    const filePath = join(resultsDir, filename)

    setTimeout(() => ingestResultFile(filePath), 200)

  })

}



export function initAiExportService(): void {

  exportDir = join(getDataDir(), 'ai-export')

  resultsDir = join(getDataDir(), 'ai-results')

  ensureAiDirs()

  watchForResults()

}



export function stopAiExportService(): void {

  if (resultsWatcher) {

    resultsWatcher.close()

    resultsWatcher = null

  }

}



export function getAiDataPaths(): { exportDir: string; resultsDir: string } {

  return { exportDir, resultsDir }

}


