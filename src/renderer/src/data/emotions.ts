/** 系统状态词典：Zone 分类 + 录入标签 */
export type EmotionPolarity = 'positive' | 'negative' | 'neutral'

export interface EmotionItem {
  id: string
  label: string
  polarity: EmotionPolarity
}

/** 历史记录兼容：旧 CBT 情绪 id 保留供 label 查找 */
const LEGACY_EMOTIONS: EmotionItem[] = [
  { id: 'anxious', label: '焦虑', polarity: 'negative' },
  { id: 'worried', label: '担忧', polarity: 'negative' },
  { id: 'angry', label: '愤怒', polarity: 'negative' },
  { id: 'irritated', label: '烦躁', polarity: 'negative' },
  { id: 'sad', label: '悲伤', polarity: 'negative' },
  { id: 'grieved', label: '难过', polarity: 'negative' },
  { id: 'wronged', label: '委屈', polarity: 'negative' },
  { id: 'frustrated', label: '沮丧', polarity: 'negative' },
  { id: 'fear', label: '恐惧', polarity: 'negative' },
  { id: 'ashamed', label: '羞耻', polarity: 'negative' },
  { id: 'guilty', label: '内疚', polarity: 'negative' },
  { id: 'lonely', label: '孤独', polarity: 'negative' },
  { id: 'helpless', label: '无助', polarity: 'negative' },
  { id: 'disappointed', label: '失望', polarity: 'negative' },
  { id: 'jealous', label: '嫉妒', polarity: 'negative' },
  { id: 'envious', label: '羡慕（不适）', polarity: 'negative' },
  { id: 'disgusted', label: '厌恶', polarity: 'negative' },
  { id: 'stressed', label: '压力大', polarity: 'negative' },
  { id: 'overwhelmed', label: '不堪重负', polarity: 'negative' },
  { id: 'numb_neg', label: '麻木（难受向）', polarity: 'negative' },
  { id: 'happy', label: '开心', polarity: 'positive' },
  { id: 'grateful', label: '感激', polarity: 'positive' },
  { id: 'hopeful', label: '希望', polarity: 'positive' },
  { id: 'satisfied', label: '满足', polarity: 'positive' },
  { id: 'excited', label: '兴奋', polarity: 'positive' },
  { id: 'relaxed', label: '放松', polarity: 'positive' },
  { id: 'proud', label: '自豪', polarity: 'positive' },
  { id: 'warm', label: '温暖', polarity: 'positive' },
  { id: 'moved', label: '感动', polarity: 'positive' },
  { id: 'confident', label: '自信', polarity: 'positive' },
  { id: 'peaceful_pos', label: '安宁', polarity: 'positive' },
  { id: 'interested', label: '有兴趣', polarity: 'positive' },
  { id: 'energetic', label: '有活力', polarity: 'positive' },
  { id: 'calm', label: '平静', polarity: 'neutral' },
  { id: 'numb', label: '麻木', polarity: 'neutral' },
  { id: 'blank', label: '茫然', polarity: 'neutral' },
  { id: 'tired', label: '疲惫', polarity: 'neutral' },
  { id: 'bored', label: '无聊', polarity: 'neutral' },
  { id: 'confused', label: '困惑', polarity: 'neutral' },
  { id: 'curious', label: '好奇', polarity: 'neutral' },
  { id: 'alert', label: '警觉', polarity: 'neutral' }
]

/** 真我哲学默认词：Zone-S / Zone-0 / Zone-H */
export const ZONE_DEFAULT_EMOTIONS: EmotionItem[] = [
  { id: 'zone_s_flow', label: '纯粹心流', polarity: 'positive' },
  { id: 'zone_s_control', label: '掌控感', polarity: 'positive' },
  { id: 'zone_s_ease', label: '游刃有余', polarity: 'positive' },
  { id: 'zone_s_sovereignty', label: '绝对主权', polarity: 'positive' },
  { id: 'zone_s_curiosity', label: '好奇驱动', polarity: 'positive' },
  { id: 'zone_s_natural', label: '像呼吸一样自然', polarity: 'positive' },
  { id: 'zone_0_mechanical', label: '机械执行', polarity: 'neutral' },
  { id: 'zone_0_routine', label: '按部就班', polarity: 'neutral' },
  { id: 'zone_0_still', label: '心如止水', polarity: 'neutral' },
  { id: 'zone_0_observer', label: '旁观者模式', polarity: 'neutral' },
  { id: 'zone_h_pleasing', label: '迎合外界', polarity: 'negative' },
  { id: 'zone_h_persona', label: '强撑人设', polarity: 'negative' },
  { id: 'zone_h_expectation', label: '过高期许', polarity: 'negative' },
  { id: 'zone_h_forced', label: '被逼迫感', polarity: 'negative' },
  { id: 'zone_h_drain', label: '无意义消耗', polarity: 'negative' },
  { id: 'zone_h_rush', label: '急躁催促', polarity: 'negative' },
  { id: 'zone_h_avoidance', label: '逃避记录', polarity: 'negative' }
]

