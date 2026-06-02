---
name: emotion-diary-ai
description: 分析 emotion-diary 导出的情绪记录，写入 ai-results JSON 供 App 自动入库与展示。修改 AI 输出字段时先改 src/shared/aiInsightManifest.ts。
---

# 情绪日记 AI 分析

在 Claude Code 中分析 `%APPDATA%/emotion-diary/data/ai-export/` 下的导出文件，将结构化结果写入 `ai-results/{date}.json`。Electron 应用通过 fs.watch 自动 ingest 到 Store，并按 **manifest** 自适应渲染。

## 何时使用

- 用户运行 `/analyze-records` 做当日全量分析
- 用户运行 `/detect-patterns` 做跨日模式识别（增量合并）
- 用户运行 `/risk-alert` 更新风险等级与建议
- 用户询问如何修改 AI 输出字段或 App 展示内容

## 数据路径（Windows）

| 路径 | 说明 |
| --- | --- |
| `%APPDATA%/emotion-diary/data/ai-export/{date}.json` | App 导出的当日记录 |
| `%APPDATA%/emotion-diary/data/ai-results/{date}.json` | AI 写入的分析结果 |
| `%APPDATA%/emotion-diary/data/emotion-diary.json` | 主库（含 `ai_insights[]`） |

## 修改 AI 输出字段（必读）

1. 编辑 **`src/shared/aiInsightManifest.ts`** 的 `AI_INSIGHT_FIELDS`（增删字段、改标题、分区、renderType）
2. 更新 **`.claude/commands/analyze-records.md`**（及 detect-patterns / risk-alert）中的 JSON 示例
3. 同步 **`.cursor/skills/emotion-diary-ai/output-manifest.md`** 人类可读说明
4. 若新增 **renderType**（非 paragraph / string_list 等已有类型），需在 App 的 `AiInsightSectionRenderer` 注册组件（一次性）

App 会根据 manifest 自动展示 payload 中有值的字段。未在 manifest 注册的 key 会被 ingest 存入 payload 但**不在 UI 展示**。

## 字段说明

详见 [output-manifest.md](output-manifest.md)、[examples/analyze-output-v2.json](examples/analyze-output-v2.json)，以及面向用户的完整指南 **[docs/AI使用与修改说明.md](../../docs/AI使用与修改说明.md)**。

## 命令

| 命令 | 用途 |
| --- | --- |
| `/analyze-records` | 全量 v2 JSON（首次分析） |
| `/detect-patterns` | 增量更新 patterns / summary（合并 payload） |
| `/risk-alert` | 更新 risk_level、risk_signals、recommendations |

## UI 展示规则

- **记录页 banner**：固定只显示 `date` + `key_insight`（不受 manifest 扩展影响）
- **洞察页卡片**：折叠态显示 core + entry_count；点击「展开详情」按 manifest 顺序渲染 `card_expand` 字段
- **entry_id**：认知扭曲 / 相关日记可跳转历史页编辑
