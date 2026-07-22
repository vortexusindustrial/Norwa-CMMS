<script setup>
import { ref, reactive, computed } from 'vue'
import { Plus } from 'lucide-vue-next'
import { RESERVATION_STATUS_META } from '../../data/procurement'

const props = defineProps({
  reservations: { type: Array, required: true },
  editable: { type: Boolean, default: false },
})

const emit = defineEmits(['reserve', 'release', 'consume'])

const sorted = computed(() => [...props.reservations].sort((a, b) => (a.reservedDate < b.reservedDate ? 1 : -1)))

const showForm = ref(false)
const form = reactive({ partNumber: '', description: '', qtyReserved: 1, uom: 'Unit', label: '', reservedBy: 'Current user' })
function submit() {
  if (!props.editable || !form.partNumber.trim() || !form.description.trim() || !form.label.trim()) return
  emit('reserve', {
    partNumber: form.partNumber.trim(),
    description: form.description.trim(),
    qtyReserved: Number(form.qtyReserved) || 1,
    uom: form.uom.trim() || 'Unit',
    reservedFor: { type: 'manual', id: null, label: form.label.trim() },
    reservedBy: form.reservedBy,
  })
  form.partNumber = ''
  form.description = ''
  form.qtyReserved = 1
  form.uom = 'Unit'
  form.label = ''
  showForm.value = false
}
</script>

<template>
  <div class="rounded-lg border border-gray-200 bg-white p-5">
    <div class="flex items-center justify-between gap-3">
      <p class="text-xs text-gray-500">{{ reservations.length }} reservations</p>
      <button
        v-if="editable"
        type="button"
        class="flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
        @click="showForm = !showForm"
      >
        <Plus class="h-3.5 w-3.5" />
        New Reservation
      </button>
    </div>

    <div v-if="showForm" class="mt-3 grid grid-cols-2 gap-2 rounded-md border border-gray-200 p-3 sm:grid-cols-6">
      <input v-model="form.partNumber" type="text" placeholder="Part number" class="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none" />
      <input v-model="form.description" type="text" placeholder="Description" class="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none sm:col-span-2" />
      <input v-model.number="form.qtyReserved" type="number" min="1" step="1" placeholder="Qty" class="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none" />
      <input v-model="form.uom" type="text" placeholder="UoM" class="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none" />
      <input v-model="form.label" type="text" placeholder="Reserved for (project/work order)" class="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none sm:col-span-2" />
      <div class="col-span-2 flex gap-2 sm:col-span-6">
        <button type="button" class="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800" @click="submit">Reserve</button>
        <button type="button" class="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50" @click="showForm = false">Cancel</button>
      </div>
    </div>

    <div v-if="!sorted.length" class="mt-4 rounded-md border border-dashed border-gray-200 p-4 text-center text-sm text-gray-500">
      No component reservations.
    </div>
    <div v-else class="mt-4 overflow-x-auto">
      <table class="w-full border-collapse text-sm">
        <thead>
          <tr class="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
            <th class="px-3 py-2">Part</th>
            <th class="px-3 py-2">Description</th>
            <th class="px-3 py-2 text-right">Qty</th>
            <th class="px-3 py-2">Reserved For</th>
            <th class="px-3 py-2">Reserved By</th>
            <th class="px-3 py-2">Status</th>
            <th v-if="editable" class="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in sorted" :key="r.id" class="border-b border-gray-100 last:border-0">
            <td class="px-3 py-2 font-medium text-gray-900">{{ r.partNumber }}</td>
            <td class="px-3 py-2 text-gray-700">{{ r.description }}</td>
            <td class="px-3 py-2 text-right text-gray-900">{{ r.qtyReserved }}</td>
            <td class="px-3 py-2 text-gray-700">{{ r.reservedFor.label }}</td>
            <td class="px-3 py-2 text-gray-500">{{ r.reservedBy }} &middot; {{ r.reservedDate }}</td>
            <td class="px-3 py-2">
              <span class="rounded px-2 py-0.5 text-xs font-medium" :class="RESERVATION_STATUS_META[r.status].badgeClass">
                {{ RESERVATION_STATUS_META[r.status].label }}
              </span>
            </td>
            <td v-if="editable" class="px-3 py-2 text-right">
              <div v-if="r.status === 'active'" class="flex justify-end gap-1.5">
                <button type="button" class="rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50" @click="emit('release', r.id)">Release</button>
                <button type="button" class="rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white hover:bg-gray-800" @click="emit('consume', r.id)">Consume</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
