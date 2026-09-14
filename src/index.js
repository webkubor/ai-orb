/**
 * agent-orb —— 一颗会表态的 AI 助手状态球。零依赖，纯 SVG。
 *
 * AI 产品的等待期是最难交代的一段：模型在想、图在生成、它问了你一句正等着回话——
 * 这些在界面上通常只剩一个转圈或者一个数字角标，说不清到底在等什么。
 * 这颗球把这段等待变成看得懂的神态。
 *
 *   import { AgentOrb } from 'agent-orb'
 *   const orb = new AgentOrb(document.querySelector('#orb'))
 *   orb.state = 'working'
 *
 * 设计上的三条克制（都是有意为之，别当成还没做完）：
 *   · 只有 6 个状态。多到分不清就失去了「一眼看懂」的意义。
 *   · 只有出图中那一个状态在持续旋转。动效要留给最长的那段等待。
 *   · 不做卡通大眼睛。它要能待在正经产品的角落里，不能喧宾夺主。
 */
import { injectStyle } from './style.js'

/** 状态清单。传入未知值按 idle 处理，不抛错——状态多半来自后端，不该因此白屏。 */
export const STATES = ['idle', 'thinking', 'working', 'asking', 'done', 'error']

/** 形态清单。 */
export const SHAPES = ['circle', 'squircle', 'pill']

/** 默认的无障碍文案。状态必须有文字版，不能只靠看脸。 */
export const DEFAULT_LABELS = {
  idle: 'Assistant · idle',
  thinking: 'Assistant · thinking',
  working: 'Assistant · working',
  asking: 'Assistant · waiting for you',
  done: 'Assistant · done',
  error: 'Assistant · something went wrong',
}

const SVG_NS = 'http://www.w3.org/2000/svg'

/* 渐变 id 必须每个实例唯一。同页放两颗球时，重复 id 会让后一颗引用到前一颗的
   渐变定义——移除前一颗，后一颗就变成没有填充的透明圈。这个坑不常见但很难查。 */
let seq = 0

/* 注视跟随用一个全局 mousemove + 一个 rAF 驱动所有实例。
   每个实例各挂一个监听的话，桌面宠物那种多球场景会白白多出 N 倍回调，
   而 mousemove 每秒几十上百次，正好和页面滚动抢帧。 */
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
  // 最后一颗球销毁时把全局监听也摘掉，别在 SPA 里留下越积越多的 listener
  if (!living.size && bound && typeof window !== 'undefined') {
    window.removeEventListener('mousemove', onPointerMove)
    bound = false
    if (loopId) { cancelAnimationFrame(loopId); loopId = 0 }
  }
}

/** 内置主题预设。每个对象是 { --ao-hi, --ao-mid, --ao-lo, --ao-glow, --ao-ink }。
 *  用法：new AgentOrb(el, { theme: 'blue' }) 或 orb.theme = 'blue'。 */
export const THEMES = {
  orange:  { '--ao-hi': '#ffc79a', '--ao-mid': '#ff8a50', '--ao-lo': '#e8632f', '--ao-glow': '#ff8a50', '--ao-ink': '#2a1a10' },
  blue:    { '--ao-hi': '#a5e9ff', '--ao-mid': '#3aa8d8', '--ao-lo': '#1c6a94', '--ao-glow': '#3aa8d8', '--ao-ink': '#0d2733' },
  green:   { '--ao-hi': '#c8f5d8', '--ao-mid': '#4cb782', '--ao-lo': '#2b7a55', '--ao-glow': '#4cb782', '--ao-ink': '#0f2b1d' },
  violet:  { '--ao-hi': '#dcc8ff', '--ao-mid': '#8b5cf6', '--ao-lo': '#5b32b8', '--ao-glow': '#8b5cf6', '--ao-ink': '#1e1233' },
  rose:    { '--ao-hi': '#ffd0d0', '--ao-mid': '#ef5350', '--ao-lo': '#b82e2e', '--ao-glow': '#ef5350', '--ao-ink': '#2a1515' },
  gold:    { '--ao-hi': '#fff3c4', '--ao-mid': '#f5b800', '--ao-lo': '#b88800', '--ao-glow': '#f5b800', '--ao-ink': '#2a2200' },
  cyan:    { '--ao-hi': '#c8f7ff', '--ao-mid': '#22d3ee', '--ao-lo': '#0e7490', '--ao-glow': '#22d3ee', '--ao-ink': '#082f38' },
  graphite:{ '--ao-hi': '#e8e8e8', '--ao-mid': '#8a8a8a', '--ao-lo': '#4a4a4a', '--ao-glow': '#8a8a8a', '--ao-ink': '#1a1a1a' },
}

