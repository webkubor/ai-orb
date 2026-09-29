# Changelog

格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)。

## [0.2.0] - 2026-09-14

主发布：

- **三种形态**：圆球 / 方块 / 胶囊
- **八色主题预设** + favicon
- **本地化支持卡**（website widget）
- **Plausible 埋点**（同 `reel-kit` 站点），后改用 CF Web Analytics 统一撤回
- **CI**：Node 24；测试文件交给 shell 展开，不依赖 `--test` 的 glob

### 修复 / 样式

- `63f918a` — style: 简化支持面板与 composer
- `e58602d` — fix: 细化 orb 反馈与交互预览
- `d64e067` — revert: 撤掉 Plausible 埋点（改用 CF Web Analytics 统一）
- `4169ec5` — fix: `showcase.png` 截到的是 Pages 404 页
- `d5e6c6d` — feat(analytics): Plausible 埋点（同 `reel-kit` site）—— *(已撤回)*

### 文档

- `ca85476` — docs: 重写 README —— 首屏截图先秀出来
- `12a0e11` — docs: README 补下载量 badge（npm monthly downloads）
- `3aef042` — docs: README 默认中文 + 首屏截图

### 命名 / CI

- `1d09cce` — chore: 改名 `ai-orb`
- `f7b4739` — chore: npm 包名改 scoped —— `agent-orb` 撞了已存在的 `agentorb`
- `3953b63` — ci: Node 24；测试文件交给 shell 展开，别依赖 `--test` 的 glob

## 起源

- `3246ada` — feat: agent-orb —— 一颗会表态的 AI 助手状态球（首版）

---

完整 commit 列表见 `git log`。