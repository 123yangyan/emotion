import { app, BrowserWindow } from 'electron'
import { autoUpdater } from 'electron-updater'
import type { UpdateCheckResponse } from '../shared/update'

let windowGetter: () => BrowserWindow | null = () => null

export function setUpdateWindowGetter(getter: () => BrowserWindow | null): void {
  windowGetter = getter
}

function send(channel: string, payload?: unknown): void {
  windowGetter()?.webContents.send(channel, payload)
}

/** 初始化自动更新：仅打包版生效，不自动下载 */
export function initAutoUpdater(): void {
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = false

  autoUpdater.on('download-progress', (progress) => {
    send('update:progress', { percent: progress.percent })
  })
}

/** 当前版本与是否可检查更新 */
export function getUpdateInfo(): { currentVersion: string; canCheck: boolean } {
  return {
    currentVersion: app.getVersion(),
    canCheck: app.isPackaged
  }
}

/** 向 GitHub Releases 检查新版本 */
export function checkForAppUpdate(): Promise<UpdateCheckResponse> {
  const currentVersion = app.getVersion()

  if (!app.isPackaged) {
    return Promise.resolve({ status: 'dev', currentVersion })
  }

  return new Promise((resolve) => {
    let settled = false

    const finish = (result: UpdateCheckResponse): void => {
      if (settled) return
      settled = true
      autoUpdater.removeListener('update-available', onAvailable)
      autoUpdater.removeListener('update-not-available', onNotAvailable)
      autoUpdater.removeListener('error', onError)
      resolve(result)
    }

    const onAvailable = (info: { version: string }): void => {
      finish({
        status: 'available',
        currentVersion,
        latestVersion: info.version
      })
    }

    const onNotAvailable = (): void => {
      finish({
        status: 'latest',
        currentVersion,
        latestVersion: currentVersion
      })
    }

    const onError = (err: Error): void => {
      finish({
        status: 'error',
        currentVersion,
        message: err.message
      })
    }

    autoUpdater.once('update-available', onAvailable)
    autoUpdater.once('update-not-available', onNotAvailable)
    autoUpdater.once('error', onError)

    void autoUpdater.checkForUpdates().catch((err: Error) => {
      onError(err)
    })
  })
}

/** 下载已发现的新版本 */
export function downloadAppUpdate(): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!app.isPackaged) {
    return Promise.resolve({ ok: false, message: 'dev-mode' })
  }

  return new Promise((resolve) => {
    let settled = false

    const finish = (result: { ok: true } | { ok: false; message: string }): void => {
      if (settled) return
      settled = true
      autoUpdater.removeListener('update-downloaded', onDownloaded)
      autoUpdater.removeListener('error', onError)
      resolve(result)
    }

    const onDownloaded = (): void => {
      finish({ ok: true })
    }

    const onError = (err: Error): void => {
      finish({ ok: false, message: err.message })
    }

    autoUpdater.once('update-downloaded', onDownloaded)
    autoUpdater.once('error', onError)

    void autoUpdater.downloadUpdate().catch((err: Error) => {
      onError(err)
    })
  })
}

/** 退出并安装已下载的更新 */
export function installAppUpdate(): void {
  autoUpdater.quitAndInstall(false, true)
}
