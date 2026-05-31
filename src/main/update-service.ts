import { app, BrowserWindow } from 'electron'
import type { UpdateCheckResponse } from '../shared/update'
import { GITHUB_RELEASES_URL } from '../shared/update'

let windowGetter: () => BrowserWindow | null = () => null

export function setUpdateWindowGetter(getter: () => BrowserWindow | null): void {
  windowGetter = getter
}

/** 保留签名兼容旧调用，无实际操作（已改为 GitHub API 模式） */
export function initAutoUpdater(): void {}

/** 当前版本与是否可检查更新 */
export function getUpdateInfo(): { currentVersion: string; canCheck: boolean } {
  return {
    currentVersion: app.getVersion(),
    canCheck: true
  }
}

/** 版本号比较：a > b 返回正数，a < b 返回负数，相等返回 0 */
function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number)
  const pb = b.split('.').map(Number)
  for (let i = 0; i < 3; i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0)
    if (diff !== 0) return diff
  }
  return 0
}

/**
 * 直接调用 GitHub API 检查最新版本。
 * 不依赖 electron-updater 的构建配置，开发 / 打包环境均可使用。
 */
export async function checkForAppUpdate(): Promise<UpdateCheckResponse> {
  const currentVersion = app.getVersion()

  try {
    // https://github.com/owner/repo/releases → https://api.github.com/repos/owner/repo/releases/latest
    const apiUrl = GITHUB_RELEASES_URL
      .replace('https://github.com/', 'https://api.github.com/repos/')
      .replace(/\/releases$/, '/releases/latest')

    const res = await fetch(apiUrl, {
      headers: {
        'User-Agent': `emotion-app/${currentVersion}`,
        Accept: 'application/vnd.github+json'
      }
    })

    if (res.status === 404) {
      return { status: 'latest', currentVersion, latestVersion: currentVersion }
    }
    if (!res.ok) {
      throw new Error(`GitHub API 返回 ${res.status}`)
    }

    const data = (await res.json()) as { tag_name?: string; prerelease?: boolean; draft?: boolean }

    if (!data.tag_name || data.prerelease || data.draft) {
      return { status: 'latest', currentVersion, latestVersion: currentVersion }
    }

    const latestVersion = data.tag_name.replace(/^v/, '')
    if (compareVersions(latestVersion, currentVersion) > 0) {
      return { status: 'available', currentVersion, latestVersion }
    }
    return { status: 'latest', currentVersion, latestVersion }
  } catch (err) {
    return { status: 'error', currentVersion, message: (err as Error).message }
  }
}

/** 保留兼容签名，实际不再自动下载（UI 改为打开浏览器手动下载） */
export function downloadAppUpdate(): Promise<{ ok: true } | { ok: false; message: string }> {
  return Promise.resolve({ ok: false, message: 'manual-download' })
}

/** 保留兼容签名，不再使用 */
export function installAppUpdate(): void {}
