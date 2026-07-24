<script setup>
import { computed } from 'vue'
import { projects } from '../../data/projects'
import { WORK_ORDER_STATUS_META, PRIORITY_META, technicianById, siteFor } from '../../data/workOrders'

const props = defineProps({
  workOrder: { type: Object, required: true },
  selected: { type: Boolean, default: false },
})

defineEmits(['click'])

const statusMeta = computed(() => WORK_ORDER_STATUS_META[props.workOrder.status])
const priorityMeta = computed(() => PRIORITY_META[props.workOrder.priority])
const project = computed(() => projects.find((p) => p.id === props.workOrder.projectId) ?? null)
const technician = computed(() => technicianById(props.workOrder.technicianId))
const site = computed(() => siteFor(props.workOrder))
</script>

<template>
  <li
    class="cursor-pointer rounded-lg border bg-white p-4 transition-colors"
    :class="selected ? 'border-gray-900' : 'border-gray-200 hover:bg-gray-50'"
    @click="$emit('click')"
  >
    <div class="flex items-start justify-between gap-3">
      <p class="text-sm font-medium text-gray-900">{{ workOrder.title }}</p>
      <span class="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium" :class="priorityMeta.badgeClass">
        {{ priorityMeta.label }}
      </span>
    </div>
    <p class="mt-1 text-xs text-gray-500">
      {{ project?.name }}<span v-if="site"> &middot; {{ site.name }}</span><span v-else-if="workOrder.location"> &middot; {{ workOrder.location.address }}</span>
    </p>
    <div class="mt-2 flex items-center justify-between">
      <span class="text-xs text-gray-500">{{ technician?.name ?? 'Unassigned' }}</span>
      <span class="rounded-full px-2.5 py-1 text-xs font-medium" :class="statusMeta.badgeClass">
        {{ statusMeta.label }}
      </span>
    </div>
  </li>
</template>
