# 情绪日记 AI 输出字段（Manifest v4）

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
| `data_quality` | text | card_fold | 数据质量评估：`rich` / `moderate` / `sparse` |
| `summary` | paragraph | card_expand | 详细分析段落 |
| `quadrant_stats` | quadrant_bar | card_expand | `{ 攻坚区, 心流区, 机械区, 内耗陷阱 }` 计数 |
| `thought_themes` | string_list | card_expand | 今日写作中反复出现的话题 / 关注焦点（≤5 条） |
| `cognitive_distortions` | distortion_list | card_expand | `{ type, quote, entry_id? }[]` |
| `risk_signals` | string_list | card_expand | 风险依据 |
| `patterns` | string_list | card_expand | 识别模式 |
| `recommendations` | string_list | card_expand | 建议行动 |
| `entry_summaries` | entry_link_list | card_expand | 逐条速览：`{ entry_id, occurred_at?, note }[]`，note 为 ≤30 字摘要 |
| `writing_feedback` | string_list | card_expand | 记录建议：哪些记录太空洞、建议补充的内容（数据良好时可省略） |
| `related_entries` | entry_link_list | card_expand | `{ entry_id, note?, occurred_at? }[]` |

## 仪表页专用（zone: dashboard，洞察卡片不展示）

| key | 类型 | 说明 |
| --- | --- | --- |
| `ability_growth_score` | 0–100 整数 | 能力增长点 |
| `experience_richness_score` | 0–100 整数 | 经历丰富点 |
| `mood_index` | 0–100 整数 | 心情指数 |
| `mood_trend` | up / down / stable | 心情趋势箭头 |
| `mood_context` | string ≤40 | 心情情境一句 |
| `risk_reason` | string ≤30 | 风险主因（UI：中风险：xxx） |
| `growth_contributors` | string[] ≤3 | 能力增长贡献点 |
| `experience_highlights` | string[] ≤3 | 经历高光 |
| `value_energy_tags` | string[] ≤6 | 价值/耗能高频标签 |
| `guidance_primary` | string | 5% 微迭代主行动 |
| `guidance_target_time` | string 可选 | 如 15:00 |

`risk_level` 与 `guidance_primary` 在仪表三层 IA 中展示；完整建议列表仍在 `recommendations`。

### 文字字段读取优先级

分析时请按以下优先级读取每条 entry 的文字内容：

1. `reaction_note`（主要日记文字，优先读取）
2. `fact`（次选）
3. `thought`（再次选）
4. 三者均为空 → 标记为「仅坐标」，只做象限分析，不生成文字摘要

### 坐标轴语义

- `coord_x`（X 轴）= 任务价值 / 重要性，-5（低价值）→ +5（高价值）
- `coord_y`（Y 轴）= 耗能程度，-5（低耗能）→ +5（高耗能）
- 四象限：心流区（+x, -y） / 攻坚区（+x, +y） / 机械区（-x, -y） / 内耗陷阱（-x, +y）

## 新增字段示例

在 `AI_INSIGHT_FIELDS` 增加一行（需已有 renderType）：

```typescript
{ key: 'energy_trend', label: '能量趋势', zone: 'card_expand', renderType: 'paragraph' }
```

完整示例见 [examples/analyze-output-v4.json](examples/analyze-output-v4.json)。
