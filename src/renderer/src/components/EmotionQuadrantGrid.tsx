import {
  QUADRANT_DEFINITIONS,
  type DayQuadrantSummary,
  type QuadrantId
} from '../utils/dayAnalytics'
import { ZH } from '../i18n/zh'

interface Props {
  summary: DayQuadrantSummary
}

/** 2×2 矩阵：上行高唤醒，下行低唤醒；左列消极、右列积极 */
const ORDER: QuadrantId[] = ['hn', 'hp', 'ln', 'lp']

export default function EmotionQuadrantGrid({ summary }: Props): JSX.Element {
  const total = summary.placements.length

  return (
    <section className="insight-panel quadrant-grid">
      <h3>{ZH.quadrantTitle}</h3>
      <p className="hint insight-panel__desc">{ZH.quadrantDesc}</p>

      {total === 0 ? (
        <p className="empty insight-panel__empty">{ZH.quadrantEmpty}</p>
      ) : (
        <>
          <div className="quadrant-matrix" role="img" aria-label={ZH.quadrantTitle}>
            <span className="quadrant-matrix__ylabel">{ZH.quadrantArousalHigh}</span>
            <div className="quadrant-matrix__grid">
              {ORDER.map((id) => {
                const def = QUADRANT_DEFINITIONS.find((q) => q.id === id)!
                const count = summary.counts[id]
                const active = count > 0
                const samples = summary.placements.filter((p) => p.quadrantId === id)
                return (
                  <div
                    key={id}
                    className={`quadrant-cell quadrant-cell--${id} ${active ? 'is-active' : ''}`}
                  >
                    <p className="quadrant-cell__title">{def.title}</p>
                    <p className="quadrant-cell__count">
                      {active ? ZH.quadrantCount(count) : ZH.quadrantCountZero}
                    </p>
                    {active ? (
                      <p className="quadrant-cell__samples">
                        {samples
                          .map((s) => `${s.time} ${s.emotionLabel}`)
                          .slice(0, 3)
                          .join(' · ')}
                      </p>
                    ) : null}
                  </div>
                )
              })}
            </div>
            <span className="quadrant-matrix__ylabel quadrant-matrix__ylabel--low">
              {ZH.quadrantArousalLow}
            </span>
            <span className="quadrant-matrix__xlabel quadrant-matrix__xlabel--neg">
              {ZH.quadrantValenceNeg}
            </span>
            <span className="quadrant-matrix__xlabel quadrant-matrix__xlabel--pos">
              {ZH.quadrantValencePos}
            </span>
          </div>

          <ul className="quadrant-advice-list">
            {ORDER.filter((id) => summary.counts[id] > 0).map((id) => {
              const def = QUADRANT_DEFINITIONS.find((q) => q.id === id)!
              const dominantBodies = [
                ...new Set(
                  summary.placements
                    .filter((p) => p.quadrantId === id)
                    .map((p) => p.bodySummary)
                    .filter((b) => b !== '\u2014')
                )
              ].slice(0, 2)

              return (
                <li key={id} className="quadrant-advice-card">
                  <h4>{def.title}</h4>
                  <p className="quadrant-advice-card__emotions">
                    <strong>{ZH.quadrantEmotionExamples}</strong>
                    {def.exampleEmotions}
                  </p>
                  <p className="quadrant-advice-card__body">
                    <strong>{ZH.quadrantBodyTraits}</strong>
                    {dominantBodies.length > 0
                      ? dominantBodies.join(ZH.emotionJoin)
                      : def.bodyTraits}
                  </p>
                  <p className="quadrant-advice-card__advice">
                    <strong>{ZH.quadrantAdvice}</strong>
                    {def.advice}
                  </p>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </section>
  )
}
