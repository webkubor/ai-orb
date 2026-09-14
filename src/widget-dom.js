/** 隔离宿主网站的 DOM；所有外部文本通过 textContent 写入。 */
import { css as orbCss } from './style.js'
import { widgetCss } from './widget-style.js'

const markup = `
<div class="aw-root" data-open="false" data-state="idle">
  <section class="aw-panel" id="aw-panel" role="dialog" aria-labelledby="aw-title" aria-hidden="true" inert>
    <header class="aw-header">
      <div class="aw-avatar" aria-hidden="true"></div>
      <div class="aw-heading"><h2 id="aw-title"></h2><p class="aw-status" role="status" aria-live="polite"></p></div>
      <button class="aw-close" type="button"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="m6 6 12 12M6 18 18 6"/></svg></button>
    </header>
    <div class="aw-log" role="log" aria-live="polite" aria-relevant="additions text" tabindex="0"></div>
    <div class="aw-suggestions"></div>
    <div class="aw-error" role="status" hidden><span class="aw-error-text"></span><button class="aw-retry" type="button"></button></div>
    <form class="aw-form">
      <label class="aw-label" for="aw-input"></label>
      <textarea class="aw-input" id="aw-input" rows="1" maxlength="2000" aria-describedby="aw-input-hint"></textarea>
      <div class="aw-composer-actions"><span class="aw-hint" id="aw-input-hint"></span><button class="aw-send" type="submit"><span class="aw-button-label"></span><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5m-6 6 6-6 6 6"/></svg></button><button class="aw-stop" type="button" hidden><span class="aw-button-label"></span><svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg></button></div>
    </form>
    <p class="aw-footer" hidden></p>
  </section>
  <div class="aw-launcher">
    <div class="aw-capsule" hidden><button class="aw-notice" type="button"></button><button class="aw-dismiss" type="button"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="m6 6 12 12M6 18 18 6"/></svg></button></div>
    <div class="aw-orb"></div>
  </div>
</div>`

/** 创建一个独立 ShadowRoot，返回可操作的命名节点。 */
export function createWidgetDOM(container, options) {
  const doc = container.ownerDocument
  const el = doc.createElement('div')
  el.setAttribute('data-agent-widget', '')
  const root = el.attachShadow({ mode: 'open' })
  const style = doc.createElement('style')
  style.textContent = orbCss + widgetCss
  root.appendChild(style)
  const template = doc.createElement('template')
  template.innerHTML = markup
  root.appendChild(template.content.cloneNode(true))
  const names = ['root', 'panel', 'avatar', 'heading', 'status', 'close', 'log', 'suggestions',
    'error', 'error-text', 'retry', 'form', 'label', 'input', 'hint', 'send', 'stop', 'footer',
    'launcher', 'capsule', 'notice', 'dismiss', 'orb']
  const ui = Object.fromEntries(names.map(name => [name, root.querySelector(`.aw-${name}`)]))
  ui.root.dataset.position = options.position === 'left' ? 'left' : 'right'
  container.appendChild(el)
  return { el, root, ui }
}

/** 一次性创建消息节点，保留历史区滚动位置。 */
export function appendMessage(ui, message, labels, doc) {
  const nearBottom = ui.log.scrollHeight - ui.log.scrollTop - ui.log.clientHeight < 48
  const node = doc.createElement('div')
  node.className = 'aw-message'
  node.dataset.role = message.role
  node.textContent = message.text
  node.setAttribute('aria-label', message.role === 'user' ? labels.you : labels.title)
  ui.log.appendChild(node)
  if (nearBottom || message.role === 'user') ui.log.scrollTop = ui.log.scrollHeight
}
