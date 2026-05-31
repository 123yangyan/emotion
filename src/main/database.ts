import { app } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'

export interface EntryRow {
  id: number
  fact: string
  thought: string
  body_tags: string
  behavior_tags: string
  reaction_note: string
  /** 价值感坐标 -4（排斥）~ +4（愉悦） */
  coord_x: number
  /** 耗能度坐标 -4（轻松）~ +4（极耗） */
  coord_y: number
  /** 疲劳检查数据 JSON 字符串，普通打卡时为 null */
  fatigue_check: string | null
  occurred_at: string
  duration_estimate: string | null
  thought_persona_id: number | null
  created_at: string
}

export interface EntryInput {
  fact: string
  thought: string
  bodyTags: string[]
  behaviorTags: string[]
  reactionNote: string
  coordX: number
  coordY: number
  fatigueCheck?: string | null
  occurredAt: string
  durationEstimate?: string
  thoughtPersonaId?: number | null
}

export interface NudgeRow {
  id: number
  entry_id: number
  fire_at: string
  status: string
}

interface PersonaRow {
  id: number
  name: string
  created_at: string
}

interface Store {
  entries: EntryRow[]
  personas: PersonaRow[]
  nudges: NudgeRow[]
  settings: Record<string, string>
  counters: { entry: number; persona: number; nudge: number }
}

let storePath = ''

function loadStore(): Store {
  if (!existsSync(storePath)) {
    return {
      entries: [],
      personas: [],
      nudges: [],
      settings: {},
      counters: { entry: 0, persona: 0, nudge: 0 }
    }
  }
  return JSON.parse(readFileSync(storePath, 'utf-8')) as Store
}

function saveStore(store: Store): void {
  writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf-8')
}

function dateOnly(iso: string): string {
  return iso.slice(0, 10)
}

export function initDatabase(): void {
  const dir = join(app.getPath('userData'), 'data')
  mkdirSync(dir, { recursive: true })
  storePath = join(dir, 'emotion-diary.json')
  if (!existsSync(storePath)) {
    saveStore({
      entries: [],
      personas: [],
      nudges: [],
      settings: {},
      counters: { entry: 0, persona: 0, nudge: 0 }
    })
  }
}

export function createEntry(input: EntryInput): EntryRow {
  const store = loadStore()
  const id = ++store.counters.entry
  const now = new Date().toISOString()
  const row: EntryRow = {
    id,
    fact: input.fact,
    thought: input.thought,
    body_tags: JSON.stringify(input.bodyTags),
    behavior_tags: JSON.stringify(input.behaviorTags),
    reaction_note: input.reactionNote,
    coord_x: input.coordX,
    coord_y: input.coordY,
    fatigue_check: input.fatigueCheck ?? null,
    occurred_at: input.occurredAt,
    duration_estimate: input.durationEstimate ?? null,
    thought_persona_id: input.thoughtPersonaId ?? null,
    created_at: now
  }
  store.entries.push(row)
  saveStore(store)
  return row
}

export function getEntryById(id: number): EntryRow | undefined {
  const target = Number(id)
  return loadStore().entries.find((e) => Number(e.id) === target)
}

export function listEntriesByDate(dateStr: string): EntryRow[] {
  return loadStore()
    .entries.filter((e) => dateOnly(e.occurred_at) === dateStr)
    .sort((a, b) => a.occurred_at.localeCompare(b.occurred_at))
}

/** 按时间范围列出记录（含起止日，ISO 字符串比较） */
export function listEntriesBetween(startIso: string, endIso: string): EntryRow[] {
  return loadStore()
    .entries.filter((e) => e.occurred_at >= startIso && e.occurred_at <= endIso)
    .sort((a, b) => a.occurred_at.localeCompare(b.occurred_at))
}

/** 今天是否已有记录（每日弹窗：记过则今日不再提醒） */
export function hasEntryToday(dateStr?: string): boolean {
  const d = dateStr ?? new Date().toISOString().slice(0, 10)
  return loadStore().entries.some((e) => dateOnly(e.occurred_at) === d)
}

