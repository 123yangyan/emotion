const fs = require('fs')
const p = 'src/renderer/src/components/MoodRecordForm.tsx'
let s = fs.readFileSync(p, 'utf8')
const start = s.indexOf('  if (isPopup) {')
const end = s.indexOf('  return (', start)
const replacement = `  if (isPopup) {
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
if (start < 0 || end < 0) {
  console.error('markers not found', start, end)
  process.exit(1)
}
s = s.slice(0, start) + replacement + s.slice(end)
fs.writeFileSync(p, s)
console.log('patched')
