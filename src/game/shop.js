// Shop catalog (USD $). Items grant modest, balanced stat perks applied once on
// purchase. Real estate and vehicles are tracked as owned properties/vehicles;
// gifts can be given to NPCs.
//
// The catalog is generated as a TIER LADDER: each product line spans eight
// quality tiers (Basic → Masterwork) with geometrically rising price and
// linearly rising perks, so a player can grind toward ever-better gear. A few
// fixed anchor items (e.g. the Smartphone that unlocks the Phone) are injected.

const item = (id, name, price, opts = {}) => ({ id, name, price, ...opts })

// pm = price multiplier vs the line's base price; qm = perk (quality) multiplier.
const TIERS = [
  { adj: 'Basic', pm: 1, qm: 0.5 },
  { adj: 'Standard', pm: 2.2, qm: 0.8 },
  { adj: 'Quality', pm: 4.5, qm: 1.1 },
  { adj: 'Premium', pm: 9, qm: 1.5 },
  { adj: 'Professional', pm: 18, qm: 2.0 },
  { adj: 'Elite', pm: 38, qm: 2.7 },
  { adj: 'Luxury', pm: 80, qm: 3.6 },
  { adj: 'Masterwork', pm: 170, qm: 4.8 },
]

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 12)

const PERK_LABEL = (key) => {
  if (key === 'reputation') return 'Rep'
  if (key === 'mentalHealth') return 'Calm'
  if (key === 'stress') return 'Stress'
  if (key.startsWith('skill:')) return key.slice(6)
  if (key.startsWith('needs.')) return key.slice(6).replace(/^./, (c) => c.toUpperCase())
  if (key.startsWith('meters.')) return key.slice(7).replace(/^./, (c) => c.toUpperCase())
  return key
}

// Build a short note from the strongest perk, e.g. "+Coding" or "−Stress".
function noteFor(perks) {
  const entries = Object.entries(perks)
  if (!entries.length) return undefined
  let best = entries[0]
  for (const e of entries) if (Math.abs(e[1]) > Math.abs(best[1])) best = e
  const sign = best[1] >= 0 ? '+' : '−'
  return `${sign}${PERK_LABEL(best[0])}`
}

// Expand a product line into one item per tier.
function ladder(catKey, kind, prod) {
  return TIERS.map((t, i) => {
    const perks = {}
    for (const [k, v] of Object.entries(prod.perks)) {
      const scaled = Math.round(v * t.qm)
      if (scaled !== 0) perks[k] = scaled
    }
    const price = Math.max(5, Math.round((prod.base * t.pm) / 5) * 5)
    return item(`${catKey}_${slug(prod.name)}_${i}`, `${t.adj} ${prod.name}`, price, {
      kind,
      perks,
      note: noteFor(perks),
      tier: i,
    })
  })
}

