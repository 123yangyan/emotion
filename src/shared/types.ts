/** 记录页情绪标签（保留供设置页兼容，录入流程已不使用） */
export interface RecordTagEmotion {
  id: string
  label: string
}

/** 身心反应中的行为模式标签 */
export interface RecordTagBehavior {
  id: string
  label: string
}

/** 记录页可自定义标签 */
export interface TagListsConfig {
  emotionsPositive: RecordTagEmotion[]
  emotionsNeutral?: RecordTagEmotion[]
  emotionsNegative: RecordTagEmotion[]
  factScenes: string[]
  /** 主观想法：常见自动化思维胶囊 */
  thoughtTags: string[]
  bodyTags: string[]
  behaviorTags: RecordTagBehavior[]
}

/** 疲劳检查表单数据（每日 18:00 打卡使用） */
export interface FatigueCheck {
  /** 今日琐碎决策量 */
  decision_load: '少' | '正常' | '极多'
  /** 是否对简单决定也犹豫不决 */
  hesitate: boolean
  /** 是否更倾向于逃避/对小挫折失去耐心 */
  escapeTendency: boolean
  /** 是否感到脑雾（认知模糊） */
  brainFog: boolean
  /** 今日最重要决策质量打分 1-9 */
  decision_quality: number
}

/** 应用设置（与主进程 settings.ts 同步） */
export interface AppSettings {
  /** 提醒间隔（分钟）：按设定间隔弹窗提醒 */
  reminderIntervalMinutes: number
  /** 静默时段开始，如 22:00 */
  quietStart: string
  /** 静默时段结束，如 08:00 */
  quietEnd: string
  strongPopup: boolean
  notificationsEnabled: boolean
  /** 记录页标签词表；未设置时使用内置默认 */
  tagLists?: TagListsConfig
}
