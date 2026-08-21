/**
 * 球的全部样式，导出成字符串。
 *
 * 为什么不发一个 .css 文件让用户自己引：这个库主打「一行代码就能跑」，
 * 多一个 `import 'agent-orb/style.css'` 就多一个会被忘记的步骤，
 * 而忘了引样式的表现是「球是个黑方块」——看起来像库坏了，不像少引了文件。
 * 所以默认自动注入（每页只注一次），同时把字符串导出，
 * 给需要自己管样式的场景（SSR、CSP 严格、想改主题）留出口。
 *
 * 所有可调的东西都是 CSS 变量，改主题不用碰这里：
 *   --ao-size      尺寸，默认 56px
 *   --ao-hi/mid/lo 球体三段色（径向渐变由内到外）
 *   --ao-glow      光晕色
 *   --ao-ink       眼睛颜色
 *   --ao-badge-bg / --ao-badge-fg / --ao-badge-ring  角标
 */
export const css = `
.agent-orb {
  --ao-size: 56px;
  --ao-hi: #ffc79a;
  --ao-mid: #ff8a50;
  --ao-lo: #e8632f;
  --ao-glow: #ff8a50;
  --ao-ink: #2a1a10;
  --ao-badge-bg: #e8632f;
  --ao-badge-fg: #fff;
  --ao-badge-ring: transparent;

  position: relative; display: inline-block;
  width: var(--ao-size); height: var(--ao-size);
  padding: 0; border: 0; background: transparent;
  cursor: pointer; -webkit-tap-highlight-color: transparent;
}
.agent-orb:focus-visible { outline: 2px solid var(--ao-glow); outline-offset: 3px; border-radius: 50%; }
.ao-svg { display: block; width: 100%; height: 100%; overflow: visible; }

.ao-body { transform-origin: 32px 32px; animation: ao-breathe 4.2s ease-in-out infinite; }
.ao-gloss { fill: rgba(255,255,255,.5); }
.ao-halo {
  fill: none; stroke: var(--ao-glow); stroke-width: 8; opacity: .16;
  transform-origin: 32px 32px; animation: ao-breathe 4.2s ease-in-out infinite;
}
.ao-eyes { transition: transform .18s ease-out; }
.ao-pupil { fill: var(--ao-ink); }
.ao-line { fill: none; stroke: var(--ao-ink); stroke-width: 2.6; stroke-linecap: round; }

/* 四组眼形全部渲染在 DOM 里，靠 CSS 显隐切换。
   比按状态增删节点简单得多，也不会在状态频繁切换时反复重排。 */
.ao-eye { display: none; }
.is-idle .ao-eye-round,
.is-thinking .ao-eye-round,
.is-asking .ao-eye-round { display: block; }
.is-working .ao-eye-focus { display: block; }
.is-done .ao-eye-smile { display: block; }
.is-error .ao-eye-cross { display: block; }

/* 眨眼：压扁瞳孔而不是整个消失——闭眼那一瞬形状还在，才像眼皮盖下来 */
.agent-orb.ao-blink .ao-pupil { transform: scaleY(.12); transform-box: fill-box; transform-origin: center; }
.ao-pupil { transition: transform .07s ease-in; }

/* 只在需要的状态显示的零件 */
.ao-ring, .ao-dots { display: none; }
.is-working .ao-ring { display: block; }
.is-thinking .ao-dots { display: block; }

/* ── 各状态 ───────────────────────────────────────────────────────────────
   待命：只呼吸。它是常驻状态，任何多余动效都会变成视觉噪音。 */

/* 在想：呼吸加快 + 眼神朝上 + 头顶三点依次亮。
   三点是最没有歧义的「思考中」符号，不需要教用户认。 */
.is-thinking .ao-body, .is-thinking .ao-halo { animation-duration: 1.5s; }
.is-thinking .ao-eyes { transform: translateY(-1.5px); }
.ao-dots circle { fill: var(--ao-hi); opacity: .25; animation: ao-blip 1.25s ease-in-out infinite; }
.ao-dots circle:nth-child(2) { animation-delay: .16s; }
.ao-dots circle:nth-child(3) { animation-delay: .32s; }

/* 出图中：一条环绕着转。全库唯一持续旋转的元素，专门留给最长的那段等待。 */
.is-working { --ao-glow: var(--ao-hi); }
.ao-ring {
  fill: none; stroke: var(--ao-hi); stroke-width: 2; stroke-linecap: round;
  stroke-dasharray: 30 140; transform-origin: 32px 32px;
  animation: ao-spin 1.5s linear infinite;
}

/* 等你回话：慢慢左右摆，像在视线边上晃手。比闪烁礼貌，又确实看得见。 */
.is-asking .ao-svg { animation: ao-nudge 2.4s ease-in-out infinite; }

/* 好了：弹一次就回到呼吸。事情已经做完，不该再持续抢注意力。 */
.is-done .ao-body { animation: ao-pop .5s cubic-bezier(.34,1.56,.64,1) 1, ao-breathe 4.2s ease-in-out infinite .5s; }

/* 出错：褪成灰，不闪不抖。用「暗下来」表达故障，闪红只会让人紧张。 */
.is-error { --ao-hi: #9a8b7e; --ao-mid: #6b5d52; --ao-lo: #463b33; --ao-glow: #6b5d52; }

.ao-badge {
  position: absolute; top: -1px; right: -1px;
  min-width: 18px; height: 18px; padding: 0 5px; box-sizing: border-box;
  display: none; place-items: center;
  border-radius: 9px; background: var(--ao-badge-bg); color: var(--ao-badge-fg);
  font: 700 11px/1 system-ui, -apple-system, sans-serif;
  box-shadow: 0 0 0 2px var(--ao-badge-ring);
}
.agent-orb.ao-has-badge .ao-badge { display: grid; }

.agent-orb:hover .ao-body { filter: brightness(1.08); }
.agent-orb:active .ao-svg { transform: scale(.94); }

@keyframes ao-breathe { 0%,100% { transform: scale(1); } 50% { transform: scale(1.045); } }
@keyframes ao-spin { to { transform: rotate(360deg); } }
@keyframes ao-blip { 0%,100% { opacity: .25; } 50% { opacity: 1; } }
@keyframes ao-nudge { 0%,100% { transform: rotate(0); } 25% { transform: rotate(-7deg); } 75% { transform: rotate(7deg); } }
@keyframes ao-pop { 0% { transform: scale(1); } 45% { transform: scale(1.22); } 100% { transform: scale(1); } }

/* 这颗球常驻在屏幕上，对前庭敏感的人来说持续动效是真难受。
   系统开了「减弱动态效果」就全停，只留状态配色和眼形——信息一点不丢。 */
@media (prefers-reduced-motion: reduce) {
  .ao-body, .ao-halo, .ao-ring, .ao-dots circle, .is-asking .ao-svg { animation: none !important; }
  .ao-eyes, .ao-pupil { transition: none !important; }
}
`

let injected = false

/** 把样式注入 document.head，重复调用只注一次。无 DOM 环境（SSR）直接跳过。 */
export function injectStyle(doc) {
  const d = doc || (typeof document !== 'undefined' ? document : null)
  if (!d || injected || d.querySelector('style[data-agent-orb]')) return
  const el = d.createElement('style')
  el.setAttribute('data-agent-orb', '')
  el.textContent = css
  d.head.appendChild(el)
  injected = true
}
