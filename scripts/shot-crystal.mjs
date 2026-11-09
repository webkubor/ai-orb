#!/usr/bin/env node
/**
 * Crystal 形态的视觉取证台（开发用，不进 npm 包）。
 *
 * 为什么要单独一个脚本：crystal 的好坏是「看起来高级不高级」，
 * 代码跑通不等于好看。必须把六种状态真的渲染出来、截图、看。
 *
 * 用法：node scripts/shot-crystal.mjs [输出目录]
 * 依赖：本机 Chrome（CHROME_PATH 可覆盖）、playwright-core
 */
import { chromium } from 'playwright-core'
import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { resolve, dirname, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(process.argv[2] || `${ROOT}/.shots`)
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const STATES = ['idle', 'thinking', 'working', 'asking', 'done', 'error']

// file:// 下 ESM 会被 CORS 拦掉，所以起个静态服务
const MIME = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.html': 'text/html' }
const server = createServer(async (req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0])
  // 优先从输出目录找（grid.html / big.html 写在那儿），否则回落到仓库根
  const cands = [join(OUT, url), join(ROOT, url)]
  for (const p of cands) {
    try {
      const buf = await readFile(p)
      res.writeHead(200, { 'content-type': MIME[extname(p)] || 'application/octet-stream' })
      res.end(buf)
      return
    } catch { /* 试下一个 */ }
  }
  res.writeHead(404); res.end('nope')
})
await new Promise((r) => server.listen(0, '127.0.0.1', r))
const BASE = `http://127.0.0.1:${server.address().port}`

const grid = `<!doctype html>
<html><head><meta charset="utf-8"><style>
  body{margin:0;padding:36px;background:#0e1014;font:14px/1.6 -apple-system,system-ui,sans-serif;color:#c9d1de}
  h2{font-size:12px;font-weight:600;color:#7d8797;margin:0 0 12px;letter-spacing:.1em;text-transform:uppercase}
  .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
  .cell{display:flex;flex-direction:column;align-items:center;gap:12px;padding:26px 12px;border:1px solid rgba(255,255,255,.06);border-radius:14px;background:rgba(255,255,255,.02)}
  .cell b{font-size:12px;font-weight:600;letter-spacing:.04em}
  .stage{display:grid;place-items:center;width:100%;height:190px;border-radius:12px;background:#f2f0ec}
  .stage.dark{background:#0b0d11}
  .stage.warm{background:#e8e2d8}
</style></head>
<body>
  <h2>light</h2>
  <div class="grid" id="light"></div>
  <h2 style="margin-top:38px">dark</h2>
  <div class="grid" id="dark"></div>
<script type="module">
  import AgentOrb from '/src/index.js'
  import '/src/crystal.js'
  for (const id of ['light','dark']) {
    const box = document.getElementById(id)
    for (const s of ${JSON.stringify(STATES)}) {
      const cell = document.createElement('div')
      cell.className = 'cell'
      const stage = document.createElement('div')
      stage.className = 'stage' + (id === 'dark' ? ' dark' : '')
      const host = document.createElement('div')
      stage.appendChild(host)
      const b = document.createElement('b')
      b.textContent = s
      cell.append(stage, b)
      box.appendChild(cell)
      new AgentOrb(host, { state: s, skin: 'crystal', size: 130 })
    }
  }
  document.title = 'ready'
</script>
</body></html>`

await mkdir(OUT, { recursive: true })
await writeFile(join(OUT, 'grid.html'), grid)

const browser = await chromium.launch({ executablePath: CHROME })
const ctx = await browser.newContext({ viewport: { width: 1100, height: 900 }, deviceScaleFactor: 2 })

const p = await ctx.newPage()
p.on('console', (m) => { if (m.type() === 'error') console.log('[console]', m.text()) })
p.on('pageerror', (e) => console.log('[pageerror]', e.message))
await p.goto(`${BASE}/.shots/grid.html`, { waitUntil: 'networkidle' })
await p.waitForFunction(() => document.title === 'ready', { timeout: 15000 })
await p.waitForTimeout(2600)
await p.locator('#light').screenshot({ path: join(OUT, 'crystal-light.png') })
await p.locator('#dark').screenshot({ path: join(OUT, 'crystal-dark.png') })

// 单颗大图，看材质细节
const big = `<!doctype html><meta charset="utf-8">
<style>body{margin:0;display:grid;place-items:center;height:100vh;background:#0b0d11}</style>
<div id="h"></div>
<script type="module">
  import AgentOrb from '/src/index.js'
  import '/src/crystal.js'
  new AgentOrb(document.getElementById('h'), { state: 'idle', skin: 'crystal', size: 340 })
</script>`
await writeFile(join(OUT, 'big.html'), big)
const single = await ctx.newPage()
await single.goto(`${BASE}/.shots/big.html`, { waitUntil: 'networkidle' })
await single.waitForTimeout(2400)
await single.screenshot({ path: join(OUT, 'crystal-large.png') })

await browser.close()
server.close()
console.log('截图输出：', OUT)
