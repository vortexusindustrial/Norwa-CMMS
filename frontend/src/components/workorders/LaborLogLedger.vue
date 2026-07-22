<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-vue-next'
import { TECHNICIANS, technicianById, CURRENT_TECHNICIAN_ID } from '../../data/workOrders'
import { usePermissions } from '../../composables/usePermissions'
import { useWorkOrdersStore } from '../../stores/workOrders'

const props = defineProps({
  workOrders: { type: Array, required: true },
  focusedWorkOrderId: { type: String, default: null },
})

const store = useWorkOrdersStore()
const { accessLevel } = usePermissions()

const laborLevel = computed(() => accessLevel('workOrders.laborLog')) // 'full' | 'scoped'
const scoped = computed(() => laborLevel.value === 'scoped')
// 'full' access covers the whole ledger, so it also covers correcting or
// removing an entry someone else logged — 'scoped' technicians can only add.
const editable = computed(() => laborLevel.value === 'full')

const editingId = ref(null)
const editForm = reactive({ date: '', hours: 1, notes: '' })

function startEdit(entry) {
  editingId.value = entry.id
  editForm.date = entry.date
  editForm.hours = entry.hours
  editForm.notes = entry.notes
}

function cancelEdit() {
  editingId.value = null
}

function saveEdit(entry) {
  const hours = Number(editForm.hours)
  store.updateLaborEntry(entry.id, {
    date: editForm.date || entry.date,
    hours: Number.isFinite(hours) && hours > 0 ? hours : entry.hours,
    notes: editForm.notes.trim(),
  })
  editingId.value = null
}

function remove(entry) {
  if (editingId.value === entry.id) editingId.value = null
  store.removeLaborEntry(entry.id)
}

const filterWoId = ref(props.focusedWorkOrderId ?? '')
watch(
  () => props.focusedWorkOrderId,
  (id) => {
    if (id) filterWoId.value = id
  }
)

const visibleEntries = computed(() =>
  store.laborEntries
    .filter((entry) => !scoped.value || entry.technicianId === CURRENT_TECHNICIAN_ID)
    .filter((entry) => !filterWoId.value || entry.workOrderId === filterWoId.value)
)

function woTitle(id) {
  return props.workOrders.find((wo) => wo.id === id)?.title ?? id
}

const dateFormatter = new Intl.DateTimeFormat('en-KE', { month: 'short', day: 'numeric', year: 'numeric' })
function formatDate(iso) {
  return dateFormatter.format(new Date(iso))
}

const showForm = ref(false)
const form = reactive({
  workOrderId: props.focusedWorkOrderId ?? '',
  technicianId: scoped.value ? CURRENT_TECHNICIAN_ID : '',
  date: new Date().toISOString().slice(0, 10),
  hours: 1,
  notes: '',
})

function submit() {
  if (!form.workOrderId || !form.technicianId || !form.hours) return
  store.addLaborEntry({
    workOrderId: form.workOrderId,
    technicianId: form.technicianId,
    date: form.date,
    hours: Number(form.hours),
    notes: form.notes.trim(),
  })
  form.notes = ''
  form.hours = 1
  showForm.value = false
}
</script>

