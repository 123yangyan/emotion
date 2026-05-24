import type { TagListsConfig } from '../../../shared/types'
import { defaultTagLists, makeTagId, syncEmotionSpectrum } from '../data/tagLists'
import { POLARITY_LABEL } from '../data/emotions'
import { ZH } from '../i18n/zh'
import { IdChipFlow, TagChipFlow } from './TagChipFlow'

interface Props {
  value: TagListsConfig
  onChange: (next: TagListsConfig) => void
}

export default function SettingsTagLists({ value, onChange }: Props): JSX.Element {
  const defaults = defaultTagLists()

  const patch = (partial: Partial<TagListsConfig>): void => {
    onChange({ ...value, ...partial })
  }

  /** 编辑情绪三组后自动重建光谱，保证录入页与设置同步 */
  const patchEmotions = (partial: Partial<TagListsConfig>): void => {
    onChange(syncEmotionSpectrum({ ...value, ...partial }))
  }

  return (
    <div className="tag-edit-panel">
      <h2>{ZH.tagListsTitle}</h2>
      <p className="hint">{ZH.tagListsDesc}</p>

      <section className="tag-edit-section">
        <h3>{ZH.emotionCore}</h3>
        <p className="hint">{ZH.tagEmotionHint}</p>
        <div className="tag-edit-polarity tag-edit-polarity--positive">
          <h4>{POLARITY_LABEL.positive}</h4>
          <IdChipFlow
            items={value.emotionsPositive}
            tone="positive"
            placeholder={ZH.tagEmotionPlaceholder}
            makeId={(label) => makeTagId('emo_positive', label)}
            onChange={(emotionsPositive) => patchEmotions({ emotionsPositive })}
            onRestore={() => patchEmotions({ emotionsPositive: defaults.emotionsPositive })}
          />
        </div>
        <div className="tag-edit-polarity tag-edit-polarity--neutral">
          <h4>{POLARITY_LABEL.neutral}</h4>
          <IdChipFlow
            items={value.emotionsNeutral ?? defaults.emotionsNeutral ?? []}
            tone="neutral"
            placeholder={ZH.tagEmotionPlaceholder}
            makeId={(label) => makeTagId('emo_neutral', label)}
            onChange={(emotionsNeutral) => patchEmotions({ emotionsNeutral })}
            onRestore={() => patchEmotions({ emotionsNeutral: defaults.emotionsNeutral })}
          />
        </div>
        <div className="tag-edit-polarity tag-edit-polarity--negative">
          <h4>{POLARITY_LABEL.negative}</h4>
          <IdChipFlow
            items={value.emotionsNegative}
            tone="negative"
            placeholder={ZH.tagEmotionPlaceholder}
            makeId={(label) => makeTagId('emo_negative', label)}
            onChange={(emotionsNegative) => patchEmotions({ emotionsNegative })}
            onRestore={() => patchEmotions({ emotionsNegative: defaults.emotionsNegative })}
          />
        </div>
      </section>

      <section className="tag-edit-section">
        <h3>{ZH.factSceneTitle}</h3>
        <p className="hint">{ZH.tagFactHint}</p>
        <TagChipFlow
          items={value.factScenes}
          tone="scene"
          onChange={(factScenes) => patch({ factScenes })}
          onRestore={() => patch({ factScenes: defaults.factScenes })}
        />
      </section>

      <section className="tag-edit-section">
        <h3>{ZH.subjectiveThought}</h3>
        <p className="hint">{ZH.tagThoughtHint}</p>
        <TagChipFlow
          items={value.thoughtTags}
          tone="thought"
          onChange={(thoughtTags) => patch({ thoughtTags })}
          onRestore={() => patch({ thoughtTags: defaults.thoughtTags })}
        />
      </section>
    </div>
  )
}
