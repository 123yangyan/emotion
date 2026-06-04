import { useCallback, useEffect, useMemo, useState } from 'react'
import type { AiInsightRow, EntryRow } from '../../../main/database'
import { beijingDayBounds, todayBeijingDateKey } from '../../../shared/beijingTime'
import { ZH } from '../i18n/zh'
import { useAiInsightsRefresh } from '../hooks/useDataRefresh'
import { formatDiaryDateLabel } from '../utils/historyRowPreview'
import { buildCoordDriftView } from '../utils/coordDriftAnalytics'
import {
  buildDashboardSeries,
  buildDashboardView,
  dateKeysEndingAt,
  findInsightByDate
} from '../utils/dashboardMetrics'
import { useEntriesRefresh } from '../hooks/useDataRefresh'
import DashboardStateAlert from './dashboard/DashboardStateAlert'
import DashboardGrowthEngine from './dashboard/DashboardGrowthEngine'
import DashboardTagStrip from './dashboard/DashboardTagStrip'
import DashboardGuidanceCard from './dashboard/DashboardGuidanceCard'

/** 北京时间日期键 ±N 天 */
function shiftBeijingDateKey(dateKey: string, deltaDays: number): string {
  const [y, m, d] = dateKey.split('-').map(Number)
  const local = new Date(y, m - 1, d)
  local.setDate(local.getDate() + deltaDays)
  const yy = local.getFullYear()
  const mm = String(local.getMonth() + 1).padStart(2, '0')
  const dd = String(local.getDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}

function recentDateKeys(count: number): string[] {
  const today = todayBeijingDateKey()
  const keys: string[] = []
  for (let i = 0; i < count; i++) {
    keys.push(shiftBeijingDateKey(today, -i))
  }
  return keys
}

interface DashboardPageProps {
  onEditEntry?: (entryId: number) => void
  onViewInsight?: () => void
}

export default function DashboardPage({
  onEditEntry,
  onViewInsight
}: DashboardPageProps): JSX.Element {
  const [insights, setInsights] = useState<AiInsightRow[]>([])
  const [weekEntries, setWeekEntries] = useState<EntryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(() => todayBeijingDateKey())

  const dateOptions = useMemo(() => recentDateKeys(7), [])

  const load = useCallback(async () => {
    setLoading(true)
    const rows = await window.api.getAiInsights()
    setInsights(rows)
    setLoading(false)
  }, [])

  const loadWeekEntries = useCallback(async (endDate: string) => {
    const keys = dateKeysEndingAt(endDate, 7)
    const startIso = beijingDayBounds(keys[0]).startIso
    const endIso = beijingDayBounds(keys[keys.length - 1]).endIso
    const rows = await window.api.listEntriesBetween(startIso, endIso)
    setWeekEntries(rows)
  }, [])

  useAiInsightsRefresh(() => {
    void load()
  }, [load])

  useEntriesRefresh(() => {
    void loadWeekEntries(selectedDate)
  }, [loadWeekEntries, selectedDate])

  useEffect(() => {
    void loadWeekEntries(selectedDate)
  }, [selectedDate, loadWeekEntries])

  useEffect(() => {
    if (!dateOptions.includes(selectedDate)) {
      setSelectedDate(dateOptions[0] ?? todayBeijingDateKey())
    }
  }, [dateOptions, selectedDate])

  const insightForDate = useMemo(
    () => findInsightByDate(insights, selectedDate),
    [insights, selectedDate]
  )

  const view = useMemo(
    () => buildDashboardView(insightForDate, insights),
    [insightForDate, insights]
  )

  const series = useMemo(
    () => buildDashboardSeries(insights, selectedDate, 7),
    [insights, selectedDate]
  )

  const drift = useMemo(
    () => buildCoordDriftView(weekEntries, selectedDate, 7),
    [weekEntries, selectedDate]
  )

  const todayKey = todayBeijingDateKey()

  if (loading) {
    return <p className="hint">{ZH.loading}</p>
  }

  return (
    <div className="dashboard-v2">
      <header className="dashboard-v2__header">
        <div>
          <h2>{ZH.dashboardTitle}</h2>
          <p className="dashboard-v2__desc">{ZH.dashboardDesc}</p>
        </div>
        <label className="dashboard-v2__date-select">
          <span className="dashboard-v2__date-label">{ZH.dashboardSelectDate}</span>
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            aria-label={ZH.dashboardSelectDate}
          >
            {dateOptions.map((dk) => (
              <option key={dk} value={dk}>
                {dk === todayKey
                  ? `${formatDiaryDateLabel(dk)}（${ZH.dashboardDateToday}）`
                  : dk === shiftBeijingDateKey(todayKey, -1)
                    ? `${formatDiaryDateLabel(dk)}（${ZH.dashboardDateYesterday}）`
                    : formatDiaryDateLabel(dk)}
              </option>
            ))}
          </select>
        </label>
      </header>

      {!view || !view.hasContent ? (
        <div className="dashboard-v2__empty">
          <p>{ZH.dashboardEmpty}</p>
          <p className="hint">{ZH.dashboardEmptyHint}</p>
        </div>
      ) : (
        <>
          <DashboardStateAlert view={view} drift={drift} />
          <DashboardGrowthEngine view={view} insights={insights} series={series} />
          <DashboardTagStrip tags={view.valueEnergyTags} />
          <DashboardGuidanceCard view={view} onEditEntry={onEditEntry} />
        </>
      )}

      {onViewInsight ? (
        <p className="dashboard-v2__insight-link-wrap">
          <button type="button" className="dashboard-v2__insight-link" onClick={onViewInsight}>
            {ZH.dashboardViewFullInsight}
          </button>
        </p>
      ) : null}
    </div>
  )
}
