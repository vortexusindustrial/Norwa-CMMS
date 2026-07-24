<script setup>
import { computed } from 'vue'
import { costInfoFor } from '../../data/stock'
import { technicianById } from '../../data/workOrders'
import { formatCurrency } from '../../utils/currency'

const props = defineProps({
  assets: { type: Array, required: true },
  workOrders: { type: Array, required: true },
  laborEntries: { type: Array, required: true },
})

function costsFor(asset) {
  const assetWorkOrders = props.workOrders.filter((wo) => wo.assetId === asset.id)
  const workOrderIds = new Set(assetWorkOrders.map((wo) => wo.id))

  const materialsCost = assetWorkOrders.reduce(
    (sum, wo) => sum + wo.materials.reduce((s, m) => s + m.qtyUsed * (costInfoFor(m).unitCost ?? 0), 0),
    0
  )
  const laborCost = props.laborEntries
    .filter((entry) => workOrderIds.has(entry.workOrderId))
    .reduce((sum, entry) => sum + entry.hours * (technicianById(entry.technicianId)?.hourlyRate ?? 0), 0)

  return { materialsCost, laborCost, maintenanceCost: materialsCost + laborCost }
}

const rows = computed(() =>
  props.assets
    .map((asset) => {
      const costs = costsFor(asset)
      return { asset, ...costs, total: asset.acquisitionCost + costs.maintenanceCost }
    })
    .sort((a, b) => b.total - a.total)
)

const maxTotal = computed(() => Math.max(...rows.value.map((r) => r.total), 1))
function barPct(total) {
  return Math.max((total / maxTotal.value) * 100, 2)
}
</script>

<template>
  <div class="rounded-lg border border-gray-200 bg-white p-5">
    <p class="text-xs text-gray-500">Acquisition cost plus logged materials and labor, per asset &middot; ranked highest first</p>

    <div class="mt-4 overflow-x-auto">
      <table class="w-full border-collapse text-sm">
        <thead>
          <tr class="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
            <th class="px-3 py-2">Asset</th>
            <th class="px-3 py-2 text-right">Acquisition Cost</th>
            <th class="px-3 py-2 text-right">Maintenance Cost</th>
            <th class="px-3 py-2 text-right">Total TCO</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.asset.id" class="border-b border-gray-100 last:border-0">
            <td class="px-3 py-2">
              <p class="font-medium text-gray-900">{{ row.asset.name }}</p>
              <p class="text-xs text-gray-500">{{ row.asset.category }}</p>
            </td>
            <td class="px-3 py-2 text-right text-gray-700">{{ formatCurrency(row.asset.acquisitionCost) }}</td>
            <td class="px-3 py-2 text-right text-gray-700">{{ formatCurrency(row.maintenanceCost) }}</td>
            <td class="px-3 py-2">
              <div class="flex items-center justify-end gap-2">
                <span class="font-medium text-gray-900" :title="`Acquisition ${formatCurrency(row.asset.acquisitionCost)} + maintenance ${formatCurrency(row.maintenanceCost)}`">
                  {{ formatCurrency(row.total) }}
                </span>
              </div>
              <div class="mt-1.5 h-1.5 w-full rounded-full bg-gray-100">
                <div class="h-1.5 rounded-full bg-blue-500" :style="{ width: barPct(row.total) + '%' }" />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
