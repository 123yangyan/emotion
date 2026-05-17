import { getIntensityTheme } from '../utils/intensityTheme'
import { ZH } from '../i18n/zh'

interface Props {
  intensity: number
  levels: number[]
  onPick: (n: number) => void
  /** 底部提示文案，弹窗传键盘快捷键，记录页可省略 */
  hint?: string
}

/** 1–9 强度色条：弹窗与记录页共用，左侧蓝 → 右侧红，已选档位左侧累积填色 */
export default function IntensityEnergyBar({
  intensity,
  levels,
  onPick,
  hint
}: Props): JSX.Element {
  return (
    <>
      <div className="energy-bar" role="group" aria-label={ZH.moodIntensity}>
        {levels.map((n) => {
          const filled = n <= intensity
          const active = n === intensity
          const theme = getIntensityTheme(n)
          return (
            <button
              key={n}
              type="button"
              className={`energy-bar__seg ${filled ? 'is-filled' : ''} ${active ? 'is-active' : ''}`}
              style={{
                background: filled ? theme.btnBgActive : theme.btnBg,
                color: filled ? theme.btnTextActive : '#4a5568'
              }}
              onClick={() => onPick(n)}
              aria-pressed={active}
              aria-label={ZH.intensityLabel(n)}
            >
              {n}
            </button>
          )
        })}
      </div>
      {hint ? <p className="checkin-energy__hint">{hint}</p> : null}
    </>
  )
}
