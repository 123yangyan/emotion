import type { PanoramaFrequencies } from '../../utils/panoramaAnalytics'
import { ZH } from '../../i18n/zh'

interface Props {
  frequencies: PanoramaFrequencies
}

function RankList({
  title,
  items,
  emptyHint
}: {
  title: string
  items: { label: string; count: number }[]
  emptyHint: string
}): JSX.Element {
  return (
    <div className="freq-block">
      <h4>{title}</h4>
      {items.length === 0 ? (
        <p className="hint freq-empty">{emptyHint}</p>
      ) : (
        <ol className="freq-list">
          {items.map((item, i) => (
            <li key={item.label}>
              <span className="freq-rank">{i + 1}</span>
              <span className="freq-label">{item.label}</span>
              <span className="freq-count">{item.count}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

/** 侧边栏：高频定音鼓（纯计数，不做因果推断） */
export default function FrequencyPanel({ frequencies }: Props): JSX.Element {
  return (
    <aside className="panorama-freq" aria-label={ZH.panoramaFreqTitle}>
      <h3>{ZH.panoramaFreqTitle}</h3>
      <p className="hint panorama-freq__desc">{ZH.panoramaFreqDesc}</p>
      <RankList
        title={ZH.panoramaFreqEmotion}
        items={frequencies.negativeEmotions}
        emptyHint={ZH.panoramaFreqEmpty}
      />
      <RankList
        title={ZH.panoramaFreqThought}
        items={frequencies.thoughts}
        emptyHint={ZH.panoramaFreqEmpty}
      />
      <RankList
        title={ZH.panoramaFreqBody}
        items={frequencies.bodyReactions}
        emptyHint={ZH.panoramaFreqEmpty}
      />
    </aside>
  )
}
