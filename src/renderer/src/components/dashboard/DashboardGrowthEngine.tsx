import { ZH } from '../../i18n/zh'
import type { DashboardSeries, DashboardViewModel, ScoreDelta } from '../../utils/dashboardMetrics'
import {
  buildMaSeries,
  buildScoreDeltas,
  computeMovingAverage
} from '../../utils/dashboardMetrics'
import type { AiInsightRow } from '../../../../main/database'
import DashboardSparkline from './DashboardSparkline'

interface EngineCardProps {
  label: string
  value: number | null
  delta: ScoreDelta
  sparkPoints: { date: string; value: number | null }[]
  maPoints: { date: string; value: number | null }[]
  contributors: string[]
  stroke: string
}

function deltaBadge(delta: ScoreDelta): JSX.Element | null {
  if (delta.direction === 'unknown' || delta.delta == null) return null
  const sign = delta.delta > 0 ? '+' : ''
  const arrow = delta.direction === 'up' ? '↑' : delta.direction === 'down' ? '↓' : '→'
  return (
    <span className={`dashboard-v2__delta dashboard-v2__delta--${delta.direction}`}>
      {arrow} {sign}
      {delta.delta} {ZH.dashboardVsYesterday}
    </span>
  )
}

function maVsTodayBadge(value: number | null, ma: number | null): JSX.Element | null {
  if (value == null || ma == null) return null
  const diff = value - ma
  if (diff === 0) return null
  const sign = diff > 0 ? '+' : ''
  return (
    <span className="dashboard-v2__ma-badge" title={ZH.dashboardMaLegend}>
      {ZH.dashboardMaVsToday(sign)}
      {diff}
    </span>
  )
}

function EngineCard({
  label,
  value,
  delta,
  sparkPoints,
  maPoints,
  contributors,
  stroke
}: EngineCardProps): JSX.Element {
  const maEnd = computeMovingAverage(sparkPoints, 7)

  return (
    <article className="dashboard-v2__engine-card">
      <div className="dashboard-v2__engine-head">
        <p className="dashboard-v2__engine-label">{label}</p>
        <p className="dashboard-v2__engine-value">{value == null ? '—' : value}</p>
        {deltaBadge(delta)}
        {maVsTodayBadge(value, maEnd)}
      </div>
      <DashboardSparkline
        points={sparkPoints}
        maPoints={maPoints}
        stroke={stroke}
        className="dashboard-v2__spark"
      />
      <p className="dashboard-v2__spark-legend">{ZH.dashboardMaLegend}</p>
      {contributors.length > 0 ? (
        <ul className="dashboard-v2__contributors">
          {contributors.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      ) : null}
    </article>
  )
}

interface Props {
  view: DashboardViewModel
  insights: AiInsightRow[]
  series: DashboardSeries
}

/** Layer 2：双引擎动能舱 */
export default function DashboardGrowthEngine({ view, insights, series }: Props): JSX.Element {
  const deltas = buildScoreDeltas(view, insights)
  const abilityMa = buildMaSeries(series.ability, 7)
  const experienceMa = buildMaSeries(series.experience, 7)

  return (
    <section className="dashboard-v2__engines" aria-label={ZH.dashboardLayerGrowth}>
      {(view.growthPhaseLabel || view.continuitySummary) && (
        <div className="dashboard-v2__continuity">
          {view.growthPhaseLabel ? (
            <span className="dashboard-v2__phase-badge">{view.growthPhaseLabel}</span>
          ) : null}
          {view.continuitySummary ? (
            <p className="dashboard-v2__continuity-text">{view.continuitySummary}</p>
          ) : null}
        </div>
      )}
      <div className="dashboard-v2__engines-grid">
      <EngineCard
        label={ZH.dashboardAbilityGrowth}
        value={view.scores.ability_growth_score}
        delta={deltas.ability}
        sparkPoints={series.ability}
        maPoints={abilityMa}
        contributors={view.growthContributors}
        stroke="var(--dashboard-ability-stroke)"
      />
      <EngineCard
        label={ZH.dashboardExperienceRichness}
        value={view.scores.experience_richness_score}
        delta={deltas.experience}
        sparkPoints={series.experience}
        maPoints={experienceMa}
        contributors={view.experienceHighlights}
        stroke="var(--dashboard-experience-stroke)"
      />
      </div>
    </section>
  )
}
