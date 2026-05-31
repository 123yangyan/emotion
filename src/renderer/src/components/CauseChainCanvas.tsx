import type { CauseChainInsight } from '../utils/dayAnalytics'
import { ZH } from '../i18n/zh'

interface Props {
  insights: CauseChainInsight[]
  emotionLabels: Map<string, string>
}

export default function CauseChainCanvas({ insights, emotionLabels }: Props): JSX.Element {
  return (
    <section className="insight-panel cause-canvas">
      <h3>{ZH.causeCanvasTitle}</h3>
      <p className="hint insight-panel__desc">{ZH.causeCanvasDesc}</p>

      {insights.length === 0 ? (
        <p className="empty insight-panel__empty">{ZH.causeCanvasEmpty}</p>
      ) : (
        <ul className="cause-chain-list">
          {insights.map((item, idx) => {
            const facts = item.factPattern.join(ZH.emotionJoin)
            const emotions =
              item.emotionIds
                .map((id) => emotionLabels.get(id) ?? id)
                .join(ZH.emotionJoin) || ZH.causeEmotionUnknown
            const intensityText =
              item.avgIntensity >= 7
                ? String(Math.round(item.avgIntensity))
                : String(Math.round(item.avgIntensity))

            return (
              <li key={`${facts}-${idx}`} className="cause-chain-card">
                <p className="cause-chain-card__badge">{ZH.causeCanvasBadge}</p>
                <p className="cause-chain-card__text">
                  {ZH.causeInsightIntro}
                  <strong>[{ZH.causeFactLabel}{facts}]</strong>
                  {ZH.causeInsightRate(item.triggerRate)}
                  {ZH.causeInsightTail}
                  <strong>
                    [{ZH.causeEmotionLabel}
                    {emotions}
                    {ZH.causeIntensityWrap(intensityText)}]
                  </strong>
                  。
                </p>
                <p className="cause-chain-card__meta">
                  {ZH.causeMeta(item.matchCount, item.factCount)}
                  {item.lowConfidence ? ` · ${ZH.causeLowConfidence}` : ''}
                </p>
                <div className="cause-flow" aria-hidden>
                  <span className="cause-flow__node cause-flow__node--in">{ZH.causeFlowFact}</span>
                  <span className="cause-flow__arrow" />
                  <span className="cause-flow__node cause-flow__node--out">{ZH.causeFlowEmotion}</span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