// ── Product lines per category. `base` is the Basic-tier price; `perks` are the
// Quality-tier (≈1.0) perk magnitudes, scaled per tier. ──
const LINES = {
  Technology: {
    kind: 'item',
    products: [
      { name: 'Headphones', base: 60, perks: { 'needs.fun': 6 } },
      { name: 'Smartwatch', base: 120, perks: { 'meters.health': 5, 'skill:Fitness': 6 } },
      { name: 'Laptop', base: 400, perks: { 'skill:Coding': 14, 'skill:Writing': 8 } },
      { name: 'Desktop Rig', base: 700, perks: { 'skill:Coding': 18 } },
      { name: 'Tablet', base: 250, perks: { 'skill:Creativity': 10 } },
      { name: 'Game Console', base: 300, perks: { 'needs.fun': 14 } },
      { name: 'Camera', base: 350, perks: { 'skill:Creativity': 9, 'meters.creativity': 5 } },
      { name: 'Drone', base: 500, perks: { 'needs.fun': 10, 'skill:Logic': 6 } },
      { name: 'VR Headset', base: 450, perks: { 'needs.fun': 16 } },
      { name: 'E-Reader', base: 90, perks: { 'skill:Writing': 6, 'skill:Logic': 4 } },
      { name: 'Speaker System', base: 200, perks: { 'needs.fun': 8, 'needs.comfort': 4 } },
      { name: 'Smart Home Kit', base: 300, perks: { 'needs.comfort': 8 } },
      { name: 'Mechanical Keyboard', base: 80, perks: { 'skill:Coding': 8 } },
      { name: 'Studio Monitor', base: 260, perks: { 'skill:Music': 10 } },
      { name: 'Graphics Tablet', base: 180, perks: { 'skill:Painting': 12 } },
      { name: 'Microphone', base: 150, perks: { 'skill:Music': 9, 'skill:Charisma': 4 } },
    ],
  },
  Fashion: {
    kind: 'item',
    products: [
      { name: 'Sneakers', base: 70, perks: { 'skill:Charisma': 6 } },
      { name: 'Dress Shoes', base: 120, perks: { 'skill:Charisma': 8, reputation: 2 } },
      { name: 'Jacket', base: 150, perks: { reputation: 3, 'skill:Charisma': 6 } },
      { name: 'Suit', base: 300, perks: { reputation: 6, 'skill:Charisma': 12 } },
      { name: 'Dress', base: 250, perks: { reputation: 5, 'skill:Charisma': 10 } },
      { name: 'Handbag', base: 200, perks: { reputation: 5 } },
      { name: 'Sunglasses', base: 90, perks: { 'skill:Charisma': 5 } },
      { name: 'Wristwatch', base: 400, perks: { reputation: 7 } },
      { name: 'Perfume', base: 80, perks: { 'skill:Charisma': 7 } },
      { name: 'Coat', base: 220, perks: { 'needs.comfort': 5, reputation: 3 } },
      { name: 'Hat', base: 50, perks: { 'skill:Charisma': 4 } },
      { name: 'Scarf', base: 45, perks: { 'needs.comfort': 4 } },
      { name: 'Boots', base: 130, perks: { 'skill:Charisma': 6 } },
      { name: 'Tailored Shirt', base: 90, perks: { 'skill:Charisma': 6, reputation: 2 } },
    ],
  },
  'Home & Comfort': {
    kind: 'item',
    products: [
      { name: 'Armchair', base: 200, perks: { 'needs.comfort': 10 } },
      { name: 'Sofa', base: 400, perks: { 'needs.comfort': 14 } },
      { name: 'Bed', base: 500, perks: { 'needs.comfort': 12, 'needs.energy': 6 } },
      { name: 'Desk', base: 180, perks: { 'skill:Writing': 6, 'needs.comfort': 4 } },
      { name: 'Bookshelf', base: 150, perks: { 'skill:Logic': 5 } },
      { name: 'Rug', base: 120, perks: { 'needs.comfort': 6 } },
      { name: 'Lamp', base: 60, perks: { 'needs.comfort': 4 } },
      { name: 'Coffee Maker', base: 90, perks: { 'needs.energy': 6 } },
      { name: 'Dining Set', base: 350, perks: { 'needs.comfort': 8, 'needs.social': 4 } },
      { name: 'Hot Tub', base: 2000, perks: { 'needs.comfort': 16, stress: -8 } },
      { name: 'Fireplace', base: 1200, perks: { 'needs.comfort': 14 } },
      { name: 'Curtains', base: 80, perks: { 'needs.comfort': 5 } },
      { name: 'Houseplant Set', base: 70, perks: { 'skill:Gardening': 6, 'needs.comfort': 3 } },
      { name: 'Wall Art', base: 140, perks: { 'meters.creativity': 5, reputation: 2 } },
    ],
  },
  'Fitness & Health': {
    kind: 'item',
    products: [
      { name: 'Yoga Mat', base: 40, perks: { 'meters.health': 4, stress: -4 } },
      { name: 'Dumbbell Set', base: 120, perks: { 'skill:Fitness': 10 } },
      { name: 'Treadmill', base: 800, perks: { 'skill:Fitness': 14, 'meters.health': 8 } },
      { name: 'Exercise Bike', base: 500, perks: { 'skill:Fitness': 12, 'meters.health': 6 } },
      { name: 'Home Gym', base: 1500, perks: { 'skill:Fitness': 20, 'meters.health': 10 } },
      { name: 'Running Shoes', base: 90, perks: { 'skill:Fitness': 8 } },
      { name: 'Protein Stack', base: 60, perks: { 'meters.health': 6 } },
      { name: 'Massage Chair', base: 1800, perks: { stress: -10, 'needs.comfort': 10 } },
      { name: 'Bicycle', base: 400, perks: { 'skill:Fitness': 10, 'needs.fun': 6 } },
      { name: 'Boxing Bag', base: 200, perks: { 'skill:Fighting': 10, 'skill:Fitness': 6 } },
      { name: 'Rowing Machine', base: 700, perks: { 'skill:Endurance': 12 } },
      { name: 'Kettlebell', base: 80, perks: { 'skill:Strength': 8 } },
    ],
  },
  'Art & Creativity': {
    kind: 'item',
    products: [
      { name: 'Sketchbook', base: 30, perks: { 'skill:Painting': 5 } },
      { name: 'Paint Set', base: 80, perks: { 'skill:Painting': 10 } },
      { name: 'Easel', base: 150, perks: { 'skill:Painting': 8, 'meters.creativity': 5 } },
      { name: 'Pottery Wheel', base: 400, perks: { 'skill:Painting': 12, 'meters.creativity': 6 } },
      { name: 'Calligraphy Kit', base: 70, perks: { 'skill:Writing': 8 } },
      { name: 'Camera Lens', base: 300, perks: { 'skill:Creativity': 12 } },
      { name: 'Sewing Machine', base: 350, perks: { 'meters.creativity': 8 } },
      { name: 'Sculpting Tools', base: 120, perks: { 'skill:Painting': 9 } },
      { name: 'Digital Pen', base: 100, perks: { 'skill:Painting': 8, 'skill:Creativity': 5 } },
      { name: 'Craft Bench', base: 250, perks: { 'meters.creativity': 9 } },
      { name: 'Photo Studio Kit', base: 600, perks: { 'skill:Creativity': 16 } },
      { name: 'Animation Suite', base: 450, perks: { 'skill:Creativity': 14, 'skill:Coding': 6 } },
    ],
  },
  'Books & Learning': {
    kind: 'item',
    products: [
      { name: 'Novel Collection', base: 50, perks: { 'skill:Writing': 6, 'needs.fun': 4 } },
      { name: 'Logic Puzzle Set', base: 40, perks: { 'skill:Logic': 8 } },
      { name: 'Encyclopedia', base: 120, perks: { 'skill:Logic': 10 } },
      { name: 'Online Course', base: 200, perks: { 'skill:Coding': 12 } },
      { name: 'Language Pack', base: 150, perks: { 'skill:Charisma': 8, 'skill:Logic': 4 } },
      { name: 'Business Guide', base: 90, perks: { 'skill:Business': 10 } },
      { name: 'Strategy Manual', base: 110, perks: { 'skill:Strategy': 10 } },
      { name: 'Writing Masterclass', base: 250, perks: { 'skill:Writing': 14 } },
      { name: 'Memory Workbook', base: 60, perks: { 'skill:Memory': 9 } },
      { name: 'Finance Handbook', base: 130, perks: { 'skill:Finance': 11 } },
      { name: 'Negotiation Course', base: 220, perks: { 'skill:Negotiation': 12 } },
      { name: 'Teaching Toolkit', base: 180, perks: { 'skill:Teaching': 11 } },
    ],
  },
  'Music Gear': {
    kind: 'item',
    products: [
      { name: 'Acoustic Guitar', base: 150, perks: { 'skill:Music': 10 } },
      { name: 'Electric Guitar', base: 400, perks: { 'skill:Music': 14 } },
      { name: 'Keyboard Piano', base: 500, perks: { 'skill:Music': 14 } },
      { name: 'Drum Kit', base: 700, perks: { 'skill:Music': 16, 'needs.fun': 6 } },
      { name: 'Violin', base: 600, perks: { 'skill:Music': 15 } },
      { name: 'DJ Controller', base: 450, perks: { 'skill:Music': 12, 'needs.fun': 8 } },
      { name: 'Synthesizer', base: 800, perks: { 'skill:Music': 16, 'meters.creativity': 6 } },
      { name: 'Audio Interface', base: 250, perks: { 'skill:Music': 9 } },
      { name: 'Looper Pedal', base: 120, perks: { 'skill:Music': 8 } },
      { name: 'Grand Piano', base: 5000, perks: { 'skill:Music': 24, reputation: 6 } },
    ],
  },
  'Kitchen & Cooking': {
    kind: 'item',
    products: [
      { name: 'Chef Knife', base: 60, perks: { 'skill:Cooking': 8 } },
      { name: 'Cookware Set', base: 150, perks: { 'skill:Cooking': 12 } },
      { name: 'Stand Mixer', base: 300, perks: { 'skill:Cooking': 14 } },
      { name: 'Espresso Machine', base: 400, perks: { 'needs.energy': 8, 'needs.comfort': 4 } },
      { name: 'Grill', base: 350, perks: { 'skill:Cooking': 10, 'needs.social': 6 } },
      { name: 'Sous-Vide Kit', base: 200, perks: { 'skill:Cooking': 11 } },
      { name: 'Spice Rack', base: 50, perks: { 'skill:Cooking': 6 } },
      { name: 'Wine Fridge', base: 600, perks: { 'needs.comfort': 6, reputation: 3 } },
      { name: 'Baking Set', base: 90, perks: { 'skill:Cooking': 9 } },
      { name: 'Pizza Oven', base: 700, perks: { 'skill:Cooking': 13, 'needs.social': 6 } },
    ],
  },
  Wellness: {
    kind: 'item',
    products: [
      { name: 'Meditation Cushion', base: 40, perks: { stress: -6, mentalHealth: 5 } },
      { name: 'Aromatherapy Set', base: 50, perks: { stress: -5, 'needs.comfort': 4 } },
      { name: 'Spa Voucher', base: 120, perks: { stress: -10, 'needs.comfort': 8 } },
      { name: 'Sleep Mask Kit', base: 30, perks: { 'needs.energy': 6 } },
      { name: 'Therapy Sessions', base: 300, perks: { mentalHealth: 14, stress: -10 } },
      { name: 'Sauna', base: 2500, perks: { stress: -12, 'meters.health': 8 } },
      { name: 'Journal Set', base: 35, perks: { mentalHealth: 6, 'skill:Writing': 4 } },
      { name: 'Light Therapy Lamp', base: 90, perks: { mentalHealth: 7 } },
      { name: 'Weighted Blanket', base: 110, perks: { 'needs.comfort': 8, stress: -5 } },
      { name: 'Retreat Package', base: 800, perks: { mentalHealth: 16, stress: -14 } },
    ],
  },
  Collectibles: {
    kind: 'item',
    products: [
      { name: 'Trading Cards', base: 60, perks: { reputation: 3, 'needs.fun': 4 } },
      { name: 'Vinyl Records', base: 120, perks: { 'needs.fun': 6, reputation: 3 } },
      { name: 'Antique Vase', base: 400, perks: { reputation: 6 } },
      { name: 'Rare Coin', base: 300, perks: { reputation: 5 } },
      { name: 'Painting Print', base: 200, perks: { reputation: 4, 'meters.creativity': 4 } },
      { name: 'Action Figures', base: 80, perks: { 'needs.fun': 6 } },
      { name: 'Fine Wine Bottle', base: 250, perks: { reputation: 5 } },
      { name: 'Sports Memorabilia', base: 350, perks: { reputation: 6, 'needs.fun': 4 } },
      { name: 'Stamp Album', base: 90, perks: { reputation: 3 } },
      { name: 'Sculpture', base: 600, perks: { reputation: 8, 'meters.creativity': 5 } },
      { name: 'Vintage Watch', base: 1500, perks: { reputation: 10 } },
      { name: 'Art Original', base: 3000, perks: { reputation: 14, 'meters.creativity': 8 } },
    ],
  },
}

