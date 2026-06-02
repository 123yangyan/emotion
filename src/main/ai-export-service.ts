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
import { parseAiResultToInput } from '../shared/aiInsightIngest'
import {
  listEntriesByDate,
  saveAiInsight,
  parseJsonArraySafe,
  type EntryRow
} from './database'

const EXPORT_HOUR = 22

let exportDir = ''
let resultsDir = ''
let resultsWatcher: FSWatcher | null = null
let dailyExportTimer: ReturnType<typeof setTimeout> | null = null
let lastExportFiredDate = ''

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

function todayDateStr(): string {
  return new Date().toISOString().slice(0, 10)
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

  saveAiInsight(input)
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
  const date = dateStr ?? todayDateStr()
  const entries = listEntriesByDate(date)
  const payload = {
    export_date: date,
    entries: entries.map(entryToExportItem)
  }
  const filePath = join(exportDir, `${date}.json`)
  writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf-8')
  return { ok: true, path: filePath, count: entries.length }
}

export function triggerManualExport(dateStr?: string): { ok: true; path: string; count: number } {
  return exportEntriesForDate(dateStr)
}

function scheduleNextDailyExport(): void {
  if (dailyExportTimer) {
    clearTimeout(dailyExportTimer)
    dailyExportTimer = null
  }

  const now = new Date()
  const target = new Date(now)
  target.setHours(EXPORT_HOUR, 0, 0, 0)
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1)
  }

  const delayMs = target.getTime() - now.getTime()
  dailyExportTimer = setTimeout(() => {
    dailyExportTimer = null
    const today = todayDateStr()
    if (lastExportFiredDate !== today) {
      lastExportFiredDate = today
      exportEntriesForDate(today)
    }
    scheduleNextDailyExport()
  }, delayMs)
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
  scheduleNextDailyExport()
}

export function stopAiExportService(): void {
  if (dailyExportTimer) {
    clearTimeout(dailyExportTimer)
    dailyExportTimer = null
  }
  if (resultsWatcher) {
    resultsWatcher.close()
    resultsWatcher = null
  }
}

export function getAiDataPaths(): { exportDir: string; resultsDir: string } {
  return { exportDir, resultsDir }
}
