<script setup>
import { reactive } from 'vue'
import { Plus } from 'lucide-vue-next'
import { projects } from '../../data/projects'
import { BOM_STATUS_META } from '../../data/boms'
import { costInfoFor } from '../../data/stock'
import { useBomStore } from '../../stores/bom'
import BomLineItemsTable from './BomLineItemsTable.vue'

const props = defineProps({
  bom: { type: Object, default: null },
})

const emit = defineEmits(['submit'])

const bomStore = useBomStore()

const newItem = reactive({ partNumber: '', description: '', uom: '', qtyRequired: 1, estimatedUnitCost: 0 })

function projectFor(bom) {
  return projects.find((p) => p.id === bom.projectId) ?? null
}

function addItem() {
  if (!props.bom || !newItem.partNumber || !newItem.description) return
  bomStore.addLineItem(props.bom.id, { ...newItem })
  newItem.partNumber = ''
  newItem.description = ''
  newItem.uom = ''
  newItem.qtyRequired = 1
  newItem.estimatedUnitCost = 0
}

function removeItem(itemId) {
  bomStore.removeLineItem(props.bom.id, itemId)
}

function updateQty(itemId, qty) {
  bomStore.updateLineItemQty(props.bom.id, itemId, qty)
}

function updateCost(itemId, cost) {
  bomStore.updateLineItemCost(props.bom.id, itemId, cost)
}
</script>

<template>
  <div class="rounded-lg border border-gray-200 bg-white p-5">
    <div v-if="!bom" class="py-16 text-center text-sm text-gray-500">
      Select a project to view its BoM.
    </div>
    <div v-else>
      <div class="flex items-start justify-between gap-3">
        <div>
          <h3 class="text-base font-semibold text-gray-900">{{ projectFor(bom)?.name }}</h3>
          <p class="mt-0.5 text-xs text-gray-500">{{ bom.id }}</p>
        </div>
        <span class="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium" :class="BOM_STATUS_META[bom.status].badgeClass">
          {{ BOM_STATUS_META[bom.status].label }}
        </span>
      </div>

      <p v-if="bom.status !== 'draft'" class="mt-4 rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-500">
        This BoM is {{ BOM_STATUS_META[bom.status].label.toLowerCase() }} and can no longer be edited.
      </p>

      <div class="mt-4">
        <BomLineItemsTable
          :items="bom.items"
          :readonly="bom.status !== 'draft'"
          :cost-info-for="costInfoFor"
          @update-qty="updateQty"
          @update-cost="updateCost"
          @remove-item="removeItem"
        />
      </div>

      <form v-if="bom.status === 'draft'" class="mt-4 flex flex-wrap items-end gap-2" @submit.prevent="addItem">
        <div>
          <label class="block text-xs font-medium text-gray-500">Part Number</label>
          <input v-model="newItem.partNumber" type="text" class="mt-1 w-32 rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none" />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-500">Description</label>
          <input v-model="newItem.description" type="text" class="mt-1 w-56 rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none" />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-500">UoM</label>
          <input v-model="newItem.uom" type="text" class="mt-1 w-20 rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none" />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-500">Qty</label>
          <input v-model.number="newItem.qtyRequired" type="number" min="1" step="1" class="mt-1 w-20 rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none" />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-500">Est. Unit Cost</label>
          <input v-model.number="newItem.estimatedUnitCost" type="number" min="0" step="1" class="mt-1 w-28 rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none" />
        </div>
        <button
          type="submit"
          class="flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          <Plus class="h-3.5 w-3.5" />
          Add Line Item
        </button>
      </form>

      <div v-if="bom.status === 'draft'" class="mt-5 flex justify-end">
        <button
          type="button"
          class="rounded-md bg-gray-900 px-3 py-2 text-xs font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="!bom.items.length"
          @click="$emit('submit', bom.id)"
        >
          Submit for Approval
        </button>
      </div>
    </div>
  </div>
</template>
