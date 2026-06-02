import { useState } from 'react'
import type { AiInsightRow } from '../../../main/database'
import { formatDiaryDateLabel } from '../../utils/historyRowPreview'
import {
  buildSectionViews,
  hasExpandContent,
  mergeInsightData,
  riskClass
} from '../../utils/aiInsightParse'
import { ZH } from '../../i18n/zh'
import AiInsightSectionRenderer from './AiInsightSectionRenderer'

interface AiInsightCardProps {
  row: AiInsightRow
  onEditEntry?: (entryId: number) => void
}

export default function AiInsightCard({ row, onEditEntry }: AiInsightCardProps): JSX.Element {
  const [expanded, setExpanded] = useState(false)
  const canExpand = hasExpandContent(row)
  const merged = mergeInsightData(row)
  const entryCount = merged.entry_count
  const foldSections = buildSectionViews(row, 'card_fold', {
    skipKeys: ['key_insight', 'entry_count']
  })
  const expandSections = buildSectionViews(row, 'card_expand')

  return (
    <li className={`ai-insight-card${expanded ? ' ai-insight-card--expanded' : ''}`}>
      <div className="ai-insight-card__meta">
        <span className="ai-insight-card__date">{formatDiaryDateLabel(row.date)}</span>
        <span className={`ai-insight-risk ${riskClass(row.risk_level)}`}>
          {ZH.insightRiskLevel(row.risk_level)}
        </span>
        {typeof entryCount === 'number' ? (
          <span className="ai-insight-card__count">{ZH.insightEntryCount(entryCount)}</span>
        ) : null}
      </div>

      <p className="ai-insight-card__summary">{row.key_insight}</p>

      {!expanded && foldSections.length > 0 ? (
        <div className="ai-insight-card__fold-extra">
          {foldSections.map(({ def, value }) => (
            <AiInsightSectionRenderer
              key={def.key}
              def={def}
              value={value}
              onEditEntry={onEditEntry}
            />
          ))}
        </div>
      ) : null}

      {canExpand ? (
        <button
          type="button"
          className="ai-insight-card__toggle"
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? ZH.insightCollapse : ZH.insightExpand}
        </button>
      ) : null}

      {expanded && canExpand ? (
        <div className="ai-insight-card__expand">
          {expandSections.map(({ def, value }) => (
            <AiInsightSectionRenderer
              key={def.key}
              def={def}
              value={value}
              onEditEntry={onEditEntry}
            />
          ))}
        </div>
      ) : null}

      <p className="ai-insight-card__time hint">
        {ZH.insightAnalyzedAt(row.analyzed_at.slice(0, 19).replace('T', ' '))}
      </p>
    </li>
  )
}
