import { useEffect, useState } from 'react'
import RecordForm from './components/RecordForm'
import DayChart from './components/DayChart'
import AnalysisPage from './components/AnalysisPage'
import EntryHistoryPage from './components/EntryHistoryPage'
import SettingsPage from './components/SettingsPage'
import CheckInPanel from './components/CheckInPanel'
import { ZH } from './i18n/zh'

type Tab = 'record' | 'history' | 'chart' | 'analysis' | 'settings'

/** 设为 true 可在顶栏重新显示「今日曲线」页签（DayChart 组件仍保留） */
const SHOW_CHART_TAB = false

const TABS: { id: Tab; label: string }[] = [
  { id: 'record', label: ZH.tabRecord },
  { id: 'history', label: ZH.tabHistory },
  { id: 'chart', label: ZH.tabChart },
  { id: 'analysis', label: ZH.tabAnalysis },
  { id: 'settings', label: ZH.tabSettings }
]

const NAV_TABS = SHOW_CHART_TAB ? TABS : TABS.filter((t) => t.id !== 'chart')

function isCheckInPopup(): boolean {
  return new URLSearchParams(window.location.search).get('mode') === 'checkin'
}

export default function App() {
  const [tab, setTab] = useState<Tab>('record')
  const [toast, setToast] = useState('')
  const [tagListsVersion, setTagListsVersion] = useState(0)

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

      <main className="main">
        {tab === 'record' && (
          <RecordForm
            key={tagListsVersion}
            onSaved={() => showToast(ZH.toastSaved)}
          />
        )}
        {tab === 'history' && (
          <EntryHistoryPage
            key={tagListsVersion}
            tagListsVersion={tagListsVersion}
            onToast={showToast}
          />
        )}
        {tab === 'chart' && <DayChart key={tagListsVersion} />}
        {tab === 'analysis' && <AnalysisPage key={tagListsVersion} />}
        {tab === 'settings' && (
          <SettingsPage
            onToast={showToast}
            onTagsSaved={() => setTagListsVersion((v) => v + 1)}
          />
        )}
      </main>

      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  )
}
