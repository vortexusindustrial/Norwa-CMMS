<script setup>
import { ref, reactive } from 'vue'
import { Plus } from 'lucide-vue-next'

const props = defineProps({
  materials: { type: Array, required: true },
  editable: { type: Boolean, default: false },
})

const emit = defineEmits(['add'])

const showForm = ref(false)
const form = reactive({ partNumber: '', description: '', qtyUsed: 1, uom: 'Unit' })

function submit() {
  if (!props.editable || !form.partNumber.trim() || !form.description.trim()) return
  emit('add', { partNumber: form.partNumber.trim(), description: form.description.trim(), qtyUsed: Number(form.qtyUsed) || 1, uom: form.uom.trim() || 'Unit' })
  form.partNumber = ''
  form.description = ''
  form.qtyUsed = 1
  form.uom = 'Unit'
  showForm.value = false
}
</script>

<template>
  <div>
    <div v-if="!materials.length" class="rounded-md border border-dashed border-gray-200 p-4 text-center text-sm text-gray-500">
      No materials logged yet.
    </div>
    <table v-else class="w-full border-collapse text-sm">
      <thead>
        <tr class="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
          <th class="px-3 py-2">Part</th>
          <th class="px-3 py-2">Description</th>
          <th class="px-3 py-2 text-right">Qty</th>
          <th class="px-3 py-2">UoM</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, i) in materials" :key="i" class="border-b border-gray-100 last:border-0">
          <td class="px-3 py-2 font-medium text-gray-900">{{ item.partNumber }}</td>
          <td class="px-3 py-2 text-gray-700">{{ item.description }}</td>
          <td class="px-3 py-2 text-right text-gray-900">{{ item.qtyUsed }}</td>
          <td class="px-3 py-2 text-gray-500">{{ item.uom }}</td>
        </tr>
      </tbody>
    </table>

    <div v-if="editable" class="mt-3">
      <button
        v-if="!showForm"
        type="button"
        class="flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
        @click="showForm = true"
      >
        <Plus class="h-3.5 w-3.5" />
        Log Material
      </button>
      <div v-else class="mt-1 grid grid-cols-2 gap-2 rounded-md border border-gray-200 p-3 sm:grid-cols-5">
        <input v-model="form.partNumber" type="text" placeholder="Part number" class="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none sm:col-span-1" />
        <input v-model="form.description" type="text" placeholder="Description" class="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none sm:col-span-2" />
        <input v-model.number="form.qtyUsed" type="number" min="1" step="1" placeholder="Qty" class="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none" />
        <input v-model="form.uom" type="text" placeholder="UoM" class="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none" />
        <div class="col-span-2 flex gap-2 sm:col-span-5">
          <button type="button" class="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800" @click="submit">Add</button>
          <button type="button" class="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50" @click="showForm = false">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>
