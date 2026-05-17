import { Notification, BrowserWindow, screen } from 'electron'
import { join } from 'path'
import { getSetting, setSetting } from './database'
import {
  isQuietHours,
  loadSettings,
  MIN_REMINDER_INTERVAL_HOURS,
  type AppSettings
} from './settings'

let checkInWindow: BrowserWindow | null = null
let getMainWindow: () => BrowserWindow | null = () => null
let lastShownAt = 0
let testReminderTimer: ReturnType<typeof setTimeout> | null = null
let testReminderFireAt = 0
let testReminderDelaySeconds = 0

const SNOOZE_INTERVAL_MS = 20 * 60 * 1000
const MAX_SNOOZE_PER_DAY = 3
function clampReminderHours(hours: number): number {
  if (!Number.isFinite(hours) || hours < MIN_REMINDER_INTERVAL_HOURS) {
    return MIN_REMINDER_INTERVAL_HOURS
  }
  return Math.min(24, hours)
}

function reminderIntervalMs(settings: AppSettings): number {
  return clampReminderHours(settings.reminderIntervalHours) * 60 * 60 * 1000
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

function getSnoozeCount(date: string): number {
  return Number(getSetting(`checkinSnoozeCount_${date}`, '0')) || 0
}

function getEffectiveIntervalMs(settings: AppSettings): number {
  const snoozes = getSnoozeCount(todayKey())
  if (snoozes > 0 && snoozes < MAX_SNOOZE_PER_DAY) {
    return SNOOZE_INTERVAL_MS
  }
  return reminderIntervalMs(settings)
}

/** 后台检查频率：约为间隔的一半，最短 10 秒、最长 60 秒 */
export function getCheckPollIntervalMs(settings: AppSettings): number {
  const intervalMs = reminderIntervalMs(settings)
  return Math.min(60_000, Math.max(10_000, Math.floor(intervalMs / 2)))
}

export function setMainWindowGetter(fn: () => BrowserWindow | null): void {
  getMainWindow = fn
}

/** 非静默时段 + 距上次提醒已满间隔（保存记录后仍会继续提醒） */
export function shouldPromptDailyCheckIn(now: Date, settings: AppSettings): boolean {
  const date = now.toISOString().slice(0, 10)
  if (isQuietHours(now, settings.quietStart, settings.quietEnd)) return false
  if (getSnoozeCount(date) >= MAX_SNOOZE_PER_DAY) return false

  const intervalMs = getEffectiveIntervalMs(settings)
  if (lastShownAt > 0 && Date.now() - lastShownAt < intervalMs) return false

  return true
}

export function processDailyCheckIn(): void {
  const settings = loadSettings()
  const now = new Date()
  if (!shouldPromptDailyCheckIn(now, settings)) return
  if (checkInWindow && !checkInWindow.isDestroyed()) return

  deliverDailyCheckIn(settings)
  lastShownAt = Date.now()
}

export function onDailyRecordSaved(): void {
  lastShownAt = Date.now()
  closeCheckInWindow()
}

function deliverDailyCheckIn(settings: AppSettings): void {
  const title = '\u8bb0\u5f55\u4eca\u5929\u7684\u5fc3\u60c5'
  const body = '\u82b1\u4e00\u5206\u949f\u70b9\u9009\u60c5\u7eea\u4e0e\u72b6\u6001\uff0c\u7136\u540e\u4fdd\u5b58\u3002'

  if (settings.notificationsEnabled && Notification.isSupported()) {
    const notification = new Notification({ title, body })
    notification.on('click', () => openCheckInWindow())
    notification.show()
  }

  if (settings.strongPopup) {
    openCheckInWindow()
  }
}

const CHECKIN_WIDTH = 720
const CHECKIN_HEIGHT = 500

function positionCheckInWindow(win: BrowserWindow): void {
  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize
  const x = Math.round((sw - CHECKIN_WIDTH) / 2)
  const y = Math.round((sh - CHECKIN_HEIGHT) / 2)
  win.setBounds({ x, y, width: CHECKIN_WIDTH, height: CHECKIN_HEIGHT })
}

export function openCheckInWindow(): void {
  if (checkInWindow && !checkInWindow.isDestroyed()) {
    checkInWindow.focus()
    return
  }

  checkInWindow = new BrowserWindow({
    width: CHECKIN_WIDTH,
    height: CHECKIN_HEIGHT,
    minWidth: CHECKIN_WIDTH,
    maxWidth: CHECKIN_WIDTH,
    minHeight: CHECKIN_HEIGHT,
    maxHeight: CHECKIN_HEIGHT,
    frame: false,
    titleBarStyle: 'hidden',
    thickFrame: false,
    transparent: false,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    alwaysOnTop: true,
    show: false,
    backgroundColor: '#f7f2eb',
    autoHideMenuBar: true,
    title: '\u8bb0\u5f55\u5fc3\u60c5',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  positionCheckInWindow(checkInWindow)

  const url =
    process.env.ELECTRON_RENDERER_URL ?? `file://${join(__dirname, '../renderer/index.html')}`
  const sep = url.includes('?') ? '&' : '?'
  void checkInWindow.loadURL(`${url}${sep}mode=checkin`)

  checkInWindow.once('ready-to-show', () => {
    if (checkInWindow && !checkInWindow.isDestroyed()) {
      checkInWindow.setOpacity(0)
      checkInWindow.show()
      checkInWindow.focus()
      let opacity = 0
      const fade = setInterval(() => {
        opacity += 0.12
        if (!checkInWindow || checkInWindow.isDestroyed()) {
          clearInterval(fade)
          return
        }
        if (opacity >= 1) {
          checkInWindow.setOpacity(1)
          clearInterval(fade)
        } else {
          checkInWindow.setOpacity(opacity)
        }
      }, 16)
    }
  })

  checkInWindow.on('closed', () => {
    checkInWindow = null
  })
}

/** 用户 Esc / 关闭：稍后提醒（20 分钟内可再弹，当日满 3 次后静默） */
export function recordCheckInSnooze(): void {
  const date = todayKey()
  const count = getSnoozeCount(date) + 1
  setSetting(`checkinSnoozeCount_${date}`, String(count))
  lastShownAt = Date.now()
  closeCheckInWindow()
}

export function closeCheckInWindow(): void {
  if (checkInWindow && !checkInWindow.isDestroyed()) {
    checkInWindow.close()
  }
  checkInWindow = null
}

/** 测试用：忽略静默时段、间隔限制，按当前设置弹出提醒 */
export function triggerForcedDailyCheckIn(): void {
  if (checkInWindow && !checkInWindow.isDestroyed()) {
    checkInWindow.focus()
    return
  }
  deliverDailyCheckIn(loadSettings())
  lastShownAt = Date.now()
}

export function scheduleTestReminder(delaySeconds: number): {
  ok: boolean
  delaySeconds: number
  fireAt: string
} {
  cancelTestReminder()
  const sec = Math.max(1, Math.round(delaySeconds))
  const ms = sec * 1000
  testReminderDelaySeconds = sec
  testReminderFireAt = Date.now() + ms

  testReminderTimer = setTimeout(() => {
    testReminderTimer = null
    testReminderFireAt = 0
    testReminderDelaySeconds = 0
    triggerForcedDailyCheckIn()
  }, ms)

  return {
    ok: true,
    delaySeconds: sec,
    fireAt: new Date(testReminderFireAt).toISOString()
  }
}

export function cancelTestReminder(): void {
  if (testReminderTimer) {
    clearTimeout(testReminderTimer)
    testReminderTimer = null
  }
  testReminderFireAt = 0
  testReminderDelaySeconds = 0
}

export function getTestReminderStatus(): {
  scheduled: boolean
  fireAt?: string
  delaySeconds?: number
  remainingSeconds?: number
} {
  if (!testReminderTimer || testReminderFireAt <= 0) {
    return { scheduled: false }
  }
  const remainingMs = Math.max(0, testReminderFireAt - Date.now())
  return {
    scheduled: true,
    fireAt: new Date(testReminderFireAt).toISOString(),
    delaySeconds: testReminderDelaySeconds,
    remainingSeconds: Math.ceil(remainingMs / 1000)
  }
}

export function clearTestReminderOnQuit(): void {
  cancelTestReminder()
}
