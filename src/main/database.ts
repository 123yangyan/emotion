import { app } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { beijingDateKey, nowBeijingIso, todayBeijingDateKey } from '../shared/beijingTime'

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

export type AiRiskLevel = 'low' | 'medium' | 'high'

/** AI 分析洞察（写入 Store.ai_insights[]） */
export interface AiInsightRow {
  id: number
  date: string
  analyzed_at: string
  risk_level: AiRiskLevel
  key_insight: string
  /** v1 兼容列，ingest 时从 payload 同步 */
  patterns: string
  recommendations: string
  /** v2：AI 返回的扩展字段 JSON object */
  payload?: string
  manifest_version?: number
}

export interface AiInsightInput {
  date: string
  analyzed_at: string
  risk_level: AiRiskLevel
  key_insight: string
  patterns: string[] | string
  recommendations: string[] | string
  payload?: Record<string, unknown> | string
  manifest_version?: number
  /** 为 true 时合并 payload，不清空未提及字段 */
  merge?: boolean
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
  ai_insights: AiInsightRow[]
  settings: Record<string, string>
  counters: { entry: number; persona: number; nudge: number; ai_insight: number }
}

let storePath = ''

function emptyStore(): Store {
  return {
    entries: [],
    personas: [],
    nudges: [],
    ai_insights: [],
    settings: {},
    counters: { entry: 0, persona: 0, nudge: 0, ai_insight: 0 }
  }
}

function normalizeStore(raw: Partial<Store>): Store {
  const base = emptyStore()
  return {
    entries: raw.entries ?? base.entries,
    personas: raw.personas ?? base.personas,
    nudges: raw.nudges ?? base.nudges,
    ai_insights: raw.ai_insights ?? base.ai_insights,
    settings: raw.settings ?? base.settings,
    counters: {
      entry: raw.counters?.entry ?? 0,
      persona: raw.counters?.persona ?? 0,
      nudge: raw.counters?.nudge ?? 0,
      ai_insight: raw.counters?.ai_insight ?? 0
    }
  }
}

function loadStore(): Store {
  if (!existsSync(storePath)) {
    return emptyStore()
  }
  return normalizeStore(JSON.parse(readFileSync(storePath, 'utf-8')) as Partial<Store>)
}

function saveStore(store: Store): void {
  writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf-8')
}

function dateOnly(iso: string): string {
  return beijingDateKey(iso)
}

export function initDatabase(): void {
  const dir = join(app.getPath('userData'), 'data')
  mkdirSync(dir, { recursive: true })
  storePath = join(dir, 'emotion-diary.json')
  if (!existsSync(storePath)) {
    saveStore(emptyStore())
  }
}

export function createEntry(input: EntryInput): EntryRow {
  const store = loadStore()
  const id = ++store.counters.entry
  const now = nowBeijingIso()
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
  const startMs = new Date(startIso).getTime()
  const endMs = new Date(endIso).getTime()
  return loadStore()
    .entries.filter((e) => {
      const t = new Date(e.occurred_at).getTime()
      return t >= startMs && t <= endMs
    })
    .sort((a, b) => a.occurred_at.localeCompare(b.occurred_at))
}

/** 今天是否已有记录（每日弹窗：记过则今日不再提醒） */
export function hasEntryToday(dateStr?: string): boolean {
  const d = dateStr ?? todayBeijingDateKey()
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

/** JSON 备份结构（含 AI 洞察） */
export interface JsonBackupExport {
  format: 'emotion-diary-backup'
  version: 2
  exportedAt: string
  entries: EntryRow[]
  ai_insights: Array<
    Omit<AiInsightRow, 'patterns' | 'recommendations' | 'payload'> & {
      patterns: string[]
      recommendations: string[]
      payload?: Record<string, unknown>
    }
  >
}

function serializeInsightForExport(row: AiInsightRow): JsonBackupExport['ai_insights'][number] {
  let payload: Record<string, unknown> | undefined
  if (row.payload) {
    try {
      const parsed = JSON.parse(row.payload) as unknown
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        payload = parsed as Record<string, unknown>
      }
    } catch {
      /* 保留 undefined */
    }
  }
  return {
    id: row.id,
    date: row.date,
    analyzed_at: row.analyzed_at,
    risk_level: row.risk_level,
    key_insight: row.key_insight,
    patterns: parseJsonArraySafe(row.patterns),
    recommendations: parseJsonArraySafe(row.recommendations),
    payload,
    manifest_version: row.manifest_version
  }
}

