import { chromium } from 'playwright'
import { mkdirSync } from 'fs'
const BASE = `http://localhost:${process.argv[2] || '5174'}/`
mkdirSync('./shots', { recursive: true })
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
const shot = async (n) => { await p.waitForTimeout(450); await p.screenshot({ path: `./shots/${n}.png` }); console.log('shot', n) }
const click = async (s, l) => { try { await s.click({ timeout: 2500 }); await p.waitForTimeout(350) } catch { console.log('miss', l) } }

await p.goto(BASE, { waitUntil: 'networkidle' })
await p.evaluate(() => localStorage.clear()); await p.reload({ waitUntil: 'networkidle' })
await click(p.getByText('Quick Start', { exact: true }), 'quickstart')
await click(p.getByText('Alex Morgan').first(), 'simcard')
await shot('N1-dashboard')
await click(p.getByLabel('Back'), 'back')
await click(p.locator('nav').getByText('Menu'), 'menu')
await shot('N2-menu')
await click(p.getByText('Skills', { exact: true }), 'skills')
await shot('N3-skills')
await click(p.getByLabel('Back'), 'back')
await click(p.getByText('Shop', { exact: true }), 'shop')
await shot('N4-shop')
await click(p.getByText('Vehicles', { exact: true }), 'vehicles cat')
await shot('N5-shop-vehicles')
await click(p.getByLabel('Back'), 'back')
await click(p.getByText('Phone', { exact: true }), 'phone')
await shot('N6-phone')
await click(p.getByText('Jamie Chen').first(), 'contact')
await shot('N7-phone-msg')
await b.close(); console.log('done')
