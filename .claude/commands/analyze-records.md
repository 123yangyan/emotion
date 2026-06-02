---
description: 分析当日导出的情绪记录，识别认知模式并写入 ai-results
argument-hint: [YYYY-MM-DD 可选，默认今天]
---

分析 emotion-diary 当日导出数据，输出结构化 AI 洞察。

**输出字段以 `src/shared/aiInsightManifest.ts` 为准**；下方 JSON 为当前 manifest v2 示例。  
**完整使用与修改说明**：项目根目录 `docs/AI使用与修改说明.md`。

## 步骤

1. 确定日期：`$ARGUMENTS` 若为空则用今天（本地日期 YYYY-MM-DD）。
2. 读取导出文件（Windows 用户数据目录）：
   - `%APPDATA%/emotion-diary/data/ai-export/{date}.json`
   - 若应用未导出，提示用户先在应用中等待 22:00 自动导出，或在应用内点击「手动导出今日」。
3. 分析 `entries` 数组中每条记录的：
   - `fact` / `thought` 自由文本 → 识别认知扭曲（灾难化、过度概括、非黑即白、读心术、自我否定等）
   - `coord_x` / `coord_y` / `quadrant` → 象限分布、高耗能时段（occurred_at 小时）
   - `body_tags` / `behavior_tags` → 身心关联
4. 评估 `risk_level`：`low` | `medium` | `high`
5. 生成 `key_insight`：一句话中文摘要（≤80 字，用于应用提醒条）
6. 写入结果文件：`%APPDATA%/emotion-diary/data/ai-results/{date}.json`

## 输出 JSON 格式（严格遵守）

```json
{
  "schema_version": 2,
  "date": "2026-06-02",
  "analyzed_at": "2026-06-02T22:05:12.000Z",
  "entry_count": 5,
  "risk_level": "medium",
  "key_insight": "今日3次落入内耗陷阱，日记里反复出现「每次都这样」等过度概括表达",
  "summary": "今天共记录5条。下午14-18点耗能偏高，3条落在内耗陷阱，日记中多次出现绝对化表达。心流区记录集中在上午。建议关注下午时段的决策负荷。",
  "quadrant_stats": {
    "攻坚区": 0,
    "心流区": 2,
    "机械区": 0,
    "内耗陷阱": 3
  },
  "cognitive_distortions": [
    { "type": "过度概括", "quote": "每次都这样", "entry_id": 42 }
  ],
  "patterns": ["下午高耗能集中", "过度概括思维"],
  "risk_signals": ["3条内耗陷阱", "绝对化用语出现2次"],
  "recommendations": ["下午3点设休息提醒", "注意「每次」「总是」等用词"],
  "related_entries": [
    { "entry_id": 42, "occurred_at": "2026-06-02T14:30:00", "note": "内耗陷阱 · 收到批评邮件" }
  ]
}
```

只写入上述 JSON 到结果文件，不要额外 markdown 说明。应用会通过 fs.watch 自动回写到 Store，并按 manifest 自适应展示各字段。
