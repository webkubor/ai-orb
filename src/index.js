/**
 * ai-orb 3.0 —— 一颗有情绪、有形态、有物理果冻弹性形变的 AI 助手数字生命球。
 * 纯 SVG + CSS 动画，零外部依赖。
 *
 * 3.0 核心演进：
 *   · 9 种多元形态体系（circle, squircle, pill, diamond, hex, shield, drop, bean, star）
 *   · 8 种面部表情与情绪系统（neutral, happy, curious, focused, playful, sparkle, zen, surprised）
 *   · 5 种独立生命动效（breathe, float, bounce, pulse, orbit），打破机械同步
 *   · 鼠标临场果冻形变（Jelly Squish & Tilt）与动量交互
 *   · 交互 poke() 弹性挤压反弹
 */
import { injectStyle } from './style.js'

/** 运行状态清单。 */
export const STATES = ['idle', 'thinking', 'working', 'asking', 'done', 'error']

/** 几何形态清单（3.0 新增 6 种） */
export const SHAPES = [
  'circle',
  'squircle',
  'pill',
  'diamond',
  'hex',
  'shield',
  'drop',
  'bean',
  'star'
]

/** 情绪与表情清单（3.0 新增） */
export const MOODS = [
  'neutral',
  'happy',
  'curious',
  'focused',
  'playful',
  'sparkle',
  'zen',
  'surprised'
]

/** 独立运动节奏模式（3.0 新增） */
export const MOTIONS = [
  'breathe',
  'float',
  'bounce',
  'pulse',
  'orbit'
]

/** 默认无障碍文案 */
export const DEFAULT_LABELS = {
  idle: 'Assistant · idle',
  thinking: 'Assistant · thinking',
  working: 'Assistant · working',
  asking: 'Assistant · waiting for you',
  done: 'Assistant · done',
  error: 'Assistant · something went wrong',
}

let seq = 0

const living = new Set()
let pointer = { x: 0, y: 0 }
let loopId = 0
let bound = false

function onPointerMove(e) {
  pointer = { x: e.clientX, y: e.clientY }
}

function loop() {
  for (const orb of living) orb._frame()
  loopId = living.size ? requestAnimationFrame(loop) : 0
}

function join(orb) {
  living.add(orb)
  if (!bound && typeof window !== 'undefined') {
    window.addEventListener('mousemove', onPointerMove, { passive: true })
    bound = true
  }
  if (!loopId && typeof requestAnimationFrame !== 'undefined') loopId = requestAnimationFrame(loop)
}

function leave(orb) {
  living.delete(orb)
  if (!living.size && bound && typeof window !== 'undefined') {
    window.removeEventListener('mousemove', onPointerMove)
    bound = false
    if (loopId) { cancelAnimationFrame(loopId); loopId = 0 }
  }
}

/** 内置 8 色莫兰迪与钛金主题 */
export const THEMES = {
  orange:   { '--ao-hi': '#ffc79a', '--ao-mid': '#ff8a50', '--ao-lo': '#e8632f', '--ao-glow': '#ff8a50', '--ao-ink': '#2a1a10' },
  blue:     { '--ao-hi': '#a5e9ff', '--ao-mid': '#3aa8d8', '--ao-lo': '#1c6a94', '--ao-glow': '#3aa8d8', '--ao-ink': '#0d2733' },
  green:    { '--ao-hi': '#c8f5d8', '--ao-mid': '#4cb782', '--ao-lo': '#2b7a55', '--ao-glow': '#4cb782', '--ao-ink': '#0f2b1d' },
  violet:   { '--ao-hi': '#dcc8ff', '--ao-mid': '#8b5cf6', '--ao-lo': '#5b32b8', '--ao-glow': '#8b5cf6', '--ao-ink': '#1e1233' },
  rose:     { '--ao-hi': '#ffd0d0', '--ao-mid': '#ef5350', '--ao-lo': '#b82e2e', '--ao-glow': '#ef5350', '--ao-ink': '#2a1515' },
  gold:     { '--ao-hi': '#fff3c4', '--ao-mid': '#f5b800', '--ao-lo': '#b88800', '--ao-glow': '#f5b800', '--ao-ink': '#2a2200' },
  cyan:     { '--ao-hi': '#c8f7ff', '--ao-mid': '#22d3ee', '--ao-lo': '#0e7490', '--ao-glow': '#22d3ee', '--ao-ink': '#082f38' },
  graphite: { '--ao-hi': '#e8e8e8', '--ao-mid': '#8a8a8a', '--ao-lo': '#4a4a4a', '--ao-glow': '#8a8a8a', '--ao-ink': '#1a1a1a' },
}

