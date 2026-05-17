import MoodRecordForm from './MoodRecordForm'

interface Props {
  onSaved: () => void
}

/** 主窗口「记录」页：与弹窗共用同一套三块表�?*/
export default function RecordForm({ onSaved }: Props) {
  return <MoodRecordForm variant="page" onSaved={onSaved} />
}
