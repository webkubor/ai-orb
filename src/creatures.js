/**
 * 生灵形态（creature）插件：圆润身体 + 物种特征 + 大眼高光 + 腮红 + 嘴。
 *
 * 可选加载，核心包不含它：
 *   import 'ai-orb/creatures'
 *   new AgentOrb(el, { creature: 'cat' })
 * 没加载插件时传 creature 会回落到 shape，老用法和体积都不受影响。
 *
 * 几何形态（shape）只改轮廓，读起来仍是「一颗球」；生灵形态让它有物种可认——
 * 耳朵会竖、尾巴会摆、鳃会飘。所有零件按「身后 / 身前」两层拼装：
 * 身后层（耳、角、翅、尾、脚）被身体压住根部，看起来是长出来的。
 *
 * 坐标系与几何形态一致（viewBox 0 0 64 64），身体底部在 y≈57，脚踩在 y≈60 的影子上。
 */

import { defineCreatures } from './index.js'

const KINDS = ['cat', 'bunny', 'dragon', 'owl', 'sprout', 'axolotl', 'bear', 'chick']

const BODY = 'M32 16 C46.5 16 55 26.5 55 40 C55 51.5 46 57 32 57 C18 57 9 51.5 9 40 C9 26.5 17.5 16 32 16 Z'

const FEET = '<ellipse class="ao-c-lo" cx="23.5" cy="56.6" rx="4.6" ry="2.6"/><ellipse class="ao-c-lo" cx="40.5" cy="56.6" rx="4.6" ry="2.6"/>'

