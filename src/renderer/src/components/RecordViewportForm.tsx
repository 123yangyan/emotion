import { useRef } from 'react'
import type { TagListsConfig } from '../data/tagLists'
import ValueEnergyGrid from './ValueEnergyGrid'
import FactSceneSection from './FactSceneSection'
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
  tagLists: TagListsConfig
  focusZone?: 'coord' | 'fact' | 'thought' | null
  setFocusZone?: (z: 'coord' | 'fact' | 'thought' | null) => void
  factTags: string[]
  onPickFact: (tag: string) => void
  factSupplement: string
  setFactSupplement: (v: string) => void
  factPlaceholder: string
  thoughtTags: string[]
  onPickThought: (tag: string) => void
  thoughtNote: string
  setThoughtNote: (v: string) => void
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
  focusZone: 'coord' | 'fact' | 'thought' | null,
  zone: 'coord' | 'fact' | 'thought',
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
  tagLists,
  focusZone = null,
  setFocusZone,
  factTags,
  onPickFact,
  factSupplement,
  setFactSupplement,
  factPlaceholder,
  thoughtTags,
  onPickThought,
  thoughtNote,
  setThoughtNote,
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
  const factRef = useRef<HTMLElement>(null)
  const thoughtRef = useRef<HTMLElement>(null)

  const formClass = [
    'record-viewport',
    `record-viewport--${variant}`,
    isPopup ? 'checkin-dual-layout' : '',
    closing ? 'is-closing' : ''
  ]
    .filter(Boolean)
    .join(' ')

  const focusHandlers = (zone: 'coord' | 'fact' | 'thought') =>
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
        : isPopup
          ? ZH.saveRecordCtrlEnter
          : ZH.saveRecordEnter

  return (
    <form ref={formRef} className={formClass} onSubmit={onSubmit}>
      {/* 疲劳检查区块（疲劳模式置顶，作为主要内容） */}
      {isFatigueCheck && fatigueExtra}

      {/* 坐标点选区（仅非疲劳模式显示） */}
      {!isFatigueCheck && (
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
          <h3>
            {ZH.coordTitle}
            <span>{ZH.coordHint}</span>
          </h3>
          <ValueEnergyGrid
            coordX={coordX}
            coordY={coordY}
            hasSelection={hasCoordSelection}
            onPick={onPickCoord}
          />
        </section>
      )}

      {/* 事实/想法：疲劳检查模式不显示 */}
      {!isFatigueCheck && (
        <div className="record-viewport__split">
          {/* 事实/场景 */}
          <section
            ref={factRef}
            className={zoneClass(
              isPopup,
              focusZone,
              'fact',
              'record-viewport__card record-viewport__input-col'
            )}
            {...focusHandlers('fact')}
          >
            <h3>
              {ZH.factSceneTitle}
              <span>{ZH.factSceneHintShort}</span>
            </h3>
            <FactSceneSection
              factScenes={tagLists.factScenes}
              factTags={factTags}
              onPickFact={onPickFact}
              factSupplement={factSupplement}
              setFactSupplement={setFactSupplement}
              factPlaceholder={factPlaceholder}
              useTextarea
            />
          </section>

          {/* 主观想法 */}
          <section
            ref={thoughtRef}
            className={zoneClass(
              isPopup,
              focusZone,
              'thought',
              'record-viewport__card record-viewport__input-col'
            )}
            {...focusHandlers('thought')}
          >
            <h3>
              {ZH.subjectiveThought}
              <span>{ZH.thoughtHintShort}</span>
            </h3>
            <div className="record-input-stack record-input-stack--elastic">
              <div className="tag-flow thought-chips">
                {tagLists.thoughtTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={`chip sm thought ${thoughtTags[0] === tag ? 'active' : ''}`}
                    onClick={() => onPickThought(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <textarea
                className="single-line-input"
                rows={1}
                value={thoughtNote}
                onChange={(e) => setThoughtNote(e.target.value)}
                placeholder={ZH.thoughtNotePh}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.preventDefault()
                }}
              />
            </div>
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
        </footer>
        {!isModal ? (
          <span className="record-viewport__last">
            {isEdit
              ? `${ZH.historyEditAt(recordTimeLabel)} · ${dateLabel}`
              : lastRecordTimeLabel
                ? ZH.lastRecordAt(lastRecordTimeLabel)
                : ZH.lastRecordNone}
          </span>
        ) : null}
      </div>
    </form>
  )
}