export function listPersonas(): { id: number; name: string }[] {
  return loadStore()
    .personas.map((p) => ({ id: p.id, name: p.name }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export function createPersona(name: string): { id: number; name: string } {
  const store = loadStore()
  if (store.personas.some((p) => p.name === name)) {
    const existing = store.personas.find((p) => p.name === name)!
    return { id: existing.id, name: existing.name }
  }
  const id = ++store.counters.persona
  store.personas.push({ id, name, created_at: new Date().toISOString() })
  saveStore(store)
  return { id, name }
}

export function hasPendingNudgeForEntry(entryId: number): boolean {
  return loadStore().nudges.some(
    (n) => n.entry_id === entryId && (n.status === 'scheduled' || n.status === 'deferred')
  )
}

export function scheduleNudge(entryId: number, fireAt: string): NudgeRow {
  const store = loadStore()
  const id = ++store.counters.nudge
  const row: NudgeRow = { id, entry_id: entryId, fire_at: fireAt, status: 'scheduled' }
  store.nudges.push(row)
  saveStore(store)
  return row
}

export function deferNudge(id: number, fireAt: string): void {
  const store = loadStore()
  const n = store.nudges.find((x) => x.id === id)
  if (n) {
    n.fire_at = fireAt
    n.status = 'deferred'
    saveStore(store)
  }
}

export function getNudgeById(id: number): NudgeRow | undefined {
  return loadStore().nudges.find((n) => n.id === id)
}

export function getDueNudges(nowIso: string): NudgeRow[] {
  return loadStore()
    .nudges.filter(
      (n) =>
        (n.status === 'scheduled' || n.status === 'deferred') && n.fire_at <= nowIso
    )
    .sort((a, b) => a.fire_at.localeCompare(b.fire_at))
}

export function updateNudgeStatus(id: number, status: string): void {
  const store = loadStore()
  const n = store.nudges.find((x) => x.id === id)
  if (n) {
    n.status = status
    saveStore(store)
  }
}

export function countNudgesSentToday(dateStr: string): number {
  return loadStore().nudges.filter(
    (n) =>
      ['sent', 'answered', 'dismissed'].includes(n.status) && dateOnly(n.fire_at) === dateStr
  ).length
}

export function getSetting(key: string, defaultValue: string): string {
  const store = loadStore()
  return store.settings[key] ?? defaultValue
}

export function setSetting(key: string, value: string): void {
  const store = loadStore()
  store.settings[key] = value
  saveStore(store)
}

export function exportAllEntries(): EntryRow[] {
  return [...loadStore().entries].sort((a, b) => b.occurred_at.localeCompare(a.occurred_at))
}

export function listAllEntries(): EntryRow[] {
  return exportAllEntries()
}

export function updateEntry(id: number, input: EntryInput): EntryRow | undefined {
  const store = loadStore()
  const row = store.entries.find((e) => e.id === id)
  if (!row) return undefined
  row.fact = input.fact
  row.thought = input.thought
  row.body_tags = JSON.stringify(input.bodyTags)
  row.behavior_tags = JSON.stringify(input.behaviorTags)
  row.reaction_note = input.reactionNote
  row.coord_x = input.coordX
  row.coord_y = input.coordY
  row.fatigue_check = input.fatigueCheck ?? null
  row.occurred_at = input.occurredAt
  row.duration_estimate = input.durationEstimate ?? null
  row.thought_persona_id = input.thoughtPersonaId ?? null
  saveStore(store)
  return row
}

export function deleteEntry(id: number): boolean {
  return deleteEntries([id]) > 0
}

function normalizeEntryIds(ids: unknown): number[] {
  const raw = Array.isArray(ids) ? ids : ids != null ? [ids] : []
  return [...new Set(raw.map((id) => Number(id)).filter((id) => Number.isFinite(id) && id > 0))]
}

/** 批量删除，返回实际删除条数 */
export function deleteEntries(ids: number[] | number): number {
  const normalized = normalizeEntryIds(ids)
  if (normalized.length === 0) return 0
  const store = loadStore()
  const idSet = new Set(normalized)
  const before = store.entries.length
  store.entries = store.entries.filter((e) => !idSet.has(Number(e.id)))
  store.nudges = store.nudges.filter((n) => !idSet.has(Number(n.entry_id)))
  const deleted = before - store.entries.length
  if (deleted > 0) saveStore(store)
  return deleted
}

export function getDailyTitle(dateStr: string): string {
  return getSetting(`daily_title_${dateStr}`, '')
}

export function setDailyTitle(dateStr: string, title: string): void {
  setSetting(`daily_title_${dateStr}`, title)
}

export function getDbPath(): string {
  return storePath
}
