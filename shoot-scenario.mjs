// Let game time run until a scenario modal fires, then screenshot it.
import { chromium } from 'playwright'
const BASE = `http://localhost:${process.argv[2] || '5174'}/`
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
await page.goto(BASE, { waitUntil: 'networkidle' })
await page.evaluate(() => localStorage.clear())
await page.reload({ waitUntil: 'networkidle' })
await page.getByText('Quick Start', { exact: true }).click()
await page.waitForTimeout(400)
// crank speed to 3x to make a scenario fire fast
try { await page.getByRole('button', { name: '3×' }).click() } catch {}
try {
  await page.getByText('A moment unfolds', { exact: false }).waitFor({ timeout: 20000 })
  await page.waitForTimeout(300)
  await page.screenshot({ path: './shots/12-scenario.png' })
  console.log('scenario captured')
} catch (e) {
  await page.screenshot({ path: './shots/12-scenario.png' })
  console.log('no scenario within timeout, captured current state')
}
await browser.close()