export class AgentOrb {
  /**
   * @param {Element} host 挂载点
   * @param {object} [opts]
   * @param {string} [opts.state='idle']
   * @param {string} [opts.mood='neutral'] 3.0 情绪表情：neutral/happy/curious/focused/playful/sparkle/zen/surprised
   * @param {string} [opts.motion] 3.0 动效模式：breathe/float/bounce/pulse/orbit
   * @param {number} [opts.unseen=0]
   * @param {number|string} [opts.size] 尺寸，数字按 px
   * @param {boolean} [opts.follow=true] 眼睛与身体果冻跟随
   * @param {boolean} [opts.squish=true] 3.0 是否开启果冻弹性形变
   * @param {boolean} [opts.blink=true] 是否自然眨眼
   * @param {string} [opts.shape='circle'] circle/squircle/pill/diamond/hex/shield/drop/bean/star
   * @param {string} [opts.theme] 内置主题名
   * @param {object} [opts.labels]
   * @param {(e: MouseEvent) => void} [opts.onClick]
   * @param {boolean} [opts.injectStyle=true]
   * @param {Document} [opts.document]
   */
  constructor(host, opts = {}) {
    if (!host) throw new Error('[agent-orb] 需要一个挂载点元素')
    const doc = opts.document || host.ownerDocument || document

    this._doc = doc
    this._seq = ++seq
    this._id = `ao${this._seq}`
    this._labels = { ...DEFAULT_LABELS, ...(opts.labels || {}) }
    this._state = STATES.includes(opts.state) ? opts.state : 'idle'
    this._mood = MOODS.includes(opts.mood) ? opts.mood : 'neutral'
    this._motion = MOTIONS.includes(opts.motion) ? opts.motion : null
    this._unseen = Number(opts.unseen) || 0
    this._follow = opts.follow !== false
    this._squishEnabled = opts.squish !== false
    this._wantBlink = opts.blink !== false
    this._shape = SHAPES.includes(opts.shape) ? opts.shape : 'circle'
    this._theme = opts.theme || null

    // 动态物理与跟随状态
    this._eye = { x: 0, y: 0 }
    this._tilt = 0
    this._squish = { x: 1, y: 1 }
    this._blinkTimer = 0
    this._blinkEndTimer = 0
    this._pokeTimer = 0
    this._motionQuery = doc.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)')
    this._onMotionChange = () => this._syncMotion()
    this._destroyed = false

    if (opts.injectStyle !== false) injectStyle(doc)
    this._build(host, opts)
    this._applyTheme()
    this._render()

