/**
 * Vue 封装层的测试。
 *
 * 这层薄到看起来「没什么可测的」，但它恰恰是最容易出静默 bug 的地方：
 * props 变了忘了同步、卸载时忘了 destroy——都不报错，只是行为不对。
 * 尤其是忘记 destroy：页面不会坏，只是每次路由切换都多留一个 rAF 循环，
 * 用户过一小时才发现风扇在转。
 */
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'

let dom
before(() => {
  dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', { pretendToBeVisual: true })
  globalThis.window = dom.window
  globalThis.document = dom.window.document
  globalThis.requestAnimationFrame = dom.window.requestAnimationFrame.bind(dom.window)
  globalThis.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(dom.window)
  // Vue 的 runtime-dom 直接引用这些全局构造函数（resolveRootNamespace 里查 SVGElement），
  // 只挂 window/document 不够，会报 "SVGElement is not defined"
  // navigator 在新版 Node 里是只读 getter，赋值会抛，所以不在这个列表里
  for (const k of ['SVGElement', 'MathMLElement', 'Element', 'HTMLElement', 'Node', 'MouseEvent', 'Event']) {
    if (dom.window[k] !== undefined) globalThis[k] = dom.window[k]
  }
})
after(() => dom?.window?.close())

const { createApp, h, ref, nextTick } = await import('vue')
const { AgentOrb } = await import('../src/vue.js')

/** 挂一个只有 orb 的小应用，返回 { orbEl, setState, unmount } */
function mountOrb(initial = {}) {
  const state = ref(initial.state || 'idle')
  const unseen = ref(initial.unseen || 0)
  const host = document.createElement('div')
  document.body.appendChild(host)

  const app = createApp({
    setup: () => () => h(AgentOrb, { state: state.value, unseen: unseen.value, ...initial.props }),
  })
  app.mount(host)

  return {
    host,
    state,
    unseen,
    get el() { return host.querySelector('.agent-orb') },
    unmount: () => { app.unmount(); host.remove() },
  }
}

test('挂载后真的产出一颗球（不是空的宿主节点）', () => {
  const m = mountOrb()
  assert.ok(m.el, '没渲染出 .agent-orb')
  assert.ok(m.el.querySelector('.ao-body'), '球体缺失')
  assert.ok(m.el.classList.contains('is-idle'))
  m.unmount()
})

test('state prop 变化会同步到球上', async () => {
  const m = mountOrb()
  m.state.value = 'working'
  await nextTick()
  assert.ok(m.el.classList.contains('is-working'), 'state 没同步')
  assert.ok(!m.el.classList.contains('is-idle'), '旧状态没清掉')

  m.state.value = 'error'
  await nextTick()
  assert.ok(m.el.classList.contains('is-error'))
  m.unmount()
})

test('unseen prop 变化会同步到角标', async () => {
  const m = mountOrb({ state: 'done' })
  assert.ok(!m.el.classList.contains('ao-has-badge'), 'unseen=0 不该有角标')

  m.unseen.value = 7
  await nextTick()
  assert.ok(m.el.classList.contains('ao-has-badge'))
  assert.equal(m.el.querySelector('.ao-badge').textContent, '7')
  m.unmount()
})

test('组件卸载时必须 destroy —— 否则 rAF 循环会一直转', () => {
  // 忘了 destroy 不会报错、页面也不坏，只是每次路由切换多留一个循环。
  // 这种「不报错的泄漏」只能靠测试盯。
  const added = []
  const origAdd = window.addEventListener.bind(window)
  const origRemove = window.removeEventListener.bind(window)
  window.addEventListener = (t, f, o) => { if (t === 'mousemove') added.push(f); origAdd(t, f, o) }
  window.removeEventListener = (t, f, o) => { if (t === 'mousemove') added.splice(added.indexOf(f), 1); origRemove(t, f, o) }

  try {
    const m = mountOrb()
    assert.equal(added.length, 1, '挂载后应当有一个全局监听')
    const el = m.el
    m.unmount()
    assert.equal(el.isConnected, false, '卸载后 DOM 应当被摘掉')
    assert.equal(added.length, 0, '卸载后必须摘掉全局监听')
  } finally {
    window.addEventListener = origAdd
    window.removeEventListener = origRemove
  }
})

test('反复挂载卸载不会堆积监听（模拟 SPA 路由来回切）', () => {
  const added = []
  const origAdd = window.addEventListener.bind(window)
  const origRemove = window.removeEventListener.bind(window)
  window.addEventListener = (t, f, o) => { if (t === 'mousemove') added.push(f); origAdd(t, f, o) }
  window.removeEventListener = (t, f, o) => { if (t === 'mousemove') added.splice(added.indexOf(f), 1); origRemove(t, f, o) }

  try {
    for (let i = 0; i < 5; i++) mountOrb().unmount()
    assert.equal(added.length, 0, `来回切 5 次后残留了 ${added.length} 个监听`)
  } finally {
    window.addEventListener = origAdd
    window.removeEventListener = origRemove
  }
})

test('size / labels 等挂载期选项能透传到核心', () => {
  const m = mountOrb({ props: { size: 80, labels: { idle: '待命中' } } })
  assert.equal(m.el.style.getPropertyValue('--ao-size'), '80px')
  assert.equal(m.el.getAttribute('aria-label'), '待命中')
  m.unmount()
})
