import type { AiRelatedEntry } from '../../../../shared/aiInsightManifest'
import { ZH } from '../../i18n/zh'
import type { DashboardViewModel } from '../../utils/dashboardMetrics'

interface Props {
  view: DashboardViewModel
  onEditEntry?: (entryId: number) => void
}

/** Layer 3：5% 微迭代指南 */
export default function DashboardGuidanceCard({ view, onEditEntry }: Props): JSX.Element {
  const entries = view.relatedEntries

  return (
    <section className="dashboard-v2__guidance" aria-label={ZH.dashboardLayerGuidance}>
      <h3 className="dashboard-v2__guidance-title">{ZH.dashboardGuidance}</h3>
      <div className="dashboard-v2__guidance-card">
        {view.guidanceTargetTime ? (
          <span className="dashboard-v2__guidance-time">{view.guidanceTargetTime}</span>
        ) : null}
        <p className="dashboard-v2__guidance-action">
          {view.guidancePrimary || ZH.dashboardGuidanceEmpty}
        </p>
      </div>

      {entries.length > 0 && onEditEntry ? (
        <div className="dashboard-v2__entry-links">
          <p className="dashboard-v2__entry-links-label">{ZH.dashboardRelatedEntries}</p>
          <ul className="dashboard-v2__entry-list">
            {entries.map((e: AiRelatedEntry) => (
              <li key={e.entry_id}>
                <button
                  type="button"
                  className="dashboard-v2__entry-btn"
                  onClick={() => onEditEntry(e.entry_id)}
                >
                  {e.note ? `${e.note}` : ZH.dashboardViewEntry(e.entry_id)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}
