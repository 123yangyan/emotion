import { getSetting, setSetting } from './database'
import type { AppSettings, TagListsConfig } from '../shared/types'

/** 提醒间隔下限（小时），约 36 秒 */
export const MIN_REMINDER_INTERVAL_HOURS = 0.01

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
  reminderIntervalHours: 2,
  quietStart: '22:00',
  quietEnd: '08:00',
  strongPopup: true,
  notificationsEnabled: true,
  fatigueCheckHour: 18
}

export function loadSettings(): AppSettings {
  const legacyInterval = getSetting('quietHoursBeforeCheckIn', '')
  const intervalDefault =
    legacyInterval && legacyInterval !== '2'
      ? legacyInterval
      : String(DEFAULTS.reminderIntervalHours)

  return {
    reminderIntervalHours: clampReminderIntervalHours(
      Number(getSetting('reminderIntervalHours', intervalDefault))
    ),
    quietStart: getSetting('quietStart', DEFAULTS.quietStart),
    quietEnd: getSetting('quietEnd', DEFAULTS.quietEnd),
    strongPopup: getSetting('strongPopup', 'true') === 'true',
    notificationsEnabled: getSetting('notificationsEnabled', 'true') === 'true',
    tagLists: parseTagLists(getSetting('tagLists', '')),
    fatigueCheckHour: clampFatigueHour(Number(getSetting('fatigueCheckHour', String(DEFAULTS.fatigueCheckHour))))
  }
}

function clampFatigueHour(h: number): number {
  if (!Number.isFinite(h) || h < 0 || h > 23) return 18
  return Math.round(h)
}

function clampReminderIntervalHours(hours: number): number {
  if (!Number.isFinite(hours) || hours < MIN_REMINDER_INTERVAL_HOURS) {
    return MIN_REMINDER_INTERVAL_HOURS
  }
  return Math.min(24, hours)
}

export function saveSettings(partial: Partial<AppSettings>): AppSettings {
  const current = loadSettings()
  const next = { ...current, ...partial }
  if (partial.reminderIntervalHours !== undefined) {
    next.reminderIntervalHours = clampReminderIntervalHours(next.reminderIntervalHours)
  }
  setSetting('reminderIntervalHours', String(next.reminderIntervalHours))
  setSetting('quietStart', next.quietStart)
  setSetting('quietEnd', next.quietEnd)
  setSetting('strongPopup', String(next.strongPopup))
  setSetting('notificationsEnabled', String(next.notificationsEnabled))
  if (partial.tagLists !== undefined) {
    setSetting('tagLists', JSON.stringify(next.tagLists))
  }
  if (partial.fatigueCheckHour !== undefined) {
    setSetting('fatigueCheckHour', String(next.fatigueCheckHour))
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
