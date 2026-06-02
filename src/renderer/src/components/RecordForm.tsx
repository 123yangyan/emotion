import MoodRecordForm from './MoodRecordForm'

interface Props {
  onSaved: () => void
  onViewInsight?: () => void
}

/** 主窗口「记录」页：与弹窗共用同一套表单 */
export default function RecordForm({ onSaved, onViewInsight }: Props) {
  return (
    <MoodRecordForm variant="page" onSaved={onSaved} onViewInsight={onViewInsight} />
  )
}
