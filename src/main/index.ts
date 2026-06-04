import {
  app,
  BrowserWindow,
  Tray,
  Menu,
  ipcMain,
  dialog,
  shell
} from 'electron'
import { nowBeijingIso, todayBeijingDateKey } from '../shared/beijingTime'
import { join } from 'path'
import { writeFileSync } from 'fs'
import {
  initDatabase,
  createEntry,
  listEntriesByDate,
  listEntriesBetween,
  listAllEntries,
  updateEntry,
  deleteEntry,
  deleteEntries,
  getEntryById,
  exportAllEntries,
  exportJsonBackup,
  getDailyTitle,
  setDailyTitle,
  getDbPath,
  hasEntryToday,
  getAiInsights,
  getLatestAiInsight,
  type EntryInput
} from './database'
import {
  autoExportForOccurredAt,
  initAiExportService,
  stopAiExportService
} from './ai-export-service'
import { notifyEntriesChanged, setRendererNotifyWindow } from './renderer-notify'
import { loadSettings, saveSettings } from './settings'
import {
  processDailyCheckIn,
  onDailyRecordSaved,
  openCheckInWindow,
  setMainWindowGetter,
  scheduleTestReminder,
  cancelTestReminder,
  getTestReminderStatus,
  clearTestReminderOnQuit,
  recordCheckInSnooze,
  getCheckPollIntervalMs
} from './daily-checkin-service'
import { loadTrayIcon, loadWindowIcon } from './trayIcon'
import {
  initAutoUpdater,
  setUpdateWindowGetter,
  getUpdateInfo,
  checkForAppUpdate,
  downloadAppUpdate,
  installAppUpdate
} from './update-service'

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let checkInTimer: ReturnType<typeof setInterval> | null = null
let isQuitting = false

// Windows：Fluent 原生滚动条会忽略 ::-webkit-scrollbar，需关闭后才走 CSS 自定义
if (process.platform === 'win32') {
  app.commandLine.appendSwitch(
    'disable-features',
    'FluentScrollbar,FluentOverlayScrollbar'
  )
}

function createMainWindow(): void {
  mainWindow = new BrowserWindow({
    width: 960,
    height: 720,
    minWidth: 800,
    minHeight: 600,
    title: '真我状态记录',
    icon: loadWindowIcon(),
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  setMainWindowGetter(() => mainWindow)
  setRendererNotifyWindow(() => mainWindow)
  setUpdateWindowGetter(() => mainWindow)

  if (process.env.ELECTRON_RENDERER_URL) {
    void mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    void mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault()
      mainWindow?.hide()
    }
  })
}

function createTray(): void {
  const icon = loadTrayIcon()
  tray = new Tray(icon)
  tray.setToolTip('真我状态记录')
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '打开主窗口',
      click: () => {
        mainWindow?.show()
        mainWindow?.focus()
      }
    },
    {
      label: '记录此刻的状态',
      click: () => openCheckInWindow()
    },
    {
      label: '退出',
      click: () => {
        isQuitting = true
        app.quit()
      }
    }
  ])
  tray.setContextMenu(contextMenu)
  tray.on('double-click', () => {
    mainWindow?.show()
    mainWindow?.focus()
  })
}

