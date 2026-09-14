/** 网站客服入口：状态球、通知胶囊、非模态对话面板。服务请求由接入方提供。 */
import { AgentOrb, STATES } from './index.js'
import { createWidgetDOM, appendMessage } from './widget-dom.js'
import { DEFAULT_WIDGET_LABELS, mergeLabels } from './widget-labels.js'

const CANCELLED = Symbol('cancelled')
const MAX_LENGTH = 2000

/** 可独立引入的网站客服组件；默认不联网、不持久化对话。 */
export class AgentWidget {
  constructor(options = {}) {
    const container = options.container || globalThis.document?.body
    if (!container?.ownerDocument) throw new Error('[ai-orb] A DOM container is required')
    this._doc = container.ownerDocument
    this._labels = mergeLabels(DEFAULT_WIDGET_LABELS, options.labels)
    this._onSend = options.onSend
    this._messages = []
    this._state = 'idle'
    this._isOpen = false
    this._destroyed = false
    this._unread = 0
    this._active = null
    this._errorKey = null
    this._retryText = null
    this._dismissed = false
    Object.assign(this, createWidgetDOM(container, options))
    this.orb = new AgentOrb(this.ui.orb, { injectStyle: false, size: 64, theme: options.theme, onClick: () => this.toggle() })
    this._avatar = new AgentOrb(this.ui.avatar, { injectStyle: false, size: 40, theme: options.theme, follow: false, blink: false })
    this._avatar.el.tabIndex = -1
    this._avatar.el.style.pointerEvents = 'none'
    this.orb.el.setAttribute('aria-controls', 'aw-panel')
    this.orb.el.setAttribute('aria-haspopup', 'dialog')
    this.setDirection(options.dir)
    this._bind()
    this.setSuggestions(options.suggestions || [])
    this.setLabels(options.labels)
  }

  get state() { return this._state }
  get isOpen() { return this._isOpen }
  get messages() { return this._messages.map(message => ({ ...message })) }

  open() {
    if (this._destroyed || this._isOpen) return
    this._isOpen = true
    this._dismissed = true
    this._unread = 0
    this.ui.panel.inert = false
    this.ui.panel.removeAttribute('inert')
    this._render()
    this.ui.input.focus({ preventScroll: true })
  }

  close() {
    if (this._destroyed || !this._isOpen) return
    const restoreFocus = this.root.activeElement && this.ui.panel.contains(this.root.activeElement)
    this._isOpen = false
    this.ui.panel.inert = true
    this.ui.panel.setAttribute('inert', '')
    this._render()
    if (restoreFocus) this.orb.el.focus({ preventScroll: true })
  }

  toggle() { this._isOpen ? this.close() : this.open() }

  /** 外部主动状态提示；请求上下文只允许报告 thinking / working。 */
  setState(state, message = '') {
    if (this._destroyed) return
    this._state = STATES.includes(state) ? state : 'idle'
    this._stateMessage = typeof message === 'string' ? message : ''
    this._dismissed = this._isOpen
    this._render()
  }

  /** 动态更新语言；已产生的业务消息维持原文。 */
  setLabels(labels = {}) {
    if (this._destroyed) return
    this._labels = mergeLabels(this._labels, labels)
    const l = this._labels
    this.ui.heading.querySelector('h2').textContent = l.title
    for (const key of ['close', 'send', 'stop', 'retry', 'dismiss']) {
      if (key === 'retry') this.ui[key].textContent = l[key]
      if (['send', 'stop'].includes(key)) this.ui[key].querySelector('.aw-button-label').textContent = l[key]
      this.ui[key].title = l[key]
      this.ui[key].setAttribute('aria-label', l[key])
    }
    this.ui.label.textContent = l.inputLabel
    this.ui.hint.textContent = l.inputHint
    this.ui.input.placeholder = l.placeholder
    this.ui.footer.textContent = l.notice
    this.ui.footer.hidden = !l.notice
    this.ui.log.setAttribute('aria-label', l.title)
    this.ui.log.querySelectorAll('.aw-message').forEach(node => {
      node.setAttribute('aria-label', node.dataset.role === 'user' ? l.you : l.title)
    })
    if (!this._messages.length) this._showGreeting()
    this._render()
  }

  setDirection(dir = 'ltr') { this.el.dir = dir === 'rtl' ? 'rtl' : 'ltr' }

  setSuggestions(suggestions) {
    if (this._destroyed) return
    this.ui.suggestions.replaceChildren()
    for (const text of suggestions.filter(value => typeof value === 'string' && value.trim())) {
      const button = this._doc.createElement('button')
      button.type = 'button'
      const label = this._doc.createElement('span')
      label.textContent = text
      button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>'
      button.prepend(label)
      button.addEventListener('click', () => this.send(text))
      this.ui.suggestions.appendChild(button)
    }
    this._render()
  }

  async send(value) {
    const text = typeof value === 'string' ? value.trim() : ''
    if (this._destroyed || this._active || !text) return
    if (text.length > MAX_LENGTH) {
      this._retryText = null
      return this._showError('tooLong')
    }
    if (typeof this._onSend !== 'function') return this._showError('unavailable')
    if (this.ui.input.value.trim() === text) this.ui.input.value = ''
    this._append({ role: 'user', text })
    await this._request(text)
  }

