<script setup>
import { computed } from 'vue'
import { RefreshCw } from 'lucide-vue-next'

const props = defineProps({
  health: { type: Object, required: true },
})

const emit = defineEmits(['refresh'])

const CONNECTION_META = {
  connected: { label: 'Connected', badgeClass: 'bg-green-100 text-green-700' },
  degraded: { label: 'Degraded', badgeClass: 'bg-amber-100 text-amber-700' },
  down: { label: 'Down', badgeClass: 'bg-red-100 text-red-700' },
}

const connectionMeta = computed(() => CONNECTION_META[props.health.erpnextConnection])
const lastSyncLabel = computed(() => new Date(props.health.lastSyncAt).toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' }))
</script>

<template>
  <div class="rounded-lg border border-gray-200 bg-white p-5">
    <div class="flex items-center justify-between gap-3">
      <p class="text-xs text-gray-500">ERPNext integration status</p>
      <button
        type="button"
        class="flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
        @click="emit('refresh')"
      >
        <RefreshCw class="h-3.5 w-3.5" />
        Check Now
      </button>
    </div>

    <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-md border border-gray-200 p-4">
        <p class="text-xs font-medium text-gray-500">Connection</p>
        <span class="mt-2 inline-block rounded px-2 py-0.5 text-xs font-medium" :class="connectionMeta.badgeClass">
          {{ connectionMeta.label }}
        </span>
      </div>
      <div class="rounded-md border border-gray-200 p-4">
        <p class="text-xs font-medium text-gray-500">Last Sync</p>
        <p class="mt-2 text-sm font-semibold text-gray-900">{{ lastSyncLabel }}</p>
      </div>
      <div class="rounded-md border border-gray-200 p-4">
        <p class="text-xs font-medium text-gray-500">Sync Queue Depth</p>
        <p class="mt-2 text-sm font-semibold text-gray-900">{{ health.syncQueueDepth }}</p>
      </div>
      <div class="rounded-md border border-gray-200 p-4">
        <p class="text-xs font-medium text-gray-500">API Latency</p>
        <p class="mt-2 text-sm font-semibold text-gray-900">{{ health.apiLatencyMs }}ms</p>
      </div>
    </div>

    <div class="mt-4">
      <p class="text-xs font-medium text-gray-500">Recent Errors</p>
      <div v-if="!health.recentErrors.length" class="mt-2 rounded-md border border-dashed border-gray-200 p-4 text-center text-sm text-gray-500">
        No sync errors reported.
      </div>
      <ul v-else class="mt-2 flex flex-col gap-2">
        <li v-for="(err, i) in health.recentErrors" :key="i" class="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
          {{ err }}
        </li>
      </ul>
    </div>
  </div>
</template>
