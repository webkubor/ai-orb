/**
 * 测的是**行为**，不是「能 import 成功」。
 *
 * 重点盯三类容易在真实项目里咬人、但肉眼看 demo 看不出来的问题：
 *   1. 多实例的渐变 id 冲突 —— 同页两颗球，后一颗会引用到前一颗的 <defs>，
 *      前一颗一销毁，后一颗就变成透明圈。很难查，因为单实例永远正常。
 *   2. destroy 之后有没有留下全局监听和 rAF —— SPA 里反复挂载卸载会越积越多。
 *   3. 未知状态不能炸 —— 状态多半来自后端，一个拼错的字符串不该让页面白屏。
 */
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'

let dom
before(() => {
  dom = new JSDOM('<!doctype html><html><body></body></html>', { pretendToBeVisual: true })
  globalThis.window = dom.window
  globalThis.document = dom.window.document
  globalThis.requestAnimationFrame = dom.window.requestAnimationFrame.bind(dom.window)
  globalThis.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(dom.window)
})
after(() => dom?.window?.close())

const { AgentOrb, STATES } = await import('../src/index.js')

const mount = (opts) => {
  const host = document.createElement('div')
  document.body.appendChild(host)
  return new AgentOrb(host, opts)
}

test('挂载后产出一个按钮，且样式只注入一次', () => {
  const a = mount()
  const b = mount()
  assert.equal(a.el.tagName, 'BUTTON')
  assert.equal(a.el.type, 'button')
  assert.equal(document.querySelectorAll('style[data-agent-orb]').length, 1, '样式不该重复注入')
  a.destroy(); b.destroy()
})

test('多实例的渐变 id 必须各不相同', () => {
  // 同页两颗球用同一个 id 时，后一颗会引用前一颗的 <defs>；
  // 前一颗销毁 → 后一颗填充失效变成透明圈。单实例测不出来，所以专门锁这条。
  const orbs = [mount(), mount(), mount()]
  const ids = orbs.map((o) => o.el.querySelector('radialGradient').id)
  assert.equal(new Set(ids).size, 3, `id 撞了: ${ids.join(', ')}`)
  // 球体的 fill 要指向自己那个 id，不能指向别人的
  orbs.forEach((o, i) => {
    assert.equal(o.el.querySelector('.ao-body').getAttribute('fill'), `url(#${ids[i]})`)
  })
  orbs.forEach((o) => o.destroy())
})

test('状态切换只换 class，六个状态互斥', () => {
  const o = mount()
  for (const s of STATES) {
    o.state = s
    const on = STATES.filter((x) => o.el.classList.contains(`is-${x}`))
    assert.deepEqual(on, [s], `${s} 状态下 class 应当只有 is-${s}，实际 ${on.join(',')}`)
  }
  o.destroy()
})

test('未知状态回落到 idle，不抛错', () => {
  // 状态多半来自后端，拼错一个字符串不该让页面白屏
  const o = mount({ state: '不存在的状态' })
  assert.equal(o.state, 'idle')
  o.state = null
  assert.equal(o.state, 'idle')
  o.destroy()
})

test('角标只在 done 且 unseen>0 时出现，超过 99 显示 99+', () => {
  const o = mount()
  o.set('working', 5)
  assert.ok(!o.el.classList.contains('ao-has-badge'), '非 done 状态不该有角标')

  o.state = 'done'
  assert.ok(o.el.classList.contains('ao-has-badge'))
  assert.equal(o.el.querySelector('.ao-badge').textContent, '5')

  o.unseen = 250
  assert.equal(o.el.querySelector('.ao-badge').textContent, '99+')

  o.unseen = 0
  assert.ok(!o.el.classList.contains('ao-has-badge'), 'unseen 归零后角标要消失')
  o.destroy()
})

test('每个状态都有无障碍文案，且能被覆盖', () => {
  const o = mount()
  for (const s of STATES) {
    o.state = s
    const label = o.el.getAttribute('aria-label')
    assert.ok(label && label.length > 3, `${s} 缺 aria-label`)
    assert.equal(o.el.title, label, 'title 和 aria-label 应当一致')
  }
  o.destroy()

  const zh = mount({ labels: { idle: '助手 · 待命' } })
  assert.equal(zh.el.getAttribute('aria-label'), '助手 · 待命')
  zh.state = 'working'
  assert.match(zh.el.getAttribute('aria-label'), /working/, '没覆盖的状态应当回落到默认文案')
  zh.destroy()
})

test('destroy 之后移除 DOM，且能重复调用不炸', () => {
  const o = mount()
  const el = o.el
  o.destroy()
  assert.equal(el.isConnected, false, 'DOM 应当被摘掉')
  assert.doesNotThrow(() => o.destroy(), '重复 destroy 不该抛')
})

test('最后一个实例销毁后，全局 mousemove 监听要摘干净', () => {
  // SPA 里反复挂载卸载，监听不摘就会越积越多
  const added = []
  const origAdd = window.addEventListener.bind(window)
  const origRemove = window.removeEventListener.bind(window)
  window.addEventListener = (t, f, o) => { if (t === 'mousemove') added.push(f); origAdd(t, f, o) }
  window.removeEventListener = (t, f, o) => { if (t === 'mousemove') added.splice(added.indexOf(f), 1); origRemove(t, f, o) }

  try {
    const a = mount(); const b = mount()
    assert.equal(added.length, 1, '多个实例应当共用一个全局监听')
    a.destroy()
    assert.equal(added.length, 1, '还有实例活着时不该摘监听')
    b.destroy()
    assert.equal(added.length, 0, '最后一个销毁后必须摘掉监听')
  } finally {
    window.addEventListener = origAdd
    window.removeEventListener = origRemove
  }
})

test('follow=false 时不参与全局注视循环', () => {
  const o = mount({ follow: false })
  assert.doesNotThrow(() => { o.state = 'working' })
  o.destroy()
})

test('size 数字按 px 写进 CSS 变量', () => {
  const a = mount({ size: 72 })
  assert.equal(a.el.style.getPropertyValue('--ao-size'), '72px')
  const b = mount({ size: '3rem' })
  assert.equal(b.el.style.getPropertyValue('--ao-size'), '3rem')
  a.destroy(); b.destroy()
})

test('没有挂载点直接抛，不静默失败', () => {
  // 静默失败的表现是「球没出现」，会被当成样式问题查半天
  assert.throws(() => new AgentOrb(null), /挂载点/)
})

test('四组眼形全都渲染在 DOM 里，靠 CSS 显隐', () => {
  // 这是刻意的设计：状态切换不增删节点，频繁切换时不会反复重排
  const o = mount()
  for (const cls of ['ao-eye-round', 'ao-eye-focus', 'ao-eye-smile', 'ao-eye-cross']) {
    assert.ok(o.el.querySelector(`.${cls}`), `缺少眼形 ${cls}`)
  }
  o.destroy()
})
