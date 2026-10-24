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

const { AgentOrb, SHAPES, MOODS, MOTIONS } = await import('../src/index.js')

const mount = (opts) => {
  const host = document.createElement('div')
  document.body.appendChild(host)
  return new AgentOrb(host, opts)
}

test('3.0 支持 9 大形态且各形态正确生成对应的 class 与 geometry', () => {
  assert.equal(SHAPES.length, 9)
  for (const sh of SHAPES) {
    const o = mount({ shape: sh })
    assert.ok(o.el.classList.contains(`ao-shape-${sh}`), `缺少 ao-shape-${sh}`)
    assert.ok(o.el.querySelector('.ao-body'), `形态 ${sh} 必须包含 .ao-body`)
    o.destroy()
  }
})

test('3.0 支持情绪切换且正确对应 class', () => {
  const o = mount()
  for (const m of MOODS) {
    o.mood = m
    assert.ok(o.el.classList.contains(`ao-mood-${m}`), `切换到 ${m} 缺少 ao-mood-${m}`)
  }
  o.destroy()
})

test('3.0 支持独立动效模式', () => {
  const o = mount()
  for (const mot of MOTIONS) {
    o.motion = mot
    assert.ok(o.el.classList.contains(`ao-motion-${mot}`), `切换到 ${mot} 缺少 ao-motion-${mot}`)
  }
  o.destroy()
})

test('3.0 poke() 触发果冻弹性挤压与临时情绪', (t, done) => {
  const o = mount({ mood: 'neutral' })
  o.poke('sparkle')
  assert.ok(o.el.classList.contains('ao-poked'))
  assert.equal(o.mood, 'sparkle')
  setTimeout(() => {
    assert.equal(o.mood, 'neutral')
    o.destroy()
    done()
  }, 700)
})

const { CREATURES } = await import('../src/index.js')

test('creature：每个物种都渲染身体、可眨的眼球与腮红', () => {
  for (const c of CREATURES) {
    const o = mount({ creature: c })
    assert.ok(o.el.classList.contains(`ao-creature-${c}`), `缺少 ao-creature-${c}`)
    assert.ok(o.el.querySelector('.ao-body'))
    assert.ok(o.el.querySelector('.ao-blush'))
    assert.ok(o.el.querySelector('.ao-eye-round .ao-eyeball'), `${c} 缺少眼球`)
    o.destroy()
  }
})

test('creature：嘴型跟情绪走，出错时固定为波浪嘴', () => {
  const o = mount({ creature: 'cat' })
  assert.equal(o.el.getAttribute('data-mouth'), 'w')
  o.mood = 'happy'
  assert.equal(o.el.getAttribute('data-mouth'), 'open')
  o.mood = 'neutral'
  o.state = 'working'
  assert.equal(o.el.getAttribute('data-mouth'), 'flat')
  o.state = 'error'
  assert.equal(o.el.getAttribute('data-mouth'), 'wave')
  o.destroy()
})

test('有喙的物种不画嘴', () => {
  const o = mount({ creature: 'owl' })
  assert.ok(o.el.classList.contains('ao-has-beak'))
  o.destroy()
})

test('poke 喷出粒子，飘完自动清理；传 null 不换表情', async () => {
  const o = mount({ creature: 'bunny', mood: 'curious' })
  o.poke(null)
  assert.equal(o.mood, 'curious')
  assert.ok(o.el.querySelectorAll('.ao-particle').length > 0)
  await new Promise((r) => setTimeout(r, 1500))
  assert.equal(o.el.querySelectorAll('.ao-particle').length, 0)
  o.destroy()
})
