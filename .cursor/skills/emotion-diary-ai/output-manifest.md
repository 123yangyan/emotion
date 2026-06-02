# 情绪日记 AI 输出字段（Manifest v2）

单一契约源文件：`src/shared/aiInsightManifest.ts`

App 会按本表自动渲染 **payload 中有值的字段**。修改输出内容时，请先改 manifest，再同步命令模板与本说明。

## Core 字段（入库索引 + 记录页 banner）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `date` | string | YYYY-MM-DD |
| `analyzed_at` | ISO 8601 | 分析时间 |
| `risk_level` | low / medium / high | 风险徽章 |
| `key_insight` | string ≤80 字 | **必填**；banner + 卡片折叠主文案 |

## 扩展字段（存入 payload，洞察页按 manifest 展示）

| key | renderType | 分区 | 说明 |
| --- | --- | --- | --- |
| `entry_count` | text | card_fold | 当日分析条数 |
| `summary` | paragraph | card_expand | 详细分析段落 |
| `quadrant_stats` | quadrant_bar | card_expand | `{ 攻坚区, 心流区, 机械区, 内耗陷阱 }` 计数 |
| `cognitive_distortions` | distortion_list | card_expand | `{ type, quote, entry_id? }[]` |
| `risk_signals` | string_list | card_expand | 风险依据 |
| `patterns` | string_list | card_expand | 识别模式 |
| `recommendations` | string_list | card_expand | 建议行动 |
| `related_entries` | entry_link_list | card_expand | `{ entry_id, note?, occurred_at? }[]` |

## 新增字段示例

在 `AI_INSIGHT_FIELDS` 增加一行（需已有 renderType）：

```typescript
{ key: 'energy_trend', label: '能量趋势', zone: 'card_expand', renderType: 'paragraph' }
```

完整示例见 [examples/analyze-output-v2.json](examples/analyze-output-v2.json)。
