const fs = require('fs')
const p = 'src/renderer/src/components/MoodRecordForm.tsx'
const lines = fs.readFileSync(p, 'utf8').split(/\r?\n/)
const popupRender = lines.findIndex((l) => l === '  if (isPopup) {')
const endLine = lines.findIndex(
  (l, i) => i > popupRender && l === '  return (' && lines[i + 1]?.includes('record-compact')
)
if (popupRender < 0 || endLine < 0) {
  console.error('lines', popupRender, endLine)
  process.exit(1)
}
const block = `  if (isPopup) {
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
const out = [...lines.slice(0, popupRender), ...block.split('\n'), ...lines.slice(endLine)].join('\n')
fs.writeFileSync(p, out)
console.log('ok', popupRender, endLine)