// Gifts ladder: cheap tokens up to lavish presents; gift value scales by tier.
const GIFT_LINES = [
  { name: 'Chocolates', base: 20, gift: 0.5 },
  { name: 'Flowers', base: 30, gift: 0.6 },
  { name: 'Greeting Card', base: 10, gift: 0.3 },
  { name: 'Scented Candle', base: 35, gift: 0.6 },
  { name: 'Wine Bottle', base: 60, gift: 0.8 },
  { name: 'Perfume', base: 120, gift: 1.0 },
  { name: 'Jewelry', base: 400, gift: 1.4 },
  { name: 'Watch', base: 800, gift: 1.7 },
  { name: 'Handbag', base: 600, gift: 1.5 },
  { name: 'Gadget', base: 300, gift: 1.2 },
  { name: 'Plush Toy', base: 25, gift: 0.5 },
  { name: 'Gift Basket', base: 80, gift: 0.9 },
]
const GIFT_TIERS = [
  { adj: 'Simple', pm: 1, gm: 1 },
  { adj: 'Nice', pm: 2.5, gm: 1.4 },
  { adj: 'Fine', pm: 6, gm: 1.9 },
  { adj: 'Lavish', pm: 16, gm: 2.5 },
]
function giftLadder(g) {
  return GIFT_TIERS.map((t, i) =>
    item(`gift_${slug(g.name)}_${i}`, `${t.adj} ${g.name}`, Math.max(5, Math.round((g.base * t.pm) / 5) * 5), {
      kind: 'gift',
      gift: Math.round(g.gift * t.gm * 10) / 10,
    }),
  )
}

