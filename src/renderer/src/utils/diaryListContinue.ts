/** 日记 textarea：Enter 时有序/无序列表自动续号 */

export interface ListContinueResult {
  nextValue: string
  nextCursor: number
}

/** 取光标所在行的起止下标（不含换行符） */
function getCurrentLineBounds(value: string, cursor: number): {
  lineStart: number
  lineEnd: number
  line: string
} {
  const before = value.slice(0, cursor)
  const lineStart = before.lastIndexOf('\n') + 1
  const afterLine = value.slice(lineStart)
  const nl = afterLine.indexOf('\n')
  const lineEnd = nl === -1 ? value.length : lineStart + nl
  return { lineStart, lineEnd, line: value.slice(lineStart, lineEnd) }
}

const ORDERED_RE = /^(\s*)(\d+)\.\s(.*)$/
const UNORDERED_RE = /^(\s*)-\s(.*)$/

/**
 * 在 Enter 时应用列表续号；无需续号时返回 null。
 * - 有序列表：下一行 `n+1. `
 * - 无序列表：下一行 `- `
 * - 空列表项：删除当前行前缀，普通换行（退出列表）
 */
export function applyListContinuation(
  value: string,
  selectionStart: number,
  selectionEnd: number
): ListContinueResult | null {
  if (selectionStart !== selectionEnd) return null

  const { lineStart, lineEnd, line } = getCurrentLineBounds(value, selectionStart)
  const ordered = line.match(ORDERED_RE)
  if (ordered) {
    const indent = ordered[1]
    const num = parseInt(ordered[2], 10)
    const content = ordered[3]
    if (content.trim() === '') {
      const nextValue = value.slice(0, lineStart) + value.slice(lineEnd)
      return { nextValue, nextCursor: lineStart }
    }
    const insert = `\n${indent}${num + 1}. `
    const nextValue = value.slice(0, selectionStart) + insert + value.slice(selectionEnd)
    return { nextValue, nextCursor: selectionStart + insert.length }
  }

  const unordered = line.match(UNORDERED_RE)
  if (unordered) {
    const indent = unordered[1]
    const content = unordered[2]
    if (content.trim() === '') {
      const nextValue = value.slice(0, lineStart) + value.slice(lineEnd)
      return { nextValue, nextCursor: lineStart }
    }
    const insert = `\n${indent}- `
    const nextValue = value.slice(0, selectionStart) + insert + value.slice(selectionEnd)
    return { nextValue, nextCursor: selectionStart + insert.length }
  }

  return null
}
