# 更新日志

## v3.7.0（2026-06-04）

### 仪表与记录

- 新增**今日仪表**三层 IA：心情环、坐标漂移、双引擎 Sparkline（含 7 日均线）、跨日阶段标签（manifest v5）
- 默认打开**仪表**页；记录页移除顶部 AI 洞察横幅
- 日记列表 Enter 自动续号（`1.` / `-`）；同日多条序号展示
- 移除 18:00 疲劳检查定时弹窗及相关 UI（历史 `fatigue_check` 数据仍只读保留）

### AI

- `analyze-records` 支持读取近 3–5 日 `ai-results` 做跨日连贯分析
- 测试 fixture / `npm run seed:ai-insight` 更新至 v5

---

## v3.6.0（2026-06-03）

### AI 分析

- 增强 `/analyze-records`：优先读取 `reaction_note`，补充 8 项可执行分析规则与风险计分
- manifest 新增 `data_quality`、`thought_themes`、`entry_summaries`、`writing_feedback`
- 安装包通过 `extraResources` 附带 `resources/ai-kit`（`.claude` 命令、Cursor Skill、使用说明）

### 应用与打包

- 北京时间统一、主进程通知与相关 UI/分析逻辑优化
- 文档补充：安装版 AI 套件路径说明

---

## v3.5.0（2026-06-02）

### 记录与历史

- 记录页改为**日记化**：左栏任务坐标（四象限）+ 右栏自由日记 `DiaryInput`
- 历史页日记风格列表、坐标徽章、日期头优化
- 记录页日记区支持区域内滚动；保存按钮文案与布局修复

### AI 洞察（新）

- 新增 **AI 洞察** 页签：Claude Code 分析结果自动入库与展示
- **manifest 驱动**：`src/shared/aiInsightManifest.ts` 统一 AI 输出契约与 UI 自适应渲染
- 卡片折叠/展开、象限条、认知扭曲、关联日记跳转历史编辑
- 22:00 自动导出 + 手动导出；`ai-results` 监听 ingest
- Skill 文档：`.cursor/skills/emotion-diary-ai/`；命令：`.claude/commands/`
- 测试：`npm run seed:ai-insight` + `docs/fixtures/`

### 设置与数据

- 提醒间隔改为**分钟**（默认 60 分钟），兼容旧版小时设置
- 移除设置页「记录标签管理」
- JSON 备份升级为 `emotion-diary-backup` 格式，**含全部 AI 洞察**
- AI 洞察页、记录页 banner 色调与 App 全局风格统一

### 文档

- 重写 README；新增 [docs/AI使用与修改说明.md](docs/AI使用与修改说明.md)

---

## v3.1.0

- GitHub 版本检查、全景分析改进等（见历史 commit）

## v2.1.0

- 自动更新检测、设置页更新面板等
