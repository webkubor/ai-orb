/**
 * ai-orb 3.0 全部样式 —— 纯 CSS 驱动的灵动有机生命体。
 *
 * 3.0 升级：
 *   · 9 种几何形态（圆、方圆、胶囊、八面水晶菱晶、蜂巢六边、机甲护盾、水墨水滴、有机萌芽灵豆、星芒）
 *   · 8 种面部情绪与表情（neutral, happy, curious, focused, playful, sparkle, zen, surprised）
 *   · 5 种独立生命动效（breathe, float, bounce, pulse, orbit）避免机械同步
 *   · 鼠标临场果冻形变（Jelly Squish & Tilt）与点击回弹物理
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
  --ao-feedback-duration: 200ms;
  --ao-focus-radius: 50%;
  --ao-phase: 0s;

  position: relative; display: inline-block;
  width: var(--ao-size); height: var(--ao-size);
  padding: 0; border: 0; background: transparent;
  cursor: pointer; -webkit-tap-highlight-color: transparent;
  touch-action: manipulation; vertical-align: middle;
  transition: transform var(--ao-feedback-duration) cubic-bezier(0.34, 1.56, 0.64, 1);
}
.agent-orb:focus-visible { outline: 2px solid var(--ao-glow); outline-offset: 3px; border-radius: var(--ao-focus-radius); }

/* ── 形态对应的聚焦轮廓 ─────────────────────────────────────────────────── */
.ao-shape-squircle { --ao-focus-radius: 14px; }
.ao-shape-pill { width: calc(var(--ao-size) * 1.5); --ao-focus-radius: 999px; }
.ao-shape-diamond { --ao-focus-radius: 8px; }
.ao-shape-hex { --ao-focus-radius: 12px; }
.ao-shape-shield { --ao-focus-radius: 12px; }
.ao-shape-drop { --ao-focus-radius: 16px; }
.ao-shape-bean { --ao-focus-radius: 16px; }
.ao-shape-star { --ao-focus-radius: 8px; }

.ao-svg { display: block; width: 100%; height: 100%; overflow: visible; }

/* ── 核心身体与高光 ─────────────────────────────────────────────────────── */
.ao-body-wrap {
  transform-origin: 32px 32px;
  will-change: transform;
}
.ao-body {
  transform-origin: 32px 32px;
  transition: filter var(--ao-feedback-duration) ease-out;
}
.ao-gloss { fill: rgba(255, 255, 255, 0.45); pointer-events: none; }
.ao-halo {
  fill: none; stroke: var(--ao-glow); stroke-width: 8; opacity: 0.16;
  transform-origin: 32px 32px;
}
.ao-eyes { transition: transform 0.16s ease-out; transform-origin: 32px 32px; }
.ao-pupil { fill: var(--ao-ink); transition: transform 0.08s ease-in; }
.ao-line { fill: none; stroke: var(--ao-ink); stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round; }
.ao-sparkle-star { fill: var(--ao-ink); transform-origin: center; animation: ao-twinkle 2.4s ease-in-out infinite; }

/* ── 动效模式（各 Agent 独立节奏，打破机械同步）──────────────────────────── */
.ao-motion-breathe .ao-body,
.ao-motion-breathe .ao-halo {
  animation: ao-breathe 4.2s ease-in-out infinite;
  animation-delay: var(--ao-phase);
}

.ao-motion-float .ao-body-wrap {
  animation: ao-float 3.6s ease-in-out infinite;
  animation-delay: var(--ao-phase);
}
.ao-motion-float .ao-halo {
  animation: ao-breathe 3.6s ease-in-out infinite;
  animation-delay: var(--ao-phase);
}

.ao-motion-bounce .ao-body-wrap {
  animation: ao-hop 2.8s cubic-bezier(0.28, 0.84, 0.42, 1) infinite;
  animation-delay: var(--ao-phase);
}

