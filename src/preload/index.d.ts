import type { EntryInput, EntryRow, AiInsightRow } from '../main/database'
import type { AppSettings } from '../shared/types'
import type { UpdateCheckResponse } from '../shared/update'

export interface ElectronAPI {
  createEntry: (input: EntryInput) => Promise<EntryRow>
  listToday: (dateStr?: string) => Promise<EntryRow[]>
  listEntriesBetween: (startIso: string, endIso: string) => Promise<EntryRow[]>
  hasEntryToday: () => Promise<boolean>
  listAllEntries: () => Promise<EntryRow[]>
  getEntry: (id: number) => Promise<EntryRow | null>
  updateEntry: (id: number, input: EntryInput) => Promise<EntryRow | null>
  deleteEntry: (id: number) => Promise<boolean>
  deleteEntries: (ids: number[]) => Promise<number>
  getSettings: () => Promise<AppSettings>
  saveSettings: (partial: Partial<AppSettings>) => Promise<AppSettings>
  getDailyTitle: (dateStr: string) => Promise<string>
  setDailyTitle: (dateStr: string, title: string) => Promise<string>
  exportJson: () => Promise<{ ok: boolean; path?: string }>
  getDataPath: () => Promise<{ dbPath: string; userData: string }>
  openCheckInPopup: () => Promise<{ ok: boolean }>
  scheduleTestReminder: (
    delaySeconds: number
  ) => Promise<{ ok: boolean; delaySeconds: number; fireAt: string }>
  cancelTestReminder: () => Promise<{ ok: boolean }>
  getTestReminderStatus: () => Promise<{
    scheduled: boolean
    fireAt?: string
    delaySeconds?: number
    remainingSeconds?: number
  }>
  snoozeCheckIn: () => Promise<{ ok: boolean }>
  getUpdateInfo: () => Promise<{ currentVersion: string; canCheck: boolean }>
  checkForUpdate: () => Promise<UpdateCheckResponse>
  downloadUpdate: () => Promise<{ ok: true } | { ok: false; message: string }>
  installUpdate: () => Promise<{ ok: true }>
  openExternalUrl: (url: string) => Promise<{ ok: boolean }>
  getAiInsights: () => Promise<AiInsightRow[]>
  getLatestAiInsight: (withinDays?: number) => Promise<AiInsightRow | null>
  onEntriesChanged: (callback: () => void) => () => void
  onAiInsightsChanged: (callback: () => void) => () => void
  onUpdateProgress: (callback: (percent: number) => void) => () => void
}

declare global {
  interface Window {
    api: ElectronAPI
  }
}
