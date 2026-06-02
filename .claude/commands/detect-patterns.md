---
description: 读取近 7 日 ai-export 数据，识别跨日重复模式
argument-hint: [days 默认 7]
---

跨日模式识别：分析最近若干天的 emotion-diary 导出文件。

**输出字段以 `src/shared/aiInsightManifest.ts` 为准**；增量更新时只写需要变更的字段，应用会合并 payload。

## 步骤

1. 读取目录：`%APPDATA%/emotion-diary/data/ai-export/`
2. 按文件名日期排序，取最近 7 个（或 `$ARGUMENTS` 指定的天数）JSON 文件。
3. 合并所有 `entries`，识别跨日重复模式。
4. 读取已有 `%APPDATA%/emotion-diary/data/ai-results/{latest_date}.json`（若存在），在其基础上合并更新。

## 输出

更新 `%APPDATA%/emotion-diary/data/ai-results/{latest_date}.json`：

- 在 `patterns` 数组中加入以「[跨日]」前缀标记的模式
- 可选更新 `summary` 追加跨日结论
- 保留已有 `quadrant_stats`、`cognitive_distortions` 等字段（不要清空）

示例（可与已有文件合并）：

```json
{
  "date": "2026-06-02",
  "analyzed_at": "2026-06-02T22:15:00.000Z",
  "risk_level": "medium",
  "key_insight": "今日3次落入内耗陷阱…",
  "patterns": ["[跨日] 工作日下午反复落入内耗陷阱", "[跨日] thought 中「总是」高频出现"],
  "recommendations": ["下午3点设休息提醒"]
}
```
