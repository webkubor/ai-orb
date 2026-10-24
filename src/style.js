/**
 * ai-orb 3.0 全部样式。
 *
 * 结构上分三层，各管各的 transform，互不覆盖：
 *   .ao-body-wrap  JS 每帧写入的倾斜 / 挤压（跟随鼠标）
 *   .ao-bob        CSS 动效（呼吸、漂浮、跳跃）
 *   零件           耳朵、翅膀、鳃各自的抖动与摇摆
 * CSS 动画会盖掉同一元素上的行内 transform，所以跟随和律动不能放在同一个节点上。
 */
export const css = `
.agent-orb {
  --ao-size: 56px;
  --ao-hi: #ffc79a;
  --ao-mid: #ff8a50;
  --ao-lo: #e8632f;
  --ao-glow: #ff8a50;
  --ao-ink: #2a1a10;
  --ao-cheek: #ff9eb5;
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

.ao-shape-squircle { --ao-focus-radius: 14px; }
.ao-shape-pill { width: calc(var(--ao-size) * 1.5); --ao-focus-radius: 999px; }
.ao-shape-diamond { --ao-focus-radius: 8px; }
.ao-shape-hex { --ao-focus-radius: 12px; }
.ao-shape-shield { --ao-focus-radius: 12px; }
.ao-shape-drop { --ao-focus-radius: 16px; }
.ao-shape-bean { --ao-focus-radius: 16px; }
.ao-shape-star { --ao-focus-radius: 8px; }
.ao-creature { --ao-focus-radius: 40%; width: var(--ao-size); }

.ao-svg { display: block; width: 100%; height: 100%; overflow: visible; }

/* ── 身体、高光、光晕 ───────────────────────────────────────────────────── */
.ao-body-wrap, .ao-bob { transform-origin: 32px 32px; }
.ao-body-wrap { will-change: transform; }
.ao-body { transform-origin: 32px 32px; transition: filter var(--ao-feedback-duration) ease-out; }
.ao-gloss { fill: rgba(255, 255, 255, 0.45); pointer-events: none; }
.ao-halo { fill: none; stroke: var(--ao-glow); stroke-width: 8; opacity: 0.16; transform-origin: 32px 32px; }
.ao-eyes, .ao-face { transition: transform 0.16s ease-out; transform-origin: 32px 32px; }
.ao-pupil { fill: var(--ao-ink); transition: transform 0.08s ease-in; }
.ao-line { fill: none; stroke: var(--ao-ink); stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round; }
.ao-sparkle-star { fill: var(--ao-ink); transform-origin: center; animation: ao-twinkle 2.4s ease-in-out infinite; }

/* 默认呼吸 */
.ao-body { animation: ao-breathe 4.2s ease-in-out infinite; animation-delay: var(--ao-phase); }
.ao-halo { animation: ao-breathe 4.2s ease-in-out infinite; animation-delay: var(--ao-phase); }

/* ── 生灵：身体以脚底为支点，呼吸是上下挤压而不是整体放大 ───────────────── */
.ao-creature .ao-body-wrap, .ao-creature .ao-bob { transform-origin: 32px 58px; }
.ao-creature .ao-body { animation: none !important; }
.ao-creature .ao-bob { animation: ao-squish 3.4s ease-in-out infinite; animation-delay: var(--ao-phase); }

/* ── 动效模式 ───────────────────────────────────────────────────────────── */
.ao-motion-breathe .ao-body,
.ao-motion-breathe .ao-halo { animation: ao-breathe 4.2s ease-in-out infinite; animation-delay: var(--ao-phase); }
.ao-motion-float .ao-bob { animation: ao-float 3.6s ease-in-out infinite; animation-delay: var(--ao-phase); }
.ao-motion-float .ao-halo { animation: ao-breathe 3.6s ease-in-out infinite; animation-delay: var(--ao-phase); }
.ao-motion-bounce .ao-bob { animation: ao-hop 2.8s cubic-bezier(0.28, 0.84, 0.42, 1) infinite; animation-delay: var(--ao-phase); }
.ao-motion-pulse .ao-body { animation: ao-cyber-pulse 2.2s ease-in-out infinite; animation-delay: var(--ao-phase); }
.ao-motion-pulse .ao-halo { animation: ao-halo-pulse 2.2s ease-in-out infinite; animation-delay: var(--ao-phase); }
.ao-motion-orbit .ao-bob { animation: ao-float 4.4s ease-in-out infinite; animation-delay: var(--ao-phase); }
.ao-creature.ao-motion-breathe .ao-bob { animation: ao-squish 3.4s ease-in-out infinite; animation-delay: var(--ao-phase); }
.ao-creature.ao-motion-pulse .ao-bob { animation: ao-squish 1.7s ease-in-out infinite; animation-delay: var(--ao-phase); }

/* 脚下的影子：跳起来变小变淡，落地变回来 */
.ao-shadow { fill: rgba(0, 0, 0, 0.28); transform-origin: 32px 60.5px; animation: ao-shadow 3.4s ease-in-out infinite; animation-delay: var(--ao-phase); }
.ao-motion-bounce .ao-shadow { animation: ao-shadow-hop 2.8s cubic-bezier(0.28, 0.84, 0.42, 1) infinite; animation-delay: var(--ao-phase); }
.ao-motion-float .ao-shadow, .ao-motion-orbit .ao-shadow { animation: ao-shadow-float 3.6s ease-in-out infinite; animation-delay: var(--ao-phase); }

/* ── 表情显隐 ───────────────────────────────────────────────────────────── */
.ao-eye { display: none; }
.is-idle .ao-eye-round,
.is-thinking .ao-eye-round,
.is-asking .ao-eye-round { display: block; }
.is-working .ao-eye-focus { display: block; }
.is-done .ao-eye-smile { display: block; }
.is-error .ao-eye-cross { display: block; }

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
.is-error.ao-creature .ao-eye { display: none !important; }
.is-error.ao-creature .ao-eye-cross { display: block !important; }

/* 眨眼：几何形态压扁瞳孔，生灵压扁整颗眼球（连高光一起） */
.agent-orb.ao-blink .ao-pupil { transform: scaleY(0.12); transform-box: fill-box; transform-origin: center; }
.ao-eyeball { transform-box: fill-box; transform-origin: center; transition: transform 0.08s ease-in; }
.agent-orb.ao-blink .ao-eyeball { transform: scaleY(0.1); }
.ao-creature.ao-blink .ao-pupil { transform: none; }
.agent-orb.ao-blink .ao-sparkle-star { transform: scale(0.1); transform-box: fill-box; transform-origin: center; }

/* ── 生灵零件 ───────────────────────────────────────────────────────────── */
.ao-glint { fill: #fff; }
.ao-star-glint { transform-box: fill-box; transform-origin: center; animation: ao-twinkle 1.8s ease-in-out infinite; }
.ao-thick { stroke-width: 3; }
.ao-ink { fill: var(--ao-ink); }
.ao-c-hi { fill: var(--ao-hi); }
.ao-c-mid { fill: var(--ao-mid); }
.ao-c-lo { fill: var(--ao-lo); }
.ao-c-cheek { fill: var(--ao-cheek); }
.ao-thin { fill: none; stroke: var(--ao-ink); stroke-width: 1.2; stroke-linecap: round; opacity: 0.5; }
.ao-stem { fill: none; stroke: var(--ao-lo); stroke-width: 2; stroke-linecap: round; }
.ao-leaf { fill: var(--ao-hi); stroke: var(--ao-lo); stroke-width: 1; stroke-linejoin: round; }
.ao-gill { fill: none; stroke: var(--ao-accent, var(--ao-cheek)); stroke-width: 3.4; stroke-linecap: round; }
.ao-beak { fill: #f6a63a; stroke: #c97a1c; stroke-width: 0.6; stroke-linejoin: round; }
.ao-tongue { fill: #ff7a93; }

.ao-blush ellipse { fill: var(--ao-cheek); }
.ao-blush { opacity: 0.42; transition: opacity 0.3s ease; }
.ao-near .ao-blush, .ao-mood-happy .ao-blush, .is-done .ao-blush, .ao-petted .ao-blush { opacity: 0.9; }

.ao-mouth { display: none; }
.ao-mouth-stroke { fill: none; stroke: var(--ao-ink); stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
[data-mouth="w"] .ao-mouth-w,
[data-mouth="open"] .ao-mouth-open,
[data-mouth="o"] .ao-mouth-o,
[data-mouth="flat"] .ao-mouth-flat,
[data-mouth="tongue"] .ao-mouth-tongue,
[data-mouth="wave"] .ao-mouth-wave,
[data-mouth="calm"] .ao-mouth-calm { display: block; }
.ao-has-beak .ao-mouths { display: none; }

/* 耳朵：光标靠近时竖起来，平时不定时抖一下 */
.ao-part { transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1); }
.ao-near .ao-part-l { transform: rotate(-9deg) scale(1.06); }
.ao-near .ao-part-r { transform: rotate(9deg) scale(1.06); }
.ao-twitch-l .ao-part-l { animation: ao-twitch-l 0.5s ease-in-out; }
.ao-twitch-r .ao-part-r { animation: ao-twitch-r 0.5s ease-in-out; }

/* 兔子平时耷拉一只耳朵，看到你才竖起来 */
.ao-creature-bunny .ao-part-r { transform: rotate(32deg); }
.ao-creature-bunny.ao-near .ao-part-r { transform: rotate(6deg) scale(1.05); }

/* 小龙翅膀：靠近时扑腾 */
.ao-near .ao-wing.ao-part-l { animation: ao-flap-l 0.34s ease-in-out infinite; }
.ao-near .ao-wing.ao-part-r { animation: ao-flap-r 0.34s ease-in-out infinite; }

/* 芽芽的叶子、小鸡的呆毛、蝾螈的鳃、猫尾巴：一直在轻轻摆 */
.ao-sway { animation: ao-sway 2.8s ease-in-out infinite alternate; animation-delay: var(--ao-phase); }
.ao-near .ao-sway { animation-duration: 0.8s; }
.ao-gills-l { animation: ao-gill-l 2.2s ease-in-out infinite alternate; }
.ao-gills-r { animation: ao-gill-r 2.2s ease-in-out infinite alternate; }
.ao-near .ao-gills-l, .ao-near .ao-gills-r { animation-duration: 0.6s; }
.ao-tail { transform-origin: 49px 49px; animation: ao-tail 1.9s ease-in-out infinite alternate; }
.ao-near .ao-tail { animation-duration: 0.5s; }

/* 摸摸：害羞地扭一扭 */
.ao-petted .ao-bob { animation: ao-jiggle 0.45s ease-in-out 3 !important; }

/* ── 运行状态零件 ───────────────────────────────────────────────────────── */
.ao-ring, .ao-dots, .ao-satellite { display: none; }
.is-working .ao-ring { display: block; }
.is-thinking .ao-dots { display: block; }
.ao-motion-orbit .ao-satellite { display: block; }

.is-thinking .ao-body, .is-thinking .ao-halo { animation-duration: 1.5s; }
.is-thinking .ao-eyes { transform: translateY(-1.5px); }
.ao-dots circle { fill: var(--ao-working-glow, var(--ao-hi)); opacity: 0.25; animation: ao-blip 1.25s ease-in-out infinite; }
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

.ao-satellite { transform-origin: 32px 32px; animation: ao-spin 6s linear infinite; }
.ao-satellite circle { fill: var(--ao-hi); filter: drop-shadow(0 0 3px var(--ao-glow)); }

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

/* ── 粒子：戳一下冒星光，摸摸冒爱心 ─────────────────────────────────────── */
.ao-particle {
  position: absolute; left: 50%; top: 28%;
  pointer-events: none; opacity: 0;
  font: 700 12px/1 system-ui, -apple-system, sans-serif;
  color: var(--ao-cheek);
  text-shadow: 0 0 6px var(--ao-glow);
  animation: ao-particle 0.95s cubic-bezier(0.2, 0.7, 0.3, 1) forwards;
}
.ao-particle-spark { color: var(--ao-hi); }

/* ── 悬停与点击 ─────────────────────────────────────────────────────────── */
@media (hover: hover) {
  .agent-orb:hover { transform: translateY(-2px) scale(1.05); }
  .agent-orb:hover .ao-body { filter: brightness(1.1); }
}
.agent-orb:active { transform: scale(0.92); }
.agent-orb.ao-poked { animation: ao-squash-bounce 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) 1; }
.ao-creature.ao-poked { transform-origin: 50% 92%; }

/* ── 关键帧 ─────────────────────────────────────────────────────────────── */
@keyframes ao-breathe { 0%,100% { transform: scale(1); } 50% { transform: scale(1.045); } }
@keyframes ao-squish { 0%,100% { transform: scale(1, 1); } 50% { transform: scale(0.975, 1.035); } }
@keyframes ao-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3.5px); } }
@keyframes ao-hop { 0%,100% { transform: translateY(0) scale(1); } 10% { transform: translateY(0) scale(1.06, 0.94); } 25% { transform: translateY(-6px) scale(0.95, 1.06); } 42% { transform: translateY(0) scale(1.07, 0.93); } 55% { transform: translateY(0) scale(1); } }
@keyframes ao-cyber-pulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.06); opacity: 0.92; } }
@keyframes ao-halo-pulse { 0%,100% { opacity: 0.16; transform: scale(1); } 50% { opacity: 0.32; transform: scale(1.08); } }
@keyframes ao-shadow { 0%,100% { transform: scale(1); } 50% { transform: scale(0.95); } }
@keyframes ao-shadow-hop { 0%,100% { transform: scale(1); opacity: 1; } 25% { transform: scale(0.72); opacity: 0.55; } 42% { transform: scale(1.06); } 55% { transform: scale(1); } }
@keyframes ao-shadow-float { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(0.84); opacity: 0.7; } }
@keyframes ao-spin { to { transform: rotate(360deg); } }
@keyframes ao-blip { 0%,100% { opacity: 0.25; } 50% { opacity: 1; } }
@keyframes ao-nudge { 0%,100% { transform: rotate(0); } 25% { transform: rotate(-7deg); } 75% { transform: rotate(7deg); } }
@keyframes ao-pop { 0% { transform: scale(1); } 45% { transform: scale(1.22); } 100% { transform: scale(1); } }
@keyframes ao-twinkle { 0%,100% { transform: scale(1); opacity: 0.9; } 50% { transform: scale(1.2) rotate(45deg); opacity: 1; } }
@keyframes ao-twitch-l { 0%,100% { transform: rotate(0); } 30% { transform: rotate(-16deg); } 60% { transform: rotate(7deg); } }
@keyframes ao-twitch-r { 0%,100% { transform: rotate(0); } 30% { transform: rotate(16deg); } 60% { transform: rotate(-7deg); } }
@keyframes ao-flap-l { 0%,100% { transform: rotate(0); } 50% { transform: rotate(-24deg); } }
@keyframes ao-flap-r { 0%,100% { transform: rotate(0); } 50% { transform: rotate(24deg); } }
@keyframes ao-sway { from { transform: rotate(-7deg); } to { transform: rotate(7deg); } }
@keyframes ao-gill-l { from { transform: rotate(-6deg); } to { transform: rotate(9deg); } }
@keyframes ao-gill-r { from { transform: rotate(6deg); } to { transform: rotate(-9deg); } }
@keyframes ao-tail { from { transform: rotate(-8deg); } to { transform: rotate(14deg); } }
@keyframes ao-jiggle { 0%,100% { transform: scale(1, 1); } 25% { transform: scale(1.08, 0.92) rotate(-3deg); } 50% { transform: scale(0.95, 1.06); } 75% { transform: scale(1.05, 0.95) rotate(3deg); } }
@keyframes ao-squash-bounce {
  0% { transform: scale(1); }
  25% { transform: scale(1.18, 0.82); }
  50% { transform: scale(0.86, 1.18); }
  75% { transform: scale(1.06, 0.96); }
  100% { transform: scale(1); }
}
@keyframes ao-particle {
  0% { opacity: 0; transform: translate(-50%, 0) scale(0.4); }
  20% { opacity: 1; }
  100% { opacity: 0; transform: translate(calc(-50% + var(--dx)), -36px) scale(1.15) rotate(var(--rot)); }
}

/* 系统开了「减弱动态效果」：全停，只留配色、表情和嘴型 */
@media (prefers-reduced-motion: reduce) {
  .ao-body, .ao-halo, .ao-ring, .ao-dots circle, .is-asking .ao-svg, .ao-bob, .ao-satellite,
  .ao-shadow, .ao-part, .ao-sway, .ao-gills-l, .ao-gills-r, .ao-tail, .ao-star-glint, .ao-sparkle-star { animation: none !important; }
  .ao-particle { display: none; }
  .agent-orb, .ao-body, .ao-eyes, .ao-face, .ao-pupil, .ao-eyeball, .ao-part { transition: none !important; }
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
