<h1 align="center">🔮 ai-orb</h1>

<p align="center">
  <strong>A tiny SVG orb that shows what your AI assistant is actually doing.</strong><br>
  Thinking · working · waiting on you · done. Zero dependencies, 4 KB.
</p>

<p align="center">
  <img src="https://img.shields.io/npm/v/ai-orb?style=for-the-badge&color=ff8a50" alt="npm">
  <img src="https://img.shields.io/bundlephobia/minzip/ai-orb?style=for-the-badge&color=ff8a50&label=gzipped" alt="size">
  <img src="https://img.shields.io/badge/dependencies-0-brightgreen?style=for-the-badge" alt="zero deps">
  <img src="https://img.shields.io/badge/license-MIT-blue?style=for-the-badge" alt="MIT">
  <img src="https://img.shields.io/badge/framework-agnostic-8b5cf6?style=for-the-badge" alt="framework agnostic">
</p>

<p align="center">
  <a href="https://webkubor.github.io/ai-orb/"><strong>▶ Live demo</strong></a> ·
  <a href="./README.zh-CN.md">中文文档</a>
</p>

---

## 🏆 Why not just a spinner?

The hard part of AI UX isn't the loading — it's that **every kind of waiting looks identical**.

|                          | agent-orb | Spinner | Unread badge | Lottie animation |
| ------------------------ | :-------: | :-----: | :----------: | :--------------: |
| Tells thinking vs working|     ✅    |    ❌   |      ❌      |        ❌        |
| Shows "I'm waiting on **you**" | ✅  |    ❌   |      ❌      |        ❌        |
| Survives a 60s image gen |     ✅    |  😵 feels frozen |  ❌   |        ✅        |
| Zero dependencies        |     ✅    |    ✅   |      ✅      |  ❌ ~250 KB lib  |
| Themeable via CSS vars   |     ✅    |    ✅   |      ✅      |  ❌ re-export JSON |
| Respects reduced-motion  |     ✅    |   ⚠️    |      ✅      |        ⚠️        |

A spinner says "something is happening." An orb says **which** something — and when
the model has stopped and is quietly waiting for your answer, it says that too.
That last state is the one users miss most: the assistant asked a question,
they walked away, and nothing on screen admits it's stuck.

## 🔥 Highlights

- **🧠 Six states, each earned** — `idle` `thinking` `working` `asking` `done` `error`.
  No decorative extras: every state maps to something your app actually knows.
- **👀 It looks at you** — eyes track the cursor with 1.6px of travel. Small enough
  that nobody calls it an animation, big enough that everybody feels it.
- **🪶 4 KB, zero deps** — plain SVG + vanilla JS. Works in React, Vue, Svelte,
  or a bare `<script type="module">`.
- **🎨 Themed with CSS variables** — five lines to recolor. No build step, no config file.
- **♿ Accessible by default** — every state carries an `aria-label`, and
  `prefers-reduced-motion` stops all animation while keeping the state readable.

## ⚡ Quickstart

```bash
npm i ai-orb
```

```js
import { AgentOrb } from 'ai-orb'

const orb = new AgentOrb(document.querySelector('#orb'))

orb.state = 'thinking'   // model is composing
orb.state = 'working'    // long job running — the ring spins
orb.set('done', 3)       // finished, with an unread badge
orb.destroy()            // always clean up on unmount
```

Vue 3:

```vue
<script setup>
import { AgentOrb } from 'ai-orb/vue'
</script>

<template>
  <AgentOrb :state="state" :unseen="n" @click="openChat" />
</template>
```

That's the whole API.

## 🎭 The six states

