import {
  BEHAVIOR_TAGS,
  BODY_TAGS,
  FACT_SCENES,
  THOUGHT_TAGS,
  getDefaultNeutralEmotions,
  getQuickEmotions,
  getSpectrumEmotions
} from './emotions'
import type {
  RecordTagBehavior,
  RecordTagEmotion,
  TagListsConfig
} from '../../../shared/types'

export type { RecordTagBehavior, RecordTagEmotion, TagListsConfig }

function toRecordTags(items: { id: string; label: string }[]): RecordTagEmotion[] {
  return items.map((e) => ({ id: e.id, label: e.label }))
}

/** 去重合并：按 id 保留首次出现顺序 */
function dedupeById(items: RecordTagEmotion[]): RecordTagEmotion[] {
  const seen = new Set<string>()
  const out: RecordTagEmotion[] = []
  for (const item of items) {
    if (seen.has(item.id)) continue
    seen.add(item.id)
    out.push(item)
  }
  return out
}

function defaultNeutralTags(): RecordTagEmotion[] {
  return toRecordTags(getDefaultNeutralEmotions())
}

/** 从三组词表合成一维光谱（愉快 → 平稳 → 低落） */
export function buildEmotionSpectrumFromGroups(lists: TagListsConfig): RecordTagEmotion[] {
  const positive = lists.emotionsPositive ?? []
  const neutral =
    lists.emotionsNeutral?.length ? lists.emotionsNeutral : defaultNeutralTags()
  const negative = lists.emotionsNegative ?? []
  return dedupeById([...positive, ...neutral, ...negative])
}

/** 解析录入页使用的情绪光谱；兼容旧用户配置 */
export function resolveEmotionSpectrum(lists: TagListsConfig): RecordTagEmotion[] {
  if (lists.emotionsSpectrum && lists.emotionsSpectrum.length > 0) {
    return lists.emotionsSpectrum
  }
  return buildEmotionSpectrumFromGroups(lists)
}

/** 设置页编辑三组后，重建并写回 emotionsSpectrum */
export function syncEmotionSpectrum(lists: TagListsConfig): TagListsConfig {
  const spectrum = buildEmotionSpectrumFromGroups(lists)
  return { ...lists, emotionsSpectrum: spectrum }
}

/** 内置默认：与当前记录页展示一致 */
export function defaultTagLists(): TagListsConfig {
  const emotionsPositive = getQuickEmotions('positive').map((e) => ({
    id: e.id,
    label: e.label
  }))
  const emotionsNeutral = defaultNeutralTags()
  const emotionsNegative = getQuickEmotions('negative').map((e) => ({
    id: e.id,
    label: e.label
  }))
  const emotionsSpectrum = dedupeById([
    ...emotionsPositive,
    ...emotionsNeutral,
    ...emotionsNegative
  ])
  return {
    emotionsSpectrum,
    emotionsPositive,
    emotionsNeutral,
    emotionsNegative,
    factScenes: [...FACT_SCENES],
    thoughtTags: [...THOUGHT_TAGS],
    bodyTags: [...BODY_TAGS],
    behaviorTags: BEHAVIOR_TAGS.map((b) => ({ id: b.id, label: b.label }))
  }
}

export function resolveTagLists(raw?: TagListsConfig | null): TagListsConfig {
  const base = defaultTagLists()
  if (!raw) return base
  const merged: TagListsConfig = {
    emotionsPositive: raw.emotionsPositive?.length ? raw.emotionsPositive : base.emotionsPositive,
    emotionsNeutral: raw.emotionsNeutral?.length ? raw.emotionsNeutral : base.emotionsNeutral,
    emotionsNegative: raw.emotionsNegative?.length ? raw.emotionsNegative : base.emotionsNegative,
    factScenes: raw.factScenes?.length ? raw.factScenes : base.factScenes,
    thoughtTags: raw.thoughtTags?.length ? raw.thoughtTags : base.thoughtTags,
    bodyTags: raw.bodyTags?.length ? raw.bodyTags : base.bodyTags,
    behaviorTags: raw.behaviorTags?.length ? raw.behaviorTags : base.behaviorTags
  }
  merged.emotionsSpectrum =
    raw.emotionsSpectrum?.length ? raw.emotionsSpectrum : resolveEmotionSpectrum(merged)
  return merged
}

export function makeTagId(prefix: string, label: string): string {
  const slug = label
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^\w\u4e00-\u9fa5-]/g, '')
  return `${prefix}_${slug || Date.now()}`
}

/** 合并内置词典 + 用户词表，供图表显示历史情绪名 */
export function buildEmotionLabelMap(
  tagLists: TagListsConfig,
  builtin: { id: string; label: string }[]
): Map<string, string> {
  const map = new Map(builtin.map((e) => [e.id, e.label]))
  const spectrum = resolveEmotionSpectrum(tagLists)
  for (const e of spectrum) {
    map.set(e.id, e.label)
  }
  return map
}