/** 导出完整 JSON 备份：记录 + AI 分析 */
export function exportJsonBackup(): JsonBackupExport {
  const store = loadStore()
  return {
    format: 'emotion-diary-backup',
    version: 2,
    exportedAt: new Date().toISOString(),
    entries: [...store.entries].sort((a, b) => b.occurred_at.localeCompare(a.occurred_at)),
    ai_insights: [...store.ai_insights]
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(serializeInsightForExport)
  }
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

function toJsonString(value: string[] | string): string {
  return typeof value === 'string' ? value : JSON.stringify(value)
}

function parseJsonArraySafe(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return []
  }
}

/** 列出全部 AI 洞察（按日期倒序） */
export function getAiInsights(): AiInsightRow[] {
  return [...loadStore().ai_insights].sort((a, b) => b.date.localeCompare(a.date))
}

/** 最近 withinDays 天内最新一条洞察（供记录页提醒） */
export function getLatestAiInsight(withinDays = 3): AiInsightRow | null {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - withinDays)
  const cutoffStr = beijingDateKey(cutoff)
  const rows = getAiInsights().filter((r) => r.date >= cutoffStr)
  return rows[0] ?? null
}

function parsePayloadObject(raw: string | Record<string, unknown> | undefined): Record<string, unknown> {
  if (!raw) return {}
  if (typeof raw === 'object') return { ...raw }
  try {
    const parsed = JSON.parse(raw) as unknown
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {}
  } catch {
    return {}
  }
}

/** 写入或按 date 覆盖 / 合并 AI 洞察 */
export function saveAiInsight(input: AiInsightInput): AiInsightRow | null {
  const store = loadStore()
  const existing = store.ai_insights.find((r) => r.date === input.date)

  const keyInsight = input.key_insight.trim() || existing?.key_insight || ''
  if (!keyInsight) return null

  let payloadObj = parsePayloadObject(existing?.payload)
  const incomingPayload = parsePayloadObject(input.payload)
  payloadObj = input.merge
    ? { ...payloadObj, ...incomingPayload }
    : Object.keys(incomingPayload).length > 0
      ? { ...payloadObj, ...incomingPayload }
      : payloadObj

  let patternsArr = existing ? parseJsonArraySafe(existing.patterns) : []
  if (Array.isArray(input.patterns) && (!input.merge || input.patterns.length > 0)) {
    patternsArr = input.patterns.map(String)
  } else if (Array.isArray(incomingPayload.patterns)) {
    patternsArr = incomingPayload.patterns.map(String)
  }

  let recommendationsArr = existing ? parseJsonArraySafe(existing.recommendations) : []
  if (Array.isArray(input.recommendations) && (!input.merge || input.recommendations.length > 0)) {
    recommendationsArr = input.recommendations.map(String)
  } else if (Array.isArray(incomingPayload.recommendations)) {
    recommendationsArr = incomingPayload.recommendations.map(String)
  }

  payloadObj.patterns = patternsArr
  payloadObj.recommendations = recommendationsArr

  const patterns = JSON.stringify(patternsArr)
  const recommendations = JSON.stringify(recommendationsArr)
  const payload = JSON.stringify(payloadObj)
  const manifestVersion = input.manifest_version ?? existing?.manifest_version ?? 1

  if (existing) {
    if (input.analyzed_at) existing.analyzed_at = input.analyzed_at
    if (input.risk_level) existing.risk_level = input.risk_level
    existing.key_insight = keyInsight
    existing.patterns = patterns
    existing.recommendations = recommendations
    existing.payload = payload
    existing.manifest_version = manifestVersion
    saveStore(store)
    return existing
  }

  const id = ++store.counters.ai_insight
  const row: AiInsightRow = {
    id,
    date: input.date,
    analyzed_at: input.analyzed_at || nowBeijingIso(),
    risk_level: input.risk_level,
    key_insight: keyInsight,
    patterns,
    recommendations,
    payload,
    manifest_version: manifestVersion
  }
  store.ai_insights.push(row)
  saveStore(store)
  return row
}

export { parseJsonArraySafe }
