/** 网站嵌入演示：只在本地模拟请求，支持动态语言、背景和六种状态。 */
import { AgentWidget } from '../src/widget.js'
import { widgetCopy, scenarios, pageEnglish } from './embed-copy.js'

let locale = 'zh'
let previewState = 'idle'
const attempts = new Map()
const chinesePage = Object.fromEntries([...document.querySelectorAll('[data-i18n]')]
  .map(element => [element.dataset.i18n, element.textContent]))
const widget = new AgentWidget({
  labels: widgetCopy[locale],
  suggestions: scenarios[locale].suggestions,
  onSend: simulate,
})

async function simulate(text, { signal, setState }) {
  const language = locale
  const copy = scenarios[language]
  const attempt = (attempts.get(text) || 0) + 1
  attempts.set(text, attempt)
  await pause(700, signal)
  setState('working')
  await pause(1100, signal)
  if (text === copy.suggestions[2] && attempt === 1) throw new Error('Simulated failure')
  if (text === copy.suggestions[1]) return { text: copy.asking, state: 'asking' }
  return text === copy.suggestions[2] ? copy.recovered : copy.reply
}

function pause(ms, signal) {
  return new Promise((resolve, reject) => {
    const abort = () => { clearTimeout(timer); reject(new DOMException('Aborted', 'AbortError')) }
    const timer = setTimeout(() => { signal.removeEventListener('abort', abort); resolve() }, ms)
    if (signal.aborted) abort()
    else signal.addEventListener('abort', abort, { once: true })
  })
}

function showState(state) {
  widget.cancel()
  widget.close()
  previewState = state
  widget.setState(state)
  document.querySelectorAll('[data-state]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.state === state))
  })
  document.querySelector('#state-description').textContent = scenarios[locale].descriptions[state]
}

function setLocale(next) {
  locale = next
  document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en'
  const copy = locale === 'zh' ? chinesePage : pageEnglish
  document.querySelectorAll('[data-i18n]').forEach(element => {
    element.textContent = copy[element.dataset.i18n]
  })
  widget.setLabels(widgetCopy[locale])
  widget.setSuggestions(scenarios[locale].suggestions)
  document.querySelector('#state-description').textContent = scenarios[locale].descriptions[previewState]
  const button = document.querySelector('#language-toggle')
  button.textContent = locale === 'zh' ? 'EN' : '中文'
  button.setAttribute('aria-label', locale === 'zh' ? 'Switch to English' : '切换为中文')
  const labels = locale === 'zh'
    ? ['橙间首页', '示例网站导航', '示例工作空间预览']
    : ['Orange Studio home', 'Example website navigation', 'Example workspace preview']
  ;['.site-brand', '.site-header nav', '#workspace'].forEach((selector, index) => {
    document.querySelector(selector).setAttribute('aria-label', labels[index])
  })
  document.title = locale === 'zh' ? 'AI Orb · 网站客服演示' : 'AI Orb · Website support demo'
}

function toggleTheme() {
  const dark = document.body.dataset.theme !== 'dark'
  document.body.dataset.theme = dark ? 'dark' : 'light'
  document.querySelector('#theme-toggle').setAttribute('aria-pressed', String(dark))
  const darkTokens = {
    '--aw-bg': '#25211c', '--aw-bg-soft': '#302a23', '--aw-bg-user': '#513425',
    '--aw-text': '#f3ede5', '--aw-text-muted': '#bbae9e', '--aw-text-accent': '#ffb780',
    '--aw-border': '#4f4135', '--aw-focus': '#ffb780', '--aw-error-bg': '#452b24', '--aw-error-text': '#ffbaa5',
  }
  for (const [key, value] of Object.entries(darkTokens)) {
    if (dark) widget.el.style.setProperty(key, value)
    else widget.el.style.removeProperty(key)
  }
}

document.querySelector('#language-toggle').addEventListener('click', () => setLocale(locale === 'zh' ? 'en' : 'zh'))
document.querySelector('#theme-toggle').addEventListener('click', toggleTheme)
document.querySelectorAll('[data-state]').forEach(button => button.addEventListener('click', () => showState(button.dataset.state)))
document.querySelectorAll('[data-open-assistant]').forEach(button => button.addEventListener('click', () => widget.open()))
document.querySelector('#reset-preview').addEventListener('click', () => showState('idle'))
window.addEventListener('pagehide', event => { if (!event.persisted) widget.destroy() })
