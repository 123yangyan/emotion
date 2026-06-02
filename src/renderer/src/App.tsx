import { useEffect, useState } from 'react'
import RecordForm from './components/RecordForm'
import DayChart from './components/DayChart'
import AnalysisPage from './components/AnalysisPage'
import EntryHistoryPage from './components/EntryHistoryPage'
import SettingsPage from './components/SettingsPage'
import AiInsightPage from './components/AiInsightPage'
import CheckInPanel from './components/CheckInPanel'
import { ZH } from './i18n/zh'

type Tab = 'record' | 'history' | 'chart' | 'analysis' | 'insight' | 'settings'

/** 设为 true 可在顶栏重新显示「今日曲线」页签（含四象限矩阵，DayChart 组件仍保留） */
const SHOW_CHART_TAB = true

const TABS: { id: Tab; label: string }[] = [
  { id: 'record', label: ZH.tabRecord },
  { id: 'history', label: ZH.tabHistory },
  { id: 'chart', label: ZH.tabChart },
  { id: 'analysis', label: ZH.tabAnalysis },
  { id: 'insight', label: ZH.tabInsight },
  { id: 'settings', label: ZH.tabSettings }
]

const NAV_TABS = SHOW_CHART_TAB ? TABS : TABS.filter((t) => t.id !== 'chart')

function isCheckInPopup(): boolean {
  const mode = new URLSearchParams(window.location.search).get('mode') ?? ''
  return mode === 'checkin' || mode === 'fatigue_check'
}

export default function App() {
  const [tab, setTab] = useState<Tab>('record')
  const [toast, setToast] = useState('')
  const [tagListsVersion, setTagListsVersion] = useState(0)
  const [historyEditId, setHistoryEditId] = useState<number | null>(null)

  useEffect(() => {
    if (!window.api?.hasEntryToday) return
    void window.api.hasEntryToday()
  }, [])

  const showToast = (msg: string): void => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  if (isCheckInPopup()) {
    return <CheckInPanel />
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__inner">
          <div className="app-header__brand">
            <h1>{ZH.appTitle}</h1>
            <p className="app-header__tagline">{ZH.appSubtitle}</p>
          </div>
          <nav className="app-header__nav" aria-label="主导航">
            {NAV_TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                className={`app-header__tab ${tab === t.id ? 'is-active' : ''}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className={tab === 'record' ? 'main main--record' : 'main'}>
        {tab === 'record' && (
          <div className="main-record">
            <RecordForm
              key={tagListsVersion}
              onSaved={() => showToast(ZH.toastSaved)}
              onViewInsight={() => setTab('insight')}
            />
          </div>
        )}
        {tab === 'history' && (
          <EntryHistoryPage
            key={tagListsVersion}
            tagListsVersion={tagListsVersion}
            onToast={showToast}
            initialEditId={historyEditId}
            onInitialEditConsumed={() => setHistoryEditId(null)}
          />
        )}
        {tab === 'chart' && <DayChart key={tagListsVersion} />}
        {tab === 'analysis' && (
          <AnalysisPage
            key={tagListsVersion}
            onEditEntry={(id) => {
              setHistoryEditId(id)
              setTab('history')
            }}
          />
        )}
        {tab === 'insight' && (
          <AiInsightPage
            key={tagListsVersion}
            onEditEntry={(id) => {
              setHistoryEditId(id)
              setTab('history')
            }}
          />
        )}
        {tab === 'settings' && <SettingsPage onToast={showToast} />}
      </main>

      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  )
}
