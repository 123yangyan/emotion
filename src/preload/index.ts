import { contextBridge, ipcRenderer } from 'electron'
import type { EntryInput, EntryRow } from '../main/database'
import type { AppSettings } from '../shared/types'

import type { UpdateCheckResponse } from '../shared/update'

const api = {
  createEntry: (input: EntryInput): Promise<EntryRow> => ipcRenderer.invoke('entry:create', input),
  listToday: (dateStr?: string): Promise<EntryRow[]> => ipcRenderer.invoke('entry:listToday', dateStr),
  listEntriesBetween: (startIso: string, endIso: string): Promise<EntryRow[]> =>
    ipcRenderer.invoke('entry:listBetween', startIso, endIso),
  hasEntryToday: (): Promise<boolean> => ipcRenderer.invoke('entry:hasToday'),
  listAllEntries: (): Promise<EntryRow[]> => ipcRenderer.invoke('entry:listAll'),
  getEntry: (id: number): Promise<EntryRow | null> => ipcRenderer.invoke('entry:get', id),
  updateEntry: (id: number, input: EntryInput): Promise<EntryRow | null> =>
    ipcRenderer.invoke('entry:update', id, input),
  deleteEntry: (id: number): Promise<boolean> => ipcRenderer.invoke('entry:delete', id),
  deleteEntries: (ids: number[]): Promise<number> => ipcRenderer.invoke('entry:deleteMany', ids),
  getSettings: (): Promise<AppSettings> => ipcRenderer.invoke('settings:get'),
  saveSettings: (partial: Partial<AppSettings>): Promise<AppSettings> =>
    ipcRenderer.invoke('settings:save', partial),
  getDailyTitle: (dateStr: string): Promise<string> => ipcRenderer.invoke('dailyTitle:get', dateStr),
  setDailyTitle: (dateStr: string, title: string): Promise<string> =>
    ipcRenderer.invoke('dailyTitle:set', dateStr, title),
  exportJson: (): Promise<{ ok: boolean; path?: string }> => ipcRenderer.invoke('export:json'),
  getDataPath: (): Promise<{ dbPath: string; userData: string }> => ipcRenderer.invoke('app:getDataPath'),
  openCheckInPopup: (): Promise<{ ok: boolean }> => ipcRenderer.invoke('checkin:open'),
  openFatigueCheckPopup: (): Promise<{ ok: boolean }> => ipcRenderer.invoke('checkin:openFatigue'),
  scheduleTestReminder: (
    delaySeconds: number
  ): Promise<{ ok: boolean; delaySeconds: number; fireAt: string }> =>
    ipcRenderer.invoke('reminder:scheduleTest', delaySeconds),
  cancelTestReminder: (): Promise<{ ok: boolean }> => ipcRenderer.invoke('reminder:cancelTest'),
  getTestReminderStatus: (): Promise<{
    scheduled: boolean
    fireAt?: string
    delaySeconds?: number
    remainingSeconds?: number
  }> => ipcRenderer.invoke('reminder:testStatus'),
  snoozeCheckIn: (): Promise<{ ok: boolean }> => ipcRenderer.invoke('checkin:snooze'),
  getUpdateInfo: (): Promise<{ currentVersion: string; canCheck: boolean }> =>
    ipcRenderer.invoke('update:getInfo'),
  checkForUpdate: (): Promise<UpdateCheckResponse> => ipcRenderer.invoke('update:check'),
  downloadUpdate: (): Promise<{ ok: true } | { ok: false; message: string }> =>
    ipcRenderer.invoke('update:download'),
  installUpdate: (): Promise<{ ok: true }> => ipcRenderer.invoke('update:install'),
  openExternalUrl: (url: string): Promise<{ ok: boolean }> =>
    ipcRenderer.invoke('app:openExternal', url),
  onUpdateProgress: (callback: (percent: number) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, payload: { percent: number }): void => {
      callback(payload.percent)
    }
    ipcRenderer.on('update:progress', handler)
    return () => {
      ipcRenderer.removeListener('update:progress', handler)
    }
  }
}

contextBridge.exposeInMainWorld('api', api)
