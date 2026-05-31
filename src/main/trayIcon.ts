import { nativeImage } from 'electron'

/** RGBA 颜色元组 */
type RGBA = [number, number, number, number]

/** 判断 (px, py) 是否在圆角矩形内部 */
function inRoundRect(
  px: number,
  py: number,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): boolean {
  if (px < x || px >= x + w || py < y || py >= y + h) return false
  const cx = Math.min(px - x, x + w - 1 - px)
  const cy = Math.min(py - y, y + h - 1 - py)
  if (cx >= r || cy >= r) return true
  const dx = r - cx
  const dy = r - cy
  return dx * dx + dy * dy <= r * r
}

/**
 * 用像素位图生成四象限托盘图标（PNG 格式，Windows 兼容）：
 *   左上 紫红 → 内耗陷阱
 *   右上 琥珀橙 → 攻坚区
 *   左下 冷蓝灰 → 机械区
 *   右下 翠绿 → 心流区
 */
function buildTrayIcon(size: number): Electron.NativeImage {
  const s = size
  // BGRA buffer（Electron createFromBitmap 要求 BGRA 字节序）
  const buf = Buffer.alloc(s * s * 4)

  const BG: RGBA = [245, 240, 230, 255] // #f5f0e6 暖米色背景
  const TL: RGBA = [194, 80, 112, 255]  // #c25070 内耗陷阱·紫红
  const TR: RGBA = [200, 96, 40, 255]   // #c86028 攻坚区·琥珀橙
  const BL: RGBA = [76, 104, 152, 255]  // #4c6898 机械区·冷蓝灰
  const BR: RGBA = [40, 144, 74, 255]   // #28904a 心流区·翠绿

  // 外框圆角半径 & 内格参数（按比例适配不同尺寸）
  const outerR = Math.round(s * 0.18)
  const pad = Math.max(1, Math.round(s * 0.07))  // 外边距
  const gap = Math.max(1, Math.round(s * 0.05))  // 格间距
  const half = Math.floor((s - pad * 2 - gap) / 2)
  const cellR = Math.max(1, Math.round(half * 0.22))

  // 四格起始坐标
  const x1 = pad, y1 = pad
  const x2 = pad + half + gap, y2 = pad
  const x3 = pad, y3 = pad + half + gap
  const x4 = pad + half + gap, y4 = pad + half + gap

  const setPixel = (px: number, py: number, c: RGBA): void => {
    const i = (py * s + px) * 4
    buf[i] = c[2]; buf[i + 1] = c[1]; buf[i + 2] = c[0]; buf[i + 3] = c[3]
  }

  for (let py = 0; py < s; py++) {
    for (let px = 0; px < s; px++) {
      if (inRoundRect(px, py, x1, y1, half, half, cellR)) setPixel(px, py, TL)
      else if (inRoundRect(px, py, x2, y2, half, half, cellR)) setPixel(px, py, TR)
      else if (inRoundRect(px, py, x3, y3, half, half, cellR)) setPixel(px, py, BL)
      else if (inRoundRect(px, py, x4, y4, half, half, cellR)) setPixel(px, py, BR)
      else if (inRoundRect(px, py, 0, 0, s, s, outerR)) setPixel(px, py, BG)
      // 完全透明（圆角之外）
    }
  }

  return nativeImage.createFromBitmap(buf, { width: s, height: s })
}

/** 托盘图标：Windows=16 · macOS=22 · Linux=24 */
export function loadTrayIcon(): Electron.NativeImage {
  const size =
    process.platform === 'darwin' ? 22 : process.platform === 'win32' ? 16 : 24
  return buildTrayIcon(size)
}

/** 任务栏 / 窗口图标（256×256，适配 Windows 高清任务栏） */
export function loadWindowIcon(): Electron.NativeImage {
  return buildTrayIcon(256)
}