// Real estate & vehicles: explicit ladders (these are owned, not consumable).
const REAL_ESTATE = [
  item('re_room', 'Rented Room', 8000, { kind: 'property', perks: { 'needs.comfort': 6 }, note: '+Comfort' }),
  item('re_studio', 'Studio Apartment', 45000, { kind: 'property', perks: { 'needs.comfort': 12 }, note: '+Comfort' }),
  item('re_condo', 'City Condo', 120000, { kind: 'property', perks: { 'needs.comfort': 16, reputation: 4 }, note: '+Comfort, +Rep' }),
  item('re_house', 'Suburban House', 220000, { kind: 'property', perks: { 'needs.comfort': 20, reputation: 6 }, note: '+Comfort, +Rep' }),
  item('re_townhouse', 'Townhouse', 420000, { kind: 'property', perks: { 'needs.comfort': 24, reputation: 8 }, note: '+Status' }),
  item('re_villa', 'Coastal Villa', 950000, { kind: 'property', perks: { 'needs.comfort': 28, reputation: 10, stress: -6 }, note: '+Status' }),
  item('re_mansion', 'Hillside Mansion', 1800000, { kind: 'property', perks: { 'needs.comfort': 30, reputation: 14 }, note: '+Status' }),
  item('re_estate', 'Country Estate', 4500000, { kind: 'property', perks: { 'needs.comfort': 34, reputation: 18, stress: -8 }, note: '+Prestige' }),
  item('re_penthouse', 'Sky Penthouse', 7500000, { kind: 'property', perks: { 'needs.comfort': 36, reputation: 22 }, note: '+Prestige' }),
]
const VEHICLES = [
  item('v_bike', 'Bicycle', 600, { kind: 'vehicle', perks: { 'skill:Fitness': 8, 'needs.fun': 4 }, note: '+Fitness' }),
  item('v_scooter', 'Scooter', 2500, { kind: 'vehicle', perks: { 'needs.fun': 6 }, note: '+Fun' }),
  item('v_moto', 'Motorcycle', 9000, { kind: 'vehicle', perks: { 'needs.fun': 10, reputation: 3 }, note: '+Fun' }),
  item('v_economy', 'Economy Car', 18000, { kind: 'vehicle', perks: { 'needs.comfort': 6 }, note: '+Comfort' }),
  item('v_suv', 'Family SUV', 38000, { kind: 'vehicle', perks: { 'needs.comfort': 10, 'needs.social': 4 }, note: '+Comfort' }),
  item('v_luxury', 'Luxury Sedan', 75000, { kind: 'vehicle', perks: { reputation: 8, 'skill:Charisma': 20 }, note: '+Rep' }),
  item('v_sports', 'Sports Car', 160000, { kind: 'vehicle', perks: { reputation: 12, 'needs.fun': 12 }, note: '+Status' }),
  item('v_super', 'Supercar', 450000, { kind: 'vehicle', perks: { reputation: 18, 'needs.fun': 16 }, note: '+Prestige' }),
  item('v_yacht', 'Yacht', 2200000, { kind: 'vehicle', perks: { reputation: 24, 'needs.comfort': 14, stress: -8 }, note: '+Prestige' }),
]

// Assemble the catalog, sorting each consumable category cheapest-first so the
// grind ladder reads top-to-bottom.
function buildShop() {
  const out = {}
  for (const [catKey, def] of Object.entries(LINES)) {
    const items = def.products.flatMap((p) => ladder(catKey, def.kind, p))
    items.sort((a, b) => a.price - b.price)
    out[catKey] = items
  }
  out.Gifts = GIFT_LINES.flatMap(giftLadder).sort((a, b) => a.price - b.price)
  out['Real Estate'] = REAL_ESTATE
  out.Vehicles = VEHICLES

  // Fixed anchor item: the Smartphone unlocks the in-game Phone.
  out.Technology = [
    item('t_phone', 'Smartphone', 900, { kind: 'item', perks: {}, note: 'Unlocks Phone', phone: true }),
    ...out.Technology,
  ]
  return out
}

export const SHOP = buildShop()

export const ALL_SHOP_ITEMS = Object.values(SHOP).flat()
export const SHOP_ITEM_COUNT = ALL_SHOP_ITEMS.length
export const findItem = (id) => ALL_SHOP_ITEMS.find((i) => i.id === id) || null
