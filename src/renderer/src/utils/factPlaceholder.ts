import { ZH } from '../i18n/zh'

/** 场景 chip 选中后，输入框 placeholder 动态引导 */
const SCENE_PLACEHOLDERS: Record<string, string> = {
  '工作/学习': '工作/学习中发生了什么让你有这种感受？…',
  '在家': '在家时发生了什么？…',
  '户外': '户外发生了什么？…',
  '独处': '独处时在做什么、想什么？…',
  '和家人': '和家人之间发生了什么？…',
  '和同事': '和同事之间发生了什么？…',
  '和朋友': '和朋友之间发生了什么？…',
  '线上沟通': '线上沟通中发生了什么？…',
  '通勤路上': '通勤路上发生了什么？…',
  '完成了一件事': '完成了什么？当时感觉如何？…',
  '运动/散步': '运动或散步时有什么感受或事件？…',
  '娱乐放松': '放松时在做什么、感觉如何？…',
  '没什么特别': '若仍想补充，可以写一句…'
}

export function getFactInputPlaceholder(selectedScene?: string): string {
  if (selectedScene && SCENE_PLACEHOLDERS[selectedScene]) {
    return SCENE_PLACEHOLDERS[selectedScene]
  }
  return ZH.factNotePh
}
