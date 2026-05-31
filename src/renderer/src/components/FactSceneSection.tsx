interface Props {
  factScenes: string[]
  factTags: string[]
  onPickFact: (tag: string) => void
  factSupplement: string
  setFactSupplement: (v: string) => void
  factPlaceholder: string
  /** 弹窗版 ghost 风格 chip */
  ghostChips?: boolean
  compact?: boolean
  /** 限高单行 textarea，锁死一屏布局高度 */
  useTextarea?: boolean
}

/** 发生场景：chip 单选 + 常驻自由输入（与主观想法区交互一致） */
export default function FactSceneSection({
  factScenes,
  factTags,
  onPickFact,
  factSupplement,
  setFactSupplement,
  factPlaceholder,
  ghostChips = false,
  compact = false,
  useTextarea = false
}: Props): JSX.Element {
  const chipClass = ghostChips ? 'scene scene--ghost' : 'scene'
  const wrapClass = ghostChips ? 'chip-wrap chip-wrap--fact-popup tag-flow' : 'chip-wrap tag-flow'
  const inputClass = useTextarea
    ? 'single-line-input'
    : `fact-inline-input ${compact ? 'fact-inline-input--compact' : ''}`

  const chips = (
    <div className={wrapClass}>
      {factScenes.map((tag) => (
        <button
          key={tag}
          type="button"
          className={`chip sm ${chipClass} ${factTags[0] === tag ? 'active' : ''}`}
          onClick={() => onPickFact(tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  )

  const input = useTextarea ? (
    <textarea
      className={inputClass}
      rows={1}
      value={factSupplement}
      onChange={(e) => setFactSupplement(e.target.value)}
      placeholder={factPlaceholder}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.preventDefault()
      }}
    />
  ) : (
    <input
      type="text"
      className={inputClass}
      value={factSupplement}
      onChange={(e) => setFactSupplement(e.target.value)}
      placeholder={factPlaceholder}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.preventDefault()
      }}
    />
  )

  if (useTextarea) {
    return (
      <div className="record-input-stack record-input-stack--elastic">
        {chips}
        {input}
      </div>
    )
  }

  return (
    <>
      {chips}
      {input}
    </>
  )
}
