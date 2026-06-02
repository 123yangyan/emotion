import type { AiInsightFieldDef } from '../../../../shared/aiInsightManifest'
import {
  DistortionListSection,
  EntryLinkListSection,
  ParagraphSection,
  QuadrantBarSection,
  StringListSection,
  TextSection
} from './AiInsightSections'

interface AiInsightSectionRendererProps {
  def: AiInsightFieldDef
  value: unknown
  onEditEntry?: (entryId: number) => void
}

/** 按 manifest renderType 选择对应展示组件 */
export default function AiInsightSectionRenderer({
  def,
  value,
  onEditEntry
}: AiInsightSectionRendererProps): JSX.Element | null {
  let body: JSX.Element | null = null

  switch (def.renderType) {
    case 'text':
      body = <TextSection value={value} />
      break
    case 'paragraph':
      body = <ParagraphSection value={value} />
      break
    case 'string_list':
      body = <StringListSection value={value} />
      break
    case 'quadrant_bar':
      body = <QuadrantBarSection value={value} />
      break
    case 'distortion_list':
      body = <DistortionListSection value={value} onEditEntry={onEditEntry} />
      break
    case 'entry_link_list':
      body = <EntryLinkListSection value={value} onEditEntry={onEditEntry} />
      break
    default:
      return null
  }

  if (!body) return null

  return (
    <div className="ai-insight-card__section">
      <h3>{def.label}</h3>
      {body}
    </div>
  )
}