.ao-motion-pulse .ao-body {
  animation: ao-cyber-pulse 2.2s ease-in-out infinite;
  animation-delay: var(--ao-phase);
}
.ao-motion-pulse .ao-halo {
  animation: ao-halo-pulse 2.2s ease-in-out infinite;
  animation-delay: var(--ao-phase);
}

.ao-motion-orbit .ao-body-wrap {
  animation: ao-float 4.4s ease-in-out infinite;
  animation-delay: var(--ao-phase);
}

/* 默认未指定 motion 时回落到平缓呼吸 */
.ao-body { animation: ao-breathe 4.2s ease-in-out infinite; animation-delay: var(--ao-phase); }
.ao-halo { animation: ao-breathe 4.2s ease-in-out infinite; animation-delay: var(--ao-phase); }

/* ── 表情与情绪显隐系统 ─────────────────────────────────────────────────── */
.ao-eye { display: none; }

/* 默认 / 状态驱动眼形 */
.is-idle .ao-eye-round,
.is-thinking .ao-eye-round,
.is-asking .ao-eye-round { display: block; }
.is-working .ao-eye-focus { display: block; }
.is-done .ao-eye-smile { display: block; }
.is-error .ao-eye-cross { display: block; }

/* 显式情绪覆盖（3.0 情绪优先） */
.ao-mood-happy .ao-eye { display: none !important; }
.ao-mood-happy .ao-eye-smile { display: block !important; }

.ao-mood-curious .ao-eye { display: none !important; }
.ao-mood-curious .ao-eye-curious { display: block !important; }

.ao-mood-focused .ao-eye { display: none !important; }
.ao-mood-focused .ao-eye-focus { display: block !important; }

.ao-mood-playful .ao-eye { display: none !important; }
.ao-mood-playful .ao-eye-playful { display: block !important; }

.ao-mood-sparkle .ao-eye { display: none !important; }
.ao-mood-sparkle .ao-eye-sparkle { display: block !important; }

.ao-mood-zen .ao-eye { display: none !important; }
.ao-mood-zen .ao-eye-zen { display: block !important; }

.ao-mood-surprised .ao-eye { display: none !important; }
.ao-mood-surprised .ao-eye-surprised { display: block !important; }

/* 眨眼：压扁瞳孔模拟自然眨眼 */
.agent-orb.ao-blink .ao-pupil {
  transform: scaleY(0.12);
  transform-box: fill-box;
  transform-origin: center;
}
.agent-orb.ao-blink .ao-sparkle-star {
  transform: scale(0.1);
  transform-box: fill-box;
  transform-origin: center;
}

/* 旋转环与思考闪烁点 */
.ao-ring, .ao-dots, .ao-satellite { display: none; }
.is-working .ao-ring { display: block; }
.is-thinking .ao-dots { display: block; }
.ao-motion-orbit .ao-satellite { display: block; }

/* ── 状态特化 ───────────────────────────────────────────────────────────── */
.is-thinking .ao-body, .is-thinking .ao-halo { animation-duration: 1.5s; }
.is-thinking .ao-eyes { transform: translateY(-1.5px); }
.ao-dots circle {
  fill: var(--ao-working-glow, var(--ao-hi));
  opacity: 0.25;
  animation: ao-blip 1.25s ease-in-out infinite;
}
.ao-dots circle:nth-child(2) { animation-delay: 0.16s; }
.ao-dots circle:nth-child(3) { animation-delay: 0.32s; }

.is-working { --ao-glow: var(--ao-working-glow, var(--ao-hi)); }
.ao-ring {
  fill: none; stroke: var(--ao-working-glow, var(--ao-hi)); stroke-width: 2; stroke-linecap: round;
  stroke-dasharray: 30 140; transform-origin: 32px 32px;
  animation: ao-spin 1.5s linear infinite;
}

