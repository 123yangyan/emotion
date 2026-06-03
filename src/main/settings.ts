import { getSetting, setSetting } from './database'
import type { AppSettings, TagListsConfig } from '../shared/types'

/** 提醒间隔下限（分钟） */
export const MIN_REMINDER_INTERVAL_MINUTES = 1

/** 提醒间隔上限（分钟，24 小时） */
export const MAX_REMINDER_INTERVAL_MINUTES = 24 * 60

function parseTagLists(raw: string): TagListsConfig | undefined {
  if (!raw.trim()) return undefined
  try {
    const data = JSON.parse(raw) as TagListsConfig
    if (data && Array.isArray(data.factScenes) && Array.isArray(data.bodyTags)) {
      return data
    }
  } catch {
    /* 损坏的配置忽略，回退默认 */
  }
  return undefined
}

export type { AppSettings }

const DEFAULTS: AppSettings = {
  reminderIntervalMinutes: 60,
  quietStart: '22:00',
  quietEnd: '08:00',
  strongPopup: true,
  notificationsEnabled: true
}

export function clampReminderIntervalMinutes(minutes: number): number {
  if (!Number.isFinite(minutes) || minutes < MIN_REMINDER_INTERVAL_MINUTES) {
    return MIN_REMINDER_INTERVAL_MINUTES
  }
  return Math.min(MAX_REMINDER_INTERVAL_MINUTES, Math.round(minutes))
}

/** 读取间隔：优先分钟字段，兼容旧版小时字段 */
function readReminderIntervalMinutes(): number {
  const minutesRaw = getSetting('reminderIntervalMinutes', '')
  if (minutesRaw !== '') {
    return clampReminderIntervalMinutes(Number(minutesRaw))
  }

  const hoursRaw = getSetting('reminderIntervalHours', '')
  if (hoursRaw !== '') {
    return clampReminderIntervalMinutes(Number(hoursRaw) * 60)
  }

  const legacyInterval = getSetting('quietHoursBeforeCheckIn', '')
  if (legacyInterval && legacyInterval !== '2') {
    return clampReminderIntervalMinutes(Number(legacyInterval) * 60)
  }

  return DEFAULTS.reminderIntervalMinutes
}

export function loadSettings(): AppSettings {
  return {
    reminderIntervalMinutes: readReminderIntervalMinutes(),
    quietStart: getSetting('quietStart', DEFAULTS.quietStart),
    quietEnd: getSetting('quietEnd', DEFAULTS.quietEnd),
    strongPopup: getSetting('strongPopup', 'true') === 'true',
    notificationsEnabled: getSetting('notificationsEnabled', 'true') === 'true',
    tagLists: parseTagLists(getSetting('tagLists', ''))
  }
}

export function saveSettings(partial: Partial<AppSettings>): AppSettings {
  const current = loadSettings()
  const next = { ...current, ...partial }
  if (partial.reminderIntervalMinutes !== undefined) {
    next.reminderIntervalMinutes = clampReminderIntervalMinutes(next.reminderIntervalMinutes)
  }
  setSetting('reminderIntervalMinutes', String(next.reminderIntervalMinutes))
  setSetting('quietStart', next.quietStart)
  setSetting('quietEnd', next.quietEnd)
  setSetting('strongPopup', String(next.strongPopup))
  setSetting('notificationsEnabled', String(next.notificationsEnabled))
  if (partial.tagLists !== undefined) {
    setSetting('tagLists', JSON.stringify(next.tagLists))
  }
  return next
}

/** 静默时段（支持跨午夜，如 22:00–08:00） */
export function isQuietHours(now: Date, quietStart: string, quietEnd: string): boolean {
  const [sh, sm] = quietStart.split(':').map(Number)
  const [eh, em] = quietEnd.split(':').map(Number)
  const minutes = now.getHours() * 60 + now.getMinutes()
  const start = sh * 60 + sm
  const end = eh * 60 + em
  if (start <= end) {
    return minutes >= start && minutes < end
  }
  return minutes >= start || minutes < end
}
