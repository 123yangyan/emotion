/** 记录页情绪标签（积极 / 消极） */
export interface RecordTagEmotion {
  id: string
  label: string
}

/** 身心反应中的行为模式标签 */
export interface RecordTagBehavior {
  id: string
  label: string
}

/** 记录页三块可自定义标签 */
export interface TagListsConfig {
  emotionsNegative: RecordTagEmotion[]
  emotionsPositive: RecordTagEmotion[]
  factScenes: string[]
  /** 主观想法：常见自动化思维胶囊 */
  thoughtTags: string[]
  bodyTags: string[]
  behaviorTags: RecordTagBehavior[]
}

/** 应用设置（与主进程 settings.ts 同步） */
export interface AppSettings {
  /** 提醒间隔（小时）：今日未记录时，每隔 N 小时弹一次 */
  reminderIntervalHours: number
  /** 静默时段开始，如 22:00 */
  quietStart: string
  /** 静默时段结束，如 08:00 */
  quietEnd: string
  strongPopup: boolean
  notificationsEnabled: boolean
  /** 记录页标签词表；未设置时使用内置默认 */
  tagLists?: TagListsConfig
}
