import type { AiCognitiveDistortion, AiRelatedEntry } from '../../../../shared/aiInsightManifest'
import { QUADRANT_BAR_COLORS, parseQuadrantStats } from '../../utils/aiInsightParse'
import { ZH } from '../../i18n/zh'

interface TextSectionProps {
  value: unknown
}

export function TextSection({ value }: TextSectionProps): JSX.Element | null {
  if (value === null || value === undefined) return null
  return <p className="ai-insight-section__text">{String(value)}</p>
}

interface ParagraphSectionProps {
  value: unknown
}

export function ParagraphSection({ value }: ParagraphSectionProps): JSX.Element | null {
  if (typeof value !== 'string' || !value.trim()) return null
  return <p className="ai-insight-section__paragraph">{value}</p>
}

interface StringListSectionProps {
  value: unknown
}

export function StringListSection({ value }: StringListSectionProps): JSX.Element | null {
  const items = Array.isArray(value) ? value.map(String).filter(Boolean) : []
  if (items.length === 0) return null
  return (
    <ul className="ai-insight-section__list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

interface QuadrantBarSectionProps {
  value: unknown
}

export function QuadrantBarSection({ value }: QuadrantBarSectionProps): JSX.Element | null {
  const stats = parseQuadrantStats(value)
  const entries = Object.entries(stats).filter(([, count]) => count > 0)
  const total = entries.reduce((sum, [, count]) => sum + count, 0)
  if (total === 0) return null

  return (
    <div className="ai-insight-quadrant-bar">
      {entries.map(([name, count]) => {
        const pct = Math.round((count / total) * 100)
        const color = QUADRANT_BAR_COLORS[name as keyof typeof QUADRANT_BAR_COLORS] ?? '#888'
        return (
          <div key={name} className="ai-insight-quadrant-bar__row">
            <span className="ai-insight-quadrant-bar__label">{name}</span>
            <div className="ai-insight-quadrant-bar__track">
              <div
                className="ai-insight-quadrant-bar__fill"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>
            <span className="ai-insight-quadrant-bar__count">{count}</span>
          </div>
        )
      })}
    </div>
  )
}

interface DistortionListSectionProps {
  value: unknown
  onEditEntry?: (entryId: number) => void
}

export function DistortionListSection({
  value,
  onEditEntry
}: DistortionListSectionProps): JSX.Element | null {
  if (!Array.isArray(value) || value.length === 0) return null
  const items = value as AiCognitiveDistortion[]

  return (
    <ul className="ai-insight-section__distortions">
      {items.map((item, idx) => (
        <li key={`${item.type}-${idx}`} className="ai-insight-section__distortion">
          <span className="ai-insight-section__distortion-type">{item.type}</span>
          {item.quote ? (
            <span className="ai-insight-section__distortion-quote">「{item.quote}」</span>
          ) : null}
          {item.entry_id && onEditEntry ? (
            <button
              type="button"
              className="ai-insight-section__entry-link"
              onClick={() => onEditEntry(item.entry_id!)}
            >
              {ZH.insightViewEntry}
            </button>
          ) : null}
        </li>
      ))}
    </ul>
  )
}

interface EntryLinkListSectionProps {
  value: unknown
  onEditEntry?: (entryId: number) => void
}

function formatEntryTime(occurredAt?: string): string {
  if (!occurredAt) return ''
  const d = new Date(occurredAt)
  if (Number.isNaN(d.getTime())) return occurredAt.slice(11, 16)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function EntryLinkListSection({
  value,
  onEditEntry
}: EntryLinkListSectionProps): JSX.Element | null {
  if (!Array.isArray(value) || value.length === 0) return null
  const items = value as AiRelatedEntry[]

  return (
    <ul className="ai-insight-section__entries">
      {items.map((item) => {
        const time = formatEntryTime(item.occurred_at)
        const label = [time, item.note].filter(Boolean).join(' · ') || `#${item.entry_id}`
        return (
          <li key={item.entry_id} className="ai-insight-section__entry-row">
            <span>{label}</span>
            {onEditEntry ? (
              <button
                type="button"
                className="ai-insight-section__entry-link"
                onClick={() => onEditEntry(item.entry_id)}
              >
                {ZH.insightViewEntry}
              </button>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}
