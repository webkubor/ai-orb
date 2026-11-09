#!/usr/bin/env node
/**
 * 生成 README 首屏用 Crystal 宣传图：demo/media/ai-orb-4-crystal.png
 * 深色舞台 + 六态一排，2x 分辨率。
 * 用法：node scripts/shot-crystal-hero.mjs
 */
import { chromium } from 'playwright-core'
import { createServer } from 'node:http'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { resolve, dirname, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const MIME = { '.js': 'text/javascript', '.html': 'text/html' }
const server = createServer(async (req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0])
  if (url === '/__hero') { res.writeHead(200, { 'content-type': 'text/html' }); res.end(html); return }
  try {
    const buf = await readFile(join(ROOT, url))
    res.writeHead(200, { 'content-type': MIME[extname(url)] || 'application/octet-stream' })
    res.end(buf)
  } catch { res.writeHead(404); res.end('nope') }
})
await new Promise((r) => server.listen(0, '127.0.0.1', r))
const BASE = `http://127.0.0.1:${server.address().port}`

const html = `<!doctype html><meta charset="utf-8"><style>
  *{box-sizing:border-box}
  body{margin:0;width:1440px;height:560px;overflow:hidden;position:relative;
    background:
      radial-gradient(1100px 480px at 24% -12%, rgba(96,132,178,.16), transparent 60%),
      radial-gradient(900px 420px at 88% 118%, rgba(148,116,190,.13), transparent 62%),
      linear-gradient(168deg,#101319 0%,#0b0e14 58%,#080a0f 100%);
    font:15px/1.5 -apple-system,"PingFang SC",system-ui,sans-serif;color:#aab4c4;
    display:flex;flex-direction:column;align-items:center;justify-content:center;gap:34px}
  .orb-row{display:flex;gap:64px;align-items:flex-start}
  .cell{display:flex;flex-direction:column;align-items:center;gap:16px;width:150px}
  .cell b{font-size:16px;font-weight:650;color:#e8edf5;letter-spacing:.06em}
  .cell small{font-size:12.5px;color:#77839a;margin-top:-8px}
  .brand{position:absolute;top:34px;left:48px;font-size:15px;color:#64708a;letter-spacing:.14em}
  .brand b{color:#c9d4e6;font-weight:600}
  .hint{position:absolute;bottom:30px;right:48px;font-size:13px;color:#5a6680}
</style>
<div class="brand"><b>ai-orb 4.0</b> · Crystal</div>
<div class="orb-row" id="row"></div>
<div class="hint">无脸 · 玻璃 · 丝绸 —— 靠流动表态</div>
<script type="module">
  import AgentOrb from '/src/index.js'
  import '/src/crystal.js'
  const SHOW = [
    ['idle','待命','安静的珍珠白'], ['thinking','在想','波纹变密'],
    ['working','干活中','流转加快'], ['asking','等你回话','收拢泛紫'],
    ['done','好了','染上暖金'], ['error','出错了','褪成灰'],
  ]
  const row = document.getElementById('row')
  for (const [state, name, desc] of SHOW) {
    const cell = document.createElement('div')
    cell.className = 'cell'
    const slot = document.createElement('div')
    const b = document.createElement('b'); b.textContent = name
    const s = document.createElement('small'); s.textContent = desc
    cell.append(slot, b, s)
    row.appendChild(cell)
    new AgentOrb(slot, { state, skin: 'crystal', size: 128 })
  }
  document.title = 'ready'
</script>`

await mkdir(join(ROOT, '.shots'), { recursive: true })
await writeFile(join(ROOT, '.shots/hero.html'), html)

const browser = await chromium.launch({ executablePath: CHROME })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 560 }, deviceScaleFactor: 2 })
const p = await ctx.newPage()
p.on('pageerror', (e) => console.log('[pageerror]', e.message))
await p.goto(`${BASE}/__hero`, { waitUntil: 'networkidle' })
await p.waitForFunction(() => document.title === 'ready')
await p.waitForTimeout(2800)
await p.screenshot({ path: join(ROOT, '.shots/ai-orb-4-crystal.png') })
await browser.close()
server.close()
console.log('hero:', join(ROOT, '.shots/ai-orb-4-crystal.png'))
