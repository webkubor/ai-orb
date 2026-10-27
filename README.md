<h1 align="center">🔮 ai-orb</h1>

> Optional [website support widget](./README.widget.md): orb, notification capsule, chat panel and fully configurable localization.

<p align="center">
  <strong>一颗会表态的 AI 助手状态球。</strong><br>
  在想 · 干活中 · 等你回话 · 好了。零依赖，核心约 7 KB（gzip），生灵插件按需加载。
</p>

<p align="center">
  <img src="https://img.shields.io/npm/v/ai-orb?style=for-the-badge&color=ff8a50" alt="npm">
  <img src="https://img.shields.io/bundlephobia/minzip/ai-orb?style=for-the-badge&color=ff8a50&label=gzipped" alt="size">
  <img src="https://img.shields.io/badge/dependencies-0-brightgreen?style=for-the-badge" alt="zero deps">
  <img src="https://img.shields.io/badge/license-MIT-blue?style=for-the-badge" alt="MIT">
  <img src="https://img.shields.io/badge/framework-agnostic-8b5cf6?style=for-the-badge" alt="framework agnostic">
</p>

<p align="center">
  <a href="https://webkubor.github.io/ai-orb/"><strong>▶ 在线 Demo</strong></a> ·
  <a href="./README.en.md">English</a>
</p>

---

## 3.0 · 生灵形态

<p align="center">
  <a href="https://webkubor.github.io/ai-orb/"><img src="https://webkubor.github.io/ai-orb/media/ai-orb-3.gif?v=3.0.1" width="720" alt="ai-orb 3.0 生灵形态：8 个物种，眼睛跟着光标，戳一下回弹，摸摸冒爱心"></a>
</p>
<p align="center"><sub>8 个物种 · 8 种表情 · 眼睛跟着光标 · 戳一下回弹 · 摸摸冒爱心 —— <a href="https://webkubor.github.io/ai-orb/media/ai-orb-3.mp4">1080p 视频</a> · <a href="https://webkubor.github.io/ai-orb/">在线试玩</a><br>生灵是可选插件，经典的球体形态与六个状态全部保留，见下文。</sub></p>

## 看一眼就知道它在干嘛

<p align="center">
  <img src="https://cdn.jsdelivr.net/gh/webkubor/free-imgbed@main/ai-orb/showcase.webp" width="720" alt="ai-orb 六个状态 · 三种形态 · 八色主题">
</p>

| 状态 | 什么时候亮 | 表现 |
|---|---|---|
| `idle` | 默认 | 缓慢呼吸，常驻 |
| `thinking` | 请求发了，还没吐字 | 呼吸加快，眼神朝上，头顶三点闪 |
| `working` | 长任务（出图、工具调用） | 一条环在转，唯一持续旋转的元素 |
| `asking` | 助手问了话，卡在你这儿 | 轻轻左右摆，像在你视线边上晃手 |
| `done` | 结果出来了 | 弹一下、笑眼、角标 |
| `error` | 请求失败 | 褪成灰，不闪红 |

## 三种形态

```js
new AgentOrb(el, { shape: 'squircle' })  // 圆角方块
new AgentOrb(el, { shape: 'pill' })      // 胶囊
```

| `circle` | `squircle` | `pill` |
|---|---|---|
| 圆球（默认） | 圆角方块 | 胶囊 |

## 生灵形态（3.0）

不想要一颗球？给它一个物种。生灵是可选插件（gzip 约 3.8 KB），不加载时核心包和 2.x 用法完全不变：

```js
import { AgentOrb } from 'ai-orb'
import 'ai-orb/creatures'

new AgentOrb(el, { creature: 'cat', theme: 'violet', mood: 'curious', motion: 'bounce' })
```

| `creature` | 特征 |
|---|---|
| `cat` | 猫耳、胡须、会摆的尾巴 |
| `bunny` | 长耳，平时耷拉一只，看到你才竖起来 |
| `dragon` | 龙角、小翅膀，靠近时扑腾 |
| `owl` | 耳羽、大眼圈、喙 |
| `sprout` | 头顶会摇的嫩芽 |
| `axolotl` | 一直在飘的鳃 |
| `bear` | 圆耳、鼻头 |
| `chick` | 呆毛、喙、小翅膀 |

表情 `mood`：`neutral` `happy` `curious` `focused` `playful` `sparkle` `zen` `surprised`，嘴型跟着变。
交互：光标靠近会竖耳；鼠标停下它会东张西望；`orb.poke()` 果冻回弹冒星光；在它身上来回划动就是「摸摸」，冒爱心并触发 `onPet`（Vue 里是 `@pet`）。

