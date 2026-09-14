/**
 * 聊天挂件的行为回归：输入法、并发请求、取消重试、隔离与动态文案。
 * 使用可控 Promise 复现迟到回复，避免依赖网络或固定等待时间。
 */
import { test, before, after, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'

let dom
let widgets = []
const frames = new Set()
const savedGlobals = new Map()
const { AgentWidget } = await import('../src/widget.js')

before(() => {
  dom = new JSDOM('<!doctype html><html><body></body></html>', { pretendToBeVisual: true })
  const globals = { window: dom.window, document: dom.window.document }
  for (const key of ['Element', 'HTMLElement', 'Node', 'Event', 'AbortController', 'AbortSignal']) {
    globals[key] = dom.window[key]
  }
  globals.requestAnimationFrame = (callback) => {
    const id = dom.window.requestAnimationFrame((time) => { frames.delete(id); callback(time) })
    frames.add(id)
    return id
  }
  globals.cancelAnimationFrame = (id) => { frames.delete(id); dom.window.cancelAnimationFrame(id) }
  for (const [key, value] of Object.entries(globals)) {
    savedGlobals.set(key, Object.getOwnPropertyDescriptor(globalThis, key))
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value })
  }
})

afterEach(() => {
  for (const widget of widgets) widget.destroy()
  widgets = []
  document.body.replaceChildren()
  assert.equal(frames.size, 0, '所有挂件销毁后不应遗留动画循环')
})

after(() => {
  dom?.window.close()
  for (const [key, descriptor] of savedGlobals) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor)
    else delete globalThis[key]
  }
})

function mount(options = {}) {
  const widget = new AgentWidget(options)
  widgets.push(widget)
  return widget
}

function deferred() {
  let resolve
  let reject
  const promise = new Promise((done, fail) => { resolve = done; reject = fail })
  return { promise, resolve, reject }
}

const flush = () => new Promise((resolve) => setImmediate(resolve))
const query = (widget, selector) => {
  const element = widget.root.querySelector(selector)
  assert.ok(element, `缺少 ${selector}`)
  return element
}
const userMessages = (widget) => widget.messages.filter(({ role }) => role === 'user')

test('开关面板维护无障碍状态，关闭后保留草稿', () => {
  const widget = mount()
  const panel = query(widget, '.aw-panel')
  const input = query(widget, '.aw-input')
  assert.equal(widget.isOpen, false)
  assert.equal(panel.getAttribute('role'), 'dialog')
  assert.notEqual(panel.getAttribute('aria-modal'), 'true')
  assert.equal(panel.getAttribute('aria-hidden'), 'true')
  assert.ok(panel.inert || panel.hasAttribute('inert'))
  widget.open()
  assert.equal(widget.isOpen, true)
  assert.equal(panel.getAttribute('aria-hidden'), 'false')
  assert.ok(!panel.inert && !panel.hasAttribute('inert'))
  input.value = '尚未发送的中文草稿'
  query(widget, '.aw-close').click()
  assert.equal(widget.isOpen, false)
  widget.toggle()
  assert.equal(widget.isOpen, true)
  assert.equal(input.value, '尚未发送的中文草稿')
  widget.toggle()
  assert.equal(widget.isOpen, false)
})

test('提示胶囊可以打开面板，关闭提示不打开面板', () => {
  const widget = mount({ labels: { notice: '有问题可以问我' } })
  widget.setState('working')
  assert.equal(query(widget, '.aw-capsule').hidden, false)
  query(widget, '.aw-notice').click()
  assert.equal(widget.isOpen, true)
  widget.close()
  query(widget, '.aw-dismiss').click()
  assert.equal(widget.isOpen, false)
  const notice = widget.root.querySelector('.aw-notice')
  assert.ok(!notice || notice.hidden || notice.closest('[hidden]'))
})

test('中文输入法确认与 Shift+Enter 不提交，普通 Enter 提交', async () => {
  const sent = []
  const widget = mount({ onSend: async (text) => { sent.push(text); return '收到' } })
  widget.open()
  const input = query(widget, '.aw-input')
  input.value = '你好'
  for (const options of [{ isComposing: true }, { keyCode: 229 }, { shiftKey: true }]) {
    input.dispatchEvent(new window.KeyboardEvent('keydown', {
      key: 'Enter', bubbles: true, cancelable: true, ...options,
    }))
  }
  await flush()
  assert.deepEqual(sent, [])
  assert.equal(input.value, '你好')
  input.dispatchEvent(new window.KeyboardEvent('keydown', {
    key: 'Enter', bubbles: true, cancelable: true,
  }))
  await flush()
  assert.deepEqual(sent, ['你好'])
})

