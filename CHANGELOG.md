# Changelog

格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)。

## [3.0.1] - 2026-10-25

### 变更

- **生灵形态拆成可选插件 `ai-orb/creatures`**：不 import 时核心包与 2.x 用法完全一致，传 `creature` 只会回落到 `shape`。核心 gzip 约 7.1 KB，插件约 3.8 KB，CI 分别设门禁
- 戳 / 摸摸的粒子随球的尺寸缩放；爱心改为固定亮粉色，各主题下都看得清
- 样式字符串去掉注释与多余空白

### 新增

- `demo/promo.html` 推广短片拍摄页 + `scripts/record-promo.mjs` 一键录制 → `demo/media/ai-orb-3.mp4`（1080p H.264）与 `.gif`
- 展示页新增 3.0 主展区（视频、8 个可互动生灵、表情切换），经典形态各区保留

> 3.0.0 只发布过 GitHub tag、未上 npm；npm 上的第一个 3.x 版本是 3.0.1。

## [3.0.0] - 2026-10-25

### 新增

- **生灵形态 `creature`**：cat / bunny / dragon / owl / sprout / axolotl / bear / chick。圆润身体 + 物种特征（耳、角、翅、鳃、尾、呆毛）+ 大眼双高光 + 腮红 + 嘴，设置后优先于 `shape`
- **情绪 `mood`**：neutral / happy / curious / focused / playful / sparkle / zen / surprised；生灵的嘴型随情绪与状态切换
- **几何形态扩充**：diamond / hex / shield / drop / bean / star
- **独立律动 `motion`**：breathe / float / bounce / pulse / orbit，多实例相位错开
- **交互**：光标靠近竖耳、腮红变深；鼠标停下后东张西望；耳朵不定时抖动；`poke()` 果冻回弹并喷星光；在它身上来回划动触发「摸摸」，冒爱心并回调 `onPet`（Vue：`@pet`）
- 主题新增 `--ao-cheek`（腮红 / 耳内 / 鳃）

### 变更

- 跟随鼠标的倾斜挤压与 CSS 律动拆到不同节点（`.ao-body-wrap` / `.ao-bob`），律动不再覆盖跟随

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