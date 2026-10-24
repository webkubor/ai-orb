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