test('空白、超长输入不发请求，也不写入历史', async () => {
  let calls = 0
  const widget = mount({ onSend: async () => { calls += 1; return '回复' } })
  assert.equal(query(widget, '.aw-input').maxLength, 2000)
  await widget.send(' \n\t ')
  await widget.send('字'.repeat(2001))
  assert.equal(calls, 0)
  assert.deepEqual(userMessages(widget), [])
})

test('发送期间阻止重复提交，完成后恢复发送', async () => {
  const response = deferred()
  const sent = []
  const widget = mount({ onSend: (text) => { sent.push(text); return response.promise } })
  const pending = widget.send('第一条')
  await widget.send('重复点击')
  assert.deepEqual(sent, ['第一条'])
  assert.deepEqual(userMessages(widget), [{ role: 'user', text: '第一条' }])
  assert.equal(query(widget, '.aw-send').disabled, true)
  response.resolve('处理完毕')
  await pending
  assert.equal(widget.state, 'done')
  await widget.send('下一条')
  assert.deepEqual(sent, ['第一条', '下一条'])
})

test('正常回复写入消息并完成，onSend 获得独立历史与 AbortSignal', async () => {
  let context
  const widget = mount({ onSend: async (text, value) => {
    context = value
    assert.equal(text, '请帮忙')
    assert.deepEqual(value.messages, [{ role: 'user', text: '请帮忙' }])
    value.messages[0].text = '外部篡改'
    value.messages.push({ role: 'assistant', text: '外部追加' })
    value.setState('working')
    assert.equal(widget.state, 'working')
    for (const state of ['done', 'error', 'asking', 'invalid']) value.setState(state)
    assert.equal(widget.state, 'working', '请求回调不应绕过生命周期报告终态')
    return '已经处理好了'
  } })
  await widget.send(' 请帮忙 ')
  assert.ok(context.signal instanceof window.AbortSignal)
  assert.equal(context.signal.aborted, false)
  assert.equal(widget.state, 'done')
  assert.deepEqual(widget.messages, [
    { role: 'user', text: '请帮忙' }, { role: 'assistant', text: '已经处理好了' },
  ])
  const copy = widget.messages
  copy[0].text = '再次篡改'
  assert.equal(widget.messages[0].text, '请帮忙')
})

test('asking 回复保持等待用户状态且可继续发送', async () => {
  const widget = mount({ onSend: async () => ({ text: '请选择日期', state: 'asking' }) })
  await widget.send('帮我安排')
  assert.equal(widget.state, 'asking')
  assert.equal(widget.messages.at(-1).text, '请选择日期')
  await widget.send('明天')
  assert.equal(userMessages(widget).length, 2)
})

test('输入与回复中的 HTML 作为纯文本呈现', async () => {
  const payload = '<img src=x onerror="alert(1)"><script>alert(2)</script>'
  const widget = mount({ onSend: async () => payload })
  await widget.send(payload)
  const log = query(widget, '.aw-log')
  assert.equal(log.getAttribute('role'), 'log')
  assert.equal(log.querySelector('img, script'), null)
  const messages = [...log.querySelectorAll('.aw-message[data-role]')]
  assert.equal(messages.filter((node) => node.textContent.includes(payload)).length, 2)
})

test('失败保留原问题，重试不重复添加用户消息', async () => {
  const sent = []
  const widget = mount({ onSend: async (text) => {
    sent.push(text)
    if (sent.length === 1) throw new Error('临时断线')
    return '重试成功'
  } })
  await widget.send('只添加一次')
  assert.equal(widget.state, 'error')
  assert.deepEqual(userMessages(widget), [{ role: 'user', text: '只添加一次' }])
  const retry = query(widget, '.aw-retry')
  assert.equal(retry.hidden, false)
  retry.click()
  await flush()
  assert.deepEqual(sent, ['只添加一次', '只添加一次'])
  assert.equal(widget.state, 'done')
  assert.equal(userMessages(widget).length, 1)
  assert.equal(widget.messages.at(-1).text, '重试成功')
})

