import {
  formatBeijingClock,
  formatBeijingDateShort,
  formatBeijingDateTime,
  formatBeijingHm
} from '../../../shared/beijingTime'

/** 格式化为北京时间可读时间 */
export function formatNowLocal(date = new Date()): string {
  return formatBeijingDateTime(date)
}

/** 记录页顶栏：仅时分秒（北京时间） */
export function formatClockLocal(date = new Date()): string {
  return formatBeijingClock(date)
}

/** 弹窗标题区日期：2026/05/17（北京时间） */
export function formatDateShort(date = new Date()): string {
  return formatBeijingDateShort(date)
}

/** 切片卡片：2026年05月17日 14:36:56（北京时间） */
export function formatDateTime(date: Date): string {
  return formatBeijingDateTime(date)
}

/** 列表等场景的 HH:mm（北京时间） */
export function formatHmLocal(date: Date | string): string {
  return formatBeijingHm(date)
}
