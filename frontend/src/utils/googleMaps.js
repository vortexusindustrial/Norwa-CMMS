import { setOptions, importLibrary } from '@googlemaps/js-api-loader'

export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
export const googleMapsApiKeyConfigured = Boolean(GOOGLE_MAPS_API_KEY)

// Module-level singleton shared by every consumer (map view, location
// autocomplete, ...): setOptions() throws if called again after a library
// has already started loading, so it must only ever run once per page,
// not once per component.
let optionsSet = false
const libraryPromises = {}

export function loadGoogleMapsLibrary(name) {
  if (!optionsSet) {
    setOptions({ key: GOOGLE_MAPS_API_KEY, v: 'weekly' })
    optionsSet = true
  }
  if (!libraryPromises[name]) {
    libraryPromises[name] = importLibrary(name)
  }
  return libraryPromises[name]
}
