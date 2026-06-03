import type { BrowserWindow } from 'electron'

let getMainWindow: () => BrowserWindow | null = () => null

export function setRendererNotifyWindow(getter: () => BrowserWindow | null): void {
  getMainWindow = getter
}

export function notifyEntriesChanged(): void {
  getMainWindow()?.webContents.send('data:entriesChanged')
}

export function notifyAiInsightsChanged(): void {
  getMainWindow()?.webContents.send('data:aiInsightsChanged')
}
