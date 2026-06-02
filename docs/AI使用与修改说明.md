# 情绪日记 · AI 使用与修改说明

本文说明如何在 **App + Claude Code** 配合下使用 AI 分析，以及如何**自定义 AI 输出字段**与 App 展示内容。

> 技术契约源文件：`src/shared/aiInsightManifest.ts`  
> Cursor Skill：`.cursor/skills/emotion-diary-ai/`  
> Claude 斜杠命令：`.claude/commands/`

---

## 一、AI 能帮你做什么

| 能力 | 命令 | 说明 |
| --- | --- | --- |
| **当日全量分析** | `/analyze-records` | 分析今天所有日记：象限分布、认知扭曲、风险等级、建议行动等 |
| **跨日模式识别** | `/detect-patterns` | 对比近 7 天记录，发现重复出现的思维模式（增量合并，不覆盖已有分析） |
| **风险预警** | `/risk-alert` | 根据高耗能、绝对化用语等信号更新 `risk_level` 与建议 |

分析结果写入本地 JSON，App **自动监听并入库**，在 **「AI 洞察」** 页签展示；记录页顶部会显示最近几日的 **摘要 banner**（仅一句话 `key_insight`）。

---

## 二、日常使用流程（推荐）

```text
记录日记 → 导出数据 → Claude Code 分析 → App 自动同步 → 查看洞察
```

### 步骤 1：在 App 里记录

白天在 **「记录」** 页正常写日记并保存（含任务坐标 + 日记正文）。

### 步骤 2：导出当日数据

任选其一：

- **自动**：每晚 **22:00** App 会把当日记录导出到 `ai-export/{日期}.json`
- **手动**：打开 **「AI 洞察」** 页 → 点击 **「手动导出今日」**

导出路径（Windows）：

```text
%APPDATA%\emotion-diary\data\ai-export\2026-06-02.json
```

### 步骤 3：在 Claude Code 中运行分析

在项目目录打开 Claude Code，执行：

```text
/analyze-records
```

可选指定日期：

```text
/analyze-records 2026-06-02
```

AI 会把结果写入：

```text
%APPDATA%\emotion-diary\data\ai-results\2026-06-02.json
```

### 步骤 4：在 App 里查看

- 打开 **「AI 洞察」** 页（App 会通过文件监听自动入库，一般无需重启）
- 卡片默认显示：日期、风险徽章、摘要、分析条数
- 点击 **「展开详情 ▼」** 查看：详细分析、象限分布、认知扭曲、风险信号、相关日记等
- 点击 **「查看记录 →」** 可跳转到 **「历史」** 页并打开对应日记编辑

### 可选：跨日与风险

- 积累若干天导出文件后，运行 `/detect-patterns` 补充跨日模式
- 感觉状态较差时，运行 `/risk-alert` 更新风险等级

---

## 三、数据文件说明

| 路径 | 谁写入 | 内容 |
| --- | --- | --- |
| `data/emotion-diary.json` | App | 主库，含 `ai_insights[]` |
| `data/ai-export/{date}.json` | App | 当日待分析的原始记录 |
| `data/ai-results/{date}.json` | Claude Code | AI 分析结果（JSON） |

