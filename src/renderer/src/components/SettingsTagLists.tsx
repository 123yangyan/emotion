import type { TagListsConfig } from '../../../shared/types'
import { defaultTagLists, makeTagId } from '../data/tagLists'
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

  return (
    <div className="tag-edit-panel">
      <h2>{ZH.tagListsTitle}</h2>
      <p className="hint">{ZH.tagListsDesc}</p>

      <section className="tag-edit-section">
        <h3>{ZH.emotion}</h3>
        <p className="hint">{ZH.tagEmotionHint}</p>
        <div className="tag-edit-polarity tag-edit-polarity--negative">
          <h4>{POLARITY_LABEL.negative}</h4>
          <IdChipFlow
            items={value.emotionsNegative}
            tone="negative"
            placeholder={ZH.tagEmotionPlaceholder}
            makeId={(label) => makeTagId('emo_negative', label)}
            onChange={(emotionsNegative) => patch({ emotionsNegative })}
            onRestore={() => patch({ emotionsNegative: defaults.emotionsNegative })}
          />
        </div>
        <div className="tag-edit-polarity tag-edit-polarity--positive">
          <h4>{POLARITY_LABEL.positive}</h4>
          <IdChipFlow
            items={value.emotionsPositive}
            tone="positive"
            placeholder={ZH.tagEmotionPlaceholder}
            makeId={(label) => makeTagId('emo_positive', label)}
            onChange={(emotionsPositive) => patch({ emotionsPositive })}
            onRestore={() => patch({ emotionsPositive: defaults.emotionsPositive })}
          />
        </div>
      </section>

      <section className="tag-edit-section">
        <h3>{ZH.objectiveFact}</h3>
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

      <section className="tag-edit-section">
        <h3>{ZH.bodyMind}</h3>
        <p className="hint">{ZH.tagBodyHint}</p>
        <div className="tag-edit-polarity tag-edit-polarity--neutral">
          <h4>{ZH.body}</h4>
          <TagChipFlow
            items={value.bodyTags}
            tone="neutral"
            onChange={(bodyTags) => patch({ bodyTags })}
            onRestore={() => patch({ bodyTags: defaults.bodyTags })}
          />
        </div>
        <div className="tag-edit-polarity tag-edit-polarity--behavior">
          <h4>{ZH.behavior}</h4>
          <IdChipFlow
            items={value.behaviorTags}
            tone="behavior"
            placeholder={ZH.tagBehaviorPlaceholder}
            makeId={(label) => makeTagId('behavior', label)}
            onChange={(behaviorTags) => patch({ behaviorTags })}
            onRestore={() => patch({ behaviorTags: defaults.behaviorTags })}
          />
        </div>
      </section>
    </div>
  )
}
