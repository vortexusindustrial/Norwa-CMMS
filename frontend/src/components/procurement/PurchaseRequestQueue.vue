<script setup>
import { ref, reactive, computed } from 'vue'
import { Plus } from 'lucide-vue-next'
import { PURCHASE_REQUEST_STATUS_META } from '../../data/procurement'

const props = defineProps({
  requests: { type: Array, required: true },
})

const emit = defineEmits(['approve', 'reject', 'create-po', 'create-manual'])

const sorted = computed(() => [...props.requests].sort((a, b) => (a.requestedDate < b.requestedDate ? 1 : -1)))

const selectedForPo = ref([])
function toggleSelect(id) {
  selectedForPo.value = selectedForPo.value.includes(id)
    ? selectedForPo.value.filter((x) => x !== id)
    : [...selectedForPo.value, id]
}
const selectedRequests = computed(() => props.requests.filter((pr) => selectedForPo.value.includes(pr.id)))
const vendorName = ref('')
function raisePo() {
  if (!vendorName.value.trim() || !selectedForPo.value.length) return
  emit('create-po', vendorName.value.trim(), [...selectedForPo.value])
  selectedForPo.value = []
  vendorName.value = ''
}

const showForm = ref(false)
const form = reactive({ partNumber: '', description: '', qtyRequested: 1, uom: 'Unit' })
function submitManual() {
  if (!form.partNumber.trim() || !form.description.trim()) return
  emit('create-manual', {
    partNumber: form.partNumber.trim(),
    description: form.description.trim(),
    qtyRequested: Number(form.qtyRequested) || 1,
    uom: form.uom.trim() || 'Unit',
    requestedBy: 'Current user',
  })
  form.partNumber = ''
  form.description = ''
  form.qtyRequested = 1
  form.uom = 'Unit'
  showForm.value = false
}
</script>

<template>
  <div class="rounded-lg border border-gray-200 bg-white p-5">
    <div class="flex items-center justify-between gap-3">
      <p class="text-xs text-gray-500">{{ requests.length }} requests &middot; check approved rows to raise a PO</p>
      <button
        type="button"
        class="flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
        @click="showForm = !showForm"
      >
        <Plus class="h-3.5 w-3.5" />
        New Request
      </button>
    </div>

    <div v-if="showForm" class="mt-3 grid grid-cols-2 gap-2 rounded-md border border-gray-200 p-3 sm:grid-cols-5">
      <input v-model="form.partNumber" type="text" placeholder="Part number" class="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none" />
      <input v-model="form.description" type="text" placeholder="Description" class="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none sm:col-span-2" />
      <input v-model.number="form.qtyRequested" type="number" min="1" step="1" placeholder="Qty" class="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none" />
      <input v-model="form.uom" type="text" placeholder="UoM" class="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none" />
      <div class="col-span-2 flex gap-2 sm:col-span-5">
        <button type="button" class="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800" @click="submitManual">Submit</button>
        <button type="button" class="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50" @click="showForm = false">Cancel</button>
      </div>
    </div>

    <div v-if="!sorted.length" class="mt-4 rounded-md border border-dashed border-gray-200 p-4 text-center text-sm text-gray-500">
      No purchase requests.
    </div>
    <div v-else class="mt-4 overflow-x-auto">
      <table class="w-full border-collapse text-sm">
        <thead>
          <tr class="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
            <th class="px-3 py-2"></th>
            <th class="px-3 py-2">Part</th>
            <th class="px-3 py-2">Description</th>
            <th class="px-3 py-2 text-right">Qty</th>
            <th class="px-3 py-2">Reason</th>
            <th class="px-3 py-2">Requested</th>
            <th class="px-3 py-2">Status</th>
            <th class="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pr in sorted" :key="pr.id" class="border-b border-gray-100 last:border-0">
            <td class="px-3 py-2">
              <input
                v-if="pr.status === 'approved'"
                type="checkbox"
                :checked="selectedForPo.includes(pr.id)"
                @change="toggleSelect(pr.id)"
              />
            </td>
            <td class="px-3 py-2 font-medium text-gray-900">{{ pr.partNumber }}</td>
            <td class="px-3 py-2 text-gray-700">{{ pr.description }}</td>
            <td class="px-3 py-2 text-right text-gray-900">{{ pr.qtyRequested }}</td>
            <td class="px-3 py-2 text-gray-500">{{ pr.reason === 'low_stock' ? 'Low stock' : 'Manual' }}</td>
            <td class="px-3 py-2 text-gray-500">{{ pr.requestedBy }} &middot; {{ pr.requestedDate }}</td>
            <td class="px-3 py-2">
              <span class="rounded px-2 py-0.5 text-xs font-medium" :class="PURCHASE_REQUEST_STATUS_META[pr.status].badgeClass">
                {{ PURCHASE_REQUEST_STATUS_META[pr.status].label }}
              </span>
            </td>
            <td class="px-3 py-2 text-right">
              <div v-if="pr.status === 'pending'" class="flex justify-end gap-1.5">
                <button type="button" class="rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50" @click="emit('reject', pr.id)">Reject</button>
                <button type="button" class="rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white hover:bg-gray-800" @click="emit('approve', pr.id)">Approve</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="selectedRequests.length" class="mt-4 flex items-center gap-2 rounded-md bg-gray-50 p-3">
      <span class="text-xs text-gray-600">Raise PO for {{ selectedRequests.length }} item(s):</span>
      <input v-model="vendorName" type="text" placeholder="Vendor name" class="flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none" />
      <button type="button" class="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50" :disabled="!vendorName.trim()" @click="raisePo">
        Raise PO
      </button>
    </div>
  </div>
</template>