/** 每个物种：back 画在身体后面，front 画在身体上、五官下面；beak=true 时用喙代替嘴 */
const PARTS = {
  cat: (fill) => ({
    back: `
      <path class="ao-tail ao-c-mid" d="M49 51 Q61 50 60 38 Q59.5 33.5 56.5 35 Q58 44 48.5 46.5 Z"/>
      <g class="ao-part ao-part-l" style="transform-origin:19px 24px"><path fill="${fill}" d="M11.5 28 Q10.5 11 15.5 7.5 Q19 7 28.5 18.5 Z"/><path class="ao-c-cheek" opacity=".75" d="M15 23 Q14.6 14 17 12 Q19 12.5 24 18.5 Z"/></g>
      <g class="ao-part ao-part-r" style="transform-origin:45px 24px"><path fill="${fill}" d="M52.5 28 Q53.5 11 48.5 7.5 Q45 7 35.5 18.5 Z"/><path class="ao-c-cheek" opacity=".75" d="M49 23 Q49.4 14 47 12 Q45 12.5 40 18.5 Z"/></g>`,
    front: '<path class="ao-thin" d="M10 41 L3.5 39.5 M10 44 L3.5 45 M54 41 L60.5 39.5 M54 44 L60.5 45"/>',
  }),
  bunny: (fill) => ({
    back: `
      <g class="ao-part ao-part-l" style="transform-origin:24px 21px"><ellipse fill="${fill}" cx="23" cy="10" rx="5.2" ry="11.5" transform="rotate(-10 23 10)"/><ellipse class="ao-c-cheek" opacity=".7" cx="23" cy="10.5" rx="2.4" ry="8" transform="rotate(-10 23 10)"/></g>
      <g class="ao-part ao-part-r" style="transform-origin:40px 21px"><ellipse fill="${fill}" cx="41" cy="10" rx="5.2" ry="11.5" transform="rotate(10 41 10)"/><ellipse class="ao-c-cheek" opacity=".7" cx="41" cy="10.5" rx="2.4" ry="8" transform="rotate(10 41 10)"/></g>`,
    front: '<path class="ao-c-cheek" d="M30.4 40.6 h3.2 l-1.6 1.8 z"/>',
  }),
  dragon: (fill) => ({
    back: `
      <g class="ao-part ao-part-l ao-wing" style="transform-origin:12px 34px"><path class="ao-c-hi" opacity=".92" d="M12 34 Q2 30 1.5 20 Q6 24 9 22 Q9 28 13 30 Z"/></g>
      <g class="ao-part ao-part-r ao-wing" style="transform-origin:52px 34px"><path class="ao-c-hi" opacity=".92" d="M52 34 Q62 30 62.5 20 Q58 24 55 22 Q55 28 51 30 Z"/></g>
      <path class="ao-c-hi" d="M20 20 Q16 11 19 5 Q21.5 12 26 17.5 Z"/><path class="ao-c-hi" d="M44 20 Q48 11 45 5 Q42.5 12 38 17.5 Z"/>
      <path class="ao-c-lo" d="M29 16.8 L32 11.5 L35 16.8 Z"/>`,
    front: '<ellipse class="ao-c-hi" opacity=".5" cx="32" cy="50" rx="11" ry="6"/>',
  }),
  owl: (fill) => ({
    back: `
      <g class="ao-part ao-part-l" style="transform-origin:16px 24px"><path fill="${fill}" d="M11 27 Q9 15 12 8 Q17 15 24 18 Z"/></g>
      <g class="ao-part ao-part-r" style="transform-origin:48px 24px"><path fill="${fill}" d="M53 27 Q55 15 52 8 Q47 15 40 18 Z"/></g>`,
    front: `
      <circle class="ao-c-hi" opacity=".85" cx="24" cy="36" r="8.4"/><circle class="ao-c-hi" opacity=".85" cx="40" cy="36" r="8.4"/>
      <path class="ao-thin" d="M27 50.5 q2 2 4 0 M33 50.5 q2 2 4 0 M30 54 q2 2 4 0"/>
      <path class="ao-beak" d="M29.8 42.6 L34.2 42.6 L32 46.6 Z"/>`,
    beak: true,
  }),
  sprout: () => ({
    back: `
      <g class="ao-part ao-part-l ao-sway" style="transform-origin:32px 18px">
        <path class="ao-stem" d="M32 18 Q31.5 11.5 33 7.5"/>
        <path class="ao-leaf" d="M33 8 Q39 1.5 46 6 Q40 11.5 33 8 Z"/>
        <path class="ao-leaf" d="M32.5 10.5 Q26 4.5 19.5 8.5 Q25.5 13.5 32.5 10.5 Z"/>
      </g>`,
    front: '',
  }),
  axolotl: () => ({
    back: `
      <g class="ao-part ao-part-l ao-gills-l" style="transform-origin:13px 30px"><path class="ao-gill" d="M13 26 Q6 22 4 15"/><path class="ao-gill" d="M11.5 31 Q4 30 1 25"/><path class="ao-gill" d="M11 36 Q4 37.5 1.5 34"/></g>
      <g class="ao-part ao-part-r ao-gills-r" style="transform-origin:51px 30px"><path class="ao-gill" d="M51 26 Q58 22 60 15"/><path class="ao-gill" d="M52.5 31 Q60 30 63 25"/><path class="ao-gill" d="M53 36 Q60 37.5 62.5 34"/></g>`,
    front: '<g class="ao-c-lo" opacity=".35"><circle cx="20" cy="25" r="1.4"/><circle cx="44" cy="24" r="1.1"/><circle cx="47.5" cy="28.5" r=".9"/></g>',
  }),
  bear: (fill) => ({
    back: `
      <g class="ao-part ao-part-l" style="transform-origin:16px 23px"><circle fill="${fill}" cx="15" cy="19" r="6.5"/><circle class="ao-c-cheek" opacity=".7" cx="15" cy="19" r="3.2"/></g>
      <g class="ao-part ao-part-r" style="transform-origin:48px 23px"><circle fill="${fill}" cx="49" cy="19" r="6.5"/><circle class="ao-c-cheek" opacity=".7" cx="49" cy="19" r="3.2"/></g>`,
    front: '<ellipse class="ao-c-hi" opacity=".75" cx="32" cy="45" rx="7" ry="5"/><ellipse class="ao-ink" cx="32" cy="41.6" rx="2" ry="1.3"/>',
  }),
  chick: (fill) => ({
    back: `<g class="ao-part ao-part-l ao-sway" style="transform-origin:32px 17px"><path fill="${fill}" d="M31 17 Q27 10 31 7 Q30 12 33 16 Z M33 17 Q35 10 39 10 Q35 13 34.5 17 Z"/></g>`,
    front: `
      <ellipse class="ao-c-lo" opacity=".55" cx="11" cy="42" rx="3.5" ry="6" transform="rotate(20 11 42)"/>
      <ellipse class="ao-c-lo" opacity=".55" cx="53" cy="42" rx="3.5" ry="6" transform="rotate(-20 53 42)"/>
      <path class="ao-beak" d="M29.5 42.5 Q32 40.5 34.5 42.5 Q32 46 29.5 42.5 Z"/>`,
    beak: true,
  }),
}

function hasBeak(kind) {
  return Boolean(PARTS[kind]?.('').beak)
}

