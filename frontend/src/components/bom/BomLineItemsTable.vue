<script setup>
import { computed } from 'vue'
import { X } from 'lucide-vue-next'
import { formatCurrency } from '../../utils/currency'

const props = defineProps({
  items: { type: Array, required: true },
  readonly: { type: Boolean, default: false },
  // (item) => { unitCost: number, fromCatalog: boolean } — resolves cost from
  // the stock catalog when available, falling back to the item's own
  // estimatedUnitCost otherwise. Keeps this component free of importing the
  // stock catalog directly.
  costInfoFor: { type: Function, required: true },
})

const emit = defineEmits(['update-qty', 'update-cost', 'remove-item'])

function lineTotal(item) {
  return item.qtyRequired * props.costInfoFor(item).unitCost
}

const grandTotal = computed(() => props.items.reduce((sum, item) => sum + lineTotal(item), 0))
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full border-collapse text-sm">
      <thead>
        <tr class="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
          <th class="px-3 py-2">Part</th>
          <th class="px-3 py-2">Description</th>
          <th class="px-3 py-2">UoM</th>
          <th class="px-3 py-2 text-right">Qty Required</th>
          <th class="px-3 py-2 text-right">Unit Cost</th>
          <th class="px-3 py-2 text-right">Total</th>
          <th v-if="!readonly" class="px-3 py-2"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!items.length">
          <td :colspan="readonly ? 6 : 7" class="px-3 py-6 text-center text-sm text-gray-500">
            No line items yet.
          </td>
        </tr>
        <tr v-for="item in items" :key="item.id" class="border-b border-gray-100 last:border-0">
          <td class="px-3 py-2 font-medium text-gray-900">{{ item.partNumber }}</td>
          <td class="px-3 py-2 text-gray-700">{{ item.description }}</td>
          <td class="px-3 py-2 text-gray-500">{{ item.uom }}</td>
          <td class="px-3 py-2 text-right">
            <input
              v-if="!readonly"
              type="number"
              min="0"
              step="1"
              class="w-20 rounded-md border border-gray-300 px-2 py-1 text-right text-sm focus:border-gray-500 focus:outline-none"
              :value="item.qtyRequired"
              @input="$emit('update-qty', item.id, Number($event.target.value))"
            />
            <span v-else class="text-gray-900">{{ item.qtyRequired }}</span>
          </td>
          <td class="px-3 py-2 text-right">
            <template v-if="costInfoFor(item).fromCatalog">
              <span class="text-gray-900">{{ formatCurrency(costInfoFor(item).unitCost) }}</span>
              <span class="ml-1 text-xs text-gray-400">(catalog)</span>
            </template>
            <input
              v-else-if="!readonly"
              type="number"
              min="0"
              step="1"
              class="w-28 rounded-md border border-gray-300 px-2 py-1 text-right text-sm focus:border-gray-500 focus:outline-none"
              :value="item.estimatedUnitCost"
              @input="$emit('update-cost', item.id, Number($event.target.value))"
            />
            <span v-else class="text-gray-900">{{ formatCurrency(costInfoFor(item).unitCost) }}</span>
          </td>
          <td class="px-3 py-2 text-right font-medium text-gray-900">{{ formatCurrency(lineTotal(item)) }}</td>
          <td v-if="!readonly" class="px-3 py-2 text-right">
            <button
              type="button"
              class="text-gray-400 hover:text-red-600"
              @click="$emit('remove-item', item.id)"
            >
              <X class="h-4 w-4" />
            </button>
          </td>
        </tr>
      </tbody>
      <tfoot v-if="items.length">
        <tr class="border-t border-gray-200">
          <td :colspan="readonly ? 4 : 5" class="px-3 py-2 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
            Total
          </td>
          <td class="px-3 py-2 text-right font-semibold text-gray-900">{{ formatCurrency(grandTotal) }}</td>
          <td v-if="!readonly"></td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>
