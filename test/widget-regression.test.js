/** 真实浏览器审查发现的边界：焦点、旧重试、已读通知与样式隔离。 */
import { test, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import { AgentWidget } from '../src/widget.js'

let dom, widget
beforeEach(() => {
  dom = new JSDOM('<!doctype html><body></body>', { pretendToBeVisual: true })
  globalThis.window = dom.window
  globalThis.document = dom.window.document
  globalThis.requestAnimationFrame = dom.window.requestAnimationFrame.bind(dom.window)
  globalThis.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(dom.window)
})
afterEach(() => { widget?.destroy(); dom.window.close() })
const query = selector => widget.root.querySelector(selector)
const deferred = () => {
  let resolve
  const promise = new Promise(done => { resolve = done })
  return { promise, resolve }
}

test('发送和停止后焦点回到输入框，可以继续用 Escape 关闭', async () => {
  const pending = deferred()
  widget = new AgentWidget({ onSend: () => pending.promise })
  widget.open()
  const input = query('.aw-input')
  input.value = 'Hello'
  input.dispatchEvent(new window.Event('input'))
  query('.aw-send').focus()
  const sending = widget.send('Hello')
  assert.equal(widget.root.activeElement, input)
  query('.aw-stop').focus()
  widget.cancel()
  assert.equal(widget.root.activeElement, input)
  await sending
  input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
  assert.equal(widget.isOpen, false)
  pending.resolve('Late reply')
})

test('超长新问题不会保留上一条失败问题的重试入口', async () => {
  let calls = 0
  widget = new AgentWidget({ onSend: async () => { calls++; throw new Error('failed') } })
  await widget.send('Original')
  assert.equal(query('.aw-retry').hidden, false)
  await widget.send('x'.repeat(2001))
  assert.equal(query('.aw-retry').hidden, true)
  query('.aw-retry').click()
  assert.equal(calls, 1)
})

test('已查看的回复不会在关闭后重复弹出通知', async () => {
  widget = new AgentWidget({ onSend: async () => 'Reply' })
  await widget.send('Hello')
  assert.equal(query('.aw-capsule').hidden, false)
  widget.open()
  widget.close()
  assert.equal(query('.aw-capsule').hidden, true)
  await widget.send('Another question')
  assert.equal(query('.aw-capsule').hidden, false)
})

test('嵌入组件只在 Shadow DOM 注入样式，不影响宿主 document', () => {
  widget = new AgentWidget()
  assert.equal(document.head.querySelector('style[data-agent-orb]'), null)
  assert.match(widget.root.querySelector('style').textContent, /\.agent-orb/)
})