function eyeball(cx, cy, rx = 4.4, ry = 5.2) {
  const f = (n) => n.toFixed(2)
  return `<g class="ao-eyeball"><ellipse class="ao-pupil" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/>`
    + `<circle class="ao-glint" cx="${f(cx + rx * 0.38)}" cy="${f(cy - ry * 0.45)}" r="${f(rx * 0.4)}"/>`
    + `<circle class="ao-glint" cx="${f(cx - rx * 0.32)}" cy="${f(cy + ry * 0.42)}" r="${f(rx * 0.18)}"/></g>`
}

function starEye(cx, cy) {
  const r = 3, k = r * 0.28, sx = cx + 0.6, sy = cy - 0.8
  return `<g class="ao-eyeball"><ellipse class="ao-pupil" cx="${cx}" cy="${cy}" rx="4.6" ry="5.4"/>`
    + `<path class="ao-glint ao-star-glint" d="M${sx} ${sy - r} Q${sx + k} ${sy - k} ${sx + r} ${sy} Q${sx + k} ${sy + k} ${sx} ${sy + r} Q${sx - k} ${sy + k} ${sx - r} ${sy} Q${sx - k} ${sy - k} ${sx} ${sy - r} Z"/>`
    + `<circle class="ao-glint" cx="${cx - 1.6}" cy="${cy + 2.8}" r=".7"/></g>`
}

/** 眼形沿用几何形态的 class 名，情绪 / 状态的显隐规则两边通用 */
const EYES = `
  <g class="ao-eye ao-eye-round">${eyeball(24, 36)}${eyeball(40, 36)}</g>
  <g class="ao-eye ao-eye-focus">${eyeball(24, 36.5, 3.6, 4)}${eyeball(40, 36.5, 3.6, 4)}<path class="ao-line" d="M19 29.5 l8.5 2 M45 29.5 l-8.5 2"/></g>
  <g class="ao-eye ao-eye-smile"><path class="ao-line ao-thick" d="M19.5 37.5 q4.5 -6.5 9 0 M35.5 37.5 q4.5 -6.5 9 0"/></g>
  <g class="ao-eye ao-eye-cross"><path class="ao-line" d="M20.5 32.5 l7 7 M27.5 32.5 l-7 7 M36.5 32.5 l7 7 M43.5 32.5 l-7 7"/></g>
  <g class="ao-eye ao-eye-curious">${eyeball(24, 35.5, 5.2, 6)}${eyeball(40, 36.5, 3.8, 4.4)}<path class="ao-line" d="M35.5 29 q4.5 -2.6 9 0"/></g>
  <g class="ao-eye ao-eye-playful"><path class="ao-line ao-thick" d="M20.5 33 l6.5 3.2 l-6.5 3.2"/>${eyeball(40, 36, 4.6, 5.4)}</g>
  <g class="ao-eye ao-eye-sparkle">${starEye(24, 36)}${starEye(40, 36)}</g>
  <g class="ao-eye ao-eye-zen"><path class="ao-line ao-thick" d="M19.5 36 q4.5 4.5 9 0 M35.5 36 q4.5 4.5 9 0"/></g>
  <g class="ao-eye ao-eye-surprised">${eyeball(24, 36, 5, 5.8)}${eyeball(40, 36, 5, 5.8)}<path class="ao-line" d="M19 27.5 q5 -2.5 10 0 M35 27.5 q5 -2.5 10 0"/></g>`

const MOUTHS = `
  <path class="ao-mouth ao-mouth-w ao-mouth-stroke" d="M28.5 43.6 q1.75 2.2 3.5 0 q1.75 2.2 3.5 0"/>
  <g class="ao-mouth ao-mouth-open"><path class="ao-ink" d="M27.5 43 q4.5 6.8 9 0 z"/><ellipse class="ao-tongue" cx="32" cy="46.4" rx="2.3" ry="1.2"/></g>
  <ellipse class="ao-mouth ao-mouth-o ao-ink" cx="32" cy="45" rx="1.8" ry="2.2"/>
  <path class="ao-mouth ao-mouth-flat ao-mouth-stroke" d="M29 44.6 h6"/>
  <g class="ao-mouth ao-mouth-tongue"><path class="ao-mouth-stroke" d="M28.5 43.6 q3.5 2.6 7 0"/><path class="ao-tongue" d="M31 44.7 q1.6 3.6 3.2 0 z"/></g>
  <path class="ao-mouth ao-mouth-wave ao-mouth-stroke" d="M28 45 q1 -1.5 2 0 q1 1.5 2 0 q1 -1.5 2 0 q1 1.5 2 0"/>
  <path class="ao-mouth ao-mouth-calm ao-mouth-stroke" d="M29.5 43.8 q2.5 2 5 0"/>`

