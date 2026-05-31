/** 前端 5 档 UI 对应的后端强度值（1–9 量表） */
export const INTENSITY_TIERS = [1, 3, 5, 7, 9] as const

export type IntensityTier = 1 | 2 | 3 | 4 | 5

/** 将数据库强度（1–9）映射到 UI 档位（1–5） */
export function intensityToTier(intensity: number): IntensityTier {
  const n = Math.min(9, Math.max(1, Math.round(intensity)))
  if (n <= 1) return 1
  if (n <= 3) return 2
  if (n <= 5) return 3
  if (n <= 7) return 4
  return 5
}

/** 将 UI 档位（1–5）映射为保存用的强度值 */
export function tierToIntensity(tier: number): number {
  const idx = Math.min(5, Math.max(1, Math.round(tier))) - 1
  return INTENSITY_TIERS[idx]
}
