/**
 * 生灵是可选插件：没 import 'ai-orb/creatures' 时，核心包必须照旧工作——
 * 传了 creature 也只是回落到 shape，不能抛错、不能注入生灵样式。
 * 单独一个文件：node --test 每个文件一个进程，插件一旦加载就收不回来。
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

const { AgentOrb, CREATURES } = await import('../src/index.js')

test('未加载插件：CREATURES 为空，creature 回落到 shape', () => {
  assert.equal(CREATURES.length, 0)
  const host = document.createElement('div')
  document.body.appendChild(host)
  const o = new AgentOrb(host, { creature: 'cat', shape: 'squircle' })
  assert.equal(o.creature, null)
  assert.ok(o.el.classList.contains('ao-shape-squircle'))
  assert.ok(!o.el.classList.contains('ao-creature'))
  assert.equal(document.querySelectorAll('style[data-agent-orb-creatures]').length, 0)
  o.destroy()
})

test('加载插件后：同一个 creature 选项生效', async () => {
  await import('../src/creatures.js')
  assert.equal(CREATURES.length, 8)
  const host = document.createElement('div')
  document.body.appendChild(host)
  const o = new AgentOrb(host, { creature: 'cat' })
  assert.equal(o.creature, 'cat')
  assert.equal(document.querySelectorAll('style[data-agent-orb-creatures]').length, 1)
  o.destroy()
})