function creatureSvg(kind, id) {
  const fill = `url(#${id})`
  const parts = PARTS[kind](fill)
  return `
<svg class="ao-svg" viewBox="0 0 64 64" aria-hidden="true">
  <defs>
    <radialGradient id="${id}" cx="38%" cy="32%" r="72%">
      <stop offset="0%" stop-color="var(--ao-hi)"/>
      <stop offset="58%" stop-color="var(--ao-mid)"/>
      <stop offset="100%" stop-color="var(--ao-lo)"/>
    </radialGradient>
  </defs>
  <ellipse class="ao-shadow" cx="32" cy="60.5" rx="15" ry="2.6"/>
  <g class="ao-body-wrap"><g class="ao-bob">
    ${FEET}
    ${parts.back}
    <path class="ao-body" d="${BODY}" fill="${fill}"/>
    <ellipse class="ao-gloss" cx="23" cy="24" rx="6" ry="3.4" transform="rotate(-24 23 24)"/>
    ${parts.front}
    <g class="ao-face">
      <g class="ao-blush"><ellipse cx="16.5" cy="44" rx="3.8" ry="2.2"/><ellipse cx="47.5" cy="44" rx="3.8" ry="2.2"/></g>
      <g class="ao-mouths">${MOUTHS}</g>
    </g>
    <g class="ao-eyes">${EYES}</g>
    <ellipse class="ao-ring" cx="32" cy="38" rx="30" ry="27" style="transform-origin:32px 38px"/>
    <g class="ao-satellite"><circle cx="32" cy="3" r="2.4"/></g>
  </g></g>
  <g class="ao-dots"><circle cx="50" cy="12" r="1.6"/><circle cx="54.5" cy="7.5" r="2.1"/><circle cx="60" cy="3" r="2.6"/></g>
</svg>
<span class="ao-badge"></span>`
}

