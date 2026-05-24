import { intensityToTier, tierToIntensity, type IntensityTier } from '../utils/intensityTier'
import { ZH } from '../i18n/zh'

interface Props {
  /** 后端强度 1–9；组件内部映射为 5 档 UI */
  intensity: number
  onPick: (intensity: number) => void
}

const TIER_STYLES: Record<
  IntensityTier,
  { className: string; label: string }
> = {
  1: { className: 'energy-block--1', label: ZH.energyTier1 },
  2: { className: 'energy-block--2', label: ZH.energyTier2 },
  3: { className: 'energy-block--3', label: ZH.energyTier3 },
  4: { className: 'energy-block--4', label: ZH.energyTier4 },
  5: { className: 'energy-block--5', label: ZH.energyTier5 }
}

/** 5 档负荷方块：替代 1–9 滑条，选中时向下投影指向系统状态区 */
export default function EnergyBlockGrid({ intensity, onPick }: Props): JSX.Element {
  const activeTier = intensityToTier(intensity)
  const tiers = [1, 2, 3, 4, 5] as IntensityTier[]

  return (
    <div className="energy-grid" role="group" aria-label={ZH.moodIntensity}>
      {tiers.map((tier) => {
        const { className, label } = TIER_STYLES[tier]
        const active = tier === activeTier
        return (
          <button
            key={tier}
            type="button"
            className={`energy-block ${className}${active ? ' is-active' : ''}`}
            aria-pressed={active}
            aria-label={ZH.energyTierLabel(tier, label)}
            onClick={() => onPick(tierToIntensity(tier))}
          >
            {tier} | {label}
          </button>
        )
      })}
    </div>
  )
}