export const EMOTIONS: EmotionItem[] = [...LEGACY_EMOTIONS, ...ZONE_DEFAULT_EMOTIONS]

/** 外部触发器场景标签：点选即可，可配合自由输入 */
export const FACT_SCENES = [
  '工作/学习',
  '在家',
  '户外',
  '独处',
  '和家人',
  '和同事',
  '和朋友',
  '线上沟通',
  '通勤路上',
  '完成了一件事',
  '运动/散步',
  '娱乐放松'
]

/** 内在剧本 / 参考系：高压标准 + 真我觉察 */
export const THOUGHT_TAGS = [
  '我觉得不够完美',
  '我必须让他人满意',
  '如果搞砸了我就完了',
  '这其实不是我的事',
  '做不到就算了',
  '我在享受这行代码'
]

export const BODY_TAGS = [
  '心跳加快',
  '呼吸急促',
  '肌肉紧绷',
  '出汗',
  '胃部不适',
  '头痛',
  '胸闷',
  '手抖',
  '发冷',
  '发热感'
]

export const BEHAVIOR_TAGS = [
  { id: 'fight', label: '战斗：争吵/指责' },
  { id: 'flight', label: '逃跑：回避/逃离' },
  { id: 'freeze', label: '僵直：发呆/僵住' }
]

export const DURATION_OPTIONS = [
  { value: '', label: '未填写' },
  { value: '<5', label: '少于 5 分钟' },
  { value: '5-30', label: '5–30 分钟' },
  { value: '30-120', label: '30 分钟–2 小时' },
  { value: '120+', label: '超过 2 小时' }
]

/** 设置页分组标题 */
export const POLARITY_LABEL: Record<EmotionPolarity, string> = {
  positive: '真实自我区（Zone-S）',
  negative: '角色扮演区（Zone-H）',
  neutral: '待机观察区（Zone-0）'
}

/** 录入页光谱：6 Zone-S + 4 Zone-0 + 5 Zone-H（共 15 格） */
export const SPECTRUM_EMOTION_IDS = [
  'zone_s_flow',
  'zone_s_control',
  'zone_s_ease',
  'zone_s_sovereignty',
  'zone_s_curiosity',
  'zone_s_natural',
  'zone_0_mechanical',
  'zone_0_routine',
  'zone_0_still',
  'zone_0_observer',
  'zone_h_pleasing',
  'zone_h_persona',
  'zone_h_expectation',
  'zone_h_forced',
  'zone_h_drain'
] as const

/** 设置页 Zone-0 默认 */
export const DEFAULT_NEUTRAL_EMOTION_IDS = [
  'zone_0_mechanical',
  'zone_0_routine',
  'zone_0_still',
  'zone_0_observer'
] as const

/** 设置页各 Zone 快捷词（光谱派生 + 完整 H 组第六项） */
export const QUICK_EMOTION_IDS = {
  positive: [
    'zone_s_flow',
    'zone_s_control',
    'zone_s_ease',
    'zone_s_sovereignty',
    'zone_s_curiosity',
    'zone_s_natural'
  ],
  negative: [
    'zone_h_pleasing',
    'zone_h_persona',
    'zone_h_expectation',
    'zone_h_forced',
    'zone_h_drain',
    'zone_h_rush'
  ]
} as const

const emotionMap = new Map(EMOTIONS.map((e) => [e.id, e]))

export function getQuickEmotions(polarity: 'positive' | 'negative'): EmotionItem[] {
  return QUICK_EMOTION_IDS[polarity]
    .map((id) => emotionMap.get(id))
    .filter((e): e is EmotionItem => !!e)
}

export function getDefaultNeutralEmotions(): EmotionItem[] {
  return DEFAULT_NEUTRAL_EMOTION_IDS.map((id) => emotionMap.get(id)).filter(
    (e): e is EmotionItem => !!e
  )
}

export function getSpectrumEmotions(): EmotionItem[] {
  return SPECTRUM_EMOTION_IDS.map((id) => emotionMap.get(id)).filter(
    (e): e is EmotionItem => !!e
  )
}