export class AgentOrb {
  /**
   * @param {Element} host 挂载点。球会作为它的子节点插入（host 本身不被替换）。
   * @param {object} [opts]
   * @param {string} [opts.state='idle']
   * @param {number} [opts.unseen=0]   未读数，>0 且状态为 done 时显示角标
   * @param {number|string} [opts.size] 尺寸，数字按 px；不传则用 CSS 的 56px
   * @param {boolean} [opts.follow=true] 眼睛是否跟随鼠标
   * @param {boolean} [opts.blink=true]  是否眨眼
   * @param {string} [opts.shape='circle'] 外形：circle / squircle / pill
   * @param {string} [opts.theme]       内置主题名（THEMES 的 key），不传则用 CSS 默认值
   * @param {object} [opts.labels]      覆盖无障碍文案（做多语言时用）
   * @param {(e: MouseEvent) => void} [opts.onClick]
   * @param {Document} [opts.document]  自定义 document（测试 / 多窗口场景）
   */
  constructor(host, opts = {}) {
    if (!host) throw new Error('[agent-orb] 需要一个挂载点元素')
    const doc = opts.document || host.ownerDocument || document

    this._doc = doc
    this._id = `ao${++seq}`
    this._labels = { ...DEFAULT_LABELS, ...(opts.labels || {}) }
    this._state = STATES.includes(opts.state) ? opts.state : 'idle'
    this._unseen = Number(opts.unseen) || 0
    this._follow = opts.follow !== false
    this._wantBlink = opts.blink !== false
    this._eye = { x: 0, y: 0 }
    this._blinkTimer = 0
    this._blinkEndTimer = 0
    this._motionQuery = doc.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)')
    this._onMotionChange = () => this._syncMotion()
    this._destroyed = false
    this._shape = SHAPES.includes(opts.shape) ? opts.shape : 'circle'

    this._theme = opts.theme || null

    injectStyle(doc)
    this._build(host, opts)
    this._applyTheme()
    this._render()

