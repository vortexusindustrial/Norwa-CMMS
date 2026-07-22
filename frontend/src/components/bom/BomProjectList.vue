<script setup>
import { projects } from '../../data/projects'
import { BOM_STATUS_META } from '../../data/boms'
import { totalCostFor } from '../../data/stock'
import { formatCurrency } from '../../utils/currency'

defineProps({
  boms: { type: Array, required: true },
  selectedId: { type: String, default: null },
})

defineEmits(['select'])

function projectFor(bom) {
  return projects.find((p) => p.id === bom.projectId) ?? null
}
</script>

<template>
  <ul class="flex flex-col gap-3">
    <li
      v-for="bom in boms"
      :key="bom.id"
      class="cursor-pointer rounded-lg border bg-white p-4 transition-colors"
      :class="bom.id === selectedId ? 'border-gray-900' : 'border-gray-200 hover:bg-gray-50'"
      @click="$emit('select', bom.id)"
    >
      <div class="flex items-start justify-between gap-3">
        <p class="text-sm font-medium text-gray-900">{{ projectFor(bom)?.name }}</p>
        <span class="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium" :class="BOM_STATUS_META[bom.status].badgeClass">
          {{ BOM_STATUS_META[bom.status].label }}
        </span>
      </div>
      <p class="mt-1 text-xs text-gray-500">{{ projectFor(bom)?.client?.name }}</p>
      <p class="mt-2 text-xs text-gray-500">{{ bom.items.length }} items &middot; {{ formatCurrency(totalCostFor(bom)) }}</p>
    </li>
  </ul>
</template>
