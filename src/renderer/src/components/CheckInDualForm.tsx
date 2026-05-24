import { useRef } from 'react'
import type { RecordTagEmotion, TagListsConfig } from '../data/tagLists'
import IntensityEnergyBar from './IntensityEnergyBar'
import EmotionSpectrumPicker from './EmotionSpectrumPicker'
import FactSceneSection from './FactSceneSection'
import { ZH } from '../i18n/zh'

interface Props {
  formRef: React.RefObject<HTMLFormElement>
  closing: boolean
  dateLabel: string
  intensity: number
  levels: number[]
  onPickIntensity: (n: number) => void
  emotionIds: string[]
  onPickEmotion: (id: string) => void
  emotionSpectrum: RecordTagEmotion[]
  tagLists: TagListsConfig
  focusZone: 'emotion' | 'fact' | 'thought' | 'body' | null
  setFocusZone: (z: 'emotion' | 'fact' | 'thought' | 'body' | null) => void
  factTags: string[]
  onPickFact: (tag: string) => void
  factSupplement: string
  setFactSupplement: (v: string) => void
  factPlaceholder: string
  thoughtTags: string[]
  onPickThought: (tag: string) => void
  thoughtNote: string
  setThoughtNote: (v: string) => void
  bodyTags: string[]
  behaviorTags: string[]
  onPickBodyTag: (tag: string) => void
  onPickBehaviorTag: (id: string) => void
  error: string
  saving: boolean
  saveSuccess: boolean
  onSubmit: (e: React.FormEvent) => void
}

/** 弹窗：双子星分栏（720×500 固定） */
export default function CheckInDualForm({
  formRef,
  closing,
  dateLabel,
  intensity,
  levels,
  onPickIntensity,
  emotionIds,
  onPickEmotion,
  emotionSpectrum,
  tagLists,
  focusZone,
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
  bodyTags,
  behaviorTags,
  onPickBodyTag,
  onPickBehaviorTag,
  error,
  saving,
  saveSuccess,
  onSubmit
}: Props): JSX.Element {
  const emotionRef = useRef<HTMLElement>(null)
  const factRef = useRef<HTMLElement>(null)
  const thoughtRef = useRef<HTMLElement>(null)
  const bodyRef = useRef<HTMLElement>(null)

  return (
    <form
      ref={formRef}
      className={`record-compact record-compact--popup checkin-dual-layout ${closing ? 'is-closing' : ''}`}
      onSubmit={onSubmit}
    >
      <header className="checkin-titlebar checkin-titlebar--dual">
        <div className="checkin-titlebar__drag">
          <span className="checkin-titlebar__icon" aria-hidden>
            ◎
          </span>
          <div className="checkin-titlebar__text">
            <h1>{ZH.checkInTitleNow}</h1>
            <span className="checkin-titlebar__date">{dateLabel}</span>
          </div>
        </div>
        <span className="checkin-titlebar__shortcut">{ZH.checkInSaveShortcut}</span>
      </header>

      <div className="checkin-body">
        <section className="checkin-energy" data-intensity={intensity} aria-label={ZH.moodIntensity}>
          <IntensityEnergyBar
            intensity={intensity}
            levels={levels}
            onPick={onPickIntensity}
            hint={ZH.checkInKeyboardHint}
          />
        </section>

        <div className="checkin-dual">
          <div className="checkin-dual__col checkin-dual__col--internal">
            <section
              ref={emotionRef}
              className={`checkin-zone checkin-zone--emotion checkin-zone-focus ${focusZone === 'emotion' ? 'is-focused' : ''}`}
              tabIndex={0}
              onFocus={() => setFocusZone('emotion')}
              onBlur={() => setFocusZone((z) => (z === 'emotion' ? null : z))}
            >
              <h2>{ZH.emotionCore}</h2>
              <EmotionSpectrumPicker
                emotions={emotionSpectrum}
                selectedId={emotionIds[0]}
                onPick={onPickEmotion}
                compact
              />
            </section>

            <section
              ref={thoughtRef}
              className={`checkin-zone checkin-zone--thought checkin-zone-focus ${focusZone === 'thought' ? 'is-focused' : ''}`}
              tabIndex={0}
              onFocus={() => setFocusZone('thought')}
              onBlur={() => setFocusZone((z) => (z === 'thought' ? null : z))}
            >
              <h2>{ZH.subjectiveThought}</h2>
              <div className="chip-wrap thought-chips">
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
              <input
                type="text"
                className="thought-inline-input thought-inline-input--compact"
                value={thoughtNote}
                onChange={(e) => setThoughtNote(e.target.value)}
                placeholder={ZH.thoughtNotePh}
              />
            </section>
          </div>

          <div className="checkin-dual__col checkin-dual__col--external">
            <section
              ref={factRef}
              className={`checkin-zone checkin-zone--fact checkin-zone-focus ${focusZone === 'fact' ? 'is-focused' : ''}`}
              tabIndex={0}
              onFocus={() => setFocusZone('fact')}
              onBlur={() => setFocusZone((z) => (z === 'fact' ? null : z))}
            >
              <h2>{ZH.factSceneTitle}</h2>
              <FactSceneSection
                factScenes={tagLists.factScenes}
                factTags={factTags}
                onPickFact={onPickFact}
                factSupplement={factSupplement}
                setFactSupplement={setFactSupplement}
                factPlaceholder={factPlaceholder}
                ghostChips
                compact
              />
            </section>

            <section
              ref={bodyRef}
              className={`checkin-zone checkin-zone--somatic checkin-zone-focus ${focusZone === 'body' ? 'is-focused' : ''}`}
              tabIndex={0}
              onFocus={() => setFocusZone('body')}
              onBlur={() => setFocusZone((z) => (z === 'body' ? null : z))}
            >
              <h2>{ZH.bodyMind}</h2>
              <div className="somatic-box">
                <div className="chip-wrap">
                  {tagLists.bodyTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className={`chip sm somatic ${bodyTags[0] === tag ? 'active' : ''}`}
                      onClick={() => onPickBodyTag(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                  {tagLists.behaviorTags.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      className={`chip sm behavior somatic ${behaviorTags[0] === b.id ? 'active' : ''}`}
                      onClick={() => onPickBehaviorTag(b.id)}
                    >
                      {b.label.split('\uFF1A')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {error ? <p className="error checkin-error">{error}</p> : null}

      <footer className="checkin-dock">
        <button
          type="submit"
          className={`checkin-dock__btn ${saveSuccess ? 'is-success' : ''}`}
          disabled={saving || saveSuccess}
        >
          {saveSuccess ? ZH.checkInSaved : saving ? ZH.saving : ZH.saveRecord}
        </button>
      </footer>
    </form>
  )
}
