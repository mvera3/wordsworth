// Desktop-framed capture — what the user sees in a normal browser window where
// the device frame (sm:) is active. Focus on overlay/modal behaviour.
import { chromium } from 'playwright'
import { mkdirSync } from 'fs'

const BASE = `http://localhost:${process.argv[2] || '5174'}/`
const OUT = './shots'
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 })
const shot = async (n) => { await page.waitForTimeout(450); await page.screenshot({ path: `${OUT}/${n}.png` }); console.log('shot', n) }
const click = async (s, l) => { try { await s.click({ timeout: 2500 }); await page.waitForTimeout(350) } catch (e) { console.log('miss', l) } }

await page.goto(BASE, { waitUntil: 'networkidle' })
await page.evaluate(() => localStorage.clear())
await page.reload({ waitUntil: 'networkidle' })
await click(page.getByText('Quick Start', { exact: true }), 'quick start')
await shot('D1-home')
// open world, scroll down, then open an NPC modal to test overlay coverage
await click(page.locator('nav').getByText('World'), 'world')
await page.mouse.wheel(0, 600)
await shot('D2-world-scrolled')
await click(page.getByText('Sam Ortiz').first(), 'npc')
await shot('D3-npc-modal-scrolled')
await browser.close()
console.log('done')
