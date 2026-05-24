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
  compact = false
}: Props): JSX.Element {
  const chipClass = ghostChips ? 'scene scene--ghost' : 'scene'
  const wrapClass = ghostChips ? 'chip-wrap chip-wrap--fact-popup' : 'chip-wrap'

  return (
    <>
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
      <input
        type="text"
        className={`fact-inline-input ${compact ? 'fact-inline-input--compact' : ''}`}
        value={factSupplement}
        onChange={(e) => setFactSupplement(e.target.value)}
        placeholder={factPlaceholder}
        onKeyDown={(e) => {
          // 防止 Enter 误触提交整个表单
          if (e.key === 'Enter') e.preventDefault()
        }}
      />
    </>
  )
}
