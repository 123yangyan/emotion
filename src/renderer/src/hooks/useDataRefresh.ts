import { useEffect } from 'react'

/** 挂载时执行一次，并在主进程记录变更时自动刷新 */
export function useEntriesRefresh(onRefresh: () => void, deps: unknown[] = []): void {
  useEffect(() => {
    onRefresh()
    const unsubscribe = window.api.onEntriesChanged(onRefresh)
    return unsubscribe
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps 由调用方传入（如 load 函数）
  }, deps)
}

/** 挂载时执行一次，并在 AI 洞察入库时自动刷新 */
export function useAiInsightsRefresh(onRefresh: () => void, deps: unknown[] = []): void {
  useEffect(() => {
    onRefresh()
    const unsubscribe = window.api.onAiInsightsChanged(onRefresh)
    return unsubscribe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
