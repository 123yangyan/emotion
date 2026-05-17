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

/** 事实情境标签：点选即可，无需长文 */
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
  '睡眠不足',
  '身体不适',
  '没什么特别'
]

/** 主观想法：常见自动化思维（单选胶囊） */
export const THOUGHT_TAGS = [
  '肯定会搞砸',
  '他们在针对我',
  '我不配',
  '事情会变糟',
  '我不该有这种感受',
  '都是我的错',
  '我应付不来',
  '没什么想法'
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

export const POLARITY_LABEL: Record<EmotionPolarity, string> = {
  positive: '积极',
  negative: '消极',
  neutral: '中性'
}

/** 录入页常用情绪（约 8+8，积极 / 消极分开展示） */
export const QUICK_EMOTION_IDS = {
  negative: [
    'anxious',
    'grieved',
    'angry',
    'irritated',
    'frustrated',
    'wronged',
    'stressed',
    'lonely'
  ],
  positive: ['happy', 'relaxed', 'grateful', 'satisfied', 'excited', 'hopeful', 'warm', 'peaceful_pos']
} as const

const emotionMap = new Map(EMOTIONS.map((e) => [e.id, e]))

export function getQuickEmotions(polarity: 'positive' | 'negative'): EmotionItem[] {
  return QUICK_EMOTION_IDS[polarity]
    .map((id) => emotionMap.get(id))
    .filter((e): e is EmotionItem => !!e)
}
