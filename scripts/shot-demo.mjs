#!/usr/bin/env node
/**
 * demo 页整页验收：真实浏览器打开、截图、收集控制台错误。
 * 用法：node scripts/shot-demo.mjs
 */
import { chromium } from 'playwright-core'
import { createServer } from 'node:http'
import { readFile, mkdir } from 'node:fs/promises'
import { resolve, dirname, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, '.shots')
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const MIME = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.html': 'text/html', '.css': 'text/css' }
const server = createServer(async (req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0])
  if (url === '/' || url === '/index.html') {
    res.writeHead(200, { 'content-type': 'text/html' })
    res.end(await readFile(join(ROOT, 'demo/index.html')))
    return
  }
  try {
    const buf = await readFile(join(ROOT, url))
    res.writeHead(200, { 'content-type': MIME[extname(url)] || 'application/octet-stream' })
    res.end(buf)
  } catch { res.writeHead(404); res.end('nope') }
})
await new Promise((r) => server.listen(0, '127.0.0.1', r))
const BASE = `http://127.0.0.1:${server.address().port}`

await mkdir(OUT, { recursive: true })
const browser = await chromium.launch({ executablePath: CHROME })
const ctx = await browser.newContext({ viewport: { width: 1180, height: 1600 }, deviceScaleFactor: 2 })
const p = await ctx.newPage()
const errors = []
p.on('pageerror', (e) => errors.push(e.message))
p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
await p.goto(`${BASE}/`, { waitUntil: 'networkidle' })
await p.waitForTimeout(2200)

// Crystal 展区
await p.locator('#crystalRow').scrollIntoViewIfNeeded()
await p.waitForTimeout(600)
await p.locator('#crystalRow').screenshot({ path: join(OUT, 'demo-crystal.png') })

// playground 切到 Crystal + thinking，看皮肤切换
await p.locator('#playground').scrollIntoViewIfNeeded()
await p.getByRole('button', { name: '在想' }).first().click()
await p.getByRole('button', { name: 'Crystal 4.0' }).click()
await p.waitForTimeout(1200)
const stage = p.locator('#playground')
await stage.screenshot({ path: join(OUT, 'demo-play-crystal.png') })

console.log(errors.length ? `控制台错误：\n${errors.join('\n')}` : '无控制台错误')
await browser.close()
server.close()
