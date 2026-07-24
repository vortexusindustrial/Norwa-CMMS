<script setup>
import WorkOrderListItem from './WorkOrderListItem.vue'

defineProps({
  workOrders: { type: Array, required: true },
  selectedId: { type: String, default: null },
})

defineEmits(['select'])
</script>

<template>
  <div>
    <div v-if="!workOrders.length" class="rounded-lg border border-gray-200 bg-white p-5 text-center text-sm text-gray-500">
      No work orders match.
    </div>
    <ul v-else class="flex flex-col gap-3">
      <WorkOrderListItem
        v-for="wo in workOrders"
        :key="wo.id"
        :work-order="wo"
        :selected="wo.id === selectedId"
        @click="$emit('select', wo.id)"
      />
    </ul>
  </div>
</template>
