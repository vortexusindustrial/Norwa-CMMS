<script setup>
import { computed } from 'vue'
import { PO_STATUS_META } from '../../data/procurement'

const props = defineProps({
  purchaseOrders: { type: Array, required: true },
  requests: { type: Array, required: true },
  editable: { type: Boolean, default: false },
})

const emit = defineEmits(['update-status'])

const NEXT_STATUS = {
  draft: 'sent',
  sent: 'acknowledged',
  acknowledged: 'partially_received',
  partially_received: 'received',
}

const sorted = computed(() => [...props.purchaseOrders].sort((a, b) => (a.poDate < b.poDate ? 1 : -1)))

function itemsFor(po) {
  return props.requests.filter((pr) => po.requestIds.includes(pr.id))
}

function nextStatusLabel(status) {
  const next = NEXT_STATUS[status]
  return next ? PO_STATUS_META[next].label : null
}
</script>

<template>
  <div class="rounded-lg border border-gray-200 bg-white p-5">
    <p class="text-xs text-gray-500">{{ purchaseOrders.length }} purchase orders &middot; status tracking only, no vendor record management</p>

    <div v-if="!sorted.length" class="mt-4 rounded-md border border-dashed border-gray-200 p-4 text-center text-sm text-gray-500">
      No purchase orders raised yet.
    </div>
    <ul v-else class="mt-4 flex flex-col gap-3">
      <li v-for="po in sorted" :key="po.id" class="rounded-md border border-gray-200 p-4">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-sm font-medium text-gray-900">{{ po.id }} &middot; {{ po.vendorName }}</p>
            <p class="mt-0.5 text-xs text-gray-500">
              Raised {{ po.poDate }}<span v-if="po.expectedDate"> &middot; Expected {{ po.expectedDate }}</span>
            </p>
          </div>
          <span class="shrink-0 rounded px-2 py-0.5 text-xs font-medium" :class="PO_STATUS_META[po.status].badgeClass">
            {{ PO_STATUS_META[po.status].label }}
          </span>
        </div>

        <ul class="mt-3 flex flex-col gap-1">
          <li v-for="item in itemsFor(po)" :key="item.id" class="text-xs text-gray-600">
            {{ item.qtyRequested }}&times; {{ item.partNumber }} — {{ item.description }}
          </li>
        </ul>

        <div v-if="editable && nextStatusLabel(po.status)" class="mt-3 flex justify-end gap-1.5">
          <button
            type="button"
            class="rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
            @click="emit('update-status', po.id, 'cancelled')"
          >
            Cancel
          </button>
          <button
            type="button"
            class="rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white hover:bg-gray-800"
            @click="emit('update-status', po.id, NEXT_STATUS[po.status])"
          >
            Mark {{ nextStatusLabel(po.status) }}
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>
