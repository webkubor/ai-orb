<h1 align="center">🔮 ai-orb</h1>

> Optional [website support widget](./README.widget.md): orb, notification capsule, chat panel and fully configurable localization.

<p align="center">
  <strong>A tiny orb that shows what your AI assistant is doing.</strong><br>
  Thinking · working · waiting on you · done. Zero deps, ~7 KB gzipped core, creatures are an opt-in plugin.
</p>

<p align="center">
  <img src="https://img.shields.io/npm/v/ai-orb?style=for-the-badge&color=ff8a50" alt="npm">
  <img src="https://img.shields.io/bundlephobia/minzip/ai-orb?style=for-the-badge&color=ff8a50&label=gzipped" alt="size">
  <img src="https://img.shields.io/badge/dependencies-0-brightgreen?style=for-the-badge" alt="zero deps">
  <img src="https://img.shields.io/badge/license-MIT-blue?style=for-the-badge" alt="MIT">
  <img src="https://img.shields.io/badge/framework-agnostic-8b5cf6?style=for-the-badge" alt="framework agnostic">
</p>

<p align="center">
  <a href="https://webkubor.github.io/ai-orb/"><strong>▶ Live Demo</strong></a> ·
  <a href="./README.md">中文文档</a>
</p>

---

## 3.0 · Creatures

<p align="center">
  <a href="https://webkubor.github.io/ai-orb/"><img src="https://webkubor.github.io/ai-orb/media/ai-orb-3.gif?v=3.0.1" width="720" alt="ai-orb 3.0 creatures: eight species that watch your cursor, bounce when poked and blush when petted"></a>
</p>
<p align="center"><sub>8 species · 8 moods · eyes follow your cursor · bounce when poked · hearts when petted — <a href="https://webkubor.github.io/ai-orb/media/ai-orb-3.mp4">1080p video</a> · <a href="https://webkubor.github.io/ai-orb/">live demo</a><br>Creatures are an opt-in plugin. The classic orbs and all six states are still here, see below.</sub></p>

## See it once, you get it

<p align="center">
  <img src="https://cdn.jsdelivr.net/gh/webkubor/free-imgbed@main/ai-orb/showcase.webp" width="720" alt="ai-orb: six states, three shapes, eight themes">
</p>

| State | When | What it does |
|---|---|---|
| `idle` | Default | Slow breathing, stays put |
| `thinking` | Request sent, no tokens yet | Faster breathing, eyes up, 3 dots blink |
| `working` | Long job (image gen, tool call) | Ring spins — the only continuously rotating element |
| `asking` | Assistant asked, waiting on you | Gentle sway, like waving in your peripheral vision |
| `done` | Result ready | Pop, smile, badge |
| `error` | Request failed | Fades to grey, no red flash |

## Three shapes

```js
new AgentOrb(el, { shape: 'squircle' })  // rounded square
new AgentOrb(el, { shape: 'pill' })      // capsule
```

| `circle` | `squircle` | `pill` |
|---|---|---|
| Round (default) | Rounded square | Capsule |

## Creatures (3.0)

Want more than a ball? Give it a species. Creatures are an opt-in plugin (~3.8 KB gzipped); without it the core and the 2.x API are unchanged:

```js
import { AgentOrb } from 'ai-orb'
import 'ai-orb/creatures'

new AgentOrb(el, { creature: 'cat', theme: 'violet', mood: 'curious', motion: 'bounce' })
```

Species: `cat` `bunny` `dragon` `owl` `sprout` `axolotl` `bear` `chick`.
Moods: `neutral` `happy` `curious` `focused` `playful` `sparkle` `zen` `surprised` — the mouth changes with them.
Interaction: ears perk up when the cursor comes close; it looks around on its own when you stop moving; `orb.poke()` squashes and sparkles; stroking back and forth over it is a pet — hearts, plus an `onPet` callback (`@pet` in Vue).

## Eight themes

