# AGENTS.md — AI 助手工作守则

## 这是什么

ai-orb —— 会表态的 AI 助手状态球：在想 / 干活 / 等你回话 / 好了。
零依赖纯 SVG，核心约 7 KB（gzip），3.0 起有 8 种生灵与 8 种表情（按需加载），
眼睛跟光标、可戳可摸，支持 Vue 3。

## 关键文件

- `src/`：源码 —— 核心 orb 与生灵插件分离，核心保持零依赖小体积。
- `demo/`：演示页（`npm run demo`）。
- `test/`：测试。
- `README.widget.md`：widget 嵌入用法。

## 常用命令

```bash
npm run test    # 测试
npm run demo    # 本地演示
```

## 约定

- **核心零依赖、小体积是产品承诺**：生灵 / 表情等扩展一律走按需加载插件，不许塞进核心包。
- 纯 SVG，不引入 canvas / WebGL；动效尊重 `prefers-reduced-motion`。
- 双语 README（`README.md` / `README.en.md`）与 `README.zh-CN.md` 同步维护。