    this._motionQuery?.addEventListener('change', this._onMotionChange)
    this._syncMotion()
  }

  /* ── 公开状态与 API ─────────────────────────────────────────────────── */

  get state() { return this._state }
  set state(v) {
    const next = STATES.includes(v) ? v : 'idle'
    if (next === this._state) return
    this._state = next
    this._render()
  }

  get mood() { return this._mood }
  set mood(v) {
    const next = MOODS.includes(v) ? v : 'neutral'
    if (next === this._mood) return
    this._mood = next
    this._renderMood()
  }

  get motion() { return this._motion }
  set motion(v) {
    const next = MOTIONS.includes(v) ? v : null
    if (next === this._motion) return
    this._motion = next
    this._renderMotion()
  }

  get theme() { return this._theme }
  set theme(v) {
    const name = v && THEMES[v] ? v : null
    if (name === this._theme) return
    this._theme = name
    this._applyTheme()
  }

  get unseen() { return this._unseen }
  set unseen(v) {
    const n = Math.max(0, Number(v) || 0)
    if (n === this._unseen) return
    this._unseen = n
    this._render()
  }

  get shape() { return this._shape }

  /**
   * 触发一次弹动与灵动表态（果冻挤压反弹）
   * @param {string} [tempMood='happy']
   */
  poke(tempMood = 'happy') {
    if (this._destroyed || !this.el) return
    this.el.classList.remove('ao-poked')
    void this.el.offsetWidth // 触发重绘
    this.el.classList.add('ao-poked')

    const prevMood = this._mood
    if (tempMood && MOODS.includes(tempMood)) {
      this.mood = tempMood
    }

    clearTimeout(this._pokeTimer)
    this._pokeTimer = setTimeout(() => {
      this.el?.classList.remove('ao-poked')
      if (this._mood === tempMood) {
        this.mood = prevMood
      }
    }, 650)
    return this
  }

  set(state, unseen) {
    this.state = state
    if (unseen !== undefined) this.unseen = unseen
    return this
  }

  destroy() {
    if (this._destroyed) return
    this._destroyed = true
    leave(this)
    clearTimeout(this._blinkTimer)
    clearTimeout(this._blinkEndTimer)
    clearTimeout(this._pokeTimer)
    this._motionQuery?.removeEventListener('change', this._onMotionChange)
    this.el?.remove()
  }

  /* ── 内部构建与渲染 ─────────────────────────────────────────────────── */

  _syncMotion() {
    leave(this)
    clearTimeout(this._blinkTimer)
    clearTimeout(this._blinkEndTimer)
    this.el?.classList.remove('ao-blink')
    this._eye = { x: 0, y: 0 }
    this._tilt = 0
    this._squish = { x: 1, y: 1 }
    this._eyesEl?.style.removeProperty('transform')
    this._bodyWrapEl?.style.removeProperty('transform')
    if (this._motionQuery?.matches || this._destroyed) return
    if (this._follow) join(this)
    if (this._wantBlink) this._scheduleBlink()
  }

  _build(host, opts) {
    const doc = this._doc
    const btn = doc.createElement('button')
    btn.type = 'button'
    btn.className = `agent-orb ao-shape-${this._shape}`
    if (opts.size) btn.style.setProperty('--ao-size', typeof opts.size === 'number' ? `${opts.size}px` : opts.size)
    // 赋予独立动画相位（基于序列号），确保多球不同步呼吸，充满自然生机
    const phase = ((this._seq * 0.63) % 4.2).toFixed(2)
    btn.style.setProperty('--ao-phase', `-${phase}s`)

    if (opts.onClick) btn.addEventListener('click', opts.onClick)

    const id = this._id
    const sh = this._shape
    const eyeY = 32

    // ── 9 大几何形态的轮廓、光环、高光与辅助环 ──
    let body, halo, gloss, ring
    if (sh === 'pill') {
      body = `<rect class="ao-body" x="6" y="14" width="52" height="36" rx="18" fill="url(#${id})"/>`
      halo = '<rect class="ao-halo" x="2" y="10" width="60" height="44" rx="22"/>'
      gloss = '<ellipse class="ao-gloss" cx="22" cy="24" rx="10" ry="6"/>'
      ring = '<ellipse class="ao-ring" cx="32" cy="32" rx="28" ry="20"/>'
    } else if (sh === 'squircle') {
      body = `<rect class="ao-body" x="10" y="10" width="44" height="44" rx="12" fill="url(#${id})"/>`
      halo = '<rect class="ao-halo" x="6" y="6" width="52" height="52" rx="14"/>'
      gloss = '<ellipse class="ao-gloss" cx="24" cy="22" rx="10" ry="7"/>'
      ring = '<rect class="ao-ring" x="6" y="6" width="52" height="52" rx="14"/>'
    } else if (sh === 'diamond') {
      // 八面水晶菱晶（南烛/技术队长）
      body = `<path class="ao-body" d="M32 9.5 C33.5 8 34.5 8 36 9.5 L53.5 27 C55 28.5 55 29.5 55 31 L55 33 C55 34.5 55 35.5 53.5 37 L36 54.5 C34.5 56 33.5 56 32 54.5 L10.5 37 C9 35.5 9 34.5 9 33 L9 31 C9 29.5 9 28.5 10.5 27 Z" fill="url(#${id})"/>`
      halo = '<path class="ao-halo" d="M32 5.5 L57.5 31 L32 56.5 L6.5 31 Z"/>'
      gloss = '<ellipse class="ao-gloss" cx="27" cy="23" rx="7" ry="5"/>'
      ring = '<circle class="ao-ring" cx="32" cy="32" r="28"/>'
    } else if (sh === 'hex') {
      // 蜂巢六边形（小楠/全栈中枢）
      body = `<path class="ao-body" d="M32 9.5 L51 20.5 Q53 21.5 53 23.8 L53 40.2 Q53 42.5 51 43.5 L32 54.5 Q30 55.5 28 54.5 L9 43.5 Q7 42.5 7 40.2 L7 23.8 Q7 21.5 9 20.5 L28 9.5 Q30 8.5 32 9.5 Z" fill="url(#${id})"/>`
      halo = '<path class="ao-halo" d="M32 6 L55 19 L55 45 L32 58 L9 45 L9 19 Z"/>'
      gloss = '<ellipse class="ao-gloss" cx="25" cy="21" rx="8" ry="5"/>'
      ring = '<circle class="ao-ring" cx="32" cy="32" r="28"/>'
    } else if (sh === 'shield') {
      // 守护机甲护盾（Vex/运维哨兵）
      body = `<path class="ao-body" d="M12 14 Q32 10 52 14 Q53 30 46 42 Q39 51 32 55 Q25 51 18 42 Q11 30 12 14 Z" fill="url(#${id})"/>`
      halo = '<path class="ao-halo" d="M8 11 Q32 6 56 11 Q57 32 49 46 Q41 57 32 60 Q23 57 15 46 Q7 32 8 11 Z"/>'
      gloss = '<ellipse class="ao-gloss" cx="24" cy="22" rx="8" ry="6"/>'
      ring = '<circle class="ao-ring" cx="32" cy="32" r="28"/>'
    } else if (sh === 'drop') {
      // 灵动墨滴水滴（顾栖月/叙事主笔）
      body = `<path class="ao-body" d="M32 9.5 C43 23 53 35 49 45 C45 54 19 54 15 45 C11 35 21 23 32 9.5 Z" fill="url(#${id})"/>`
      halo = '<path class="ao-halo" d="M32 5 C47 21 57 34 53 47 C48 58 16 58 11 47 C7 34 17 21 32 5 Z"/>'
      gloss = '<ellipse class="ao-gloss" cx="26" cy="28" rx="7" ry="6"/>'
      ring = '<circle class="ao-ring" cx="32" cy="34" r="26"/>'
    } else if (sh === 'bean') {
      // 生机灵豆萌芽（小美/业务小助手）
      body = `<path class="ao-body" d="M26 10 C38 9 53 20 52 35 C51 48 37 55 24 53 C12 51 9 38 12 26 C14 17 19 11 26 10 Z" fill="url(#${id})"/>`
      halo = '<path class="ao-halo" d="M25 6 C41 5 57 17 56 35 C55 52 39 59 23 57 C9 55 5 39 8 24 C11 14 17 7 25 6 Z"/>'
      gloss = '<ellipse class="ao-gloss" cx="24" cy="22" rx="7" ry="5"/>'
      ring = '<circle class="ao-ring" cx="32" cy="32" r="28"/>'
    } else if (sh === 'star') {
      // 璀璨星芒（GiGi/跨境小智）
      body = `<path class="ao-body" d="M32 8 Q32 25 49 32 Q32 39 32 56 Q32 39 15 32 Q32 25 32 8 Z" fill="url(#${id})"/>`
      halo = '<circle class="ao-halo" cx="32" cy="32" r="26"/>'
      gloss = '<circle class="ao-gloss" cx="28" cy="28" r="4.5"/>'
      ring = '<circle class="ao-ring" cx="32" cy="32" r="28"/>'
    } else {
      // 经典圆球
      body = `<circle class="ao-body" cx="32" cy="32" r="22" fill="url(#${id})"/>`
      halo = '<circle class="ao-halo" cx="32" cy="32" r="26"/>'
      gloss = '<ellipse class="ao-gloss" cx="25" cy="23" rx="6" ry="4.2"/>'
      ring = '<circle class="ao-ring" cx="32" cy="32" r="27"/>'
    }

    const dotsY = sh === 'pill' ? 7 : 5

    btn.innerHTML = `
<svg class="ao-svg" viewBox="0 0 64 64" aria-hidden="true">
  <defs>
    <radialGradient id="${id}" cx="38%" cy="32%" r="72%">
      <stop offset="0%" stop-color="var(--ao-hi)"/>
      <stop offset="58%" stop-color="var(--ao-mid)"/>
      <stop offset="100%" stop-color="var(--ao-lo)"/>
    </radialGradient>
  </defs>
  ${halo}
  <g class="ao-body-wrap">
    ${body}
    ${gloss}
    ${ring}
    <g class="ao-satellite">
      <circle cx="32" cy="3" r="2.4"/>
    </g>
  </g>
  <g class="ao-dots">
    <circle cx="24" cy="${dotsY}" r="2"/><circle cx="32" cy="${dotsY - 2}" r="2"/><circle cx="40" cy="${dotsY}" r="2"/>
  </g>
  <g class="ao-eyes">
    <!-- 经典圆眼 -->
    <g class="ao-eye ao-eye-round">
      <ellipse class="ao-pupil" cx="25.5" cy="${eyeY}" rx="3.1" ry="3.6"/>
      <ellipse class="ao-pupil" cx="38.5" cy="${eyeY}" rx="3.1" ry="3.6"/>
    </g>
    <!-- 专注聚焦线 -->
    <g class="ao-eye ao-eye-focus">
      <path class="ao-line" d="M21 ${eyeY}h7"/><path class="ao-line" d="M36 ${eyeY}h7"/>
    </g>
    <!-- 快乐笑眼 -->
    <g class="ao-eye ao-eye-smile">
      <path class="ao-line" d="M20 ${eyeY + 1}q4.5 -5 9 0"/><path class="ao-line" d="M35 ${eyeY + 1}q4.5 -5 9 0"/>
    </g>
    <!-- 错误叉眼 -->
    <g class="ao-eye ao-eye-cross">
      <path class="ao-line" d="M21 ${eyeY - 3}l7 6M28 ${eyeY - 3}l-7 6"/><path class="ao-line" d="M36 ${eyeY - 3}l7 6M43 ${eyeY - 3}l-7 6"/>
    </g>
    <!-- 3.0 好奇歪头眼 -->
    <g class="ao-eye ao-eye-curious">
      <ellipse class="ao-pupil" cx="25.5" cy="${eyeY - 1}" rx="3.8" ry="4.2"/>
      <path class="ao-line" d="M35.5 ${eyeY}q4 -2 8 1"/>
    </g>
    <!-- 3.0 俏皮眨单眼 -->
    <g class="ao-eye ao-eye-playful">
      <path class="ao-line" d="M20 ${eyeY + 1}q4.5 4 9 0"/>
      <ellipse class="ao-pupil" cx="38.5" cy="${eyeY}" rx="3.3" ry="3.8"/>
    </g>
    <!-- 3.0 星光眼 -->
    <g class="ao-eye ao-eye-sparkle">
      <path class="ao-sparkle-star" d="M25.5 ${eyeY - 4}l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z"/>
      <path class="ao-sparkle-star" d="M38.5 ${eyeY - 4}l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z"/>
    </g>
    <!-- 3.0 禅意沉静眼 -->
    <g class="ao-eye ao-eye-zen">
      <path class="ao-line" d="M20 ${eyeY}q4.5 3.5 9 0"/>
      <path class="ao-line" d="M35 ${eyeY}q4.5 3.5 9 0"/>
    </g>
    <!-- 3.0 惊喜大圆目 -->
    <g class="ao-eye ao-eye-surprised">
      <ellipse class="ao-pupil" cx="25.5" cy="${eyeY}" rx="4" ry="4.5"/>
      <ellipse class="ao-pupil" cx="38.5" cy="${eyeY}" rx="4" ry="4.5"/>
      <path class="ao-line" d="M22 ${eyeY - 7}q3.5 -3 7 0M35 ${eyeY - 7}q3.5 -3 7 0"/>
    </g>
  </g>
</svg>
<span class="ao-badge"></span>`

    host.appendChild(btn)
    this.el = btn
    this._bodyWrapEl = btn.querySelector('.ao-body-wrap')
    this._eyesEl = btn.querySelector('.ao-eyes')
    this._badgeEl = btn.querySelector('.ao-badge')
    this._renderMood()
    this._renderMotion()
  }

  _render() {
    const el = this.el
    if (!el) return
    for (const s of STATES) el.classList.toggle(`is-${s}`, s === this._state)

    const showBadge = this._state === 'done' && this._unseen > 0
    el.classList.toggle('ao-has-badge', showBadge)
    if (showBadge) this._badgeEl.textContent = this._unseen > 99 ? '99+' : String(this._unseen)

    this._eyesEl?.style.removeProperty('transform')
    const label = this._labels[this._state] || this._labels.idle
    el.setAttribute('aria-label', label)
    el.title = label
  }

  _renderMood() {
    if (!this.el) return
    for (const m of MOODS) {
      this.el.classList.toggle(`ao-mood-${m}`, m === this._mood)
    }
  }

  _renderMotion() {
    if (!this.el) return
    for (const m of MOTIONS) {
      this.el.classList.toggle(`ao-motion-${m}`, m === this._motion)
    }
  }

  _applyTheme() {
    const vars = THEMES[this._theme]
    for (const k of ['--ao-hi', '--ao-mid', '--ao-lo', '--ao-glow', '--ao-ink']) {
      this.el.style.setProperty(k, vars ? vars[k] : '')
    }
  }

  /**
   * 3.0 深度鼠标动力学：
   * 1. 眼睛注视跟随（平滑指数逼近）
   * 2. 身体果冻弹性形变（Jelly Squish & Tilt）：朝光标方向倾斜、挤压伸展
   */
  _frame() {
    if (this._destroyed || !this._eyesEl || this._state === 'thinking' || this._motionQuery?.matches) return
    const b = this.el.getBoundingClientRect()
    if (!b.width) return

    const centerX = b.left + b.width / 2
    const centerY = b.top + b.height / 2
    const dx = pointer.x - centerX
    const dy = pointer.y - centerY
    const d = Math.hypot(dx, dy) || 1

    // ── 眼睛偏移计算 ──
    const k = (Math.min(d, 400) / 400) * 1.8
    const tx = (dx / d) * k
    const ty = (dy / d) * k

    this._eye = {
      x: this._eye.x + (tx - this._eye.x) * 0.14,
      y: this._eye.y + (ty - this._eye.y) * 0.14
    }
    this._eyesEl.style.transform = `translate(${this._eye.x.toFixed(2)}px, ${this._eye.y.toFixed(2)}px)`

    // ── 身体果冻微形变（Jelly Squish & Tilt）──
    if (this._squishEnabled && this._bodyWrapEl) {
      const nearDist = Math.min(d, 350)
      const influence = (1 - nearDist / 350) // 越近影响越大 (0 ~ 1)
      const targetTilt = (dx / (d + 60)) * 6.5 * influence

      // 沿光标方向产生轻微拉伸与横向压缩（弹性果冻感）
      const stretchAmount = 0.05 * influence
      const targetSquishX = 1 + (Math.abs(dx) / d) * stretchAmount - (Math.abs(dy) / d) * (stretchAmount * 0.5)
      const targetSquishY = 1 + (Math.abs(dy) / d) * stretchAmount - (Math.abs(dx) / d) * (stretchAmount * 0.5)

      this._tilt += (targetTilt - this._tilt) * 0.12
      this._squish.x += (targetSquishX - this._squish.x) * 0.12
      this._squish.y += (targetSquishY - this._squish.y) * 0.12

      this._bodyWrapEl.style.transform = `rotate(${this._tilt.toFixed(2)}deg) scale(${this._squish.x.toFixed(3)}, ${this._squish.y.toFixed(3)})`
    }
  }

  _scheduleBlink() {
    this._blinkTimer = setTimeout(() => {
      if (this._destroyed) return
      if (this._state !== 'error') {
        this.el?.classList.add('ao-blink')
        this._blinkEndTimer = setTimeout(() => this.el?.classList.remove('ao-blink'), 130)
      }
      this._scheduleBlink()
    }, 2600 + Math.random() * 3800)
  }
}

export { css, injectStyle } from './style.js'
export default AgentOrb
