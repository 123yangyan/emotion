import type { FrequencyItem, PanoramaFrequencies } from '../../utils/panoramaAnalytics'
import { ZH } from '../../i18n/zh'

interface Props {
  frequencies: PanoramaFrequencies
  activeLabel: string | null
  onItemClick: (item: FrequencyItem) => void
}

function RankList({
  title,
  items,
  emptyHint,
  activeLabel,
  onItemClick
}: {
  title: string
  items: FrequencyItem[]
  emptyHint: string
  activeLabel: string | null
  onItemClick: (item: FrequencyItem) => void
}): JSX.Element {
  return (
    <div className="freq-block">
      <h4>{title}</h4>
      {items.length === 0 ? (
        <p className="hint freq-empty">{emptyHint}</p>
      ) : (
        <ol className="freq-list">
          {items.map((item, i) => {
            const active = activeLabel === item.label
            return (
              <li key={item.label}>
                <button
                  type="button"
                  className={`freq-item ${active ? 'is-active' : ''}`}
                  onClick={() => onItemClick(item)}
                  aria-pressed={active}
                >
                  <span className="freq-rank">{i + 1}</span>
                  <span className="freq-label">{item.label}</span>
                  <span className="freq-count">{item.count}</span>
                </button>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}

/** 侧边栏：高频定音鼓（点击可高亮图表上的相关记录） */
export default function FrequencyPanel({ frequencies, activeLabel, onItemClick }: Props): JSX.Element {
  return (
    <aside className="panorama-freq" aria-label={ZH.panoramaFreqTitle}>
      <h3>{ZH.panoramaFreqTitle}</h3>
      <p className="hint panorama-freq__desc">{ZH.panoramaFreqDesc}</p>
      <RankList
        title={ZH.panoramaFreqEmotionPleasant}
        items={frequencies.pleasantEmotions}
        emptyHint={ZH.panoramaFreqEmpty}
        activeLabel={activeLabel}
        onItemClick={onItemClick}
      />
      <RankList
        title={ZH.panoramaFreqEmotionSteady}
        items={frequencies.steadyEmotions}
        emptyHint={ZH.panoramaFreqEmpty}
        activeLabel={activeLabel}
        onItemClick={onItemClick}
      />
      <RankList
        title={ZH.panoramaFreqEmotionLow}
        items={frequencies.lowEmotions}
        emptyHint={ZH.panoramaFreqEmpty}
        activeLabel={activeLabel}
        onItemClick={onItemClick}
      />
      <RankList
        title={ZH.panoramaFreqThought}
        items={frequencies.thoughts}
        emptyHint={ZH.panoramaFreqEmpty}
        activeLabel={activeLabel}
        onItemClick={onItemClick}
      />
      <RankList
        title={ZH.panoramaFreqBody}
        items={frequencies.bodyReactions}
        emptyHint={ZH.panoramaFreqEmpty}
        activeLabel={activeLabel}
        onItemClick={onItemClick}
      />
    </aside>
  )
}
