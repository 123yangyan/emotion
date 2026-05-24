import type { RecordTagEmotion } from '../../../shared/types'
import { ZH } from '../i18n/zh'
import { getEmotionValencePos } from '../utils/emotionSpectrum'

interface Props {
  emotions: RecordTagEmotion[]
  selectedId: string | undefined
  onPick: (id: string) => void
  compact?: boolean
}

/** 情绪光谱：按 valence 顺序平铺，无垂直分组标签 */
export default function EmotionSpectrumPicker({
  emotions,
  selectedId,
  onPick,
  compact = false
}: Props): JSX.Element {
  return (
    <div className={`emotion-spectrum ${compact ? 'emotion-spectrum--compact' : ''}`}>
      <div className="spectrum-axis" aria-hidden>
        <span className="spectrum-axis__hint">{ZH.spectrumHintPleasant}</span>
        <div className="spectrum-axis__line" />
        <span className="spectrum-axis__hint">{ZH.spectrumHintLow}</span>
      </div>
      <div className="emotion-chips-flow" role="radiogroup" aria-label={ZH.emotionCore}>
        {emotions.map((em) => {
          const pos = getEmotionValencePos(em.id, emotions)
          const checked = selectedId === em.id
          return (
            <button
              key={em.id}
              type="button"
              role="radio"
              aria-checked={checked}
              className={`chip sm emotion-spectrum-chip ${checked ? 'active' : ''}`}
              style={{ '--spectrum-pos': String(pos) } as React.CSSProperties}
              onClick={() => onPick(em.id)}
            >
              {em.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
