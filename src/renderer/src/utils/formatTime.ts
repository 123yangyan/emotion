/** \u683c\u5f0f\u5316\u4e3a\u672c\u5730\u53ef\u8bfb\u65f6\u95f4 */
export function formatNowLocal(date = new Date()): string {
  const y = date.getFullYear()
  const mo = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const mi = String(date.getMinutes()).padStart(2, '0')
  const s = String(date.getSeconds()).padStart(2, '0')
  return `${y}\u5e74${mo}\u6708${d}\u65e5 ${h}:${mi}:${s}`
}

/** 弹窗标题区日期：2026/05/17 */
export function formatDateShort(date = new Date()): string {
  const y = date.getFullYear()
  const mo = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}/${mo}/${d}`
}

/** 切片卡片：2026年05月17日 14:36:56 */
export function formatDateTime(date: Date): string {
  return formatNowLocal(date)
}
