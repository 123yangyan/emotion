import type { TagListsConfig } from '../../../shared/types'
import { defaultTagLists } from '../data/tagLists'
import { ZH } from '../i18n/zh'
import { TagChipFlow } from './TagChipFlow'

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
