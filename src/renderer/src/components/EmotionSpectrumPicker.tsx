import type { RecordTagEmotion } from '../../../shared/types'
import { ZH } from '../i18n/zh'

export interface EmotionZoneGroups {
  positive: RecordTagEmotion[]
  neutral: RecordTagEmotion[]
  negative: RecordTagEmotion[]
}

interface Props {
  /** 平铺模式下的完整光谱（弹窗 compact 用） */
  emotions: RecordTagEmotion[]
  selectedId: string | undefined
  onPick: (id: string) => void
  compact?: boolean
  /** 全景三列模式：左充电 / 中观察 / 右扮演 */
  layout?: 'flow' | 'panorama'
  groups?: EmotionZoneGroups
  /** 全景模式下是否显示顶部渐变轴 */
  showAxis?: boolean
}

type ZoneKey = keyof EmotionZoneGroups

const PANORAMA_ZONES: {
  key: ZoneKey
  tone: 'positive' | 'neutral' | 'negative'
  label: string
}[] = [
  { key: 'positive', tone: 'positive', label: ZH.spectrumHintPleasant },
  { key: 'neutral', tone: 'neutral', label: ZH.spectrumHintNeutral },
  { key: 'negative', tone: 'negative', label: ZH.spectrumHintLow }
]

function ZoneChips({
  items,
  tone,
  selectedId,
  onPick
}: {
  items: RecordTagEmotion[]
  tone: 'positive' | 'neutral' | 'negative'
  selectedId: string | undefined
  onPick: (id: string) => void
}): JSX.Element {
  return (
    <div className={`spectrum-zone__chips spectrum-zone__chips--${tone}`}>
      {items.map((em) => {
        const checked = selectedId === em.id
        return (
          <button
            key={em.id}
            type="button"
            role="radio"
            aria-checked={checked}
            className={`chip sm emotion-zone-chip emotion-zone-chip--${tone} ${checked ? 'active' : ''}`}
            onClick={() => onPick(em.id)}
          >
            {em.label}
          </button>
        )
      })}
    </div>
  )
}

/** 系统状态光谱：flow 平铺 或 panorama 三列全景 */
export default function EmotionSpectrumPicker({
  emotions,
  selectedId,
  onPick,
  compact = false,
  layout = 'flow',
  groups,
  showAxis = true
}: Props): JSX.Element {
  if (layout === 'panorama' && groups) {
    return (
      <div
        className={`emotion-spectrum emotion-spectrum--panorama ${compact ? 'emotion-spectrum--compact' : ''}${!showAxis ? ' emotion-spectrum--no-axis' : ''}`}
      >
        {showAxis ? (
          <div className="spectrum-axis" aria-hidden>
            <span className="spectrum-axis__hint">{ZH.spectrumHintPleasant}</span>
            <div className="spectrum-axis__line" />
            <span className="spectrum-axis__hint">{ZH.spectrumHintLow}</span>
          </div>
        ) : null}
        <div className="spectrum-panorama" role="radiogroup" aria-label={ZH.emotionCore}>
          {PANORAMA_ZONES.map(({ key, tone, label }) => (
            <div key={key} className={`spectrum-zone spectrum-zone--${tone}`}>
              <span className="spectrum-zone__label">{label}</span>
              <ZoneChips
                items={groups[key]}
                tone={tone}
                selectedId={selectedId}
                onPick={onPick}
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`emotion-spectrum ${compact ? 'emotion-spectrum--compact' : ''}`}>
      <div className="spectrum-axis" aria-hidden>
        <span className="spectrum-axis__hint">{ZH.spectrumHintPleasant}</span>
        <div className="spectrum-axis__line" />
        <span className="spectrum-axis__hint">{ZH.spectrumHintLow}</span>
      </div>
      <div className="emotion-chips-flow" role="radiogroup" aria-label={ZH.emotionCore}>
        {emotions.map((em) => {
          const checked = selectedId === em.id
          return (
            <button
              key={em.id}
              type="button"
              role="radio"
              aria-checked={checked}
              className={`chip sm emotion-spectrum-chip ${checked ? 'active' : ''}`}
              style={
                {
                  '--spectrum-pos': String(
                    emotions.findIndex((e) => e.id === em.id) / Math.max(emotions.length - 1, 1)
                  )
                } as React.CSSProperties
              }
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