function registerIpc(): void {
  ipcMain.handle('entry:create', (_e, input: EntryInput) => {
    const entry = createEntry({
      ...input,
      occurredAt: input.occurredAt || nowBeijingIso()
    })
    autoExportForOccurredAt(entry.occurred_at)
    notifyEntriesChanged()
    onDailyRecordSaved()
    return entry
  })

  ipcMain.handle('entry:listToday', (_e, dateStr?: string) => {
    const d = dateStr ?? todayBeijingDateKey()
    return listEntriesByDate(d)
  })

  ipcMain.handle('entry:listBetween', (_e, startIso: string, endIso: string) =>
    listEntriesBetween(startIso, endIso)
  )

  ipcMain.handle('entry:hasToday', () => hasEntryToday())

  ipcMain.handle('entry:listAll', () => listAllEntries())

  ipcMain.handle('entry:get', (_e, id: number) => getEntryById(id) ?? null)

  ipcMain.handle('entry:update', (_e, id: number, input: EntryInput) => {
    const row = updateEntry(id, input)
    if (row) {
      autoExportForOccurredAt(row.occurred_at)
      notifyEntriesChanged()
    }
    return row ?? null
  })

  ipcMain.handle('entry:delete', (_e, id: number) => {
    const existing = getEntryById(id)
    const ok = deleteEntry(id)
    if (ok && existing) {
      autoExportForOccurredAt(existing.occurred_at)
      notifyEntriesChanged()
    }
    return ok
  })

  ipcMain.handle('entry:deleteMany', (_e, ids: unknown) => {
    const deleted = deleteEntries(ids as number[])
    if (deleted > 0) notifyEntriesChanged()
    return deleted
  })

  ipcMain.handle('settings:get', () => loadSettings())

  ipcMain.handle('settings:save', (_e, partial) => {
    const next = saveSettings(partial)
    restartCheckInTimer()
    return next
  })

  ipcMain.handle('dailyTitle:get', (_e, dateStr: string) => getDailyTitle(dateStr))

  ipcMain.handle('dailyTitle:set', (_e, dateStr: string, title: string) => {
    setDailyTitle(dateStr, title)
    return title
  })

  ipcMain.handle('export:json', async () => {
    const data = exportJsonBackup()
    const result = await dialog.showSaveDialog(mainWindow!, {
      title: '导出 JSON 备份',
      defaultPath: `emotion-backup-${todayBeijingDateKey()}.json`,
      filters: [{ name: 'JSON', extensions: ['json'] }]
    })
    if (result.canceled || !result.filePath) return { ok: false }
    writeFileSync(result.filePath, JSON.stringify(data, null, 2), 'utf-8')
    return { ok: true, path: result.filePath }
  })

  ipcMain.handle('app:getDataPath', () => ({
    dbPath: getDbPath(),
    userData: app.getPath('userData')
  }))

  ipcMain.handle('checkin:open', () => {
    openCheckInWindow()
    return { ok: true }
  })

  ipcMain.handle('reminder:scheduleTest', (_e, delaySeconds: number) =>
    scheduleTestReminder(delaySeconds)
  )

  ipcMain.handle('reminder:cancelTest', () => {
    cancelTestReminder()
    return { ok: true }
  })

  ipcMain.handle('reminder:testStatus', () => getTestReminderStatus())

  ipcMain.handle('checkin:snooze', () => {
    recordCheckInSnooze()
    return { ok: true }
  })

  ipcMain.handle('update:getInfo', () => getUpdateInfo())
  ipcMain.handle('update:check', () => checkForAppUpdate())
  ipcMain.handle('update:download', () => downloadAppUpdate())
  ipcMain.handle('update:install', () => {
    installAppUpdate()
    return { ok: true }
  })
  ipcMain.handle('app:openExternal', (_e, url: string) => {
    void shell.openExternal(url)
    return { ok: true }
  })

  ipcMain.handle('ai:getInsights', () => getAiInsights())

  ipcMain.handle('ai:getLatestInsight', (_e, withinDays?: number) =>
    getLatestAiInsight(withinDays ?? 3)
  )
}

function restartCheckInTimer(): void {
  if (checkInTimer) clearInterval(checkInTimer)
  const pollMs = getCheckPollIntervalMs(loadSettings())
  processDailyCheckIn()
  checkInTimer = setInterval(processDailyCheckIn, pollMs)
}

app.whenReady().then(() => {
  initDatabase()
  initAiExportService()
  initAutoUpdater()
  registerIpc()
  createMainWindow()
  createTray()
  restartCheckInTimer()
})

app.on('before-quit', () => {
  isQuitting = true
  if (checkInTimer) clearInterval(checkInTimer)
  clearTestReminderOnQuit()
  stopAiExportService()
})

app.on('window-all-closed', () => {
  // 托盘常驻
})