```js
new AgentOrb(el, { theme: 'blue' })  // set at creation
orb.theme = 'violet'                  // swap at runtime
```

| 🟠 orange | 🔵 blue | 🟢 green | 🟣 violet | 🔴 rose | 🟡 gold | 🩵 cyan | ⚫ graphite |
|---|---|---|---|---|---|---|---|
| default | `#3aa8d8` | `#4cb782` | `#8b5cf6` | `#ef5350` | `#f5b800` | `#22d3ee` | `#8a8a8a` |

## 30-second start

```bash
npm i ai-orb
```

```js
import { AgentOrb } from 'ai-orb'

const orb = new AgentOrb(document.querySelector('#orb'), {
  theme: 'blue',
  shape: 'squircle',
})

orb.state = 'thinking'   // model is composing
orb.state = 'working'    // long job running
orb.theme = 'violet'     // swap theme at runtime
orb.set('done', 3)       // done, badge 3
orb.destroy()            // always clean up
```

Vue 3:

```vue
<script setup>
import { AgentOrb } from 'ai-orb/vue'
</script>

<template>
  <AgentOrb :state="state" :unseen="n" :theme="theme" shape="squircle" @click="openChat" />
</template>
```

That's the whole API.

## 📖 API

### `new AgentOrb(host, options?)`

`host` is a mount point — the orb is **appended** to it, not swapped in.

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `state` | `OrbState` | `'idle'` | Unknown values fall back to `idle` |
| `unseen` | `number` | `0` | Badge shows when `state === 'done'` and `> 0` |
| `size` | `number \| string` | — | Numbers treated as px |
| `follow` | `boolean` | `true` | Eyes track cursor |
| `blink` | `boolean` | `true` | Blinking |
| `shape` | `string` | `'circle'` | Shape: `circle` / `squircle` / `pill` |
| `theme` | `string \| null` | `null` | Built-in theme name (see above) |
| `labels` | `object` | English | Override `aria-label` for i18n |
| `onClick` | `function` | — | Click handler |

**Instance:** `orb.state`, `orb.unseen`, `orb.theme` (settable), `orb.shape` (readonly),
`orb.set(state, unseen?)`, `orb.destroy()`, `orb.el`.

**Also exported:** `STATES`, `DEFAULT_LABELS`, `SHAPES`, `THEMES`, `css`, `injectStyle(doc?)`.

## 🎨 Theming

Themes are CSS variables under the hood. Override on the element for fine-grained control:

```css
.agent-orb {
  --ao-size: 64px;
  --ao-hi:   #a5e9ff;   /* inner highlight */
  --ao-mid:  #3aa8d8;   /* body */
  --ao-lo:   #1c6a94;   /* outer edge */
  --ao-glow: #3aa8d8;   /* halo */
  --ao-ink:  #0d2733;   /* eyes */
}
```

| Variable | Default | Purpose |
| --- | --- | --- |
| `--ao-size` | `56px` | Overall size |
| `--ao-hi` / `--ao-mid` / `--ao-lo` | warm orange | Radial gradient, inner → outer |
| `--ao-glow` | `#ff8a50` | Halo colour |
| `--ao-ink` | `#2a1a10` | Eye colour |
| `--ao-badge-bg` / `--ao-badge-fg` / `--ao-badge-ring` | — | Unread badge |

## Design philosophy

1. **Six states, no more.** At 56px, anything extra becomes noise.
2. **Only one thing spins.** The ring is reserved for `working` — the longest wait.
3. **No cartoon face.** It belongs in a serious product's corner, not stealing the show.

## Local dev

```bash
git clone https://github.com/webkubor/ai-orb
cd ai-orb
npm install
npm test

npx serve .   # then open http://localhost:3000/demo/
```

## Used by

- [MUSE AV](https://www.museav.top) — AI image studio.

Using it? Open a PR and add yourself.

## License

MIT © [webkubor](https://github.com/webkubor)