<template>
  <div>
    <div class="mb-3 flex items-center justify-between gap-3">
      <select
        v-model="filterWoId"
        class="max-w-xs truncate rounded-md border border-gray-300 py-1.5 pl-2.5 pr-8 text-sm focus:border-gray-500 focus:outline-none"
      >
        <option value="">All Work Orders</option>
        <option v-for="wo in workOrders" :key="wo.id" :value="wo.id">{{ wo.title }}</option>
      </select>
      <button
        type="button"
        class="flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
        @click="showForm = !showForm"
      >
        <Plus class="h-3.5 w-3.5" />
        Log Hours
      </button>
    </div>

    <div v-if="showForm" class="mb-4 grid grid-cols-2 gap-2 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-5">
      <select v-model="form.workOrderId" class="truncate rounded-md border border-gray-300 py-1.5 pl-2 pr-8 text-sm focus:border-gray-500 focus:outline-none sm:col-span-2">
        <option value="" disabled>Work order…</option>
        <option v-for="wo in workOrders" :key="wo.id" :value="wo.id">{{ wo.title }}</option>
      </select>
      <select
        v-model="form.technicianId"
        :disabled="scoped"
        class="rounded-md border border-gray-300 py-1.5 pl-2 pr-8 text-sm focus:border-gray-500 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
      >
        <option value="" disabled>Technician…</option>
        <option v-for="tech in TECHNICIANS" :key="tech.id" :value="tech.id">{{ tech.name }}</option>
      </select>
      <input v-model="form.date" type="date" class="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none" />
      <input v-model.number="form.hours" type="number" min="0.25" step="0.25" placeholder="Hours" class="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none" />
      <div class="col-span-2 flex gap-2 sm:col-span-5">
        <input v-model="form.notes" type="text" placeholder="Notes" class="flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none" />
        <button type="button" class="shrink-0 rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800" @click="submit">Save</button>
      </div>
    </div>

    <div v-if="!visibleEntries.length" class="rounded-lg border border-gray-200 bg-white p-5 text-center text-sm text-gray-500">
      No hours logged{{ scoped ? ' by you' : '' }} yet.
    </div>
    <div v-else class="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table class="w-full border-collapse text-sm">
        <thead>
          <tr class="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
            <th class="px-4 py-2.5">Date</th>
            <th class="px-4 py-2.5">Work Order</th>
            <th class="px-4 py-2.5">Technician</th>
            <th class="px-4 py-2.5 text-right">Hours</th>
            <th class="px-4 py-2.5">Notes</th>
            <th v-if="editable" class="px-4 py-2.5"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="entry in visibleEntries" :key="entry.id" class="border-b border-gray-100 last:border-0">
            <template v-if="editingId === entry.id">
              <td class="px-4 py-2">
                <input v-model="editForm.date" type="date" class="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-gray-500 focus:outline-none" />
              </td>
              <td class="px-4 py-2 text-gray-900">{{ woTitle(entry.workOrderId) }}</td>
              <td class="px-4 py-2 text-gray-700">{{ technicianById(entry.technicianId)?.name ?? '—' }}</td>
              <td class="px-4 py-2 text-right">
                <input
                  v-model.number="editForm.hours"
                  type="number"
                  min="0.25"
                  step="0.25"
                  class="w-20 rounded-md border border-gray-300 px-2 py-1 text-right text-sm focus:border-gray-500 focus:outline-none"
                />
              </td>
              <td class="px-4 py-2">
                <input v-model="editForm.notes" type="text" class="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-gray-500 focus:outline-none" />
              </td>
              <td class="px-4 py-2">
                <div class="flex items-center gap-1">
                  <button type="button" title="Save" class="rounded p-1 text-green-600 hover:bg-green-100" @click="saveEdit(entry)">
                    <Check class="h-4 w-4" />
                  </button>
                  <button type="button" title="Cancel" class="rounded p-1 text-gray-400 hover:bg-gray-100" @click="cancelEdit">
                    <X class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </template>
            <template v-else>
              <td class="px-4 py-2.5 text-gray-700">{{ formatDate(entry.date) }}</td>
              <td class="px-4 py-2.5 text-gray-900">{{ woTitle(entry.workOrderId) }}</td>
              <td class="px-4 py-2.5 text-gray-700">{{ technicianById(entry.technicianId)?.name ?? '—' }}</td>
              <td class="px-4 py-2.5 text-right font-medium text-gray-900">{{ entry.hours }}</td>
              <td class="px-4 py-2.5 text-gray-500">{{ entry.notes || '—' }}</td>
              <td v-if="editable" class="px-4 py-2.5">
                <div class="flex items-center gap-1">
                  <button type="button" title="Edit" class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700" @click="startEdit(entry)">
                    <Pencil class="h-3.5 w-3.5" />
                  </button>
                  <button type="button" title="Delete" class="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600" @click="remove(entry)">
                    <Trash2 class="h-3.5 w-3.5" />
                  </button>
                </div>
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
