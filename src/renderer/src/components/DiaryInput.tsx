import { useLayoutEffect, useRef } from 'react'

interface Props {
  value: string
  onChange: (v: string) => void
  placeholder: string
  /** 初始可见行数，默认 3 行 */
  minRows?: number
  /** 打开页面时自动聚焦（仅主记录页） */
  autoFocus?: boolean
  /** 固定高度区域内滚动（主记录页）；默认 false 为随内容增高 */
  scrollable?: boolean
}

/** 日记输入框：弹窗随内容增高；记录页在固定区域内滚动 */
export default function DiaryInput({
  value,
  onChange,
  placeholder,
  minRows = 3,
  autoFocus = false,
  scrollable = false
}: Props): JSX.Element {
  const ref = useRef<HTMLTextAreaElement>(null)

  useLayoutEffect(() => {
    if (scrollable) return
    const el = ref.current
    if (!el) return
    el.style.height = '0'
    const style = getComputedStyle(el)
    const lineHeight = parseFloat(style.lineHeight) || 21
    const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)
    const minHeight = lineHeight * minRows + padding
    el.style.height = `${Math.max(el.scrollHeight, minHeight)}px`
  }, [value, minRows, scrollable])

  return (
    <textarea
      ref={ref}
      className={scrollable ? 'diary-input diary-input--scroll' : 'diary-input'}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={scrollable ? minRows : minRows}
      autoFocus={autoFocus}
    />
  )
}
