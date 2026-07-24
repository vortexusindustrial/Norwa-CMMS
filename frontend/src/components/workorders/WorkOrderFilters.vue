<script setup>
import { ref, computed, watch } from 'vue'
import { Search, X } from 'lucide-vue-next'
import { locations } from '../../data/assets'
import { WORK_ORDER_STATUSES, WORK_ORDER_STATUS_META, PRIORITIES, PRIORITY_META, TECHNICIANS } from '../../data/workOrders'

const emit = defineEmits(['change'])

const search = ref('')
const technicianId = ref('')
const status = ref('')
const priority = ref('')
const site = ref('')
const dateFrom = ref('')
const dateTo = ref('')

const siteOptions = computed(() => locations.filter((l) => l.type === 'site'))

const hasActiveFilters = computed(
  () => !!(search.value || technicianId.value || status.value || priority.value || site.value || dateFrom.value || dateTo.value)
)

function clear() {
  search.value = ''
  technicianId.value = ''
  status.value = ''
  priority.value = ''
  site.value = ''
  dateFrom.value = ''
  dateTo.value = ''
}

watch(
  [search, technicianId, status, priority, site, dateFrom, dateTo],
  () => {
    emit('change', {
      search: search.value.trim().toLowerCase(),
      technicianId: technicianId.value,
      status: status.value,
      priority: priority.value,
      site: site.value,
      dateFrom: dateFrom.value,
      dateTo: dateTo.value,
    })
  },
  { immediate: true }
)
</script>

<template>
  <div class="rounded-lg border border-gray-200 bg-white p-3">
    <div class="relative">
      <Search class="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
      <input
        v-model="search"
        type="text"
        placeholder="Search by title or work order ID..."
        class="w-full rounded-md border border-gray-300 py-1.5 pl-8 pr-3 text-sm focus:border-gray-500 focus:outline-none"
      />
    </div>

    <div class="mt-2 flex flex-wrap items-center gap-2">
      <select v-model="technicianId" class="rounded-md border border-gray-300 py-1.5 pl-2 pr-8 text-sm focus:border-gray-500 focus:outline-none">
        <option value="">All Technicians</option>
        <option v-for="tech in TECHNICIANS" :key="tech.id" :value="tech.id">{{ tech.name }}</option>
      </select>

      <select v-model="site" class="rounded-md border border-gray-300 py-1.5 pl-2 pr-8 text-sm focus:border-gray-500 focus:outline-none">
        <option value="">All Locations</option>
        <option v-for="loc in siteOptions" :key="loc.id" :value="loc.id">{{ loc.name }}</option>
      </select>

      <select v-model="status" class="rounded-md border border-gray-300 py-1.5 pl-2 pr-8 text-sm focus:border-gray-500 focus:outline-none">
        <option value="">All Statuses</option>
        <option v-for="s in WORK_ORDER_STATUSES" :key="s" :value="s">{{ WORK_ORDER_STATUS_META[s].label }}</option>
      </select>

      <select v-model="priority" class="rounded-md border border-gray-300 py-1.5 pl-2 pr-8 text-sm focus:border-gray-500 focus:outline-none">
        <option value="">All Priorities</option>
        <option v-for="p in PRIORITIES" :key="p" :value="p">{{ PRIORITY_META[p].label }}</option>
      </select>

      <div class="flex items-center gap-1.5">
        <input v-model="dateFrom" type="date" class="rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-700 focus:border-gray-500 focus:outline-none" />
        <span class="text-xs text-gray-400">to</span>
        <input v-model="dateTo" type="date" class="rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-700 focus:border-gray-500 focus:outline-none" />
      </div>

      <button
        v-if="hasActiveFilters"
        type="button"
        class="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900"
        @click="clear"
      >
        <X class="h-3.5 w-3.5" />
        Clear
      </button>
    </div>
  </div>
</template>