test('无内容回复进入可重试错误状态', async () => {
  const widget = mount({ onSend: async () => '   ' })
  await widget.send('请回答')
  assert.equal(widget.state, 'error')
  assert.equal(query(widget, '.aw-retry').hidden, false)
  assert.equal(widget.messages.filter(({ role }) => role === 'assistant').length, 0)
})

test('停止会中止请求，迟到回复和旧状态回调不污染下一次发送', { timeout: 1000 }, async () => {
  const first = deferred()
  const second = deferred()
  const contexts = []
  const widget = mount({ onSend: (_, context) => {
    contexts.push(context)
    return contexts.length === 1 ? first.promise : second.promise
  } })
  const oldRequest = widget.send('旧问题')
  query(widget, '.aw-stop').click()
  assert.equal(contexts[0].signal.aborted, true)
  await oldRequest
  assert.equal(widget.state, 'idle')
  assert.equal(query(widget, '.aw-retry').hidden, false)
  const newRequest = widget.send('新问题')
  assert.equal(contexts.length, 2)
  const currentState = widget.state
  contexts[0].setState('working')
  first.resolve('过期回复')
  await flush()
  assert.equal(widget.state, currentState)
  assert.equal(widget.messages.some(({ text }) => text === '过期回复'), false)
  second.resolve('当前回复')
  await newRequest
  assert.equal(widget.state, 'done')
  assert.equal(widget.messages.at(-1).text, '当前回复')
})

test('destroy 中止请求、移除 DOM，重复销毁安全且迟到回复无效', async () => {
  const reply = deferred()
  let signal
  const widget = mount({ onSend: (_, context) => { signal = context.signal; return reply.promise } })
  const pending = widget.send('处理中')
  const host = widget.el
  widget.destroy()
  assert.equal(signal.aborted, true)
  assert.equal(host.isConnected, false)
  assert.doesNotThrow(() => widget.destroy())
  reply.resolve('销毁后的回复')
  await pending
  assert.equal(widget.messages.some(({ text }) => text === '销毁后的回复'), false)
})

test('Shadow DOM 隔离页面样式，多实例按钮与 SVG 引用互不干扰', () => {
  const container = document.createElement('main')
  document.body.appendChild(container)
  const first = mount({ container })
  const second = mount()
  assert.ok(first.root instanceof window.ShadowRoot)
  assert.equal(first.el.parentElement, container)
  assert.equal(document.querySelector('.aw-panel'), null)
  assert.ok(first.root.querySelector('style'))
  const firstIds = new Set([...first.root.querySelectorAll('radialGradient')].map(({ id }) => id))
  const secondIds = [...second.root.querySelectorAll('radialGradient')].map(({ id }) => id)
  assert.ok(firstIds.size > 0 && secondIds.length > 0)
  assert.ok(secondIds.every((id) => !firstIds.has(id)))
  first.orb.el.click()
  assert.equal(first.isOpen, true)
  assert.equal(second.isOpen, false)
  first.destroy()
  second.orb.el.click()
  assert.equal(second.isOpen, true)
  assert.ok(second.root.querySelector('.ao-body').getAttribute('fill').includes(secondIds[0]))
})

test('未连接 onSend 时明确报错，不伪造助手回复', async () => {
  const widget = mount({ labels: { errors: { unavailable: '尚未连接服务' } } })
  query(widget, '.aw-input').value = '你好'
  await widget.send('你好')
  assert.equal(widget.state, 'error')
  assert.match(query(widget, '.aw-panel').textContent, /尚未连接服务/)
  assert.equal(widget.messages.filter(({ role }) => role === 'assistant').length, 0)
  assert.deepEqual(widget.messages, [])
  assert.equal(query(widget, '.aw-input').value, '你好')
})

function labels(prefix) {
  const fields = ['title', 'greeting', 'placeholder', 'notice', 'close', 'send', 'stop',
    'retry', 'inputLabel', 'inputHint', 'open', 'dismiss', 'you']
  const states = ['idle', 'thinking', 'working', 'asking', 'done', 'error']
  const errors = ['unavailable', 'failed', 'empty', 'tooLong', 'cancelled']
  return {
    ...Object.fromEntries(fields.map((key) => [key, `${prefix}-${key}`])),
    states: Object.fromEntries(states.map((key) => [key, `${prefix}-${key}`])),
    errors: Object.fromEntries(errors.map((key) => [key, `${prefix}-${key}`])),
    unread: (count) => `${prefix}-unread-${count}`,
  }
}

