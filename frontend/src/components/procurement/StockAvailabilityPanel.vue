<script setup>
import { ref, computed } from 'vue'
import { Search } from 'lucide-vue-next'

const props = defineProps({
  parts: { type: Array, required: true }, // [{ partNumber, description, uom, onHand, reorderPoint }]
  scopeLabel: { type: String, default: null },
})

const search = ref('')

const rows = computed(() => {
  const term = search.value.trim().toLowerCase()
  const filtered = term
    ? props.parts.filter((p) => p.partNumber.toLowerCase().includes(term) || p.description.toLowerCase().includes(term))
    : props.parts
  return [...filtered].sort((a, b) => a.onHand - a.reorderPoint - (b.onHand - b.reorderPoint))
})

function isLow(part) {
  return part.onHand <= part.reorderPoint
}
</script>

<template>
  <div class="rounded-lg border border-gray-200 bg-white p-5">
    <div class="flex items-center justify-between gap-3">
      <p v-if="scopeLabel" class="text-xs text-gray-500">Showing parts for {{ scopeLabel }}</p>
      <div v-else />
      <div class="relative w-64">
        <Search class="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
        <input
          v-model="search"
          type="text"
          placeholder="Search part or description..."
          class="w-full rounded-md border border-gray-300 py-1.5 pl-8 pr-3 text-sm focus:border-gray-500 focus:outline-none"
        />
      </div>
    </div>

    <div v-if="!rows.length" class="mt-4 rounded-md border border-dashed border-gray-200 p-4 text-center text-sm text-gray-500">
      No parts match.
    </div>
    <div v-else class="mt-4 overflow-x-auto">
      <table class="w-full border-collapse text-sm">
        <thead>
          <tr class="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
            <th class="px-3 py-2">Part</th>
            <th class="px-3 py-2">Description</th>
            <th class="px-3 py-2 text-right">On Hand</th>
            <th class="px-3 py-2 text-right">Reorder Point</th>
            <th class="px-3 py-2">UoM</th>
            <th class="px-3 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="part in rows" :key="part.partNumber" class="border-b border-gray-100 last:border-0" :class="isLow(part) ? 'bg-red-50' : ''">
            <td class="px-3 py-2 font-medium text-gray-900">{{ part.partNumber }}</td>
            <td class="px-3 py-2 text-gray-700">{{ part.description }}</td>
            <td class="px-3 py-2 text-right" :class="isLow(part) ? 'font-medium text-red-600' : 'text-gray-900'">{{ part.onHand }}</td>
            <td class="px-3 py-2 text-right text-gray-500">{{ part.reorderPoint }}</td>
            <td class="px-3 py-2 text-gray-500">{{ part.uom }}</td>
            <td class="px-3 py-2">
              <span
                class="rounded px-2 py-0.5 text-xs font-medium"
                :class="isLow(part) ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'"
              >
                {{ isLow(part) ? 'Low Stock' : 'In Stock' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