.is-asking .ao-svg { animation: ao-nudge 2.4s ease-in-out infinite; }
.is-done .ao-body { animation: ao-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 1, ao-breathe 4.2s ease-in-out infinite 0.5s; }
.is-error .ao-svg { --ao-hi: #9a8b7e; --ao-mid: #6b5d52; --ao-lo: #463b33; --ao-glow: #6b5d52; }

/* 卫星轨道微质点（GiGi/漫游专有） */
.ao-satellite {
  transform-origin: 32px 32px;
  animation: ao-spin 6s linear infinite;
}
.ao-satellite circle {
  fill: var(--ao-hi);
  filter: drop-shadow(0 0 3px var(--ao-glow));
}

/* ── 角标 ───────────────────────────────────────────────────────────────── */
.ao-badge {
  position: absolute; top: -1px; right: -1px;
  min-width: 18px; height: 18px; padding: 0 5px; box-sizing: border-box;
  display: none; place-items: center;
  border-radius: 9px; background: var(--ao-badge-bg); color: var(--ao-badge-fg);
  font: 700 11px/1 system-ui, -apple-system, sans-serif;
  box-shadow: 0 0 0 2px var(--ao-badge-ring);
  pointer-events: none;
}
.agent-orb.ao-has-badge .ao-badge { display: grid; }

/* ── 果冻交互与点击回弹 ─────────────────────────────────────────────────── */
@media (hover: hover) {
  .agent-orb:hover { transform: translateY(-2px) scale(1.05); }
  .agent-orb:hover .ao-body { filter: brightness(1.12); }
}
.agent-orb:active { transform: scale(0.92); }
.agent-orb.ao-poked {
  animation: ao-squash-bounce 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) 1;
}

/* ── 关键帧清单 ─────────────────────────────────────────────────────────── */
@keyframes ao-breathe { 0%,100% { transform: scale(1); } 50% { transform: scale(1.045); } }
@keyframes ao-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3.5px); } }
@keyframes ao-hop { 0%,100% { transform: translateY(0) scale(1); } 20% { transform: translateY(-5px) scale(0.96, 1.05); } 40% { transform: translateY(0) scale(1.05, 0.95); } }
@keyframes ao-cyber-pulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.06); opacity: 0.92; } }
@keyframes ao-halo-pulse { 0%,100% { opacity: 0.16; transform: scale(1); } 50% { opacity: 0.32; transform: scale(1.08); } }
@keyframes ao-spin { to { transform: rotate(360deg); } }
@keyframes ao-blip { 0%,100% { opacity: 0.25; } 50% { opacity: 1; } }
@keyframes ao-nudge { 0%,100% { transform: rotate(0); } 25% { transform: rotate(-7deg); } 75% { transform: rotate(7deg); } }
@keyframes ao-pop { 0% { transform: scale(1); } 45% { transform: scale(1.22); } 100% { transform: scale(1); } }
@keyframes ao-twinkle { 0%,100% { transform: scale(1); opacity: 0.9; } 50% { transform: scale(1.2) rotate(45deg); opacity: 1; } }
@keyframes ao-squash-bounce {
  0% { transform: scale(1); }
  25% { transform: scale(1.18, 0.82); }
  50% { transform: scale(0.86, 1.18); }
  75% { transform: scale(1.06, 0.96); }
  100% { transform: scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .ao-body, .ao-halo, .ao-ring, .ao-dots circle, .is-asking .ao-svg, .ao-body-wrap, .ao-satellite { animation: none !important; }
  .agent-orb, .ao-body, .ao-eyes, .ao-pupil { transition: none !important; }
  .agent-orb:hover, .agent-orb:active { transform: none; }
}
`

/** 把样式注入 document.head，重复调用只注一次。无 DOM 环境（SSR）直接跳过。 */
export function injectStyle(doc) {
  const d = doc || (typeof document !== 'undefined' ? document : null)
  if (!d || d.querySelector('style[data-agent-orb]')) return
  const el = d.createElement('style')
  el.setAttribute('data-agent-orb', '')
  el.textContent = css
  d.head.appendChild(el)
}
