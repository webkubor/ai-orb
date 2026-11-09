#!/usr/bin/env node
/**
 * Crystal 调试台：把浏览器里的真实计算值打出来，别靠猜。
 * 用法：node scripts/debug-crystal.mjs
 */
import { chromium } from 'playwright-core'
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { resolve, dirname, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const MIME = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.html': 'text/html' }
const server = createServer(async (req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0])
  if (url === '/__dbg') {
    res.writeHead(200, { 'content-type': 'text/html' })
    res.end(html)
    return
  }
  for (const p of [join(ROOT, url)]) {
    try {
      const buf = await readFile(p)
      res.writeHead(200, { 'content-type': MIME[extname(p)] || 'application/octet-stream' })
      res.end(buf); return
    } catch { /* next */ }
  }
  res.writeHead(404); res.end('nope')
})
await new Promise((r) => server.listen(0, '127.0.0.1', r))
const BASE = `http://127.0.0.1:${server.address().port}`

const html = `<!doctype html><meta charset="utf-8"><style>body{margin:0;display:grid;place-items:center;height:100vh;background:#0b0d11}</style>
<div id="h"></div>
<script type="module">
  import AgentOrb from '/src/index.js'
  import '/src/crystal.js'
  const o = new AgentOrb(document.getElementById('h'), { state: 'thinking', skin: 'crystal', size: 300 })
  window.__o = o
</script>`
const browser = await chromium.launch({ executablePath: CHROME })
const p = await browser.newPage()
p.on('pageerror', (e) => console.log('[pageerror]', e.message))
await p.goto(`${BASE}/__dbg`, { waitUntil: 'networkidle' })
await p.waitForTimeout(1200)

const info = await p.evaluate(() => {
  const q = (s) => document.querySelector(s)
  const st = (el, props) => {
    if (!el) return null
    const cs = getComputedStyle(el)
    const o = {}
    for (const k of props) o[k] = cs.getPropertyValue(k)
    return o
  }
  const fabric = q('.ao-cx-fabric')
  const weave = q('.ao-cx-weave')
  const weave2 = q('.ao-cx-weave-2')
  const root = q('.ao-skin-crystal')
  const stop = document.querySelector('linearGradient stop')
  return {
    hasFabric: !!fabric,
    fabricFilter: fabric ? getComputedStyle(fabric).filter : null,
    fabricRect: fabric ? fabric.getBoundingClientRect().toJSON() : null,
    weaveFill: weave ? getComputedStyle(weave).fill : null,
    weave2Fill: weave2 ? getComputedStyle(weave2).fill : null,
    weave2Blend: weave2 ? getComputedStyle(weave2).mixBlendMode : null,
    rootVars: root ? {
      c1: getComputedStyle(root).getPropertyValue('--cx-c1'),
      c2: getComputedStyle(root).getPropertyValue('--cx-c2'),
      hue: getComputedStyle(root).getPropertyValue('--cx-hue'),
      sat: getComputedStyle(root).getPropertyValue('--cx-sat'),
    } : null,
    stopStyle: stop ? stop.getAttribute('style') : null,
    stopComputedColor: stop ? getComputedStyle(stop).stopColor : null,
    svgHtml: q('.ao-crystal-svg') ? q('.ao-crystal-svg').outerHTML.slice(0, 1200) : null,
  }
})
console.log(JSON.stringify(info, null, 2))
await browser.close()
server.close()
