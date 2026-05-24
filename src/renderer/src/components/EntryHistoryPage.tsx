import { useCallback, useEffect, useMemo, useState } from 'react'
import type { EntryRow } from '../../../main/database'
import { EMOTIONS } from '../data/emotions'
import { buildEmotionLabelMap, resolveTagLists } from '../data/tagLists'
import { ZH } from '../i18n/zh'
import {
  buildHistoryRowView,
  HISTORY_PAGE_SIZE,
  type HistoryRowView
} from '../utils/historyRowPreview'
import MoodRecordForm from './MoodRecordForm'

interface Props {
  onToast: (msg: string) => void
  tagListsVersion: number
  /** 从分析页跳转过来时，自动打开该条记录的编辑 */
  initialEditId?: number | null
  onInitialEditConsumed?: () => void
}

const MAX_PAGER_BUTTONS = 9

/** 全部历史：单行流 + 每页 10 条 + 选择删除 + 快速翻页 */
export default function EntryHistoryPage({
  onToast,
  tagListsVersion,
  initialEditId = null,
  onInitialEditConsumed
}: Props): JSX.Element {
  const [entries, setEntries] = useState<EntryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [jumpInput, setJumpInput] = useState('1')
  const [selectedIds, setSelectedIds] = useState<Set<number>>(() => new Set())
  const [editingId, setEditingId] = useState<number | null>(null)
  const [emotionLabels, setEmotionLabels] = useState(() =>
    buildEmotionLabelMap(resolveTagLists(), EMOTIONS)
  )
  const [thoughtTags, setThoughtTags] = useState<string[]>(() => resolveTagLists().thoughtTags)

  const load = useCallback(async () => {
    setLoading(true)
    const list = await window.api.listAllEntries()
    setEntries(list)
    const settings = await window.api.getSettings()
    const lists = resolveTagLists(settings.tagLists)
    setEmotionLabels(buildEmotionLabelMap(lists, EMOTIONS))
    setThoughtTags(lists.thoughtTags)
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load, tagListsVersion])

  const rows: HistoryRowView[] = useMemo(
    () => entries.map((e) => buildHistoryRowView(e, emotionLabels, thoughtTags)),
    [entries, emotionLabels, thoughtTags]
  )

  const totalPages = Math.max(1, Math.ceil(rows.length / HISTORY_PAGE_SIZE))

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  useEffect(() => {
    setJumpInput(String(page))
  }, [page])

  // 分析页「在历史中编辑」跳转：定位到对应页并打开编辑表单
  useEffect(() => {
    if (initialEditId == null || rows.length === 0) return
    const idx = rows.findIndex((r) => r.id === initialEditId)
    if (idx < 0) {
      onToast(ZH.historyEntryMissing)
      onInitialEditConsumed?.()
      return
    }
    setPage(Math.floor(idx / HISTORY_PAGE_SIZE) + 1)
    setEditingId(initialEditId)
    onInitialEditConsumed?.()
  }, [initialEditId, rows, onToast, onInitialEditConsumed])

  const pageRows = useMemo(() => {
    const start = (page - 1) * HISTORY_PAGE_SIZE
    return rows.slice(start, start + HISTORY_PAGE_SIZE)
  }, [rows, page])

  const pageRowIds = useMemo(() => pageRows.map((r) => r.id), [pageRows])
  const pageAllSelected =
    pageRowIds.length > 0 && pageRowIds.every((id) => selectedIds.has(id))
  const pageSomeSelected = pageRowIds.some((id) => selectedIds.has(id))

  const toggleSelect = (id: number): void => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const togglePageSelect = (): void => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (pageAllSelected) {
        for (const id of pageRowIds) next.delete(id)
      } else {
        for (const id of pageRowIds) next.add(id)
      }
      return next
    })
  }

  const clearSelection = (): void => setSelectedIds(new Set())

  const goToPage = (target: number): void => {
    const n = Math.min(totalPages, Math.max(1, Math.round(target)))
    setPage(n)
    setJumpInput(String(n))
  }

  const handleJumpSubmit = (): void => {
    const n = Number(jumpInput)
    if (!Number.isFinite(n)) return
    goToPage(n)
  }

  const handleDelete = async (row: HistoryRowView): Promise<void> => {
    if (!window.confirm(ZH.historyDeleteConfirm(row.time))) return
    const ok = await window.api.deleteEntry(row.id)
    if (ok) {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        next.delete(row.id)
        return next
      })
      onToast(ZH.historyDeleted)
      void load()
    }
  }

  const handleDeleteSelected = async (): Promise<void> => {
    const ids = [...selectedIds]
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id) && id > 0)
    if (ids.length === 0) return
    if (!window.confirm(ZH.historyDeleteSelectedConfirm(ids.length))) return

    const deleteOneByOne = async (): Promise<number> => {
      let count = 0
      for (const id of ids) {
        if (await window.api.deleteEntry(id)) count += 1
      }
      return count
    }

    try {
      let deleted = 0
      if (typeof window.api.deleteEntries === 'function') {
        deleted = await window.api.deleteEntries(ids)
      }
      // 批量未删到时，逐条删除（与单行「删除」同路径）
      if (deleted === 0) deleted = await deleteOneByOne()

      if (deleted > 0) {
        clearSelection()
        onToast(ZH.historyDeletedMany(deleted))
        await load()
      } else {
        onToast(ZH.historyDeleteFailed)
      }
    } catch {
      try {
        const deleted = await deleteOneByOne()
        if (deleted > 0) {
          clearSelection()
          onToast(ZH.historyDeletedMany(deleted))
          await load()
        } else {
          onToast(ZH.historyDeleteFailed)
        }
      } catch {
        onToast(ZH.historyDeleteFailed)
      }
    }
  }

  const pagerButtons = useMemo(() => {
    if (totalPages <= MAX_PAGER_BUTTONS) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    const half = Math.floor(MAX_PAGER_BUTTONS / 2)
    let start = Math.max(1, page - half)
    let end = start + MAX_PAGER_BUTTONS - 1
    if (end > totalPages) {
      end = totalPages
      start = Math.max(1, end - MAX_PAGER_BUTTONS + 1)
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }, [page, totalPages])

  const editingEntry = useMemo(
    () => (editingId == null ? null : (entries.find((e) => e.id === editingId) ?? null)),
    [entries, editingId]
  )

  const editingRowView = useMemo(
    () => (editingId == null ? null : (rows.find((r) => r.id === editingId) ?? null)),
    [rows, editingId]
  )

  const closeEditModal = useCallback((): void => {
    setEditingId(null)
  }, [])

  useEffect(() => {
    if (editingId == null) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') closeEditModal()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [closeEditModal, editingId])

  const handleEditSaved = useCallback(
    (updated?: EntryRow): void => {
      onToast(ZH.historyUpdated)
      setEditingId(null)
      if (updated) {
        setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))
      }
    },
    [onToast]
  )

  return (
    <div className="history-page">
      <header className="history-header">
        <div>
          <h2>{ZH.historyTitle}</h2>
        </div>
        <button type="button" className="btn secondary" onClick={() => void load()}>
          {ZH.refresh}
        </button>
      </header>

      {loading ? (
        <p className="hint">{ZH.loading}</p>
      ) : rows.length === 0 ? (
        <p className="empty">{ZH.historyEmpty}</p>
      ) : (
        <div className="history-panel">
          <div className="history-toolbar">
            <label className="history-toolbar__check">
              <input
                type="checkbox"
                checked={pageAllSelected}
                ref={(el) => {
                  if (el) el.indeterminate = pageSomeSelected && !pageAllSelected
                }}
                onChange={togglePageSelect}
              />
              <span>{ZH.historySelectPage}</span>
            </label>
            <span className="history-toolbar__count">{ZH.historySelectCount(selectedIds.size)}</span>
            <button
              type="button"
              className="btn ghost history-toolbar__btn"
              disabled={selectedIds.size === 0}
              onClick={clearSelection}
            >
              {ZH.historySelectClear}
            </button>
            <button
              type="button"
              className="btn secondary history-toolbar__btn history-toolbar__btn--danger"
              disabled={selectedIds.size === 0}
              onClick={() => void handleDeleteSelected()}
            >
              {ZH.historyDeleteSelected}
            </button>
          </div>

          <ul className="history-rows" aria-label={ZH.historyTitle}>
            {pageRows.map((row, i) => {
              const prev = pageRows[i - 1]
              const showDate = !prev || prev.dateKey !== row.dateKey
              const checked = selectedIds.has(row.id)
              return (
                <li key={row.id}>
                  {showDate ? (
                    <div className="history-rows__date">{formatDateLabel(row.dateKey)}</div>
                  ) : null}
                  <div
                    className={`history-row-item history-row history-row--${row.polarity} ${row.isAvoidance ? 'history-row--avoidance' : ''} ${checked ? 'is-selected' : ''}`}
                    title={row.fullTitle}
                  >
                    {/* 左侧：复选框 + 核心内容，与操作按钮保持在同一视线范围内 */}
                    <div className="history-row__content">
                      <label className="history-row__check" aria-label={ZH.historySelectPage}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleSelect(row.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </label>
                      <div className="history-row__body">
                        <div className="history-row__main-content">
                          {/* 一级主标题：时间锚点 → 情绪名 → 分数/场景等辅助信息 */}
                          <div className="history-row__line history-row__line--primary">
                            <time className="history-row__time">{row.time}</time>
                            <span className="history-row__time-sep" aria-hidden>
                              —
                            </span>
                            <span className="history-row__emotion">{row.emotionLabel}</span>
                            {row.isAvoidance ? (
                              <span className="history-row__avoidance-badge">{ZH.historyAvoidanceBadge}</span>
                            ) : null}
                            <span className="history-row__intensity">
                              {row.intensity}
                              {'\u5206'}
                            </span>
                            {row.sceneText ? (
                              <span className="history-row__context-tag">
                                <span className="history-row__context-icon" aria-hidden>
                                  📍
                                </span>
                                {row.sceneText}
                              </span>
                            ) : null}
                            {row.factNoteText ? (
                              <span className="history-row__fact-note">{row.factNoteText}</span>
                            ) : null}
                          </div>
                          {row.thoughtSummary || row.quoteText ? (
                            <div className="history-row__sub-thought">
                              <span className="history-row__thought-label">
                                <span aria-hidden>💭 </span>
                                {ZH.historyThoughtFlash}
                              </span>
                              {row.thoughtSummary ? (
                                <span className="history-row__thought-tag">{row.thoughtSummary}</span>
                              ) : null}
                              {row.thoughtSummary && row.quoteText ? (
                                <span className="history-row__thought-sep" aria-hidden>
                                  ·
                                </span>
                              ) : null}
                              {row.quoteText ? (
                                <q className="history-row__quote">{row.quoteText}</q>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    {/* 右侧：操作按钮紧跟内容尾部，不再贴死屏幕边缘 */}
                    <div className="history-row__actions">
                      <button
                        type="button"
                        className="history-row__link"
                        onClick={() => setEditingId(row.id)}
                      >
                        {ZH.historyEdit}
                      </button>
                      <button
                        type="button"
                        className="history-row__link history-row__link--danger"
                        onClick={() => void handleDelete(row)}
                      >
                        {ZH.historyDelete}
                      </button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>

          <nav className="history-pager" aria-label={ZH.historyPagerLabel}>
            <button
              type="button"
              className="history-pager__arrow"
              disabled={page <= 1}
              onClick={() => goToPage(1)}
              aria-label={ZH.historyPagerFirst}
              title={ZH.historyPagerFirst}
            >
              {'\u00ab'}
            </button>
            <button
              type="button"
              className="history-pager__arrow"
              disabled={page <= 1}
              onClick={() => goToPage(page - 1)}
              aria-label={ZH.historyPagerPrev}
            >
              &lt;
            </button>

            <div className="history-pager__main">
              <div className="history-pager__pages">
                {pagerButtons.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`history-pager__page ${p === page ? 'is-active' : ''}`}
                    onClick={() => goToPage(p)}
                    aria-current={p === page ? 'page' : undefined}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <div className="history-pager__jump">
                <span className="history-pager__jump-prefix">{'\u7b2c'}</span>
                <input
                  type="number"
                  className="history-pager__input"
                  min={1}
                  max={totalPages}
                  value={jumpInput}
                  onChange={(e) => setJumpInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleJumpSubmit()
                  }}
                  aria-label={ZH.historyPagerJump}
                />
                <span className="history-pager__jump-suffix">
                  / {totalPages} {'\u9875'}
                </span>
                <button type="button" className="history-pager__go" onClick={handleJumpSubmit}>
                  {ZH.historyPagerJump}
                </button>
              </div>
            </div>

            <button
              type="button"
              className="history-pager__arrow"
              disabled={page >= totalPages}
              onClick={() => goToPage(page + 1)}
              aria-label={ZH.historyPagerNext}
            >
              &gt;
            </button>
            <button
              type="button"
              className="history-pager__arrow"
              disabled={page >= totalPages}
              onClick={() => goToPage(totalPages)}
              aria-label={ZH.historyPagerLast}
              title={ZH.historyPagerLast}
            >
              {'\u00bb'}
            </button>
          </nav>
        </div>
      )}

      {editingId != null ? (
        <div
          className="modal-overlay"
          role="presentation"
          onClick={closeEditModal}
        >
          <div
            className="modal-content history-modal"
            role="dialog"
            aria-modal="true"
            aria-label={ZH.historyEditing}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="history-modal-bar">
              <div className="history-modal-bar__title">
                <span className="history-modal-bar__label">{ZH.historyEditing}</span>
                {editingRowView ? (
                  <time className="history-modal-bar__time">{editingRowView.time}</time>
                ) : null}
                {editingRowView ? (
                  <span className="history-modal-bar__emotion">{editingRowView.emotionLabel}</span>
                ) : null}
              </div>
              <button type="button" className="btn ghost" onClick={closeEditModal}>
                {ZH.historyModalClose}
              </button>
            </div>
            <MoodRecordForm
              key={editingId}
              variant="modal"
              editEntryId={editingId}
              initialData={editingEntry ?? undefined}
              onSaved={handleEditSaved}
              onCancel={closeEditModal}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}

function formatDateLabel(dateKey: string): string {
  const [y, m, d] = dateKey.split('-')
  return `${y}/${m}/${d}`
}
