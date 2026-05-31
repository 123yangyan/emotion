import { useEffect } from 'react'
import MoodRecordForm from './MoodRecordForm'

function getMode(): string {
  return new URLSearchParams(window.location.search).get('mode') ?? ''
}

/** 独立记录弹窗 (?mode=checkin 或 ?mode=fatigue_check) */
export default function CheckInPanel(): JSX.Element {
  const isFatigueCheck = getMode() === 'fatigue_check'

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
      <MoodRecordForm
        variant="popup"
        isFatigueCheck={isFatigueCheck}
        onSaved={() => undefined}
      />
    </div>
  )
}
