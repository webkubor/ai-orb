<h1 align="center">🔮 agent-orb</h1>

<p align="center">
  <strong>一颗会表态的 AI 助手状态球。</strong><br>
  在想 · 干活中 · 等你回话 · 好了。零依赖，4 KB。
</p>

<p align="center">
  <img src="https://img.shields.io/npm/v/agent-orb?style=for-the-badge&color=ff8a50" alt="npm">
  <img src="https://img.shields.io/bundlephobia/minzip/agent-orb?style=for-the-badge&color=ff8a50&label=gzipped" alt="size">
  <img src="https://img.shields.io/badge/dependencies-0-brightgreen?style=for-the-badge" alt="zero deps">
  <img src="https://img.shields.io/badge/license-MIT-blue?style=for-the-badge" alt="MIT">
</p>

<p align="center">
  <a href="https://webkubor.github.io/agent-orb/"><strong>▶ 在线 demo</strong></a> ·
  <a href="./README.md">English</a>
</p>

---

## 🏆 为什么不用一个转圈就完了

AI 产品难做的不是「加载中」，而是**每一种等待长得都一样**。

|                          | agent-orb | 转圈 spinner | 数字角标 | Lottie 动画 |
| ------------------------ | :-------: | :----------: | :------: | :---------: |
| 分得清「在想」和「在干活」 |     ✅    |      ❌      |    ❌    |     ❌      |
| 说得出「我在等**你**」    |     ✅    |      ❌      |    ❌    |     ❌      |
| 撑得住 60 秒的出图等待    |     ✅    |  😵 像卡死了 |    ❌    |     ✅      |
| 零依赖                    |     ✅    |      ✅      |    ✅    | ❌ 约 250 KB |
| 改 CSS 变量就换主题       |     ✅    |      ✅      |    ✅    | ❌ 要重导 JSON |
| 尊重「减弱动态效果」      |     ✅    |      ⚠️      |    ✅    |     ⚠️      |

转圈只说「有事在发生」，球说的是**哪件事**。尤其是模型已经停下来、
正安静地等你回答的那一刻——它也说得出来。这个状态最容易被漏掉：
助手问了个问题，人走开了，屏幕上没有任何东西承认「卡在你这儿了」。

## 🔥 几个硬的点

- **🧠 六个状态，每个都有来处** —— `idle` `thinking` `working` `asking` `done` `error`。
  没有为了好看多加的：每个状态都对应你的应用真实知道的一件事。
- **👀 它看着你** —— 眼睛跟随光标，最大偏移 1.6px。小到没人会说它是动画，
  大到每个人都感觉得到。
- **🪶 4 KB、零依赖** —— 纯 SVG + 原生 JS。React、Vue、Svelte，
  或者一个裸的 `<script type="module">` 都能用。
- **🎨 CSS 变量换肤** —— 五行改完配色。没有构建步骤，没有配置文件。
- **♿ 默认无障碍** —— 每个状态都带 `aria-label`；系统开了「减弱动态效果」
  就停掉全部动画，但状态照样读得出来。

## ⚡ 30 秒上手

```bash
npm i agent-orb
```

```js
import { AgentOrb } from 'agent-orb'

const orb = new AgentOrb(document.querySelector('#orb'))

orb.state = 'thinking'   // 模型在想
orb.state = 'working'    // 长任务跑着，环在转
orb.set('done', 3)       // 好了，带未读角标
orb.destroy()            // 卸载时一定要清理
```

Vue 3：

```vue
<script setup>
import { AgentOrb } from 'agent-orb/vue'
</script>

<template>
  <AgentOrb :state="state" :unseen="n" @click="openChat" />
</template>
```

API 就这些。

## 🎭 六个状态

| 状态       | 什么时候设                       | 表现                                        |
| ---------- | -------------------------------- | ------------------------------------------- |
| `idle`     | 默认                             | 缓慢呼吸。别的什么都不做——它是常驻在屏幕上的。 |
| `thinking` | 请求发出去了，还没吐字            | 呼吸加快，眼神朝上，头顶三点依次亮。          |
| `working`  | 长任务跑着（出图、工具调用）      | 一条环在绕。全库唯一持续旋转的元素。          |
| `asking`   | 助手问了话，卡在你这儿            | 轻轻左右摆，像在你视线边上晃手。              |
| `done`     | 面板收起时出了结果                | 弹一下、笑眼、角标。然后回到呼吸。            |
| `error`    | 请求失败                          | 褪成灰。不闪红——闪红只会让人紧张。            |

传入未知状态会回落到 `idle` 而不是抛错。状态多半来自后端，
一个拼错的字符串不该让页面白屏。

## 🎨 换肤

全是 CSS 变量，在元素上（或任意祖先上）覆盖即可：

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
| `labels` | `object` | 英文 | 覆盖 `aria-label` 文案，做多语言用 |
| `onClick` | `function` | — | 点击回调 |

**实例：** `orb.state`、`orb.unseen`（都可写）、`orb.set(state, unseen?)`、
`orb.destroy()`、`orb.el`（那个 button，用它设 CSS 变量）。

**另外导出：** `STATES`、`DEFAULT_LABELS`、`css`、`injectStyle(doc?)`。

样式每页自动注入一次。要自己管样式（SSR、严格 CSP、自定义主题流水线）就
改成引入 `css` 字符串。

## 🔬 设计上的三条克制

都是有意为之，不是还没做完：

1. **只有六个状态。** 56px 下分不清的状态再多也没用，不如少而清楚。
2. **只有一样东西在转。** 环只留给 `working`——最长的那段等待。
   什么都在动，就等于什么都不紧急。
3. **不做卡通脸。** 它得能待在正经产品的角落里，而不是变成屏幕上最吵的东西。

同页多颗球共用一个 `mousemove` 监听和一个 `requestAnimationFrame` 循环，
最后一个 `destroy()` 时一起摘掉。渐变 id 按实例区分——共用 id 的话，
销毁第一颗会让其余的全变成空心圈。

## 🛠 本地开发

```bash
git clone https://github.com/webkubor/agent-orb
cd agent-orb
npm install
npm test

npx serve .   # 然后开 http://localhost:3000/demo/
```

demo 直接 import 源码，没有构建步骤。但**必须经 http 打开**：
ES module 在 `file://` 下会被 CORS 拦掉，表现是「页面出来了但一颗球都没有」。

## 📦 谁在用

- [MUSE AV](https://www.museav.top) —— AI 出图工作台。这颗球是它创作助手的收起态，
  那里出一张图经常要 30–90 秒。

你也在用？欢迎提 PR 加上。

## License

MIT © [webkubor](https://github.com/webkubor)
