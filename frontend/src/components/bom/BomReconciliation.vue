<script setup>
import { computed } from 'vue'
import { stockFor, costInfoFor } from '../../data/stock'
import { formatCurrency } from '../../utils/currency'

const props = defineProps({
  bom: { type: Object, default: null },
})

function rowFor(item) {
  const onHand = stockFor(item.partNumber)?.onHand ?? 0
  const shortfall = Math.max(0, item.qtyRequired - onHand)
  const unitCost = costInfoFor(item).unitCost
  return { onHand, shortfall, shortfallCost: shortfall * unitCost }
}

const rows = computed(() => (props.bom ? props.bom.items.map((item) => ({ item, ...rowFor(item) })) : []))

const totalShortfallCost = computed(() => rows.value.reduce((sum, row) => sum + row.shortfallCost, 0))
</script>

<template>
  <div class="rounded-lg border border-gray-200 bg-white p-5">
    <div v-if="!bom" class="py-16 text-center text-sm text-gray-500">
      Select a project to view its BoM-to-stock reconciliation.
    </div>
    <div v-else>
      <div class="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2">
        <span class="text-xs font-medium uppercase tracking-wide text-gray-500">Estimated Shortfall Cost</span>
        <span class="text-sm font-semibold" :class="totalShortfallCost > 0 ? 'text-red-600' : 'text-gray-900'">
          {{ formatCurrency(totalShortfallCost) }}
        </span>
      </div>

      <div class="mt-4 overflow-x-auto">
        <table class="w-full border-collapse text-sm">
          <thead>
            <tr class="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              <th class="px-3 py-2">Part</th>
              <th class="px-3 py-2">Description</th>
              <th class="px-3 py-2 text-right">Qty Required</th>
              <th class="px-3 py-2 text-right">Qty On Hand</th>
              <th class="px-3 py-2 text-right">Shortfall</th>
              <th class="px-3 py-2 text-right">Est. Procurement Cost</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in rows"
              :key="row.item.id"
              class="border-b border-gray-100 last:border-0"
              :class="row.shortfall > 0 ? 'bg-red-50' : ''"
            >
              <td class="px-3 py-2 font-medium text-gray-900">{{ row.item.partNumber }}</td>
              <td class="px-3 py-2 text-gray-700">{{ row.item.description }}</td>
              <td class="px-3 py-2 text-right text-gray-900">{{ row.item.qtyRequired }}</td>
              <td class="px-3 py-2 text-right text-gray-900">{{ row.onHand }}</td>
              <td class="px-3 py-2 text-right font-medium" :class="row.shortfall > 0 ? 'text-red-600' : 'text-gray-900'">
                {{ row.shortfall }}
              </td>
              <td class="px-3 py-2 text-right" :class="row.shortfall > 0 ? 'text-red-600' : 'text-gray-900'">
                {{ formatCurrency(row.shortfallCost) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
