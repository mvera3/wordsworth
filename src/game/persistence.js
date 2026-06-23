// Persistence adapter. Defaults to an in-memory store so the app runs cleanly in
// sandboxed previews. localStorage is used only when actually available and
// writable (probe-tested), so it transparently upgrades outside the sandbox.

const KEY = 'wordsworth.save.v1'

let memoryStore = null

function storageAvailable() {
  try {
    const k = '__ww_probe__'
    window.localStorage.setItem(k, '1')
    window.localStorage.removeItem(k)
    return true
  } catch {
    return false
  }
}

const useLS = typeof window !== 'undefined' && storageAvailable()

export const persistenceMode = useLS ? 'localStorage' : 'in-memory'

export function saveGame(state) {
  const payload = JSON.stringify({ savedAt: Date.now(), state })
  if (useLS) {
    try {
      window.localStorage.setItem(KEY, payload)
      return true
    } catch {
      memoryStore = payload
      return true
    }
  }
  memoryStore = payload
  return true
}

export function loadGame() {
  try {
    const raw = useLS ? window.localStorage.getItem(KEY) : memoryStore
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed.state ?? null
  } catch {
    return null
  }
}

export function hasSave() {
  if (useLS) {
    try {
      return !!window.localStorage.getItem(KEY)
    } catch {
      return !!memoryStore
    }
  }
  return !!memoryStore
}

export function clearSave() {
  if (useLS) {
    try {
      window.localStorage.removeItem(KEY)
    } catch {
      /* ignore */
    }
  }
  memoryStore = null
}
