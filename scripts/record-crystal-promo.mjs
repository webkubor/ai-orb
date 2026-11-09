#!/usr/bin/env node
/**
 * 把 demo/promo-crystal.html 录成 4.0 推广短片：demo/media/ai-orb-4.mp4 与 ai-orb-4-crystal.gif。
 *
 * 与 record-promo.mjs 同一套 CDP screencast 机制（逐帧高质量 JPEG + 真实时间戳）。
 * GIF 取「视差折射 + 六态变化」那一段，压在 5 MB 内防 GitHub camo 404。
 *
 * 用法：node scripts/record-crystal-promo.mjs
 */
import { chromium } from 'playwright-core'
import { createServer } from 'node:http'
import { readFile, mkdir, writeFile, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { extname, join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'demo', 'media')
const FRAMES = join(tmpdir(), 'ai-orb-crystal-frames')
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png' }

const server = createServer(async (req, res) => {
  const path = join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname))
  if (!path.startsWith(ROOT) || !existsSync(path)) { res.writeHead(404).end(); return }
  res.writeHead(200, { 'content-type': TYPES[extname(path)] || 'application/octet-stream' })
  res.end(await readFile(path))
}).listen(0)
const port = server.address().port

await rm(FRAMES, { recursive: true, force: true })
await mkdir(FRAMES, { recursive: true })
await mkdir(OUT, { recursive: true })

const browser = await chromium.launch({ executablePath: CHROME, headless: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1.5 })
const cdp = await page.context().newCDPSession(page)
const frames = []
cdp.on('Page.screencastFrame', async ({ data, metadata, sessionId }) => {
  frames.push({ data, t: metadata.timestamp })
  await cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {})
})

await page.goto(`http://localhost:${port}/demo/promo-crystal.html?once`, { waitUntil: 'networkidle' })
await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 94, maxWidth: 1920, maxHeight: 1080, everyNthFrame: 1 })
await page.waitForFunction(() => document.body.dataset.done === '1', null, { timeout: 90_000, polling: 200 })
await page.waitForTimeout(300)
await cdp.send('Page.stopScreencast')
await browser.close()
server.close()

const lines = []
for (let i = 0; i < frames.length; i++) {
  const file = join(FRAMES, `${String(i).padStart(5, '0')}.jpg`)
  await writeFile(file, Buffer.from(frames[i].data, 'base64'))
  const dur = i + 1 < frames.length ? frames[i + 1].t - frames[i].t : 1
  lines.push(`file '${file}'`, `duration ${dur.toFixed(4)}`)
}
lines.push(`file '${join(FRAMES, `${String(frames.length - 1).padStart(5, '0')}.jpg`)}'`)
await writeFile(join(FRAMES, 'list.txt'), lines.join('\n'))

const total = frames.at(-1).t - frames[0].t
console.log(`采集 ${frames.length} 帧，时长 ${total.toFixed(1)}s，平均 ${(frames.length / total).toFixed(1)} fps`)

const mp4 = join(OUT, 'ai-orb-4.mp4')
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', join(FRAMES, 'list.txt'),
  '-vf', 'fps=30,scale=1920:1080:flags=lanczos:in_range=pc:out_range=tv,format=yuv420p', '-color_range', 'tv',
  '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow', '-crf', '18', '-movflags', '+faststart', mp4])

// GIF 取「视差折射 + 六态」段（约 5s–16s），720p 宽
const gif = join(OUT, 'ai-orb-4-crystal.gif')
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', '5', '-t', '11', '-i', mp4,
  '-vf', 'fps=12,scale=720:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=sierra2_4a:diff_mode=rectangle',
  gif])
const gifMB = (await import('node:fs')).statSync(gif).size / 1e6
if (gifMB > 4.8) throw new Error(`GIF ${gifMB.toFixed(1)} MB，超过 GitHub camo 上限，README 会裂图`)

console.log(`✓ ${mp4}\n✓ ${gif}`)
