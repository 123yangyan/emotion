import { QUADRANT_DEFINITIONS, type DayQuadrantSummary, type QuadrantId } from '../utils/dayAnalytics'
import { ZH } from '../i18n/zh'

interface Props {
  summary: DayQuadrantSummary
}

const ORDER: QuadrantId[] = ['tl', 'tr', 'bl', 'br']

/** 2×2 行为激活矩阵：左=排斥/右=愉悦，上=高耗能/下=轻松 */
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
                          .map((s) => {
                            const xStr = s.coordX > 0 ? `+${s.coordX}` : String(s.coordX)
                            const yStr = s.coordY > 0 ? `+${s.coordY}` : String(s.coordY)
                            return `${s.time} (${xStr},${yStr})`
                          })
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
              return (
                <li key={id} className="quadrant-advice-card">
                  <h4>{def.title}</h4>
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