export const creatureCss = `.ao-creature .ao-body-wrap,.ao-creature .ao-bob{transform-origin:32px 58px}.ao-creature.ao-motion-breathe .ao-bob{animation:ao-squish 3.4s ease-in-out infinite;animation-delay:var(--ao-phase)}.ao-creature.ao-motion-pulse .ao-bob{animation:ao-squish 1.7s ease-in-out infinite;animation-delay:var(--ao-phase)}.ao-shadow{fill:rgba(0,0,0,0.28);transform-origin:32px 60.5px;animation:ao-shadow 3.4s ease-in-out infinite;animation-delay:var(--ao-phase)}.ao-motion-bounce .ao-shadow{animation:ao-shadow-hop 2.8s cubic-bezier(0.28,0.84,0.42,1) infinite;animation-delay:var(--ao-phase)}.ao-motion-float .ao-shadow,.ao-motion-orbit .ao-shadow{animation:ao-shadow-float 3.6s ease-in-out infinite;animation-delay:var(--ao-phase)}.is-error.ao-creature .ao-eye{display:none !important}.is-error.ao-creature .ao-eye-cross{display:block !important}.ao-eyeball{transform-box:fill-box;transform-origin:center;transition:transform 0.08s ease-in}.agent-orb.ao-blink .ao-eyeball{transform:scaleY(0.1)}.ao-creature.ao-blink .ao-pupil{transform:none}.ao-glint{fill:#fff}.ao-star-glint{transform-box:fill-box;transform-origin:center;animation:ao-twinkle 1.8s ease-in-out infinite}.ao-thick{stroke-width:3}.ao-ink{fill:var(--ao-ink)}.ao-c-hi{fill:var(--ao-hi)}.ao-c-mid{fill:var(--ao-mid)}.ao-c-lo{fill:var(--ao-lo)}.ao-c-cheek{fill:var(--ao-cheek)}.ao-thin{fill:none;stroke:var(--ao-ink);stroke-width:1.2;stroke-linecap:round;opacity:0.5}.ao-stem{fill:none;stroke:var(--ao-lo);stroke-width:2;stroke-linecap:round}.ao-leaf{fill:var(--ao-hi);stroke:var(--ao-lo);stroke-width:1;stroke-linejoin:round}.ao-gill{fill:none;stroke:var(--ao-accent,var(--ao-cheek));stroke-width:3.4;stroke-linecap:round}.ao-beak{fill:#f6a63a;stroke:#c97a1c;stroke-width:0.6;stroke-linejoin:round}.ao-tongue{fill:#ff7a93}.ao-blush ellipse{fill:var(--ao-cheek)}.ao-blush{opacity:0.42;transition:opacity 0.3s ease}.ao-near .ao-blush,.ao-mood-happy .ao-blush,.is-done .ao-blush,.ao-petted .ao-blush{opacity:0.9}.ao-mouth{display:none}.ao-mouth-stroke{fill:none;stroke:var(--ao-ink);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}[data-mouth="w"] .ao-mouth-w,[data-mouth="open"] .ao-mouth-open,[data-mouth="o"] .ao-mouth-o,[data-mouth="flat"] .ao-mouth-flat,[data-mouth="tongue"] .ao-mouth-tongue,[data-mouth="wave"] .ao-mouth-wave,[data-mouth="calm"] .ao-mouth-calm{display:block}.ao-has-beak .ao-mouths{display:none}.ao-part{transition:transform 0.28s cubic-bezier(0.34,1.56,0.64,1)}.ao-near .ao-part-l{transform:rotate(-9deg) scale(1.06)}.ao-near .ao-part-r{transform:rotate(9deg) scale(1.06)}.ao-twitch-l .ao-part-l{animation:ao-twitch-l 0.5s ease-in-out}.ao-twitch-r .ao-part-r{animation:ao-twitch-r 0.5s ease-in-out}.ao-creature-bunny .ao-part-r{transform:rotate(32deg)}.ao-creature-bunny.ao-near .ao-part-r{transform:rotate(6deg) scale(1.05)}.ao-near .ao-wing.ao-part-l{animation:ao-flap-l 0.34s ease-in-out infinite}.ao-near .ao-wing.ao-part-r{animation:ao-flap-r 0.34s ease-in-out infinite}.ao-sway{animation:ao-sway 2.8s ease-in-out infinite alternate;animation-delay:var(--ao-phase)}.ao-near .ao-sway{animation-duration:0.8s}.ao-gills-l{animation:ao-gill-l 2.2s ease-in-out infinite alternate}.ao-gills-r{animation:ao-gill-r 2.2s ease-in-out infinite alternate}.ao-near .ao-gills-l,.ao-near .ao-gills-r{animation-duration:0.6s}.ao-tail{transform-origin:49px 49px;animation:ao-tail 1.9s ease-in-out infinite alternate}.ao-near .ao-tail{animation-duration:0.5s}.ao-petted .ao-bob{animation:ao-jiggle 0.45s ease-in-out 3 !important}.ao-creature.ao-poked{transform-origin:50% 92%}@keyframes ao-squish{0%,100%{transform:scale(1,1)}50%{transform:scale(0.975,1.035)}}@keyframes ao-shadow{0%,100%{transform:scale(1)}50%{transform:scale(0.95)}}@keyframes ao-shadow-hop{0%,100%{transform:scale(1);opacity:1}25%{transform:scale(0.72);opacity:0.55}42%{transform:scale(1.06)}55%{transform:scale(1)}}@keyframes ao-shadow-float{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(0.84);opacity:0.7}}@keyframes ao-twitch-l{0%,100%{transform:rotate(0)}30%{transform:rotate(-16deg)}60%{transform:rotate(7deg)}}@keyframes ao-twitch-r{0%,100%{transform:rotate(0)}30%{transform:rotate(16deg)}60%{transform:rotate(-7deg)}}@keyframes ao-flap-l{0%,100%{transform:rotate(0)}50%{transform:rotate(-24deg)}}@keyframes ao-flap-r{0%,100%{transform:rotate(0)}50%{transform:rotate(24deg)}}@keyframes ao-sway{from{transform:rotate(-7deg)}to{transform:rotate(7deg)}}@keyframes ao-gill-l{from{transform:rotate(-6deg)}to{transform:rotate(9deg)}}@keyframes ao-gill-r{from{transform:rotate(6deg)}to{transform:rotate(-9deg)}}@keyframes ao-tail{from{transform:rotate(-8deg)}to{transform:rotate(14deg)}}@keyframes ao-jiggle{0%,100%{transform:scale(1,1)}25%{transform:scale(1.08,0.92) rotate(-3deg)}50%{transform:scale(0.95,1.06)}75%{transform:scale(1.05,0.95) rotate(3deg)}}@media (prefers-reduced-motion:reduce){.ao-shadow,.ao-part,.ao-sway,.ao-gills-l,.ao-gills-r,.ao-tail,.ao-star-glint{animation:none !important}.ao-eyeball,.ao-part{transition:none !important}}`

defineCreatures({ kinds: KINDS, svg: creatureSvg, hasBeak, css: creatureCss })

export { CREATURES } from './index.js'
