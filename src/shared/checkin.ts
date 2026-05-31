/** Esc 稍后提醒时静默写入的「逃避记录」标识（主进程与渲染进程共用） */
export const AVOIDANCE_FACT = '\u9003\u907f\u8bb0\u5f55'
export const AVOIDANCE_THOUGHT = '\u4e0d\u60f3\u9762\u5bf9\u6b64\u523b\u7684\u72b6\u6001'

/** 判断一条记录是否为系统自动写入的逃避记录 */
export function isAvoidanceEntry(input: { fact?: string }): boolean {
  return input.fact === AVOIDANCE_FACT
}
