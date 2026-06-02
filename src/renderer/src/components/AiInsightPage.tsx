import { useCallback, useEffect, useState } from 'react'
import type { AiInsightRow } from '../../../main/database'
import AiInsightCard from './ai-insight/AiInsightCard'
import { ZH } from '../i18n/zh'

interface AiInsightPageProps {
  onEditEntry?: (entryId: number) => void
}

/** AI 洞察页签：按 manifest 自适应展示 Claude Code 分析结果 */
export default function AiInsightPage({ onEditEntry }: AiInsightPageProps): JSX.Element {
  const [insights, setInsights] = useState<AiInsightRow[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [exportMsg, setExportMsg] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const rows = await window.api.getAiInsights()
    setInsights(rows)
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const handleExport = async (): Promise<void> => {
    setExporting(true)
    setExportMsg('')
    try {
      const result = await window.api.triggerAiExport()
      setExportMsg(ZH.insightExportDone(result.count, result.path))
    } catch {
      setExportMsg(ZH.insightExportFail)
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return <p className="hint">{ZH.loading}</p>
  }

  return (
    <div className="ai-insight-page">
      <header className="ai-insight-page__header">
        <div>
          <h2>{ZH.insightPageTitle}</h2>
          <p className="ai-insight-page__desc">{ZH.insightPageDesc}</p>
        </div>
        <button
          type="button"
          className="btn btn--secondary"
          disabled={exporting}
          onClick={() => void handleExport()}
        >
          {exporting ? ZH.loading : ZH.insightExportToday}
        </button>
      </header>

      <details className="ai-insight-help">
        <summary className="ai-insight-help__summary">{ZH.insightHelpTitle}</summary>
        <div className="ai-insight-help__body">
          <section className="ai-insight-help__section">
            <h3>{ZH.insightHelpUsageTitle}</h3>
            <ol className="ai-insight-help__list">
              {ZH.insightHelpUsageSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>
          <section className="ai-insight-help__section">
            <h3>{ZH.insightHelpModifyTitle}</h3>
            <ol className="ai-insight-help__list">
              {ZH.insightHelpModifySteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>
          <p className="ai-insight-help__path hint">{ZH.insightHelpDataPath}</p>
        </div>
      </details>

      {exportMsg ? <p className="ai-insight-page__export-msg">{exportMsg}</p> : null}

      {insights.length === 0 ? (
        <div className="ai-insight-page__empty">
          <p>{ZH.insightNoData}</p>
          <p className="hint">{ZH.insightNoDataHint}</p>
        </div>
      ) : (
        <ul className="ai-insight-list">
          {insights.map((row) => (
            <AiInsightCard key={row.id} row={row} onEditEntry={onEditEntry} />
          ))}
        </ul>
      )}
    </div>
  )
}