test('界面与无障碍文案可动态换语言，空历史问候独立更新', () => {
  const widget = mount({ labels: labels('中文') })
  assert.deepEqual(widget.messages, [])
  assert.match(widget.root.textContent, /中文-greeting/)
  widget.setLabels(labels('English'))
  assert.doesNotMatch(widget.root.innerHTML, /中文-/)
  assert.match(widget.root.textContent, /English-greeting/)
  assert.equal(query(widget, '.aw-input').placeholder, 'English-placeholder')
  for (const key of ['close', 'dismiss', 'send', 'stop', 'retry']) {
    assert.equal(query(widget, `.aw-${key}`).getAttribute('aria-label'), `English-${key}`)
  }
  assert.equal(query(widget, '.aw-label').textContent, 'English-inputLabel')
  assert.equal(query(widget, '.aw-hint').textContent, 'English-inputHint')
  assert.equal(query(widget, '.aw-footer').textContent, 'English-notice')
  widget.setLabels({ states: { working: 'Executing' } })
  widget.setState('working')
  assert.match(widget.root.innerHTML, /Executing/)
  assert.equal(query(widget, '.aw-input').placeholder, 'English-placeholder')
  widget.setState('done')
  assert.match(widget.root.innerHTML, /English-done/)
})

test('切换语言保留真实消息，错误文案使用新语言', async () => {
  const widget = mount({ labels: labels('中文'), onSend: async () => '原始中文回复' })
  await widget.send('原始中文问题')
  const history = widget.messages
  widget.setLabels(labels('English'))
  assert.deepEqual(widget.messages, history)
  assert.match(query(widget, '.aw-log').textContent, /原始中文问题/)
  assert.match(query(widget, '.aw-log').textContent, /原始中文回复/)
  assert.equal(query(widget, '.aw-message[data-role="user"]').getAttribute('aria-label'), 'English-you')
  assert.doesNotMatch(widget.root.innerHTML, /中文-/)
  await widget.send('字'.repeat(2001))
  assert.match(query(widget, '.aw-panel').textContent, /English-tooLong/)
})

test('更新建议问题后只呈现新选项，点击发送新建议', async () => {
  const sent = []
  const widget = mount({ suggestions: ['旧建议'], onSend: async (text) => {
    sent.push(text)
    return '建议已收到'
  } })
  widget.setSuggestions(['新建议一', '新建议二'])
  const suggestions = [...query(widget, '.aw-suggestions').querySelectorAll('button')]
  assert.deepEqual(suggestions.map(({ textContent }) => textContent), ['新建议一', '新建议二'])
  suggestions[1].click()
  await flush()
  assert.deepEqual(sent, ['新建议二'])
})

test('未读提示与按钮随语言切换，打开面板后清除未读', async () => {
  const widget = mount({ labels: labels('中文'), onSend: async () => '业务回复' })
  await widget.send('问题')
  assert.equal(query(widget, '.aw-notice').textContent, '中文-unread-1')
  widget.setLabels(labels('English'))
  assert.equal(query(widget, '.aw-notice').textContent, 'English-unread-1')
  assert.match(widget.orb.el.getAttribute('aria-label'), /English-open.*English-unread-1/)
  widget.open()
  assert.doesNotMatch(widget.orb.el.getAttribute('aria-label'), /unread/)
  assert.match(widget.orb.el.getAttribute('aria-label'), /English-close/)
  assert.equal(query(widget, '.aw-capsule').hidden, true)
})

test('打开后聚焦输入框，Escape 关闭并回到入口按钮', () => {
  const widget = mount()
  widget.open()
  assert.equal(widget.root.activeElement, query(widget, '.aw-input'))
  query(widget, '.aw-input').dispatchEvent(new window.KeyboardEvent('keydown', {
    key: 'Escape', bubbles: true, cancelable: true,
  }))
  assert.equal(widget.isOpen, false)
  assert.equal(widget.root.activeElement, widget.orb.el)
})
