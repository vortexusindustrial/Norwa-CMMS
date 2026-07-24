<script setup>
import { ref, computed } from 'vue'
import { Search, ExternalLink, CircleCheck, AlertTriangle, OctagonAlert, HelpCircle } from 'lucide-vue-next'
import { stockCatalog, stockStatusFor, erpnextMaterialRequestUrl } from '../../data/stock'

const props = defineProps({
  materials: { type: Array, default: () => [] }, 
  projectId: { type: String, default: null },
  workOrderId: { type: String, default: null },
})

const STATUS_META = {
  ok: { label: 'In Stock', icon: CircleCheck, badgeClass: 'bg-green-100 text-green-700' },
  low: { label: 'Low Stock', icon: AlertTriangle, badgeClass: 'bg-amber-100 text-amber-700' },
  out: { label: 'Out of Stock', icon: OctagonAlert, badgeClass: 'bg-red-100 text-red-700' },
  untracked: { label: 'Not Stock-Tracked', icon: HelpCircle, badgeClass: 'bg-gray-100 text-gray-500' },
}

// Live availability for every part already tied to this job, so a
// technician can see at a glance whether what they logged (or plan to use)
// is actually on hand — without leaving the work order for the full
// Store & Procurement page they don't have access to.
const jobRows = computed(() =>
  props.materials.map((item) => ({
    partNumber: item.partNumber,
    description: item.description,
    qtyNeeded: item.qtyUsed,
    status: stockStatusFor(item.partNumber),
    onHand: stockCatalog[item.partNumber]?.onHand ?? null,
  }))
)

// Ad-hoc lookup for a part not yet logged against this job — e.g. checking
// before heading out whether a spare is available.
const search = ref('')
const searchResult = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term) return null
  const partNumber = Object.keys(stockCatalog).find((code) => code.toLowerCase() === term)
  if (!partNumber) return { partNumber: search.value.trim(), notFound: true }
  return { partNumber, description: stockCatalog[partNumber].description, status: stockStatusFor(partNumber), onHand: stockCatalog[partNumber].onHand }
})

function requestUrl(partNumber, qtyNeeded = 1) {
  return erpnextMaterialRequestUrl({ partNumber, qtyNeeded, projectId: props.projectId, workOrderId: props.workOrderId })
}
</script>

<template>
  <div>
    <div v-if="!jobRows.length" class="rounded-md border border-dashed border-gray-200 p-4 text-center text-sm text-gray-500">
      No materials logged for this job yet.
    </div>
    <ul v-else class="flex flex-col gap-1.5">
      <li
        v-for="row in jobRows"
        :key="row.partNumber"
        class="flex items-center justify-between gap-3 rounded-md border border-gray-200 px-3 py-2"
      >
        <div class="min-w-0">
          <p class="truncate text-sm font-medium text-gray-900">{{ row.partNumber }}</p>
          <p class="truncate text-xs text-gray-500">{{ row.description }}</p>
        </div>
        <div class="flex shrink-0 items-center gap-2">
          <span class="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium" :class="STATUS_META[row.status].badgeClass">
            <component :is="STATUS_META[row.status].icon" class="h-3 w-3" />
            {{ STATUS_META[row.status].label }}{{ row.onHand !== null ? ` (${row.onHand})` : '' }}
          </span>
          <a
            v-if="row.status !== 'ok'"
            :href="requestUrl(row.partNumber, row.qtyNeeded)"
            target="_blank"
            rel="noopener"
            class="flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            <ExternalLink class="h-3 w-3" />
            Request
          </a>
        </div>
      </li>
    </ul>

    <div class="mt-3 border-t border-gray-100 pt-3">
      <p class="text-xs font-medium uppercase tracking-wide text-gray-500">Check Another Part</p>
      <div class="relative mt-1.5">
        <Search class="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
        <input
          v-model="search"
          type="text"
          placeholder="Enter a part number..."
          class="w-full rounded-md border border-gray-300 py-1.5 pl-8 pr-3 text-sm focus:border-gray-500 focus:outline-none"
        />
      </div>
      <div v-if="searchResult" class="mt-2 flex items-center justify-between gap-3 rounded-md border border-gray-200 px-3 py-2">
        <template v-if="searchResult.notFound">
          <p class="text-sm text-gray-500">No catalog match for "{{ searchResult.partNumber }}".</p>
          <a
            :href="requestUrl(searchResult.partNumber)"
            target="_blank"
            rel="noopener"
            class="flex shrink-0 items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            <ExternalLink class="h-3 w-3" />
            Request
          </a>
        </template>
        <template v-else>
          <div class="min-w-0">
            <p class="truncate text-sm font-medium text-gray-900">{{ searchResult.partNumber }}</p>
            <p class="truncate text-xs text-gray-500">{{ searchResult.description }}</p>
          </div>
          <div class="flex shrink-0 items-center gap-2">
            <span class="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium" :class="STATUS_META[searchResult.status].badgeClass">
              <component :is="STATUS_META[searchResult.status].icon" class="h-3 w-3" />
              {{ STATUS_META[searchResult.status].label }} ({{ searchResult.onHand }})
            </span>
            <a
              v-if="searchResult.status !== 'ok'"
              :href="requestUrl(searchResult.partNumber)"
              target="_blank"
              rel="noopener"
              class="flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              <ExternalLink class="h-3 w-3" />
              Request
            </a>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
