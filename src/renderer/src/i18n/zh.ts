/** UI 文案（Unicode 转义，避免编码损坏导致编译失败） */
export const ZH = {
  loading: '\u52a0\u8f7d\u4e2d\u2026',
  chartTitle: '\u4eca\u65e5\u72b6\u6001\u66f2\u7ebf',
  chartSubtitle: (n: number) =>
    n > 0
      ? `\u4eca\u65e5\u5171 ${n} \u6761\u8bb0\u5f55\u00b7\u5b9e\u7ebf=\u4ef7\u5024\u611f\uff0c\u865a\u7ebf=\u8017\u80fd\u5ea6\uff0c\u70b9\u8272\u6309\u8c61\u9650`
      : '\u7eb5\u8f74 \u22124 ~ +4\uff1a\u5b9e\u7ebf=\u4ef7\u5024\u611f\uff08\u6b63=\u613f\u610f/\u8d1f=\u6392\u65a5\uff09\uff0c\u865a\u7ebf=\u8017\u80fd\u5ea6\uff08\u6b63=\u9ad8\u8017/\u8d1f=\u8f7b\u677e\uff09',
  chartAxis: '\u7eb5\u8f74 \u22124 ~ +4 \u00b7 \u5b9e\u7ebf=\u4ef7\u5024\u611f\uff08\u613f\u610f\u2191/\u6392\u65a5\u2193\uff09\u00b7 \u865a\u7ebf=\u8017\u80fd\u5ea6\uff08\u9ad8\u8017\u2191/\u8f7b\u677e\u2193\uff09\u00b7 \u70b9\u8272\u6309\u8c61\u9650',
  chartEmpty: '\u4eca\u5929\u8fd8\u6ca1\u6709\u8bb0\u5f55\uff0c\u53bb\u300c\u8bb0\u5f55\u300d\u9875\u5199\u7b2c\u4e00\u6761\u5427\u3002',
  chartTooltipFact: '\u5916\u90e8\u89e6\u53d1\u5668',
  chartTooltipBody: '\u8eab\u5fc3',
  chartTooltipQuadrant: '\u80fd\u91cf\u533a',
  chartLegendPos: '\u2500\u2500 \u4ef7\u5024\u611f\uff08\u6b63=\u613f\u610f \u00b7 \u8d1f=\u6392\u65a5\uff09',
  chartLegendNeg: '- - - \u8017\u80fd\u5ea6\uff08\u6b63=\u9ad8\u8017 \u00b7 \u8d1f=\u8f7b\u677e\uff09',
  chartLegendNeu: '\u70b9\u8272\uff1a\u5fc3\u6d41=\u7eff\u00b7\u653b\u575a=\u6a59\u00b7\u673a\u68b0=\u7070\u00b7\u5185\u8017=\u7ea2',
  causeCanvasTitle: '\u60c5\u5883\u2014\u6210\u56e0\u903b\u8f91\u94fe',
  causeCanvasDesc:
    '\u4ece\u300c\u4e8b\u5b9e\u8f93\u5165 \u2192 \u8eab\u5fc3\u4e2d\u4ecb \u2192 \u60c5\u7eea\u8f93\u51fa\u300d\u68c0\u6d4b\u4eca\u65e5\u5f3a\u5173\u8054\uff0c\u5e2e\u4f60\u6293\u51fa\u6f5c\u5728\u89e6\u53d1\u6e90\u3002',
  causeCanvasEmpty:
    '\u4eca\u65e5\u6682\u65e0\u53ef\u5206\u6790\u7684\u8bb0\u5f55\uff1b\u5b8c\u6210\u4e00\u6761\u542b\u4e8b\u5b9e\u4e0e\u8eab\u5fc3\u7684\u8bb0\u5f55\u540e\u4f1a\u51fa\u73b0\u521d\u6b65\u6d1e\u5bdf\u3002',
  causeCanvasBadge: '\u4eca\u65e5\u56e0\u679c\u94fe\u4fa6\u6d4b',
  causeInsightIntro: '\u5f53\u6ee1\u8db3 ',
  causeInsightMid: ' \u8fd9\u4e00\u60c5\u5883\u65f6\uff0c\u7cfb\u7edf\u68c0\u6d4b\u5230\u60a8\u7684 ',
  causeInsightRate: (n: number) => ` \u89e6\u53d1\u7387\u7ea6 ${n}%`,
  causeInsightTail: '\uff0c\u5e76\u5e38\u5bfc\u81f3 ',
  causeFactLabel: '\u4e8b\u5b9e\uff1a',
  causeBodyLabel: '\u8eab\u5fc3\u53cd\u5e94\uff1a',
  causeEmotionLabel: '\u6838\u5fc3\u60c5\u7eea\uff1a',
  causeIntensityWrap: (n: string) => `\uff08\u5f3a\u5ea6 ${n}\uff09`,
  causeBodyUnknown: '\u672a\u6807\u6ce8\u8eab\u5fc3',
  causeEmotionUnknown: '\u672a\u6807\u6ce8\u60c5\u7eea',
  causeMeta: (m: number, t: number) => `\u5171 ${t} \u6761\u76f8\u5173\u8bb0\u5f55\u00b7\u5339\u914d ${m} \u6761`,
  causeLowConfidence: '\u6837\u672c\u8f83\u5c11\uff0c\u4ec5\u4f9b\u53c2\u8003',
  causeFlowFact: '\u60c5\u5883',
  causeFlowBody: '\u8eab\u5fc3',
  causeFlowEmotion: '\u60c5\u7eea',
  quadrantTitle: '\u80fd\u91cf\u6d41\u52a8\u77e9\u9635',
  quadrantDesc:
    '\u6a2a\u8f74\uff1a\u9022\u5408\u5916\u754c\u6807\u51c6 \u2192 \u987a\u5e94\u5185\u5728\u771f\u6211\uff1b\u7eb5\u8f74\uff1a\u5185\u8017\u6389\u7535 \u2192 \u4e13\u6ce8\u5145\u7535\u3002\u5c06\u4eca\u65e5\u8bb0\u5f55\u5b9a\u4f4d\u5230\u56db\u533a\u5e76\u7ed9\u51fa\u884c\u52a8\u5efa\u8bae\u3002',
  quadrantEmpty: '\u6682\u65e0\u8bb0\u5f55\u53ef\u5206\u6790\u3002',
  quadrantArousalHigh: '\u6781\u5ea6\u4e13\u6ce8\u5145\u7535',
  quadrantArousalLow: '\u6781\u5ea6\u5185\u8017\u6389\u7535',
  quadrantValenceNeg: '\u9022\u5408\u5916\u754c\u6807\u51c6',
  quadrantValencePos: '\u987a\u5e94\u5185\u5728\u771f\u6211',
  quadrantCount: (n: number) => `\u4eca\u65e5 ${n} \u6761`,
  quadrantCountZero: '\u4eca\u65e5\u672a\u51fa\u73b0',
  quadrantEmotionExamples: '\u5178\u578b\u72b6\u6001\uff1a',
  quadrantBodyTraits: '\u8eab\u5fc3\u7279\u5f81\uff1a',
  quadrantAdvice: '\u5efa\u8bae\uff1a',
  weatherTitle: '\u4eca\u65e5\u6c14\u8c61\u547d\u540d\uff08\u53ef\u9009\uff09',
  weatherPlaceholder: '\u4f8b\u5982\uff1a\u96f7\u9635\u96e8\u8f6c\u6674\u7684\u4e00\u5929',
  saveTitle: '\u4fdd\u5b58\u6807\u9898',
  refresh: '\u5237\u65b0',
  intensityLabel: (v: number) => `\u5f3a\u5ea6 ${v}`,
  emotionJoin: '\u3001',

  selectEmotion: '\u8bf7\u9009\u62e9\u4e00\u4e2a\u7cfb\u7edf\u72b6\u6001',
  saveFail: '\u4fdd\u5b58\u5931\u8d25\uff0c\u8bf7\u91cd\u8bd5',
  checkInTitle: '\u8bb0\u5f55\u4eca\u5929\u7684\u72b6\u6001',
  checkInTitleNow: '\u8bb0\u5f55\u6b64\u523b\u7684\u72b6\u6001',
  checkInClose: '\u5173\u95ed',
  checkInSaved: '\u5df2\u6536\u7eb3',
  emotionCore: '\u7cfb\u7edf\u72b6\u6001',
  factHappened: '\u5916\u90e8\u89e6\u53d1\u5668',
  factSceneTitle: '\u5916\u90e8\u89e6\u53d1\u5668',
  factSceneHint: '\u70b9\u9009\u89e6\u53d1\u6765\u6e90\uff0c\u53ef\u7528\u4e00\u53e5\u8bdd\u8865\u5145\u7ec6\u8282',
  checkInKeyboardHint: '1\u20135 \u9009\u8d1f\u8377 \u00b7 Esc \u8bb0\u5f55\u9003\u907f',
  energyTier1: '\u505c\u673a',
  energyTier2: '\u6f0f\u7535',
  energyTier3: '\u5f85\u673a',
  energyTier4: '\u6d3b\u8dc3',
  energyTier5: '\u51b2\u51fb',
  energyTierLabel: (tier: number, label: string) => `\u8d1f\u8377\u6863\u4f4d ${tier}\uff1a${label}`,
  emotionCoreHint: '\u9009\u4e00\u4e2a\u6700\u8d34\u8fd1\u6b64\u523b\u7684\u72b6\u6001',
  factSceneHintShort: '\u70b9\u9009\u6765\u6e90',
  diaryTitle: '\u4eca\u5929\u2026',
  diaryHintShort: '\u968f\u624b\u5199\u51e0\u53e5\u5c31\u597d',
  diaryPlaceholder: '\u4eca\u5929\u53d1\u751f\u4e86\u4ec0\u4e48\uff1f\u968f\u4fbf\u5199\u51e0\u53e5\u5c31\u597d',
  /** 日记日期头：6月2日 */
  diaryDateDay: (dateLabel: string) => {
    const parts = dateLabel.split('/')
    if (parts.length < 3) return dateLabel || '\u4eca\u5929'
    const m = Number(parts[1])
    const d = Number(parts[2])
    if (!Number.isFinite(m) || !Number.isFinite(d)) return dateLabel
    return `${m}\u6708${d}\u65e5`
  },
  /** 日记日期头：周一 */
  diaryDateWeekday: (dateLabel: string) => {
    const parts = dateLabel.split('/').map(Number)
    if (parts.length < 3 || !parts.every(Number.isFinite)) return ''
    const date = new Date(parts[0], parts[1] - 1, parts[2])
    const weekdays = ['\u5468\u65e5', '\u5468\u4e00', '\u5468\u4e8c', '\u5468\u4e09', '\u5468\u56db', '\u5468\u4e94', '\u5468\u516d']
    return weekdays[date.getDay()]
  },
  coordSectionLabel: '\u6b64\u523b\u7684\u72b6\u6001',
  thoughtHintShort: '\u9009\u4e00\u4e2a\u8d34\u8fd1\u7684\u60f3\u6cd5',
  saveRecordEnter: '\u4fdd\u5b58\u8bb0\u5f55 (Enter)',
  saveRecordCtrlEnter: '\u4fdd\u5b58\u8bb0\u5f55 (Ctrl+Enter)',
  checkInSaveShortcut: 'Ctrl+Enter \u4fdd\u5b58',
  checkInHint: '\u5230\u65f6\u95f4\u4e86\uff0c\u7559\u610f\u4e00\u4e0b\u6b64\u523b\u662f\u5728\u5145\u7535\u8fd8\u662f\u5728\u626e\u6f14\u3002',
  recordTime: '\u8bb0\u5f55\u65f6\u95f4',
  recordTimeHint:
    '\u81ea\u52a8\u4f7f\u7528\u5f53\u524d\u65f6\u95f4\uff0c\u4fdd\u5b58\u65f6\u5199\u5165\u5e74\u6708\u65e5\u4e0e\u65f6\u5206\u79d2\u3002',
  lastRecordAt: (t: string) => `\u4e0a\u6b21\u8bb0\u5f55 ${t}`,
  lastRecordNone: '\u4e0a\u6b21\u8bb0\u5f55\uff1a\u5c1a\u65e0',
  moodIntensity: '\u72b6\u6001\u5f3a\u5ea6',
  intensityScale: (n: number) =>
    `\u5f53\u524d\u7b49\u7ea7 ${n}\uff081 \u4f4e\u5524\u9192 \u00b7 5 \u4e2d\u7b49 \u00b7 9 \u9ad8\u5524\u9192\uff09`,
  objectiveFact: '\u5916\u90e8\u89e6\u53d1\u5668',
  subjectiveThought: '\u5185\u5728\u5267\u672c / \u53c2\u8003\u7cfb',
  thoughtHint:
    '\u8fd9\u662f\u4f60\u7684\u672c\u5fc3\uff0c\u8fd8\u662f\u5916\u754c\u7684\u6807\u51c6\uff1f\u9009\u4e00\u4e2a\u8d34\u8fd1\u7684\u60f3\u6cd5\uff0c\u53ef\u8865\u5145\u4e00\u53e5',
  thoughtNotePh: '\u8111\u4e2d\u95ea\u8fc7\u7684\u539f\u8bdd\u2026',
  chartTooltipThought: '\u5185\u5728\u5267\u672c',
  objectiveHint: '\u70b9\u9009\u573a\u666f\u5373\u53ef',
  factSupplement: '\u8865\u5145\u8bf4\u660e\uff08\u53ef\u9009\uff09',
  factSupplementPh: '\u4e00\u53e5\u8bdd\u8865\u5145\u5373\u53ef',
  factNotePh: '\u662f\u4ec0\u4e48\u5916\u754c\u4e8b\u4ef6\u89e6\u53d1\u4e86\u4f60\uff1f\u2026',
  factPlaceholderZoneS: '\u6b64\u523b\u662f\u4ec0\u4e48\u8ba9\u4f60\u611f\u5230\u5982\u6b64\u5951\u5408\u672c\u6027\uff1f',
  factPlaceholderZoneH:
    '\u6b64\u523b\u4f60\u5728\u5f3a\u884c\u626e\u6f14\u8c01\uff1f\u5916\u754c\u7684\u4ec0\u4e48\u6807\u51c6\u8ba9\u4f60\u611f\u5230\u75db\u82e6\uff1f',
  factPlaceholderZone0: '\u6b64\u523b\u4f60\u5728\u89c2\u5bdf\u4ec0\u4e48\uff1f\u8eab\u4f53\u6709\u4ec0\u4e48\u4fe1\u53f7\uff1f',
  factAddNote: '\u8865\u5145\u4e00\u53e5\u8bdd',
  emotion: '\u60c5\u7eea',
  emotionHint: '\u9009\u4e00\u4e2a\u6700\u8d34\u8fd1\u6b64\u523b\u7684\u72b6\u6001',
  spectrumHintPleasant: '\u771f\u5b9e\u5145\u7535',
  spectrumHintNeutral: '\u65e0\u611f\u8fd0\u884c',
  spectrumHintLow: '\u89d2\u8272\u626e\u6f14',
  quickPick: '\u5feb\u901f\u70b9\u9009',
  filterAll: '\u5168\u90e8',
  filterNegative: 'Zone-H',
  filterPositive: 'Zone-S',
  filterNeutral: 'Zone-0',
  bodyMind: '\u8eab\u5fc3\u53cd\u5e94',
  bodyMindHint: '\u8eab\u4f53\u611f\u53d7\u4e0e\u884c\u4e3a\u6a21\u5f0f\uff08\u53ef\u591a\u9009\uff09\u3002',
  body: '\u8eab\u4f53',
  behavior: '\u884c\u4e3a',
  reactionOptional: '\u8865\u5145\uff08\u53ef\u9009\uff09',
  saving: '\u4fdd\u5b58\u4e2d\u2026',
  saveRecord: '\u4fdd\u5b58\u8bb0\u5f55',

  settingsLoading: '\u52a0\u8f7d\u8bbe\u7f6e\u2026',
  settingsSaved: '\u8bbe\u7f6e\u5df2\u4fdd\u5b58',
  exportOk: (p: string) => `\u5df2\u5bfc\u51fa\u5230 ${p}`,
  exportCancel: '\u5df2\u53d6\u6d88\u5bfc\u51fa',
  dailyReminder: '\u63d0\u9192\u8bbe\u7f6e',
  dailyReminderDesc:
    '\u6309\u8bbe\u5b9a\u95f4\u9694\u5f39\u7a97\u63d0\u9192\uff1b\u4fdd\u5b58\u8bb0\u5f55\u540e\u4ecd\u4f1a\u7ee7\u7eed\u63d0\u9192\u3002Esc \u5173\u95ed\u5f39\u7a97\u4f1a\u9759\u9ed8\u5199\u5165\u4e00\u6761\u300c\u9003\u907f\u8bb0\u5f55\u300d\u3002\u9759\u9ed8\u65f6\u6bb5\u5185\u4e0d\u63d0\u9192\u3002',
  reminderInterval: '\u63d0\u9192\u95f4\u9694\uff08\u5206\u949f\uff09',
  reminderIntervalHint:
    '\u4f8b\u5982\u586b 60\uff1a\u6bcf 60 \u5206\u949f\u4e00\u6b21\uff1b\u53ef\u586b 1\u20131440\uff08\u6700\u957f 24 \u5c0f\u65f6\uff09\u3002\u9759\u9ed8\u65f6\u6bb5\u4e0d\u63d0\u9192\u3002',
  quietPeriod: '\u9759\u9ed8\u65f6\u6bb5\uff08\u6b64\u65f6\u6bb5\u4e0d\u5f39\u7a97\uff09',
  quietStart: '\u5f00\u59cb',
  quietEnd: '\u7ed3\u675f',
  quietExample: '\u9ed8\u8ba4 22:00 \u81f3\u6b21\u65e5 08:00\uff0c\u591c\u95f4\u4e0d\u6253\u6270\u3002',
  notifyOn: '\u5f00\u542f\u7cfb\u7edf\u901a\u77e5',
  popupOn: '\u5f00\u542f\u5f3a\u63d0\u9192\u5f39\u7a97\uff08\u7f6e\u9876\uff09',
  recordedToday: (count: number) =>
    count > 0
      ? `\u4eca\u65e5\u5df2\u8bb0\u5f55 ${count} \u6761\uff0c\u4ecd\u6309\u95f4\u9694\u81ea\u52a8\u63d0\u9192`
      : '\u4eca\u65e5\u5c1a\u672a\u8bb0\u5f55',
  saveSettings: '\u4fdd\u5b58\u8bbe\u7f6e',
  saveSettingsHint:
    '\u63d0\u9192\u95f4\u9694\u3001\u9759\u9ed8\u65f6\u6bb5\u3001\u901a\u77e5\u4e0e\u5f39\u7a97\u7b49\u4fee\u6539\u540e\uff0c\u5fc5\u987b\u70b9\u51fb\u300c\u4fdd\u5b58\u8bbe\u7f6e\u300d\u624d\u4f1a\u5199\u5165\u672c\u5730\uff1b\u672a\u4fdd\u5b58\u524d\u5173\u95ed\u5e94\u7528\u4f1a\u4e22\u5931\u3002',
  previewPopup: '\u7acb\u5373\u9884\u89c8\u5f39\u7a97',
  previewFatiguePopup: '\u7acb\u5373\u9884\u89c8\u75b2\u52b3\u68c0\u67e5\u5f39\u7a97',
  testReminderTitle: '\u5ef6\u8fdf\u6d4b\u8bd5\u63d0\u9192',
  testReminderDesc:
    '\u6309\u8bbe\u5b9a\u597d\u7684\u901a\u77e5\u4e0e\u5f39\u7a97\u9009\u9879\uff0c\u5728\u6307\u5b9a\u79d2\u6570\u540e\u81ea\u52a8\u5f39\u51fa\uff08\u6d4b\u8bd5\u65f6\u5ffd\u7565\u9759\u9ed8\u65f6\u6bb5\u4e0e\u95f4\u9694\u9650\u5236\uff09\u3002\u8bf7\u4fdd\u6301\u5e94\u7528\u8fd0\u884c\u3002',
  testReminder30s: '30 \u79d2\u540e\u6d4b\u8bd5',
  testReminder60s: '1 \u5206\u949f\u540e\u6d4b\u8bd5',
  testReminderCancel: '\u53d6\u6d88\u5df2\u5b89\u6392\u7684\u6d4b\u8bd5',
  testReminderCancelled: '\u5df2\u53d6\u6d88\u6d4b\u8bd5\u63d0\u9192',
  testReminderScheduled: (sec: number) =>
    `\u5df2\u5b89\u6392\uff1a\u7ea6 ${sec} \u79d2\u540e\u5f39\u51fa\u63d0\u9192`,
  testReminderPending: (sec: number) =>
    `\u6d4b\u8bd5\u63d0\u9192\u5012\u8ba1\u65f6\uff1a\u5269\u4f59 ${sec} \u79d2`,
  testReminderDone: '\u6d4b\u8bd5\u63d0\u9192\u5df2\u89e6\u53d1',
  data: '\u6570\u636e',
  updateTitle: '\u8f6f\u4ef6\u66f4\u65b0',
  updateDesc:
    '\u4ece GitHub Releases \u68c0\u67e5\u65b0\u7248\u672c\u3002\u66f4\u65b0\u53ea\u66ff\u6362\u7a0b\u5e8f\u6587\u4ef6\uff0c\u672c\u5730\u8bb0\u5f55\u6570\u636e\u4e0d\u4f1a\u5220\u9664\u3002',
  updateCurrent: (v: string) => `\u5f53\u524d\u7248\u672c\uff1a${v}`,
  updateCheck: '\u68c0\u67e5\u66f4\u65b0',
  updateChecking: '\u68c0\u67e5\u4e2d\u2026',
  updateLatest: '\u5df2\u662f\u6700\u65b0\u7248\u672c',
  updateFound: (v: string) => `\u53d1\u73b0\u65b0\u7248\u672c v${v}`,
  updateDownload: '\u4e0b\u8f7d\u66f4\u65b0',
  updateDownloading: (n: number) => `\u4e0b\u8f7d\u4e2d\u2026 ${n}%`,
  updateReady: (v: string) => `\u65b0\u7248 v${v} \u5df2\u4e0b\u8f7d\uff0c\u53ef\u91cd\u542f\u5b89\u88c5`,
  updateInstall: '\u91cd\u542f\u5e76\u5b89\u88c5',
  updateError: (msg: string) => `\u66f4\u65b0\u5931\u8d25\uff1a${msg}`,
  updateDevOnly: '\u5f00\u53d1\u6a21\u5f0f\u65e0\u6cd5\u68c0\u67e5\u66f4\u65b0\uff0c\u8bf7\u4f7f\u7528\u6253\u5305\u540e\u7684\u5b89\u88c5\u7248\u3002',
  updateDownloadManual: '\u524d\u5f80 GitHub \u624b\u52a8\u4e0b\u8f7d\u65b0\u7248',
  updateOpenReleases: '\u6253\u5f00 GitHub Releases',
  dataFile: '\u6570\u636e\u6587\u4ef6\uff1a',
  exportJson: '\u5bfc\u51fa JSON \u5907\u4efd',
  exportJsonHint:
    '\u5305\u542b\u5168\u90e8\u8bb0\u5f55\u4e0e AI \u6d1e\u5bdf\u5206\u6790\uff08ai_insights\uff09\uff0c\u53ef\u7528\u4e8e\u79bb\u7ebf\u4fdd\u7559\u6216\u8fc1\u79fb\u3002',
  disclaimer:
    '\u672c\u5e94\u7528\u4ec5\u4f9b\u4e2a\u4eba\u72b6\u6001\u89c9\u5bdf\u4e0e\u771f\u6211\u63a2\u7d22\uff0c\u4e0d\u80fd\u66ff\u4ee3\u4e13\u4e1a\u5fc3\u7406\u54a8\u8be2\u6216\u533b\u7597\u8bca\u65ad\u3002',

  appTitle: '\u771f\u6211\u72b6\u6001\u8bb0\u5f55',
  appSubtitle: '\u6bcf\u65e5\u7559\u610f \u00b7 \u5145\u7535\u6216\u626e\u6f14 \u00b7 \u8bb0\u5f55',
  tabRecord: '\u8bb0\u5f55',
  tabHistory: '\u5386\u53f2',
  tabChart: '\u4eca\u65e5\u66f2\u7ebf',
  historyTitle: '\u5168\u90e8\u8bb0\u5f55',
  historyPagerLabel: '\u5386\u53f2\u8bb0\u5f55\u7ffb\u9875',
  historyPagerPrev: '\u4e0a\u4e00\u9875',
  historyPagerNext: '\u4e0b\u4e00\u9875',
  historyPageOf: (cur: number, total: number) => `\u7b2c ${cur} / ${total} \u9875`,
  historyPagerJump: '\u8df3\u8f6c',
  historyPagerFirst: '\u9996\u9875',
  historyPagerLast: '\u672b\u9875',
  historySelectPage: '\u672c\u9875\u5168\u9009',
  historySelectClear: '\u6e05\u7a7a\u9009\u62e9',
  historySelectCount: (n: number) => `\u5df2\u9009 ${n} \u6761`,
  historyDeleteSelected: '\u5220\u9664\u5df2\u9009',
  historyDeleteSelectedConfirm: (n: number) =>
    `\u786e\u5b9a\u5220\u9664\u5df2\u9009\u7684 ${n} \u6761\u8bb0\u5f55\u5417\uff1f\u6b64\u64cd\u4f5c\u4e0d\u53ef\u6062\u590d\u3002`,
  historyDeletedMany: (n: number) => `\u5df2\u5220\u9664 ${n} \u6761`,
  historyDeleteFailed: '\u5220\u9664\u5931\u8d25\uff0c\u8bf7\u91cd\u8bd5',
  historyEmpty: '\u8fd8\u6ca1\u6709\u4efb\u4f55\u8bb0\u5f55\u3002',
  historyDayCount: (n: number) => `\u5171 ${n} \u6761`,
  historyEdit: '\u7f16\u8f91',
  historyDelete: '\u5220\u9664',
  historyDeleteConfirm: (t: string) =>
    `\u786e\u5b9a\u5220\u9664 ${t} \u7684\u8fd9\u6761\u8bb0\u5f55\u5417\uff1f\u6b64\u64cd\u4f5c\u4e0d\u53ef\u6062\u590d\u3002`,
  historyDeleted: '\u5df2\u5220\u9664',
  historyUpdated: '\u5df2\u4fdd\u5b58\u4fee\u6539',
  historyBackToList: '\u2190 \u8fd4\u56de\u5217\u8868',
  historyModalClose: '\u5173\u95ed',
  historyEditing: '\u6b63\u5728\u7f16\u8f91\u8bb0\u5f55',
  historyCancelEdit: '\u53d6\u6d88',
  historySaveEdit: '\u4fdd\u5b58\u4fee\u6539',
  historyEditAt: (t: string) => `\u7f16\u8f91\u8bb0\u5f55\u00b7${t}`,
  historyEntryMissing: '\u8bb0\u5f55\u4e0d\u5b58\u5728\u6216\u5df2\u88ab\u5220\u9664',
  historyCoreStatus: (intensity: number, emotion: string) => `${intensity}\u5206 \u00b7 ${emotion}`,
  historyAvoidanceBadge: '\u81ea\u52a8\u5199\u5165',
  historyContextAt: (scene: string) => `\u5728 ${scene}`,
  historyThoughtFlash: '\u5185\u5728\u5267\u672c\uff1a',
  historyDiaryEmpty: '\uff08\u65e0\u6587\u5b57\u8bb0\u5f55\uff09',
  historyLegacyThought: '\u9644\uff1a',
  historyBodySummary: (body: string) => `${'\u8eab\u5fc3\u53cd\u5e94\uff1a'}${body}`,
  tabAnalysis: '\u5206\u6790',
  tabSettings: '\u8bbe\u7f6e',

  panoramaTitle: '\u771f\u6211\u753b\u50cf\u8231',
  panoramaSubtitle:
    '曲线反映价值感（X 轴 · coordX）随时间的波动：基准线以上 = 愿意投入（攻坚 / 心流），基准线以下 = 排斥抗拒（内耗 / 机械）；点位颜色按象限着色；点击数据点查看当时切片。',
  panoramaRangeDay: '24 \u5c0f\u65f6',
  panoramaRangeWeek: '\u672c\u5468',
  panoramaRangeMonth: '\u672c\u6708',
  panoramaEmpty: '\u8be5\u65f6\u95f4\u6bb5\u6682\u65e0\u8bb0\u5f55\uff0c\u53bb\u300c\u8bb0\u5f55\u300d\u9875\u5199\u51e0\u7b14\u5427\u3002',
  panoramaTip: '\u70b9\u51fb\u66f2\u7ebf\u4e0a\u7684\u6570\u636e\u70b9\uff0c\u67e5\u770b\u5f53\u65f6\u5f53\u5730\u7684\u5fc3\u60c5\u5207\u7247\u3002',
  panoramaLegendPos: '基准线以上 · 愿意投入（攻坚 / 心流区）',
  panoramaLegendNeg: '基准线以下 · 排斥抗拒（内耗陷阱 / 机械区）',
  panoramaTideTick: (v: number) => (v > 0 ? `+${v}` : String(v)),
  panoramaTideLabel: (v: number) => {
    if (v > 0) return `愿意投入 +${v}`
    if (v < 0) return `排斥抗拒 ${v}`
    return '价值中性 · 边界区'
  },
  panoramaClickHint: '点击查看切片',
  panoramaSnapshotPrev: '上一条',
  panoramaSnapshotNext: '下一条',
  panoramaSnapshotNav: (current: number, total: number) => `${current} / ${total}`,
  panoramaSnapshotNavLabel: '切片导航',
  panoramaSnapshotEdit: '在历史中编辑',
  panoramaSnapshotHeroIntensity: (v: number) => `强度 ${v}`,
  panoramaSnapshotNoThoughtText: '- 暂无想法描述 -',
  panoramaFreqFilterHint: (label: string, count: number) =>
    `已筛选「${label}」，共 ${count} 条相关记录（← → 切换，Esc 清除）`,
  panoramaFreqTitle: '能量画像·高频统计',
  panoramaFreqDesc:
    '仅做出现次数统计，不做因果推断。点击可在曲线上高亮相关记录。',
  panoramaFreqPainTriggers: '内耗陷阱高频触发场景 Top 3',
  panoramaFreqRechargeHavens: '心流区高频场景 Top 3（愿意 + 轻松）',
  panoramaFreqPainEmpty: '暂无内耗陷阱记录',
  panoramaFreqRechargeEmpty: '暂无心流区记录',
  panoramaFreqAvoidance: (n: number) =>
    `\u672c\u65f6\u6bb5\u5171 ${n} \u6b21\u300c\u9003\u907f\u8bb0\u5f55\u300d\uff08Esc \u5173\u95ed\u5f39\u7a97\u81ea\u52a8\u5199\u5165\uff09`,
  panoramaFreqEmotionPleasant: '心流 / 攻坚区 Top3（愿意投入）',
  panoramaFreqEmotionSteady: '边界区 Top3（价值感中性）',
  panoramaFreqEmotionLow: '内耗 / 机械区 Top3（排斥抗拒）',
  panoramaFreqEmotion: '内耗 / 机械区 Top3（排斥抗拒）',
  panoramaFreqThought: '\u5185\u5728\u5267\u672c Top3',
  panoramaFreqBody: '\u8eab\u5fc3\u53cd\u5e94 Top3',
  panoramaFreqEmpty: '\u6682\u65e0',
  panoramaSnapshotTitle: '\u72b6\u6001\u5207\u7247',
  panoramaSnapshotDivergenceBadge: '\u26a0\ufe0f \u8eab\u5fc3\u80cc\u79bb',
  panoramaSnapshotDivergenceHint:
    '\u601d\u60f3\u4e0a\u89c9\u5f97\u5e94\u8be5\u505a\uff0c\u8eab\u4f53\u5374\u5728\u6781\u529b\u6297\u62d2\u2014\u2014\u8fd9\u662f\u75db\u82e6\u7684\u6839\u6e90',
  panoramaSnapshotClose: '\u5173\u95ed',
  panoramaSnapshotNoThought: '\u5f53\u65f6\u672a\u586b\u5199\u60f3\u6cd5\u6587\u672c',
  toastSaved: '\u5df2\u8bb0\u5f55\uff0c\u6b64\u523b\u7684\u72b6\u6001\u88ab\u7559\u4e0b\u6765\u4e86',

  tagListsTitle: '\u8bb0\u5f55\u6807\u7b7e\u7ba1\u7406',
  tagListsDiaryHint:
    '\u8bb0\u5f55\u5df2\u6539\u4e3a\u81ea\u7531\u65e5\u8bb0\u6587\u672c\uff0c\u4e0d\u518d\u4f7f\u7528\u573a\u666f\u6807\u7b7e\u4e0e\u5185\u5728\u5267\u672c\u6807\u7b7e\u3002',
  tagListsDesc:
    '\u7f16\u8f91\u4ee5\u4e0b\u6807\u7b7e\u540e\u70b9\u300c\u4fdd\u5b58\u8bbe\u7f6e\u300d\uff0c\u8bb0\u5f55\u9875\u4f1a\u540c\u6b65\u66f4\u65b0\u3002',
  tagAdd: '\u6dfb\u52a0',
  tagAddChip: '+ \u6dfb\u52a0\u6807\u7b7e',
  tagDelete: '\u5220\u9664',
  tagClickEdit: '\u70b9\u51fb\u4fee\u6539\u540d\u79f0',
  tagDragReorder: '\u62d6\u52a8\u8c03\u6574\u987a\u5e8f',
  tagAddPlaceholder: '\u8f93\u5165\u540d\u79f0\u2026',
  tagEmotionPlaceholder: '\u4f8b\u5982\uff1a\u7d27\u5f20',
  tagBehaviorPlaceholder: '\u4f8b\u5982\uff1a\u56de\u907f\uff1a\u79bb\u5f00\u73b0\u573a',
  tagRestoreDefault: '\u6062\u590d\u8be5\u7ec4\u9ed8\u8ba4',
  tagEmotionHint:
    '\u771f\u5b9e\u81ea\u6211\u533a\u3001\u5f85\u673a\u89c2\u5bdf\u533a\u3001\u89d2\u8272\u626e\u6f14\u533a\u5206\u522b\u7ba1\u7406\uff1b\u53ef\u4fee\u6539\u6587\u5b57\u6216\u5220\u9664\u3002',
  tagFactHint: '\u8bb0\u5f55\u9875\u300c\u5916\u90e8\u89e6\u53d1\u5668\u300d\u533a\u57df\u7684\u70b9\u9009\u6807\u7b7e\u3002',
  tagThoughtHint: '\u8bb0\u5f55\u9875\u300c\u5185\u5728\u5267\u672c / \u53c2\u8003\u7cfb\u300d\u533a\u57df\u7684\u70b9\u9009\u6807\u7b7e\u3002',
  tagBodyHint: '\u8eab\u4f53\u611f\u53d7\u4e0e\u884c\u4e3a\u6a21\u5f0f\u6807\u7b7e\u3002',
  tagBodySubHint: '\u8eab\u4f53\u611f\u53d7\u7c7b\u6807\u7b7e',

  // 坐标选择
  coordTitle: '\u4efb\u52a1\u5750\u6807',
  coordHint: '\u70b9\u51fb\u843d\u70b9',
  selectCoord: '\u8bf7\u5728\u683c\u5b50\u4e0a\u70b9\u9009\u4efb\u52a1\u5750\u6807',

  // 象限文案（新语义）
  quadrantTitle: '\u884c\u4e3a\u6fc0\u6d3b\u77e9\u9635',
  quadrantDesc: 'X\u8f74\uff1a\u6392\u65a5\u2190\u2192\u613f\u610f\uff1bY\u8f74\uff1a\u8f7b\u677e\u2191\u2193\u9ad8\u8017\u80fd\u3002\u70b9\u51fb\u683c\u5b50\u67e5\u770b\u5f53\u65f6\u5207\u7247\u3002',
  quadrantArousalHigh: '\u9ad8\u8017\u80fd',
  quadrantArousalLow: '\u8f7b\u677e',
  quadrantValenceNeg: '\u2190 \u6392\u65a5',
  quadrantValencePos: '\u613f\u610f \u2192',
  quadrantAdvice: '\u5efa\u8bae\uff1a',

  // 疲劳检查
  fatigueTitle: '\ud83d\udcca \u75b2\u52b3\u68c0\u67e5',
  fatigueSubtitle: '\u5f53\u65e5\u8ba4\u77e5\u8d44\u6e90\u8bc4\u4f30',
  fatigueDecisionLoad: '\u4eca\u5929\u51b3\u7b56\u91cf\uff1a',
  fatigueChecks: '\u75b2\u52b3\u75c7\u72b6\u81ea\u68c0\uff08\u53ef\u591a\u9009\uff09\uff1a',
  fatigueHesitate: '\u5bf9\u7b80\u5355\u51b3\u5b9a\u4e5f\u72b9\u8c6b\u4e0d\u51b3',
  fatigueEscape: '\u66f4\u503e\u5411\u9003\u907f\uff0c\u5bf9\u5c0f\u632b\u6298\u5931\u53bb\u8010\u5fc3',
  fatigueBrainFog: '\u611f\u5230\u8111\u96fe\uff08\u903b\u8f91\u63a8\u6f14\u4e0d\u52a8\uff09',
  fatigueQuality: '\u4eca\u65e5\u6700\u91cd\u8981\u51b3\u7b56\u8d28\u91cf\uff1a',
  fatigueAutoCoord: (symptoms: number, name: string, coordStr: string) =>
    symptoms >= 2
      ? `\u26a1 ${symptoms} \u4e2a\u75b2\u52b3\u4fe1\u53f7 \u00b7 \u80fd\u91cf\u8c61\u9650\u63a8\u7b97\u4e3a ${name} ${coordStr}`
      : `\u2713 \u80fd\u91cf\u8c61\u9650\u5c06\u81ea\u52a8\u63a8\u7b97\u4e3a ${name} ${coordStr}`,
  fatigueContextTitle: '\u4eca\u5929\u53d1\u751f\u4e86\u4ec0\u4e48\uff1f',
  fatigueContextHint: '\u53ef\u9009 \u00b7 \u5e2e\u52a9\u56de\u6eaf\u8bf1\u56e0',

  // 能量审计
  energyAuditTab: '\u80fd\u91cf\u5ba1\u8ba1',
  energyAuditTop3Title: '\u672c\u5468\u9ad8\u8017\u4efb\u52a1 Top 3\uff08\u5185\u8017\u9677\u9631\u9891\u6b21\uff09',
  energyAuditTop3Empty: '\u672c\u5468\u6682\u65e0\u5185\u8017\u9677\u9631\u8bb0\u5f55',
  energyAuditSopLabel: (rank: number) => `Top ${rank} \u8282\u80fd SOP\uff1a`,
  energyAuditSopPlaceholder: '\u5199\u4e0b\u4e00\u6761\u5e94\u5bf9\u8fd9\u7c7b\u60c5\u5883\u7684\u5177\u4f53\u52a8\u4f5c\u2026',
  energyAuditNetTitle: '\u672c\u5468\u51c0\u80fd\u91cf\u503c',
  energyAuditNetDesc: '\uff08\u6240\u6709\u8bb0\u5f55\u7684\u4ef7\u503c\u611f\u603b\u548c \u2212 \u8017\u80fd\u5ea6\u603b\u548c\uff09',
  energyAuditCount: (n: number) => `\u5171 ${n} \u6761\u8bb0\u5f55`,

  // 设置页新增
  fatigueCheckHourLabel: '\u75b2\u52b3\u68c0\u67e5\u89e6\u53d1\u65f6\u95f4\uff08\u6574\u70b9\uff09',
  fatigueCheckHourHint: '\u9ed8\u8ba4 18\uff1a00\uff0c\u8f93\u5165 0\u201323\u3002',

  // AI 洞察
  tabInsight: 'AI \u6d1e\u5bdf',
  insightPageTitle: 'AI \u6d1e\u5bdf',
  insightPageDesc:
    '\u6bcf\u665a 22:00 \u81ea\u52a8\u5bfc\u51fa\u5f53\u65e5\u8bb0\u5f55\uff1b\u5728 Claude Code \u4e2d\u8fd0\u884c /analyze-records \u540e\uff0c\u7ed3\u679c\u4f1a\u81ea\u52a8\u540c\u6b65\u5230\u6b64\u5904\u3002',
  insightNoData: '\u6682\u65e0 AI \u5206\u6790\u7ed3\u679c',
  insightNoDataHint:
    '\u5148\u5728\u300c\u624b\u52a8\u5bfc\u51fa\u4eca\u65e5\u300d\u751f\u6210\u6587\u4ef6\uff0c\u518d\u5728 Claude Code \u9879\u76ee\u76ee\u5f55\u8fd0\u884c /analyze-records',
  insightRiskLevel: (level: 'low' | 'medium' | 'high') =>
    level === 'high' ? '\u9ad8\u98ce\u9669' : level === 'medium' ? '\u4e2d\u98ce\u9669' : '\u4f4e\u98ce\u9669',
  insightPatternsTitle: '\u8bc6\u522b\u6a21\u5f0f',
  insightRecommendationsTitle: '\u884c\u52a8\u5efa\u8bae',
  insightAnalyzedAt: (t: string) => `\u5206\u6790\u65f6\u95f4\uff1a${t}`,
  insightExportToday: '\u624b\u52a8\u5bfc\u51fa\u4eca\u65e5',
  insightExportDone: (count: number, path: string) =>
    `\u5df2\u5bfc\u51fa ${count} \u6761\u8bb0\u5f55\u2192 ${path}`,
  insightExportFail: '\u5bfc\u51fa\u5931\u8d25\uff0c\u8bf7\u91cd\u8bd5',
  insightBannerTitle: (date: string) => `AI \u6d1e\u5bdf \u00b7 ${date}`,
  insightViewDetail: '\u67e5\u770b\u8be6\u60c5',
  insightExpand: '\u5c55\u5f00\u8be6\u60c5 \u25bc',
  insightCollapse: '\u6536\u8d77 \u25b2',
  insightViewEntry: '\u67e5\u770b\u8bb0\u5f55 \u2192',
  insightEntryCount: (n: number) => `\u5171 ${n} \u6761`,
  insightHelpTitle: 'AI \u4f7f\u7528\u4e0e\u4fee\u6539\u8bf4\u660e',
  insightHelpUsageTitle: '\u65e5\u5e38\u4f7f\u7528',
  insightHelpUsageSteps: [
    '\u767d\u5929\u5728\u300c\u8bb0\u5f55\u300d\u9875\u5199\u65e5\u8bb0\u5e76\u4fdd\u5b58',
    '\u6253\u5f00\u300cAI \u6d1e\u5bdf\u300d\u2192 \u70b9\u300c\u624b\u52a8\u5bfc\u51fa\u4eca\u65e5\u300d\uff08\u6216\u7b49\u5f85\u6bcf\u665a 22:00 \u81ea\u52a8\u5bfc\u51fa\uff09',
    '\u5728\u672c\u9879\u76ee\u76ee\u5f55\u7528 Claude Code \u8fd0\u884c /analyze-records',
    '\u56de\u5230 App \u300cAI \u6d1e\u5bdf\u300d\u9875\u67e5\u770b\uff1b\u70b9\u300c\u5c55\u5f00\u8be6\u60c5\u300d\u53ef\u770b\u5b8c\u6574\u5206\u6790',
    '\u53ef\u9009\uff1a/detect-patterns \u8de8\u65e5\u6a21\u5f0f\u3001/risk-alert \u98ce\u9669\u9884\u8b66'
  ],
  insightHelpModifyTitle: '\u5982\u4f55\u4fee\u6539 AI \u8f93\u51fa',
  insightHelpModifySteps: [
    '\u7f16\u8f91 src/shared/aiInsightManifest.ts \u7684 AI_INSIGHT_FIELDS\uff08\u589e\u5b57\u6bb5\u3001\u6539\u6807\u9898\u3001\u9009 renderType\uff09',
    '\u540c\u6b65 .claude/commands/analyze-records.md \u91cc\u7684 JSON \u793a\u4f8b',
    'App \u4f1a\u6309 manifest \u81ea\u52a8\u5c55\u793a\u65b0\u5b57\u6bb5\uff1b\u5b8c\u6574\u6587\u6863\u89c1\u9879\u76ee docs/AI\u4f7f\u7528\u4e0e\u4fee\u6539\u8bf4\u660e.md'
  ],
  insightHelpDataPath:
    '\u6570\u636e\u76ee\u5f55\uff1a%APPDATA%\\emotion-diary\\data\\ \uff08ai-export \u5bfc\u51fa\u3001ai-results \u5206\u6790\u7ed3\u679c\uff09'
} as const
