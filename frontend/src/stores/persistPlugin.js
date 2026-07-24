const STORAGE_PREFIX = 'norwa-cmms:'

// There's no backend yet (see stores/workOrders.js, stores/auth.js) — every
// store is just an in-memory ref seeded from data/*.js, so a reload or
// re-login used to silently reset every timer, checklist, LOTO record, and
// purchase request back to the seed data. Opt a store into surviving that by
// passing `{ persist: true }` as defineStore's third argument; this plugin
// rehydrates it from localStorage on creation and re-saves on every mutation.
export function persistPlugin({ store, options }) {
  if (!options.persist) return

  const key = `${STORAGE_PREFIX}${store.$id}`
  const saved = localStorage.getItem(key)
  if (saved) {
    try {
      store.$patch(JSON.parse(saved))
    } catch {
      // Corrupt or stale-shape entry (e.g. from an older field layout) —
      // fall back to the seed data that's already loaded.
    }
  }

  store.$subscribe((_mutation, state) => {
    localStorage.setItem(key, JSON.stringify(state))
  })
}
