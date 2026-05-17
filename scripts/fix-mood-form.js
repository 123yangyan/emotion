const fs = require('fs')
const p = 'src/renderer/src/components/MoodRecordForm.tsx'
let s = fs.readFileSync(p, 'utf8')

const submitBlock = `  const submitForm = useCallback(async (): Promise<void> => {
    setError('')
    if (emotionIds.length === 0) {
      setError(ZH.selectEmotion)
      return
    }
    setSaving(true)
    try {
      await window.api.createEntry({
        fact: buildFactText(),
        thought: buildThoughtText(),
        bodyTags,
        behaviorTags,
        reactionNote: factSupplement.trim(),
        emotionIds,
        intensity,
        occurredAt: new Date().toISOString()
      })
      setFactTags([])
      setFactSupplement('')
      setFactNoteEditing(false)
      setBodyTags([])
      setBehaviorTags([])
      setThoughtTags([])
      setThoughtNote('')
      setEmotionIds([])
      setIntensity(5)
      onSaved()
      if (isPopup) {
        setSaveSuccess(true)
        await new Promise((r) => setTimeout(r, 320))
        setClosing(true)
        await new Promise((r) => setTimeout(r, 280))
        window.close()
      }
    } catch {
      setError(ZH.saveFail)
    } finally {
      setSaving(false)
    }
  }, [
    behaviorTags,
    bodyTags,
    emotionIds,
    factSupplement,
    factTags,
    intensity,
    isPopup,
    onSaved,
    thoughtNote,
    thoughtTags
  ])

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    void submitForm()
  }

  useEffect(() => {
    if (!isPopup) return

    const onKey = (e: KeyboardEvent): void => {
      if (e.key >= '1' && e.key <= '9' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const tag = (e.target as HTMLElement)?.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA') return
        e.preventDefault()
        pickIntensity(Number(e.key))
        return
      }

      if (e.key === 'Escape') {
        if (factNoteEditing) {
          closeFactNoteInput()
          return
        }
        e.preventDefault()
        snoozeAndExit()
        return
      }

      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        void submitForm()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [factNoteEditing, isPopup, pickIntensity, snoozeAndExit, submitForm])
`

const startSubmit = s.indexOf('  const submitForm = useCallback')
const endBroken = s.indexOf('  const levels = [1, 2, 3, 4, 5, 6, 7, 8, 9]')
if (startSubmit < 0 || endBroken < 0) {
  console.error('submit markers', startSubmit, endBroken)
  process.exit(1)
}
s = s.slice(0, startSubmit) + submitBlock + '\n\n  ' + s.slice(endBroken)

const popupStart = s.indexOf('  if (isPopup) {\n    return (\n      <form')
const pageReturn = s.indexOf('  return (\n    <form className="record-compact"', popupStart)
if (popupStart < 0 || pageReturn < 0) {
  console.error('popup markers', popupStart, pageReturn)
  process.exit(1)
}

const popupBlock = `  if (isPopup) {
    return (
      <CheckInDualForm
        formRef={formRef}
        closing={closing}
        dateLabel={dateLabel}
        intensity={intensity}
        levels={levels}
        onPickIntensity={pickIntensity}
        emotionIds={emotionIds}
        onPickEmotion={pickEmotion}
        tagLists={tagLists}
        focusZone={focusZone}
        setFocusZone={setFocusZone}
        factTags={factTags}
        onPickFact={pickFact}
        factSupplement={factSupplement}
        setFactSupplement={setFactSupplement}
        factNoteEditing={factNoteEditing}
        setFactNoteEditing={setFactNoteEditing}
        onConfirmFactNote={confirmFactNote}
        thoughtTags={thoughtTags}
        onPickThought={pickThought}
        thoughtNote={thoughtNote}
        setThoughtNote={setThoughtNote}
        bodyTags={bodyTags}
        behaviorTags={behaviorTags}
        onPickBodyTag={pickBodyTag}
        onPickBehaviorTag={pickBehaviorTag}
        error={error}
        saving={saving}
        saveSuccess={saveSuccess}
        onSubmit={handleSubmit}
      />
    )
  }

`
s = s.slice(0, popupStart) + popupBlock + s.slice(pageReturn)

s = s.replace("import {\n  getIntensityTheme,\n  intensityButtonStyle,\n  intensityZoneStyle\n} from '../utils/intensityTheme'", "import { intensityButtonStyle, intensityZoneStyle } from '../utils/intensityTheme'")

fs.writeFileSync(p, s)
console.log('fixed')
