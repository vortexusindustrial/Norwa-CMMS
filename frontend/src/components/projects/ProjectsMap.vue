<script setup>
import { ref, watch, nextTick, onBeforeUnmount } from 'vue'
import { MapPinOff, TriangleAlert } from 'lucide-vue-next'
import { loadGoogleMapsLibrary, googleMapsApiKeyConfigured } from '../../utils/googleMaps'
import { PROJECT_STATUSES, PROJECT_STATUS_META } from '../../data/projects'

const props = defineProps({
  projects: { type: Array, required: true },
  active: { type: Boolean, default: false },
})

const emit = defineEmits(['select-project'])

const mapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID'
const apiKeyConfigured = googleMapsApiKeyConfigured

const mapContainer = ref(null)
const mapInitialized = ref(false)
const loadError = ref(null) // null | 'load-failed'

let map = null
let markers = []
let infoWindow = null
let MapCtor = null
let InfoWindowCtor = null
let AdvancedMarkerElementCtor = null
let PinElementCtor = null
let LatLngBoundsCtor = null
let mapsEvent = null

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]
  )
}

function buildInfoWindowHtml(project, meta) {
  return `
    <div style="font-family: inherit; padding: 4px; min-width: 200px;">
      <p style="font-weight: 600; font-size: 13px; color: #111827; margin: 0 0 4px;">${escapeHtml(project.name)}</p>
      <p style="font-size: 12px; color: #6b7280; margin: 0 0 2px;">${escapeHtml(project.client.name)}</p>
      <p style="font-size: 12px; color: #6b7280; margin: 0 0 8px;">${escapeHtml(project.site.address)}</p>
      <span style="font-size: 11px; font-weight: 500; padding: 2px 8px; border-radius: 9999px; background: ${meta.markerColor}22; color: ${meta.markerColor};">
        ${escapeHtml(meta.label)}
      </span>
      <br/>
      <button id="iw-jump-${project.id}" style="margin-top:8px; font-size:12px; font-weight:500; color:#111827; text-decoration:underline; background:none; border:none; padding:0; cursor:pointer;">
        View full details
      </button>
    </div>
  `
}

function destroyMarkers() {
  markers.forEach((marker) => {
    marker.map = null
  })
  markers = []
}

function renderMarkers() {
  destroyMarkers()
  props.projects.forEach((project) => {
    const meta = PROJECT_STATUS_META[project.status]
    const pin = new PinElementCtor({
      background: meta.markerColor,
      borderColor: '#111827',
      glyphColor: '#ffffff',
    })
    const marker = new AdvancedMarkerElementCtor({
      map,
      position: { lat: project.site.lat, lng: project.site.lng },
      content: pin.element,
      title: project.name,
    })
    marker.addListener('click', () => {
      infoWindow.setContent(buildInfoWindowHtml(project, meta))
      infoWindow.open({ map, anchor: marker })
      mapsEvent.addListenerOnce(infoWindow, 'domready', () => {
        document.getElementById(`iw-jump-${project.id}`)?.addEventListener('click', () => {
          emit('select-project', project.id)
        })
      })
    })
    markers.push(marker)
  })
}

function fitBoundsToMarkers() {
  if (!markers.length) return
  const bounds = new LatLngBoundsCtor()
  markers.forEach((marker) => bounds.extend(marker.position))
  map.fitBounds(bounds, 48)
  mapsEvent.addListenerOnce(map, 'bounds_changed', () => {
    if (map.getZoom() > 15) map.setZoom(15)
  })
}

async function initMap() {
  if (!apiKeyConfigured || mapInitialized.value) return
  loadError.value = null
  try {
    const [mapsLib, markerLib, coreLib] = await Promise.all([
      loadGoogleMapsLibrary('maps'),
      loadGoogleMapsLibrary('marker'),
      loadGoogleMapsLibrary('core'),
    ])
    MapCtor = mapsLib.Map
    InfoWindowCtor = mapsLib.InfoWindow
    AdvancedMarkerElementCtor = markerLib.AdvancedMarkerElement
    PinElementCtor = markerLib.PinElement
    LatLngBoundsCtor = coreLib.LatLngBounds
    mapsEvent = coreLib.event

    await nextTick()
    map = new MapCtor(mapContainer.value, {
      mapId,
      center: { lat: -1.286389, lng: 36.817223 },
      zoom: 11,
    })
    infoWindow = new InfoWindowCtor()
    renderMarkers()
    fitBoundsToMarkers()
    mapInitialized.value = true
  } catch (err) {
    loadError.value = 'load-failed'
  }
}

watch(
  () => props.active,
  (isActive) => {
    if (!isActive) return
    if (!mapInitialized.value) {
      initMap()
    } else if (map) {
      mapsEvent.trigger(map, 'resize')
    }
  },
  { immediate: true }
)

watch(
  () => props.projects,
  () => {
    if (!mapInitialized.value) return
    renderMarkers()
    fitBoundsToMarkers()
  },
  { deep: true }
)

onBeforeUnmount(() => {
  destroyMarkers()
  infoWindow?.close()
  infoWindow = null
})
</script>

<template>
  <div class="rounded-lg border border-gray-200 bg-white p-4">
    <div v-if="!apiKeyConfigured" class="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <MapPinOff class="h-8 w-8 text-gray-300" />
      <p class="text-sm font-medium text-gray-900">Map view isn't configured yet</p>
      <p class="max-w-sm text-xs text-gray-500">
        Add a Google Maps API key to VITE_GOOGLE_MAPS_API_KEY in your .env file to enable the map view.
      </p>
    </div>

    <div v-else-if="loadError" class="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <TriangleAlert class="h-8 w-8 text-amber-500" />
      <p class="text-sm font-medium text-gray-900">Couldn't load Google Maps</p>
      <p class="text-xs text-gray-500">Check your API key and network connection, then retry.</p>
      <button
        type="button"
        class="mt-2 rounded-md border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
        @click="initMap"
      >
        Retry
      </button>
    </div>

    <template v-else>
      <div ref="mapContainer" class="h-[520px] w-full rounded-md" />
      <div class="mt-3 flex items-center gap-4 text-xs text-gray-500">
        <span v-for="key in PROJECT_STATUSES" :key="key" class="flex items-center gap-1.5">
          <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: PROJECT_STATUS_META[key].markerColor }" />
          {{ PROJECT_STATUS_META[key].label }}
        </span>
      </div>
    </template>
  </div>
</template>
