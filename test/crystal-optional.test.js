/**
 * Crystal 皮肤是可选插件：没 import 'ai-orb/crystal' 时，核心包必须照旧工作——
 * 传了 skin 也只是回落到 shape/creature，不能抛错、不能注入皮肤样式。
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
  globalThis.requestAnimationFrame = dom.window.requestAnimationFrame?.bind(dom.window)
  globalThis.cancelAnimationFrame = dom.window.cancelAnimationFrame?.bind(dom.window)
})
after(() => dom.window.close())

test('没加载 crystal 插件时，skin 选项回落到 shape，不注入皮肤样式', async () => {
  const { AgentOrb } = await import('../src/index.js')
  const host = document.createElement('div')
  document.body.appendChild(host)
  const o = new AgentOrb(host, { skin: 'crystal' })
  assert.equal(o.skin, null, '未注册的皮肤必须解析为 null（回落 shape）')
  assert.equal(document.querySelectorAll('style[data-agent-orb-crystal]').length, 0)
  assert.ok(o.el.querySelector('.ao-svg'), '回落到几何形态仍有 SVG')
  o.destroy()
})

test('加载 crystal 插件后：注册生效、渲染玻璃球、注入样式一次', async () => {
  await import('../src/crystal.js')
  const { AgentOrb, SKINS } = await import('../src/index.js')
  assert.ok(SKINS.includes('crystal'), 'SKINS 应包含 crystal')

  const host = document.createElement('div')
  document.body.appendChild(host)
  const o = new AgentOrb(host, { skin: 'crystal' })
  assert.equal(o.skin, 'crystal')
  assert.ok(o.el.classList.contains('ao-skin-crystal'), '根节点带 ao-skin-crystal')
  assert.ok(o.el.querySelector('.ao-crystal-svg'), '渲染 crystal SVG')
  assert.ok(o.el.querySelector('.ao-cx-fabric'), '内部绸面存在')
  assert.ok(o.el.querySelector('.ao-eyes'), '视差通道 .ao-eyes 存在（核心每帧驱动）')
  assert.ok(o.el.querySelector('.ao-badge'), '徽章占位存在（done+unseen 时核心要写它）')
  assert.equal(document.querySelectorAll('style[data-agent-orb-crystal]').length, 1, '皮肤样式注入一次')

  // done + unseen：核心无守卫写 ._badgeEl.textContent，crystal 必须提供 .ao-badge
  o.set('done', 3)
  assert.equal(o.el.querySelector('.ao-badge').textContent, '3')
  o.destroy()
})

test('六种状态都渲染且切状态类名正确', async () => {
  const { AgentOrb, STATES } = await import('../src/index.js')
  const host = document.createElement('div')
  document.body.appendChild(host)
  const o = new AgentOrb(host, { skin: 'crystal' })
  for (const s of STATES) {
    o.set(s)
    assert.ok(o.el.classList.contains(`is-${s}`), `状态 ${s} 类名缺失`)
    assert.ok(o.el.querySelector('.ao-crystal-svg'), `${s} 下 SVG 仍在`)
  }
  o.destroy()
})

test('destroy 后皮肤节点整体移除', async () => {
  const { AgentOrb } = await import('../src/index.js')
  const host = document.createElement('div')
  document.body.appendChild(host)
  const o = new AgentOrb(host, { skin: 'crystal' })
  o.destroy()
  assert.equal(host.querySelector('.agent-orb'), null)
})
