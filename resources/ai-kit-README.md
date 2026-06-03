# 情绪记录 · AI 分析套件（安装版）

本目录随 App 安装包一起发布，供 Claude Code / Cursor 在本地分析日记使用。

## 目录结构

```text
resources/ai-kit/
├── .claude/commands/     ← Claude Code 斜杠命令（/analyze-records 等）
├── .cursor/skills/       ← Cursor Agent Skill
└── docs/                 ← 使用说明
```

## 如何使用 Claude Code

1. 打开 **命令提示符** 或 **PowerShell**。
2. 进入本目录（将 `{安装目录}` 换成你的实际路径）：

```text
cd "{安装目录}\resources\ai-kit"
```

例如默认安装：

```text
cd "%LOCALAPPDATA%\Programs\情绪记录\resources\ai-kit"
```

3. 在该目录启动 Claude Code，执行：

```text
/analyze-records
```

Claude Code 会在 `%APPDATA%\emotion-diary\data\` 读写 `ai-export` / `ai-results`，与 App 自动同步。

## 开发源码目录 vs 安装目录

- **开发时**：在项目根目录（含 `.claude`）运行 Claude Code。
- **安装 exe 后**：使用 `resources\ai-kit` 作为工作区，不要指望在 `app.asar` 里找到 `.claude`（打包时只把编译产物放进 asar）。

详细说明见 `docs/AI使用与修改说明.md`。