完整目录：`%APPDATA%\emotion-diary\data\`

---

## 四、App 里各区域展示什么

| 位置 | 展示内容 | 是否随 manifest 变化 |
| --- | --- | --- |
| 记录页 banner | 日期 + 一句话摘要 +「查看详情」 | **否**（固定 core 字段） |
| 洞察页折叠态 | 摘要、风险、条数 | 部分（如 `entry_count`） |
| 洞察页展开区 | manifest 中 `card_expand` 且有值的字段 | **是**（按 manifest 顺序） |

---

## 五、如何修改 AI 输出内容（进阶）

设计原则：**改 Skill / 命令 = 改 manifest；App 按 manifest 自动适配展示**，一般不必为每个新字段改数据库或写新 React 页面。

### 5.1 标准三步流程

1. **编辑 manifest** — `src/shared/aiInsightManifest.ts` 中的 `AI_INSIGHT_FIELDS`  
   - 增删字段名 `key`  
   - 改中文标题 `label`  
   - 改展示分区 `zone`：`card_fold`（折叠区）或 `card_expand`（展开区）  
   - 选渲染类型 `renderType`（见下表）

2. **同步命令模板** — 更新 `.claude/commands/analyze-records.md`（及 detect-patterns / risk-alert）里的 JSON 示例

3. **同步 Skill 说明** — 更新 `.cursor/skills/emotion-diary-ai/output-manifest.md`

改完后重新 `npm run dev` 或打包 App；Claude Code 侧下次分析会按新 JSON 结构输出。

### 5.2 可用的 renderType

| renderType | 适用数据 | 示例字段 |
| --- | --- | --- |
| `text` | 数字或短文本 | `entry_count` |
| `paragraph` | 多行段落 | `summary` |
| `string_list` | `string[]` | `patterns`, `risk_signals`, `recommendations` |
| `quadrant_bar` | 象限计数对象 | `quadrant_stats` |
| `distortion_list` | `{ type, quote, entry_id? }[]` | `cognitive_distortions` |
| `entry_link_list` | `{ entry_id, note?, occurred_at? }[]` | `related_entries` |

若需要**全新展示形态**（如图表、评分条），需一次性在  
`src/renderer/src/components/ai-insight/AiInsightSectionRenderer.tsx` 注册新 `renderType` 和对应组件。

### 5.3 示例：新增「能量趋势」段落

在 `AI_INSIGHT_FIELDS` 末尾增加：

```typescript
{
  key: 'energy_trend',
  label: '能量趋势',
  zone: 'card_expand',
  renderType: 'paragraph'
}
```

在 `analyze-records.md` 的 JSON 示例里增加：

```json
"energy_trend": "上午心流区较多，下午 15 点后耗能明显上升。"
```

AI 写入该字段后，洞察页展开区会**自动多一块「能量趋势」**，无需改 `AiInsightPage` 结构。

### 5.4 Core 字段（不建议随意改）

以下字段用于入库索引与记录页 banner，修改会影响 banner、排序与必填校验：

- `date`、`analyzed_at`、`risk_level`、`key_insight`（**必填**）

扩展内容应放在 **payload** 中，由 manifest 控制展示。

---

## 六、常见问题

**Q：洞察页一直是空的？**  
先确认已导出 `ai-export` 文件，并在 Claude Code 成功写入 `ai-results`；检查 JSON 里 `key_insight` 非空。

**Q：改了 manifest 但 App 没变化？**  
需重新编译/重启 App；旧记录若无新字段，需重新运行 `/analyze-records` 生成含新字段的 JSON。

**Q：增量命令会清空之前的详细分析吗？**  
不会。`/detect-patterns` 与 `/risk-alert` 采用 **payload 合并**，只更新 JSON 里出现的字段。

**Q：AI 多写了 manifest 里没有的字段？**  
会存入 `payload`，但 **不会在 UI 展示**；要在 manifest 注册后才会显示。

**Q：数据会上传云端吗？**  
不会。导出、分析、入库均在本地 `%APPDATA%\emotion-diary\data\` 完成。

---

## 七、测试洞察展示（开发 / 预览 UI）

项目内置 3 组测试用例，覆盖 **v2 完整**、**高风险**、**v1 最小** 三种情况：

```bash
npm run seed:ai-insight
```

脚本会把 JSON 写入 `%APPDATA%\emotion-diary\data\ai-results\`（今日 / 昨日 / 前日各一条）。  
然后 **重启 App** 或切换到 **「AI 洞察」** 页签，应看到 3 张卡片；点击 **「展开详情 ▼」** 预览各 manifest 区块。

Fixture 源文件：`docs/fixtures/ai-insight-test-*.json`

---

## 八、相关文件索引

| 文件 | 用途 |
| --- | --- |
| `src/shared/aiInsightManifest.ts` | 字段契约（单一事实来源） |
| `src/shared/aiInsightIngest.ts` | 解析 ai-results、拆分 core / payload |
| `src/main/ai-export-service.ts` | 导出、监听、入库 |
| `src/renderer/src/utils/aiInsightParse.ts` | 渲染前解析 payload |
| `src/renderer/src/components/ai-insight/*` | 洞察卡片与自适应区块 |
| `.cursor/skills/emotion-diary-ai/SKILL.md` | 给 Cursor Agent 的使用说明 |
| `.claude/commands/*.md` | 给 Claude Code 的斜杠命令 |

完整 JSON 示例见：`.cursor/skills/emotion-diary-ai/examples/analyze-output-v2.json`
