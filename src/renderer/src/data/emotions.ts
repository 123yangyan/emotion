/** 情绪词典：分类 + 多选标签 */
export type EmotionPolarity = 'positive' | 'negative' | 'neutral'

export interface EmotionItem {
  id: string
  label: string
  polarity: EmotionPolarity
}

export const EMOTIONS: EmotionItem[] = [
  // 消极
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
  // 积极
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
  // 中性
  { id: 'calm', label: '平静', polarity: 'neutral' },
  { id: 'numb', label: '麻木', polarity: 'neutral' },
  { id: 'blank', label: '茫然', polarity: 'neutral' },
  { id: 'tired', label: '疲惫', polarity: 'neutral' },
  { id: 'bored', label: '无聊', polarity: 'neutral' },
  { id: 'confused', label: '困惑', polarity: 'neutral' },
  { id: 'curious', label: '好奇', polarity: 'neutral' },
  { id: 'alert', label: '警觉', polarity: 'neutral' }
]

/** 发生场景标签：点选即可，可配合自由输入 */
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
  '娱乐放松',
  '没什么特别'
]

/** 主观想法：软化担忧 + 中性观察 + 接纳与积极应对 */
export const THOUGHT_TAGS = [
  '担心结果不如预期',
  '有些自责',
  '可能不太顺利',
  '有点压力',
  '还没完全想清楚',
  '只是有点累了',
  '没什么特别想法',
  '允许自己有这种感受',
  '我已经尽力了',
  '这也会过去的',
  '可以试试别的办法'
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
  positive: '愉快',
  negative: '低落',
  neutral: '平稳'
}

/** 录入页情绪光谱：5 积极 + 5 中性 + 5 偏负（内省型，无高攻击性词） */
export const SPECTRUM_EMOTION_IDS = [
  'happy',
  'grateful',
  'relaxed',
  'satisfied',
  'warm',
  'peaceful_pos',
  'calm',
  'curious',
  'tired',
  'blank',
  'anxious',
  'worried',
  'frustrated',
  'grieved',
  'lonely'
] as const

/** 旧用户词表 merge 时补齐的中性情绪 */
export const DEFAULT_NEUTRAL_EMOTION_IDS = [
  'peaceful_pos',
  'calm',
  'curious',
  'tired',
  'blank'
] as const

/** 录入页常用情绪（由光谱派生，供设置页分组 fallback） */
export const QUICK_EMOTION_IDS = {
  positive: SPECTRUM_EMOTION_IDS.slice(0, 5),
  negative: SPECTRUM_EMOTION_IDS.slice(10, 15)
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
