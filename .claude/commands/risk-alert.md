---
description: 检测当日记录的高风险信号并生成预警级别
argument-hint: [YYYY-MM-DD 可选，默认今天]
---

评估当日情绪记录的风险水平，更新 ai-results 中的 risk_level 与 recommendations。

**输出字段以 `src/shared/aiInsightManifest.ts` 为准**。

## 输入

- 当日导出：`%APPDATA%/emotion-diary/data/ai-export/{date}.json`
- 可选历史：`%APPDATA%/emotion-diary/data/ai-results/` 近 3 日文件

## 预警信号（满足越多 risk_level 越高）

- 连续 3 条以上内耗陷阱区（coord_y 高且 coord_x 低）
- thought 含绝对化负面表达
- body_tags 在多条记录中集中出现
- 灾难化 / 自我否定类认知扭曲高频

## 输出

写入或更新 `%APPDATA%/emotion-diary/data/ai-results/{date}.json`（与已有记录合并，勿清空 summary / quadrant_stats）：

```json
{
  "date": "2026-06-02",
  "analyzed_at": "2026-06-02T22:10:00.000Z",
  "risk_level": "high",
  "key_insight": "今日多条高耗能内耗记录，thought 出现绝对化自我否定",
  "patterns": ["内耗陷阱集中", "绝对化用语"],
  "risk_signals": ["3条内耗陷阱", "绝对化自我否定出现2次"],
  "recommendations": ["暂停重要决策，先休息 30 分钟", "若持续数天，考虑寻求专业支持"]
}
```

risk_level 映射：
- `high`：≥3 个强信号
- `medium`：1–2 个信号
- `low`：无明显信号
