import { app, nativeImage } from 'electron'
import { existsSync } from 'fs'
import { join } from 'path'

/** 解析托盘图标路径（开发 / 打包后） */
function resolveTrayIconPath(): string | null {
  const names = ['tray-icon.png', 'tray-icon@2x.png']
  const bases = [
    process.resourcesPath,
    join(app.getAppPath(), 'resources'),
    join(__dirname, '../../resources'),
    join(__dirname, '../../../resources')
  ]

  for (const base of bases) {
    if (!base) continue
    for (const name of names) {
      const path = join(base, name)
      if (existsSync(path)) return path
    }
  }
  return null
}

/** 内嵌备用图标（◎ 情绪记录），找不到文件时使用 */
function fallbackTrayIcon(): Electron.NativeImage {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="30" fill="#f7f2eb" stroke="#6b8f9e" stroke-width="3"/>
  <circle cx="32" cy="32" r="10" fill="none" stroke="#6b8f9e" stroke-width="2.5"/>
  <circle cx="32" cy="32" r="3" fill="#6b8f9e"/>
</svg>`
  const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
  return nativeImage.createFromDataURL(dataUrl)
}

/** 加载并缩放到适合系统托盘的尺寸 */
export function loadTrayIcon(): Electron.NativeImage {
  const path = resolveTrayIconPath()
  let image = path ? nativeImage.createFromPath(path) : nativeImage.createEmpty()

  if (image.isEmpty()) {
    image = fallbackTrayIcon()
  }

  const size =
    process.platform === 'darwin' ? 22 : process.platform === 'win32' ? 16 : 24

  const sized = image.getSize()
  if (sized.width > size || sized.height > size) {
    return image.resize({ width: size, height: size })
  }
  return image
}