    this._motionQuery?.addEventListener('change', this._onMotionChange)
    this._syncMotion()
  }

  /* ── 公开状态 ───────────────────────────────────────────────────────── */

  get state() { return this._state }
  set state(v) {
    const next = STATES.includes(v) ? v : 'idle'
    if (next === this._state) return
    this._state = next
    this._render()
  }

  /** 当前主题名。设新值立即生效：orb.theme = 'blue'。 */
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

  /** 外形。只在创建时读取，运行时不支持动态改——换形状需要 destroy 重建。 */
  get shape() { return this._shape }

  /** 语义糖，链式写起来顺手：orb.set('working') */
  set(state, unseen) {
    this.state = state
    if (unseen !== undefined) this.unseen = unseen
    return this
  }

  /** 摘掉监听、清掉定时器、移除 DOM。SPA 卸载时必须调，否则 rAF 会一直转。 */
  destroy() {
    if (this._destroyed) return
    this._destroyed = true
    leave(this)
    clearTimeout(this._blinkTimer)
    clearTimeout(this._blinkEndTimer)
    this._motionQuery?.removeEventListener('change', this._onMotionChange)
    this.el?.remove()
  }

  /* ── 内部 ───────────────────────────────────────────────────────────── */

  _syncMotion() {
    leave(this)
    clearTimeout(this._blinkTimer)
    clearTimeout(this._blinkEndTimer)
    this.el.classList.remove('ao-blink')
    this._eye = { x: 0, y: 0 }
    this._eyesEl.style.removeProperty('transform')
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
    if (opts.onClick) btn.addEventListener('click', opts.onClick)

    const id = this._id
    const sh = this._shape
    const isP = sh === 'pill'
    const isS = sh === 'squircle'

    // body 轮廓
    let body
    if (isP) {
      // 胶囊：宽 52 高 36，rx=18（完全圆头），居中 (6, 14)
      body = `<rect class="ao-body" x="6" y="14" width="52" height="36" rx="18" fill="url(#${id})"/>`
    } else if (isS) {
      // 圆角方块：44x44，rx=12，居中 (10, 10)
      body = `<rect class="ao-body" x="10" y="10" width="44" height="44" rx="12" fill="url(#${id})"/>`
    } else {
      body = `<circle class="ao-body" cx="32" cy="32" r="22" fill="url(#${id})"/>`
    }

    // 高光
    let gloss
    if (isP) {
      gloss = '<ellipse class="ao-gloss" cx="22" cy="24" rx="10" ry="6"/>'
    } else if (isS) {
      gloss = '<ellipse class="ao-gloss" cx="24" cy="22" rx="10" ry="7"/>'
    } else {
      gloss = '<ellipse class="ao-gloss" cx="25" cy="23" rx="6" ry="4.2"/>'
    }

    // 光环
    let halo
    if (isP) {
      halo = '<rect class="ao-halo" x="2" y="10" width="60" height="44" rx="22"/>'
    } else if (isS) {
      halo = '<rect class="ao-halo" x="6" y="6" width="52" height="52" rx="14"/>'
    } else {
      halo = '<circle class="ao-halo" cx="32" cy="32" r="26"/>'
    }

    // 旋转环
    let ring
    if (isP) {
      ring = '<ellipse class="ao-ring" cx="32" cy="32" rx="28" ry="20"/>'
    } else if (isS) {
      ring = '<rect class="ao-ring" x="6" y="6" width="52" height="52" rx="14"/>'
    } else {
      ring = '<circle class="ao-ring" cx="32" cy="32" r="27"/>'
    }

    // ring 高光
    let ringGloss = isP ? '' : '<ellipse class="ao-gloss" cx="25" cy="18.5" rx="10" ry="3.5"/>'

    // thinking dots Y 坐标（头顶位置随 shape 调整）
    const dotsY = isP ? 7 : isS ? 5 : 9

    // 眼睛 Y 坐标（方块和胶囊的眼睛居中偏上一点更自然）
    const eyeY = isP ? 32 : isS ? 32 : 32

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
  ${body}
  ${gloss}
  ${ring}
  ${ringGloss}
  <g class="ao-dots">
    <circle cx="24" cy="${dotsY}" r="2"/><circle cx="32" cy="${dotsY - 2}" r="2"/><circle cx="40" cy="${dotsY}" r="2"/>
  </g>
  <g class="ao-eyes">
    <g class="ao-eye ao-eye-round">
      <ellipse class="ao-pupil" cx="25.5" cy="${eyeY}" rx="3.1" ry="3.6"/>
      <ellipse class="ao-pupil" cx="38.5" cy="${eyeY}" rx="3.1" ry="3.6"/>
    </g>
    <g class="ao-eye ao-eye-focus">
      <path class="ao-line" d="M21 ${eyeY}h7"/><path class="ao-line" d="M36 ${eyeY}h7"/>
    </g>
    <g class="ao-eye ao-eye-smile">
      <path class="ao-line" d="M20 ${eyeY + 1}q4.5 -5 9 0"/><path class="ao-line" d="M35 ${eyeY + 1}q4.5 -5 9 0"/>
    </g>
    <g class="ao-eye ao-eye-cross">
      <path class="ao-line" d="M21 ${eyeY - 3}l7 6M28 ${eyeY - 3}l-7 6"/><path class="ao-line" d="M36 ${eyeY - 3}l7 6M43 ${eyeY - 3}l-7 6"/>
    </g>
  </g>
</svg>
<span class="ao-badge"></span>`

    host.appendChild(btn)
    this.el = btn
    this._eyesEl = btn.querySelector('.ao-eyes')
    this._badgeEl = btn.querySelector('.ao-badge')
  }

  _render() {
    const el = this.el
    if (!el) return
    for (const s of STATES) el.classList.toggle(`is-${s}`, s === this._state)

    const showBadge = this._state === 'done' && this._unseen > 0
    el.classList.toggle('ao-has-badge', showBadge)
    if (showBadge) this._badgeEl.textContent = this._unseen > 99 ? '99+' : String(this._unseen)

    this._eyesEl.style.removeProperty('transform')
    const label = this._labels[this._state] || this._labels.idle
    el.setAttribute('aria-label', label)
    el.title = label
  }

  /** 把主题变量写到元素上。没主题时清掉，恢复 CSS 默认值。 */
  _applyTheme() {
    const vars = THEMES[this._theme]
    for (const k of ['--ao-hi', '--ao-mid', '--ao-lo', '--ao-glow', '--ao-ink']) {
      this.el.style.setProperty(k, vars ? vars[k] : '')
    }
  }

  /** 每帧把眼睛朝鼠标收一点。最大偏移 1.6px（球半径 22）——
   *  小到不会被当成动画，但人一眼就觉得「它看着我」。 */
  _frame() {
    if (this._destroyed || !this._eyesEl || this._state === 'thinking' || this._motionQuery?.matches) return
    const b = this.el.getBoundingClientRect()
    if (!b.width) return                       // 隐藏时不算，省掉无谓的 layout
    const dx = pointer.x - (b.left + b.width / 2)
    const dy = pointer.y - (b.top + b.height / 2)
    const d = Math.hypot(dx, dy) || 1
    const k = (Math.min(d, 400) / 400) * 1.6   // 越远越接近上限，近处不会因为除小数而抖
    const tx = (dx / d) * k
    const ty = (dy / d) * k

    // 指数平滑：每帧走剩余距离的 12%，眼神是「转过去」不是「跳过去」
    this._eye = { x: this._eye.x + (tx - this._eye.x) * 0.12,
      y: this._eye.y + (ty - this._eye.y) * 0.12 }
    this._eyesEl.style.transform = `translate(${this._eye.x.toFixed(2)}px, ${this._eye.y.toFixed(2)}px)`
  }

  /** 固定节奏眨眼会像秒针，所以每次随机 2.6~6.4s。出错时不眨——它正瞪着。 */
  _scheduleBlink() {
    this._blinkTimer = setTimeout(() => {
      if (this._destroyed) return
      if (this._state !== 'error') {
        this.el.classList.add('ao-blink')
        this._blinkEndTimer = setTimeout(() => this.el?.classList.remove('ao-blink'), 130)
      }
      this._scheduleBlink()
    }, 2600 + Math.random() * 3800)
  }
}

export { css, injectStyle } from './style.js'
export default AgentOrb

