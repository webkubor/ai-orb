#!/usr/bin/env node
/**
 * 材质配方对比台：把几种「丝绸」做法并排渲染出来，用眼睛选。
 * 用法：node scripts/shot-recipes.mjs
 */
import { chromium } from 'playwright-core'
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { resolve, dirname, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const MIME = { '.js': 'text/javascript', '.html': 'text/html' }
const server = createServer(async (req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0])
  if (url === '/__r') { res.writeHead(200, { 'content-type': 'text/html' }); res.end(html); return }
  try {
    const buf = await readFile(join(ROOT, url))
    res.writeHead(200, { 'content-type': MIME[extname(url)] || 'application/octet-stream' })
    res.end(buf)
  } catch { res.writeHead(404); res.end('nope') }
})
await new Promise((r) => server.listen(0, '127.0.0.1', r))
const BASE = `http://127.0.0.1:${server.address().port}`

// 每个配方：id、标题、filter 内容、绸面渐变、混合方式
const RECIPES = [
  {
    id: 'A', name: 'A: turbulence + 高对比遮罩',
    filter: `<feTurbulence type="turbulence" baseFrequency="0.012 0.02" numOctaves="4" seed="3" result="f"/>
      <feColorMatrix in="f" type="matrix" result="m" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  5 0 0 0 -1.9"/>
      <feComposite in="SourceGraphic" in2="m" operator="in"/>`,
  },
  {
    id: 'B', name: 'B: fractalNoise + 中对比遮罩',
    filter: `<feTurbulence type="fractalNoise" baseFrequency="0.01 0.028" numOctaves="3" seed="3" result="f"/>
      <feColorMatrix in="f" type="matrix" result="m" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  3.2 0 0 0 -1.15"/>
      <feComposite in="SourceGraphic" in2="m" operator="in"/>`,
  },
  {
    id: 'C', name: 'C: turbulence + 位移叠加',
    filter: `<feTurbulence type="turbulence" baseFrequency="0.02 0.014" numOctaves="3" seed="3" result="f"/>
      <feDisplacementMap in="SourceGraphic" in2="f" scale="9" xChannelSelector="R" yChannelSelector="G" result="d"/>
      <feColorMatrix in="f" type="matrix" result="m" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  4 0 0 0 -1.5"/>
      <feComposite in="d" in2="m" operator="in"/>`,
  },
  {
    id: 'D', name: 'D: turbulence 灰度当填充（不做遮罩）',
    filter: `<feTurbulence type="turbulence" baseFrequency="0.02 0.016" numOctaves="4" seed="3" result="f"/>
      <feColorMatrix in="f" type="matrix" values="0.9 0 0 0 0.1  0 0.85 0 0 0.14  0 0 0.9 0 0.16  0 0 0 1 0"/>`,
  },
  {
    id: 'E', name: 'E: turbulence + spec 光照（立体丝绸）',
    filter: `<feTurbulence type="turbulence" baseFrequency="0.014 0.022" numOctaves="4" seed="3" result="f"/>
      <feDiffuseLighting in="f" lighting-color="#ffffff" surfaceScale="2.4" diffuseConstant="1" result="l">
        <feDistantLight azimuth="225" elevation="55"/>
      </feDiffuseLighting>
      <feComposite in="SourceGraphic" in2="l" operator="arithmetic" k1="1" k2="0" k3="0" k4="0"/>`,
  },
  {
    id: 'F', name: 'F: turbulence + 光照 + 遮罩',
    filter: `<feTurbulence type="turbulence" baseFrequency="0.014 0.022" numOctaves="4" seed="3" result="f"/>
      <feColorMatrix in="f" type="matrix" result="m" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  3.4 0 0 0 -1.2"/>
      <feComposite in="SourceGraphic" in2="m" operator="in" result="rib"/>
      <feDiffuseLighting in="f" lighting-color="#ffffff" surfaceScale="3" diffuseConstant="1.05" result="l">
        <feDistantLight azimuth="225" elevation="58"/>
      </feDiffuseLighting>
      <feComposite in="rib" in2="l" operator="arithmetic" k1="1.15" k2="0" k3="0" k4="0"/>`,
  },
]

const html = `<!doctype html><meta charset="utf-8"><style>
  body{margin:0;padding:30px;background:#0b0d11;font:13px -apple-system,system-ui;color:#c9d1de}
  .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
  .cell{background:#f2f0ec;border-radius:12px;padding:18px;text-align:center}
  .cell b{display:block;margin-top:10px;color:#8b95a5;font-weight:600;font-size:12px}
</style>
<div class="grid">
${RECIPES.map((r) => `
  <div class="cell">
    <svg viewBox="0 0 64 64" width="230" height="230">
      <defs>
        <filter id="f-${r.id}" x="-25%" y="-25%" width="150%" height="150%" color-interpolation-filters="sRGB">
          ${r.filter}
        </filter>
        <linearGradient id="g-${r.id}" x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" style="stop-color:#ffffff"/>
          <stop offset="45%" style="stop-color:#d7dee8"/>
          <stop offset="100%" style="stop-color:#93a3b8"/>
        </linearGradient>
        <clipPath id="c-${r.id}"><circle cx="32" cy="32" r="26"/></clipPath>
      </defs>
      <g clip-path="url(#c-${r.id})">
        <rect x="0" y="0" width="64" height="64" fill="url(#g-${r.id})" filter="url(#f-${r.id})"/>
      </g>
      <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(0,0,0,.12)"/>
    </svg>
    <b>${r.name}</b>
  </div>`).join('')}
</div>`

const browser = await chromium.launch({ executablePath: CHROME })
const ctx = await browser.newContext({ viewport: { width: 1000, height: 800 }, deviceScaleFactor: 2 })
const p = await ctx.newPage()
p.on('pageerror', (e) => console.log('[pageerror]', e.message))
await p.goto(`${BASE}/__r`, { waitUntil: 'networkidle' })
await p.waitForTimeout(1500)
await p.screenshot({ path: join(ROOT, '.shots/recipes.png'), fullPage: true })
await browser.close()
server.close()
console.log('配方对比：', join(ROOT, '.shots/recipes.png'))