| State      | When to set it                                   | What it does                                       |
| ---------- | ------------------------------------------------ | -------------------------------------------------- |
| `idle`     | Default                                          | Breathes slowly. Nothing else — it's always on screen. |
| `thinking` | Request sent, no tokens yet                      | Faster breathing, eyes drift up, three dots pulse.  |
| `working`  | A long task is running (image gen, tool call)    | A ring orbits. The only continuous spin in the library. |
| `asking`   | Assistant asked something and is blocked on you  | Rocks gently, like a wave at the edge of your vision. |
| `done`     | Result delivered while the panel is collapsed    | Pops once, smiles, shows the badge. Then settles.   |
| `error`    | Request failed                                   | Fades to grey. No flashing red — that just makes people tense. |

Unknown values fall back to `idle` instead of throwing. State usually comes from a
backend, and one typo shouldn't blank the page.

## 🎨 Theming

Everything is a CSS variable. Override them on the element (or any ancestor):

```css
.agent-orb {
  --ao-size: 64px;
  --ao-hi:   #a5e9ff;   /* inner highlight  */
  --ao-mid:  #3aa8d8;   /* body             */
  --ao-lo:   #1c6a94;   /* outer edge       */
  --ao-glow: #3aa8d8;   /* halo             */
  --ao-ink:  #0d2733;   /* eyes             */
}
```

| Variable | Default | Purpose |
| --- | --- | --- |
| `--ao-size` | `56px` | Overall size |
| `--ao-hi` / `--ao-mid` / `--ao-lo` | warm orange | Radial gradient, inner → outer |
| `--ao-glow` | `#ff8a50` | Halo colour (states override this) |
| `--ao-ink` | `#2a1a10` | Eye colour |
| `--ao-badge-bg` / `--ao-badge-fg` / `--ao-badge-ring` | — | Unread badge |

## 📖 API

### `new AgentOrb(host, options?)`

`host` is a mount point — the orb is **appended** to it, not swapped in.
Throws if `host` is missing (silent failure gets misdiagnosed as a CSS problem).

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `state` | `OrbState` | `'idle'` | Unknown values fall back to `idle` |
| `unseen` | `number` | `0` | Badge shows only when `state === 'done'` and `> 0` |
| `size` | `number \| string` | — | Numbers are treated as px |
| `follow` | `boolean` | `true` | Cursor tracking |
| `blink` | `boolean` | `true` | Blinking |
| `labels` | `object` | English | Override `aria-label` text for i18n |
| `onClick` | `function` | — | Click handler |

**Instance:** `orb.state`, `orb.unseen` (both settable), `orb.set(state, unseen?)`,
`orb.destroy()`, `orb.el` (the button — use it to set CSS variables).

**Also exported:** `STATES`, `DEFAULT_LABELS`, `css`, `injectStyle(doc?)`.

Styles auto-inject once per page. Import `css` instead if you manage styles
yourself (SSR, strict CSP, or a custom theme pipeline).

## 🔬 Design notes

Three deliberate limits — they're choices, not an unfinished roadmap:

1. **Only six states.** More states you can't tell apart at 56px is worse than fewer you can.
2. **Only one thing spins.** The ring is reserved for `working`, the longest wait.
   If everything moved, nothing would read as urgent.
3. **No cartoon face.** It has to sit in the corner of a serious product without
   becoming the loudest thing on screen.

Multiple orbs on one page share a single `mousemove` listener and one `requestAnimationFrame`
loop; the last `destroy()` unbinds both. Gradient IDs are per-instance — with a shared ID,
destroying the first orb turns every other one into an empty circle.

## 🛠 Local development

```bash
git clone https://github.com/webkubor/ai-orb
cd ai-orb
npm install
npm test

npx serve .   # then open http://localhost:3000/demo/
```

The demo imports the source directly — no build step. It must be served over HTTP:
ES modules are blocked on `file://` by CORS, which shows up as "the page loads but
there are no orbs."

## 📦 Used by

- [MUSE AV](https://www.museav.top) — AI image studio. The orb is the collapsed state of
  its creation assistant, where image generation routinely takes 30–90 seconds.

Using it somewhere? Open a PR and add yourself.

## License

MIT © [webkubor](https://github.com/webkubor)
