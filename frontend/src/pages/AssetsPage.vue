<script setup>
import { ref, computed } from 'vue'
import { Network, MapPin, Boxes, CircleCheck, AlertTriangle, OctagonAlert } from 'lucide-vue-next'
import { CURRENT_TECHNICIAN_ID, CURRENT_TEAM } from '../data/workOrders'
import { useWorkOrdersStore } from '../stores/workOrders'
import { assets, rootAssets, connectedAssetSet } from '../data/assets'
import AssetTree from '../components/assets/AssetTree.vue'
import AssetDetailPanel from '../components/assets/AssetDetailPanel.vue'
import LocationRegistry from '../components/assets/LocationRegistry.vue'
import { usePermissions } from '../composables/usePermissions'

const woStore = useWorkOrdersStore()
const { accessLevel } = usePermissions();

// 'full' sees every asset. 'scoped' (supervisor) is restricted to assets
// tied to their team's work orders; 'view' (technician) to their own —
// same full/scoped/view distinction StoreProcurementPage uses for stock
// scope. Null means unrestricted.
const assetsLevel = computed(() => accessLevel('assets'))
const scopedAssetIds = computed(() => {
  if (assetsLevel.value === 'full') return null
  const relevantWorkOrders =
    assetsLevel.value === 'scoped'
      ? woStore.workOrders.filter((wo) => wo.team === CURRENT_TEAM)
      : woStore.workOrders.filter((wo) => wo.technicianId === CURRENT_TECHNICIAN_ID)
  return connectedAssetSet(relevantWorkOrders.map((wo) => wo.assetId).filter(Boolean))
})
const scopedAssets = computed(() => (scopedAssetIds.value ? assets.filter((asset) => scopedAssetIds.value.has(asset.id)) : assets))

const viewMode = ref('hierarchy') // 'hierarchy' | 'locations'
const initialRoots = scopedAssetIds.value ? rootAssets().filter((asset) => scopedAssetIds.value.has(asset.id)) : rootAssets()
const selectedAssetId = ref(initialRoots[0]?.id ?? scopedAssets.value[0]?.id ?? null)

const selectedAsset = computed(() => assets.find((asset) => asset.id === selectedAssetId.value) ?? null)

const subtitle = computed(() => {
  if (assetsLevel.value === 'scoped') return `Asset hierarchy and location registry for ${CURRENT_TEAM}.`
  if (assetsLevel.value === 'view') return 'Assets tied to your assigned work orders.'
  return 'Asset hierarchy, location registry, and live health telemetry across every site.'
})
const stats = computed(() => [
  { label: 'Total Assets', value: scopedAssets.value.length, icon: Boxes, accent: 'border-l-gray-400' },
  {
    label: 'Operational',
    value: scopedAssets.value.filter((a) => a.status === 'operational').length,
    icon: CircleCheck,
    accent: 'border-l-green-500',
  },
  {
    label: 'Needs Attention',
    value: scopedAssets.value.filter((a) => a.status === 'under_maintenance' || a.status === 'fault').length,
    icon: AlertTriangle,
    accent: 'border-l-amber-500',
  },
  {
    label: 'Critical Alerts',
    value: scopedAssets.value.filter((a) => a.health.status === 'critical').length,
    icon: OctagonAlert,
    accent: 'border-l-red-500',
  },
])

// Location Registry (below) lists assets by physical site regardless of
// scope, so a scoped user's only route to an out-of-scope asset is through
// it — guard here rather than teaching that component about asset scope too.
function inScope(id) {
  return !scopedAssetIds.value || scopedAssetIds.value.has(id)
}

function selectAsset(id) {
  if (!inScope(id)) return
  selectedAssetId.value = id
}

function handleSelectFromLocation(id) {
  if (!inScope(id)) return
  selectedAssetId.value = id
  viewMode.value = 'hierarchy'
}
</script>

<template>
  <div>
    <div class="flex items-start justify-between gap-4">
      <div>
        <h2 class="text-lg font-semibold text-gray-900">Assets & Locations</h2>
        <p class="mt-1 text-sm text-gray-500">
          {{ subtitle }}
        </p>
      </div>

      <div class="flex shrink-0 items-center gap-1 rounded-md border border-gray-200 p-1">
        <button
          type="button"
          class="flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium"
          :class="viewMode === 'hierarchy' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-50'"
          @click="viewMode = 'hierarchy'"
        >
          <Network class="h-3.5 w-3.5" />
          Hierarchy
        </button>
        <button
          type="button"
          class="flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium"
          :class="viewMode === 'locations' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-50'"
          @click="viewMode = 'locations'"
        >
          <MapPin class="h-3.5 w-3.5" />
          Locations
        </button>
      </div>
    </div>

    <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="stat in stats"
        :key="stat.label"
        :class="stat.accent"
        class="rounded-lg border border-gray-200 border-l-4 bg-white p-4"
      >
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-gray-600">{{ stat.label }}</span>
          <component :is="stat.icon" class="h-4 w-4 text-gray-400" />
        </div>
        <p class="mt-3 text-2xl font-semibold text-gray-900">{{ stat.value }}</p>
      </div>
    </div>

    <div v-show="viewMode === 'hierarchy'" class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div class="lg:col-span-1">
        <AssetTree :selected-id="selectedAssetId" :scoped-ids="scopedAssetIds" @select="selectAsset" />
      </div>
      <div class="lg:col-span-2">
        <AssetDetailPanel :asset="selectedAsset" :scoped-ids="scopedAssetIds" @select-asset="selectAsset" />
      </div>
    </div>

    <div v-show="viewMode === 'locations'" class="mt-6">
      <LocationRegistry @select-asset="handleSelectFromLocation" />
    </div>
  </div>
</template>
