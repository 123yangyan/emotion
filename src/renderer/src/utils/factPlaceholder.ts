import type { TagListsConfig } from '../../../shared/types'
import { ZH } from '../i18n/zh'
import { resolveEmotionPolarity } from './emotionSpectrum'

/** 场景 chip 选中后，输入框 placeholder 动态引导（次于 Zone 优先） */
const SCENE_PLACEHOLDERS: Record<string, string> = {
  '工作/学习': '工作/学习中，什么外界标准或任务触发了你？…',
  '在家': '在家时，什么触发了此刻的状态？…',
  '户外': '户外发生了什么外部触发？…',
  '独处': '独处时在观察什么？身体有什么信号？…',
  '和家人': '和家人之间，什么期待或标准在起作用？…',
  '和同事': '和同事之间，什么外界压力触发了你？…',
  '和朋友': '和朋友之间，发生了什么？…',
  '线上沟通': '线上沟通中，什么消息或期待触发了你？…',
  '通勤路上': '通勤路上，什么外界因素触发了你？…',
  '完成了一件事': '完成了什么？此刻更接近真我还是在扮演？…',
  '运动/散步': '运动或散步时，身体与状态如何？…',
  '娱乐放松': '放松时在做什么？是充电还是在逃避？…'
}

function placeholderForZone(polarity: ReturnType<typeof resolveEmotionPolarity>): string {
  if (polarity === 'positive') return ZH.factPlaceholderZoneS
  if (polarity === 'negative') return ZH.factPlaceholderZoneH
  return ZH.factPlaceholderZone0
}

export function getFactInputPlaceholder(
  selectedScene?: string,
  selectedEmotionId?: string,
  tagLists?: TagListsConfig
): string {
  if (selectedEmotionId) {
    return placeholderForZone(resolveEmotionPolarity(selectedEmotionId, tagLists))
  }
  if (selectedScene && SCENE_PLACEHOLDERS[selectedScene]) {
    return SCENE_PLACEHOLDERS[selectedScene]
  }
  return ZH.factNotePh
}
