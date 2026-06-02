import { useRef } from 'react'
import ValueEnergyGrid from './ValueEnergyGrid'
import DiaryInput from './DiaryInput'
import { ZH } from '../i18n/zh'

export type RecordViewportVariant = 'page' | 'popup' | 'modal'

interface Props {
  formRef: React.RefObject<HTMLFormElement>
  variant: RecordViewportVariant
  closing?: boolean
  recordTimeLabel: string
  dateLabel?: string
  lastRecordTimeLabel: string | null
  isEdit?: boolean
  coordX: number
  coordY: number
  hasCoordSelection: boolean
  onPickCoord: (x: number, y: number) => void
  focusZone?: 'coord' | 'diary' | null
  setFocusZone?: (z: 'coord' | 'diary' | null) => void
  diaryText: string
  setDiaryText: (v: string) => void
  /** 疲劳检查模式：底部追加额外区块 */
  isFatigueCheck?: boolean
  fatigueExtra?: React.ReactNode
  error: string
  saving: boolean
  saveSuccess?: boolean
  onCancel?: () => void
  onSubmit: (e: React.FormEvent) => void
}

function zoneClass(
  isPopup: boolean,
  focusZone: 'coord' | 'diary' | null,
  zone: 'coord' | 'diary',
  base: string
): string {
  if (!isPopup) return base
  return `${base} checkin-zone-focus${focusZone === zone ? ' is-focused' : ''}`
}

/** 记录页 / 弹窗 / 编辑弹窗：100vh 无缝网格共用布局 */
export default function RecordViewportForm({
  formRef,
  variant,
  closing = false,
  recordTimeLabel,
  dateLabel = '',
  lastRecordTimeLabel,
  isEdit = false,
  coordX,
  coordY,
  hasCoordSelection,
  onPickCoord,
  focusZone = null,
  setFocusZone,
  diaryText,
  setDiaryText,
  isFatigueCheck = false,
  fatigueExtra,
  error,
  saving,
  saveSuccess = false,
  onCancel,
  onSubmit
}: Props): JSX.Element {
  const isPopup = variant === 'popup'
  const isModal = variant === 'modal'
  const coordRef = useRef<HTMLElement>(null)
  const diaryRef = useRef<HTMLElement>(null)
  const diaryAutoFocus = variant === 'page' && !isEdit

  const formClass = [
    'record-viewport',
    `record-viewport--${variant}`,
    isPopup ? 'checkin-dual-layout' : '',
    closing ? 'is-closing' : ''
  ]
    .filter(Boolean)
    .join(' ')

  const focusHandlers = (zone: 'coord' | 'diary') =>
    isPopup && setFocusZone
      ? {
          tabIndex: 0 as const,
          onFocus: () => setFocusZone(zone),
          onBlur: () => setFocusZone((z) => (z === zone ? null : z))
        }
      : {}

  const saveLabel = saving
    ? ZH.saving
    : saveSuccess
      ? ZH.checkInSaved
      : isEdit
        ? ZH.historySaveEdit
        : ZH.saveRecord

  const lastLabel = isEdit
    ? `${ZH.historyEditAt(recordTimeLabel)} · ${dateLabel}`
    : lastRecordTimeLabel
      ? ZH.lastRecordAt(lastRecordTimeLabel)
      : ZH.lastRecordNone

  return (
    <form ref={formRef} className={formClass} onSubmit={onSubmit}>
      {isFatigueCheck && fatigueExtra}

      {!isFatigueCheck && (
        <div className="record-viewport__split">
          <section
            ref={coordRef}
            className={zoneClass(
              isPopup,
              focusZone,
              'coord',
              'record-viewport__card record-viewport__coord'
            )}
            {...focusHandlers('coord')}
          >
            <p className="coord-section-label">{ZH.coordSectionLabel}</p>
            <ValueEnergyGrid
              coordX={coordX}
              coordY={coordY}
              hasSelection={hasCoordSelection}
              onPick={onPickCoord}
            />
          </section>

          <section
            ref={diaryRef}
            className={zoneClass(
              isPopup,
              focusZone,
              'diary',
              'record-viewport__card record-viewport__diary'
            )}
            {...focusHandlers('diary')}
          >
            <div className="diary-date-header">
              <span className="diary-date-header__day">{ZH.diaryDateDay(dateLabel)}</span>
              {ZH.diaryDateWeekday(dateLabel) ? (
                <span className="diary-date-header__weekday">{ZH.diaryDateWeekday(dateLabel)}</span>
              ) : null}
            </div>
            <DiaryInput
              value={diaryText}
              onChange={setDiaryText}
              placeholder={ZH.diaryPlaceholder}
              autoFocus={diaryAutoFocus}
              scrollable={!isPopup}
            />
          </section>
        </div>
      )}

      {error ? <p className="error record-viewport__error">{error}</p> : null}

      <div className={`record-viewport__dock${isPopup ? ' record-viewport__dock--popup' : ''}`}>
        {isPopup ? (
          <span className="record-viewport__shortcut-corner">{ZH.checkInKeyboardHint}</span>
        ) : null}
        <footer
          className={`record-viewport__action${isEdit && onCancel ? ' record-viewport__action--split' : ''}`}
        >
          {!isModal && !isPopup ? (
            <span className="record-viewport__last">{lastLabel}</span>
          ) : null}
          <div className="record-viewport__action-buttons">
            {isEdit && onCancel ? (
              <button type="button" className="btn ghost" onClick={onCancel} disabled={saving}>
                {ZH.historyCancelEdit}
              </button>
            ) : null}
            <button
              type="submit"
              className={`record-viewport__save${saveSuccess ? ' is-success' : ''}`}
              disabled={saving || saveSuccess}
            >
              {saveLabel}
            </button>
          </div>
        </footer>
        {!isModal && isPopup ? (
          <span className="record-viewport__last record-viewport__last--popup">
            {lastLabel}
          </span>
        ) : null}
      </div>
    </form>
  )
}
