import { useEffect } from 'react'
import MoodRecordForm from './MoodRecordForm'

/** 独立记录弹窗 (?mode=checkin) */
export default function CheckInPanel(): JSX.Element {
  useEffect(() => {
    document.body.classList.add('checkin-mode')
    document.documentElement.classList.add('checkin-mode')
    return () => {
      document.body.classList.remove('checkin-mode')
      document.documentElement.classList.remove('checkin-mode')
    }
  }, [])

  return (
    <div className="checkin-panel">
      <MoodRecordForm variant="popup" onSaved={() => undefined} />
    </div>
  )
}
