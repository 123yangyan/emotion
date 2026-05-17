import {
  BEHAVIOR_TAGS,
  BODY_TAGS,
  FACT_SCENES,
  THOUGHT_TAGS,
  getQuickEmotions
} from './emotions'
import type {
  RecordTagBehavior,
  RecordTagEmotion,
  TagListsConfig
} from '../../../shared/types'

export type { RecordTagBehavior, RecordTagEmotion, TagListsConfig }

/** 内置默认：与当前记录页展示一致 */
export function defaultTagLists(): TagListsConfig {
  return {
    emotionsNegative: getQuickEmotions('negative').map((e) => ({
      id: e.id,
      label: e.label
    })),
    emotionsPositive: getQuickEmotions('positive').map((e) => ({
      id: e.id,
      label: e.label
    })),
    factScenes: [...FACT_SCENES],
    thoughtTags: [...THOUGHT_TAGS],
    bodyTags: [...BODY_TAGS],
    behaviorTags: BEHAVIOR_TAGS.map((b) => ({ id: b.id, label: b.label }))
  }
}

export function resolveTagLists(raw?: TagListsConfig | null): TagListsConfig {
  if (!raw) return defaultTagLists()
  return {
    emotionsNegative: raw.emotionsNegative?.length
      ? raw.emotionsNegative
      : defaultTagLists().emotionsNegative,
    emotionsPositive: raw.emotionsPositive?.length
      ? raw.emotionsPositive
      : defaultTagLists().emotionsPositive,
    factScenes: raw.factScenes?.length ? raw.factScenes : defaultTagLists().factScenes,
    thoughtTags: raw.thoughtTags?.length ? raw.thoughtTags : defaultTagLists().thoughtTags,
    bodyTags: raw.bodyTags?.length ? raw.bodyTags : defaultTagLists().bodyTags,
    behaviorTags: raw.behaviorTags?.length
      ? raw.behaviorTags
      : defaultTagLists().behaviorTags
  }
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
  for (const e of [...tagLists.emotionsNegative, ...tagLists.emotionsPositive]) {
    map.set(e.id, e.label)
  }
  return map
}