  cancel() {
    if (!this._active) return
    const request = this._active
    this._active = null
    request.controller.abort()
    request.cancel()
    this._retryText = request.text
    this._showError('cancelled', 'idle')
  }

  destroy() {
    if (this._destroyed) return
    this.cancel()
    this._destroyed = true
    this.orb.destroy()
    this._avatar.destroy()
    this.el.remove()
  }

  _bind() {
    this.ui.close.addEventListener('click', () => this.close())
    this.ui.notice.addEventListener('click', () => this.open())
    this.ui.dismiss.addEventListener('click', () => { this._dismissed = true; this._render() })
    this.ui.form.addEventListener('submit', event => {
      event.preventDefault()
      this.send(this.ui.input.value)
    })
    this.ui.input.addEventListener('input', () => this._render())
    this.ui.input.addEventListener('keydown', event => {
      if (event.key !== 'Enter' || event.shiftKey || event.isComposing || event.keyCode === 229) return
      event.preventDefault()
      this.send(this.ui.input.value)
    })
    this.root.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || event.isComposing || !this._isOpen) return
      event.preventDefault()
      event.stopPropagation()
      this.close()
    })
    this.ui.stop.addEventListener('click', () => this.cancel())
    this.ui.retry.addEventListener('click', () => {
      if (!this._active && this._retryText) this._request(this._retryText)
    })
  }

  async _request(text) {
    const controller = new AbortController()
    let cancel
    const cancelled = new Promise(resolve => { cancel = () => resolve(CANCELLED) })
    const request = { controller, text, cancel }
    this._active = request
    this._retryText = null
    this._errorKey = null
    this.setState('thinking')
    try {
      const context = this._context(request)
      const result = await Promise.race([this._onSend(text, context), cancelled])
      if (this._destroyed || this._active !== request || result === CANCELLED) return
      this._receive(result)
    } catch {
      if (!this._destroyed && this._active === request) this._showError('failed')
    } finally {
      if (this._active === request) {
        this._active = null
        if (this._errorKey) this._retryText = text
        this._render()
      }
    }
  }

  _context(request) {
    return {
      signal: request.controller.signal,
      messages: this.messages,
      setState: state => {
        if (this._active === request && ['thinking', 'working'].includes(state)) this.setState(state)
      },
    }
  }

  _receive(result) {
    const text = typeof result === 'string' ? result : result?.text
    if (typeof text !== 'string' || !text.trim()) return this._showError('empty')
    const state = typeof result === 'object' && result.state === 'asking' ? 'asking' : 'done'
    this._append({ role: 'assistant', text })
    if (!this._isOpen) this._unread += 1
    this.setState(state)
  }

  _showError(key, state = 'error') {
    this._errorKey = key
    this.setState(state)
  }

  _showGreeting() {
    this.ui.log.replaceChildren()
    if (this._labels.greeting) appendMessage(this.ui, { role: 'assistant', text: this._labels.greeting }, this._labels, this._doc)
  }

  _append(message) {
    if (!this._messages.length) this.ui.log.replaceChildren()
    this._messages = [...this._messages, message]
    appendMessage(this.ui, message, this._labels, this._doc)
  }

  _keepFocus() {
    if (!this._isOpen) return
    const focused = this.root.activeElement
    const { ui } = this
    const disappearing = (focused === ui.send && !!this._active)
      || (focused === ui.stop && !this._active)
      || (focused === ui.retry && (!this._retryText || !!this._active))
      || (ui.suggestions.contains(focused) && this._messages.length > 0)
    if (disappearing) ui.input.focus({ preventScroll: true })
  }

  _render() {
    if (!this.orb) return
    const { ui, _labels: l } = this
    ui.root.dataset.open = String(this._isOpen)
    ui.root.dataset.state = this._state
    ui.root.dataset.empty = String(this._messages.length === 0)
    ui.panel.setAttribute('aria-hidden', String(!this._isOpen))
    ui.status.textContent = this._stateMessage || l.states[this._state]
    ui.notice.textContent = this._stateMessage || (this._unread ? l.unread(this._unread) : l.states[this._state])
    ui.capsule.hidden = this._isOpen || this._dismissed || this._state === 'idle'
    this._keepFocus()
    ui.send.disabled = !!this._active || !ui.input.value.trim()
    ui.send.hidden = !!this._active
    ui.stop.hidden = !this._active
    ui.error.hidden = !this._errorKey
    ui['error-text'].textContent = this._errorKey ? l.errors[this._errorKey] : ''
    ui.retry.hidden = !this._retryText
    ui.retry.disabled = !!this._active
    ui.suggestions.hidden = this._messages.length > 0 || !!this._active
    this.orb.set(this._state, this._unread)
    this._avatar.set(this._state)
    this.orb.el.setAttribute('aria-expanded', String(this._isOpen))
    const action = this._isOpen ? l.close : l.open
    this.orb.el.setAttribute('aria-label', `${action} · ${l.states[this._state]}${this._unread ? ` · ${l.unread(this._unread)}` : ''}`)
    this.orb.el.title = action
    this._avatar.el.setAttribute('aria-label', l.states[this._state])
    this._avatar.el.removeAttribute('title')
  }
}

export { DEFAULT_WIDGET_LABELS } from './widget-labels.js'
export default AgentWidget