## 八色主题

```js
new AgentOrb(el, { theme: 'blue' })  // 创建时选
orb.theme = 'violet'                  // 运行时秒切
```

| 🟠 orange | 🔵 blue | 🟢 green | 🟣 violet | 🔴 rose | 🟡 gold | 🩵 cyan | ⚫ graphite |
|---|---|---|---|---|---|---|---|
| 默认 | `#3aa8d8` | `#4cb782` | `#8b5cf6` | `#ef5350` | `#f5b800` | `#22d3ee` | `#8a8a8a` |

## 30 秒上手

```bash
npm i ai-orb
```

```js
import { AgentOrb } from 'ai-orb'

const orb = new AgentOrb(document.querySelector('#orb'), {
  theme: 'blue',
  shape: 'squircle',
})

orb.state = 'thinking'   // 模型在想
orb.state = 'working'    // 长任务跑着，环在转
orb.theme = 'violet'     // 运行时换色
orb.set('done', 3)       // 好了，角标 3
orb.destroy()            // 卸载时记得清理
```

Vue 3：

```vue
<script setup>
import { AgentOrb } from 'ai-orb/vue'
</script>

<template>
  <AgentOrb :state="state" :unseen="n" :theme="theme" shape="squircle" @click="openChat" />
</template>
```

API 就这些。

## 📖 API

### `new AgentOrb(host, options?)`

`host` 是挂载点 —— 球会**追加**进去，不会替换掉它本身。
`host` 为空时直接抛错（静默失败会被当成样式问题查半天）。

| 参数 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `state` | `OrbState` | `'idle'` | 未知值回落到 `idle` |
| `unseen` | `number` | `0` | 仅 `state === 'done'` 且 `> 0` 时显示角标 |
| `size` | `number \| string` | — | 数字按 px 处理 |
| `follow` | `boolean` | `true` | 眼睛跟随光标 |
| `blink` | `boolean` | `true` | 眨眼 |
| `shape` | `string` | `'circle'` | 外形：`circle` / `squircle` / `pill` |
| `theme` | `string \| null` | `null` | 内置主题名（见上表） |
| `labels` | `object` | 英文 | 覆盖 `aria-label` 文案，做多语言用 |
| `onClick` | `function` | — | 点击回调 |

**实例：** `orb.state`、`orb.unseen`、`orb.theme`（都可写）、`orb.shape`（只读）、
`orb.set(state, unseen?)`、`orb.destroy()`、`orb.el`。

**另外导出：** `STATES`、`DEFAULT_LABELS`、`SHAPES`、`THEMES`、`css`、`injectStyle(doc?)`。

## 🎨 换肤

主题底层是 CSS 变量，要细调的话在元素上覆盖：

```css
.agent-orb {
  --ao-size: 64px;
  --ao-hi:   #a5e9ff;   /* 内高光 */
  --ao-mid:  #3aa8d8;   /* 球身   */
  --ao-lo:   #1c6a94;   /* 外缘   */
  --ao-glow: #3aa8d8;   /* 光晕   */
  --ao-ink:  #0d2733;   /* 眼睛   */
}
```

| 变量 | 默认值 | 作用 |
| --- | --- | --- |
| `--ao-size` | `56px` | 整体尺寸 |
| `--ao-hi` / `--ao-mid` / `--ao-lo` | 暖橙 | 径向渐变，由内到外 |
| `--ao-glow` | `#ff8a50` | 光晕色（各状态会覆盖） |
| `--ao-ink` | `#2a1a10` | 眼睛颜色 |
| `--ao-badge-bg` / `--ao-badge-fg` / `--ao-badge-ring` | — | 未读角标 |

## 设计上的三条克制

都是有意为之，不是还没做完：

1. **只有六个状态。** 56px 下分不清的状态再多也没用，不如少而清楚。
2. **只有一样东西在转。** 环只留给 `working`——最长的那段等待。
   什么都在动，就等于什么都不紧急。
3. **不做卡通脸。** 它得能待在正经产品的角落里，而不是变成屏幕上最吵的东西。

## 本地开发

```bash
git clone https://github.com/webkubor/ai-orb
cd ai-orb
npm install
npm test

npx serve .   # 然后开 http://localhost:3000/demo/
```

## 谁在用

- [MUSE AV](https://www.museav.top) —— AI 出图工作台。这颗球是它创作助手的收起态。

你也在用？欢迎提 PR 加上。

## License

MIT © [webkubor](https://github.com/webkubor)
