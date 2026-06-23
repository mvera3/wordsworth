// Headless screenshot harness — captures every screen at a phone viewport so we
// can actually see layout bleeds. Usage: node shoot.mjs [port]
import { chromium } from 'playwright'
import { mkdirSync } from 'fs'

const PORT = process.argv[2] || '5174'
const BASE = `http://localhost:${PORT}/`
const OUT = './shots'
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
})

const shot = async (name) => {
  await page.waitForTimeout(450)
  await page.screenshot({ path: `${OUT}/${name}.png` })
  console.log('shot:', name)
}
const click = async (sel, label) => {
  try {
    await sel.click({ timeout: 2500 })
    await page.waitForTimeout(350)
  } catch (e) {
    console.log('could not click', label, '-', e.message.split('\n')[0])
  }
}

await page.goto(BASE, { waitUntil: 'networkidle' })
await page.evaluate(() => localStorage.clear())
await page.reload({ waitUntil: 'networkidle' })
await shot('01-title')

// New Life flow (first step)
await click(page.getByText('New Life', { exact: true }), 'New Life')
await shot('02-create')

// back to title, then Quick Start into the game
await click(page.getByLabel('Back'), 'back')
await click(page.getByText('Quick Start', { exact: true }), 'Quick Start')
await shot('03-home')

// Overview via the sim card
await click(page.getByText('Alex Morgan').first(), 'sim card')
await shot('04-overview')
for (const t of ['Stats', 'Traits', 'Background']) {
  await click(page.getByRole('button', { name: t, exact: true }), t)
  await shot(`04-overview-${t.toLowerCase()}`)
}
await click(page.getByLabel('Back'), 'back')

// Career
await click(page.getByText('Career', { exact: true }).first(), 'Career stat')
await shot('05-career')
await click(page.getByRole('button', { name: 'Education', exact: true }), 'Education tab')
await shot('06-education')
await click(page.locator('nav').getByText('Home'), 'nav home')

// World + NPC profile
await click(page.locator('nav').getByText('World'), 'nav world')
await shot('07-world')
await click(page.getByText('Jamie Chen').first(), 'npc')
await shot('08-npc-profile')
await click(page.getByText('Close', { exact: true }), 'close')

// Journal, Goals, Menu
await click(page.locator('nav').getByText('Journal'), 'nav journal')
await shot('09-journal')
await click(page.locator('nav').getByText('Goals'), 'nav goals')
await shot('10-goals')
await click(page.locator('nav').getByText('Menu'), 'nav menu')
await shot('11-menu')

await browser.close()
console.log('done')
