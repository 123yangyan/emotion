import type { MoodTrend } from '../../../../shared/aiInsightManifest'
import { ZH } from '../../i18n/zh'
import { riskClass } from '../../utils/aiInsightParse'
import type { CoordDriftViewModel } from '../../utils/coordDriftAnalytics'
import type { DashboardViewModel } from '../../utils/dashboardMetrics'
import DashboardCoordDrift from './DashboardCoordDrift'

interface Props {
  view: DashboardViewModel
  drift: CoordDriftViewModel
}

function trendArrow(trend: MoodTrend): string {
  if (trend === 'up') return '↑'
  if (trend === 'down') return '↓'
  return '→'
}

function trendAria(trend: MoodTrend): string {
  if (trend === 'up') return ZH.dashboardTrendUp
  if (trend === 'down') return ZH.dashboardTrendDown
  return ZH.dashboardTrendStable
}

/** Layer 1：身心状态与风险预警 */
export default function DashboardStateAlert({ view, drift }: Props): JSX.Element {
  const mood = view.scores.mood_index
  const pct = mood ?? 0

  return (
    <section className="dashboard-v2__alert" aria-label={ZH.dashboardLayerAlert}>
      <div className="dashboard-v2__mood-gauge">
        <div
          className="dashboard-v2__mood-ring"
          style={{
            background: `conic-gradient(var(--dashboard-mood-fill) ${pct * 3.6}deg, var(--dashboard-mood-track) 0)`
          }}
          role="img"
          aria-label={ZH.dashboardMoodIndex}
        >
          <div className="dashboard-v2__mood-ring-inner">
            <span className="dashboard-v2__mood-value">{mood == null ? '—' : mood}</span>
            <span
              className={`dashboard-v2__mood-trend dashboard-v2__mood-trend--${view.moodTrend}`}
              aria-label={trendAria(view.moodTrend)}
            >
              {trendArrow(view.moodTrend)}
            </span>
          </div>
        </div>
        <p className="dashboard-v2__mood-label">{ZH.dashboardMoodIndex}</p>
        {view.moodContext ? (
          <p className="dashboard-v2__mood-context">{view.moodContext}</p>
        ) : null}
      </div>

      <DashboardCoordDrift drift={drift} />

      <div className="dashboard-v2__risk-block">
        <h3 className="dashboard-v2__risk-heading">{ZH.dashboardRisk}</h3>
        {view.riskLevel ? (
          <div className="dashboard-v2__risk-line">
            <span className={`ai-insight-risk ${riskClass(view.riskLevel)}`}>
              {ZH.insightRiskLevel(view.riskLevel)}
            </span>
            {view.riskReason ? (
              <span className="dashboard-v2__risk-reason">：{view.riskReason}</span>
            ) : null}
          </div>
        ) : (
          <span className="hint">—</span>
        )}
      </div>
    </section>
  )
}
