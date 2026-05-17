import type { CSSProperties } from 'react'

/** 心情强度 1–9：蓝 → 红 平滑色阶 */
export interface IntensityTheme {
  /** 未选中 / 未填充段底色 */
  btnBg: string
  /** 已填充段底色 */
  btnBgActive: string
  /** 已填充段文字 */
  btnTextActive: string
  /** 强度卡片背景 tint */
  zoneTint: string
  /** 强度卡片光晕 */
  zoneGlow: string
}

/** 在两端数值之间按比例 t（0~1）插值 */
function mix(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t)
}

/** 将 RGB 分量转为 #rrggbb */
function toHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

/** 按档位 index（0~8）生成该档主题色 */
function buildStop(index: number): IntensityTheme {
  const t = index / 8
  // 1 档偏蓝，9 档偏红
  const rA = mix(58, 214, t)
  const gA = mix(120, 68, t)
  const bA = mix(210, 72, t)
  const btnBgActive = toHex(rA, gA, bA)

  const rL = mix(232, 252, t)
  const gL = mix(240, 232, t)
  const bL = mix(250, 234, t)
  const btnBg = toHex(rL, gL, bL)

  const rZ = mix(244, 255, t)
  const gZ = mix(248, 244, t)
  const bZ = mix(252, 244, t)
  const zoneTint = toHex(rZ, gZ, bZ)
  const zoneGlow = `rgba(${rA}, ${gA}, ${bA}, ${(0.22 + t * 0.22).toFixed(2)})`

  return {
    btnBg,
    btnBgActive,
    btnTextActive: '#ffffff',
    zoneTint,
    zoneGlow
  }
}

const STOPS: IntensityTheme[] = Array.from({ length: 9 }, (_, i) => buildStop(i))

export function getIntensityTheme(level: number): IntensityTheme {
  const i = Math.min(9, Math.max(1, Math.round(level))) - 1
  return STOPS[i]
}

export function intensityButtonStyle(
  level: number,
  selected: boolean
): CSSProperties {
  const t = getIntensityTheme(level)
  return {
    background: selected ? t.btnBgActive : t.btnBg,
    color: selected ? t.btnTextActive : '#5c6570',
    borderColor: 'transparent',
    boxShadow: selected ? `0 4px 14px ${t.zoneGlow}` : 'none'
  }
}

export function intensityZoneStyle(level: number): CSSProperties {
  const t = getIntensityTheme(level)
  return {
    background: `linear-gradient(145deg, ${t.zoneTint} 0%, #ffffff 72%)`,
    boxShadow: `0 2px 8px rgba(60, 55, 50, 0.04), 0 12px 32px ${t.zoneGlow}`,
    ['--zone-glow' as string]: t.zoneGlow
  }
}
