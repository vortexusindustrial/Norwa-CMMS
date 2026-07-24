<script setup>
import { computed, ref } from 'vue'
import { Play, Square, Plus, X } from 'lucide-vue-next'
import { projects } from '../../data/projects'
import { assetById } from '../../data/assets'
import { WORK_ORDER_STATUS_META, PRIORITY_META, technicianById, elapsedMinutes, siteFor } from '../../data/workOrders'
import { usePermissions } from '../../composables/usePermissions'
import { useWorkOrdersStore } from '../../stores/workOrders'
import MaterialLoggingSection from './MaterialLoggingSection.vue'
import MaterialAvailabilityPanel from './MaterialAvailabilityPanel.vue'
import LotoPanel from './LotoPanel.vue'

const props = defineProps({
  workOrder: { type: Object, default: null },
})

const emit = defineEmits(['open-labor-log'])

const store = useWorkOrdersStore()
const { accessLevel } = usePermissions()

const materialLoggingEditable = computed(() => accessLevel('workOrders.materialLogging') === 'full')
const showMaterialAvailability = computed(() => accessLevel('workOrders.materialAvailability') !== 'none')

const statusMeta = computed(() => (props.workOrder ? WORK_ORDER_STATUS_META[props.workOrder.status] : null))
const priorityMeta = computed(() => (props.workOrder ? PRIORITY_META[props.workOrder.priority] : null))
const project = computed(() => (props.workOrder ? projects.find((p) => p.id === props.workOrder.projectId) ?? null : null))
const asset = computed(() => (props.workOrder ? assetById(props.workOrder.assetId) : null))
const technician = computed(() => (props.workOrder ? technicianById(props.workOrder.technicianId) : null))
const site = computed(() => (props.workOrder ? siteFor(props.workOrder) : null))

const laborForThisOrder = computed(() =>
  props.workOrder ? store.laborEntries.filter((entry) => entry.workOrderId === props.workOrder.id) : []
)
const totalHours = computed(() => laborForThisOrder.value.reduce((sum, entry) => sum + entry.hours, 0))

function formatMinutes(minutes) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h ? `${h}h ${m}m` : `${m}m`
}

const dateFormatter = new Intl.DateTimeFormat('en-KE', { month: 'short', day: 'numeric', year: 'numeric' })
function formatDate(iso) {
  return iso ? dateFormatter.format(new Date(iso)) : '—'
}

function toggleTimer() {
  if (!props.workOrder) return
  if (props.workOrder.timer.status === 'running') {
    store.stopTimer(props.workOrder.id)
  } else {
    store.startTimer(props.workOrder.id)
  }
}

function resetTimer() {
  if (!props.workOrder) return
  store.resetTimer(props.workOrder.id)
}

const showAddChecklistItem = ref(false)
const newChecklistLabel = ref('')

function submitChecklistItem() {
  if (!props.workOrder || !newChecklistLabel.value.trim()) return
  store.addChecklistItem(props.workOrder.id, newChecklistLabel.value)
  newChecklistLabel.value = ''
  showAddChecklistItem.value = false
}
</script>

<template>
  <div class="rounded-lg border border-gray-200 bg-white p-5">
    <div v-if="!workOrder" class="py-16 text-center text-sm text-gray-500">Select a work order to view details.</div>

    <div v-else>
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-xs text-gray-500">{{ workOrder.id }}</p>
          <h3 class="mt-0.5 text-base font-semibold text-gray-900">{{ workOrder.title }}</h3>
        </div>
        <div class="flex shrink-0 items-center gap-2">
          <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="priorityMeta.badgeClass">{{ priorityMeta.label }}</span>
          <span class="rounded-full px-2.5 py-1 text-xs font-medium" :class="statusMeta.badgeClass">{{ statusMeta.label }}</span>
        </div>
      </div>

      <p class="mt-3 text-sm leading-relaxed text-gray-700">{{ workOrder.description }}</p>

      <div class="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <p class="text-xs font-medium uppercase tracking-wide text-gray-500">Project</p>
          <p class="mt-1 text-sm text-gray-900">{{ project?.name ?? '—' }}</p>
        </div>
        <div>
          <p class="text-xs font-medium uppercase tracking-wide text-gray-500">Asset</p>
          <p class="mt-1 text-sm text-gray-900">{{ asset?.name ?? '—' }}</p>
        </div>
        <div>
          <p class="text-xs font-medium uppercase tracking-wide text-gray-500">Technician</p>
          <p class="mt-1 text-sm text-gray-900">{{ technician?.name ?? 'Unassigned' }}</p>
        </div>
        <div>
          <p class="text-xs font-medium uppercase tracking-wide text-gray-500">Scheduled</p>
          <p class="mt-1 text-sm text-gray-900">{{ formatDate(workOrder.scheduledDate) }}</p>
        </div>
        <div>
          <p class="text-xs font-medium uppercase tracking-wide text-gray-500">Location</p>
          <p class="mt-1 text-sm text-gray-900">{{ site?.name ?? workOrder.location?.address ?? '—' }}</p>
        </div>
      </div>

      <!-- Timer -->
      <div class="mt-5 flex items-center justify-between rounded-md border border-gray-200 p-3">
        <div>
          <p class="text-xs font-medium uppercase tracking-wide text-gray-500">Time on Job</p>
          <p class="mt-1 text-lg font-semibold text-gray-900">{{ formatMinutes(elapsedMinutes(workOrder)) }}</p>
        </div>
        <div class="flex items-center gap-2">
        <button
          type="button"
          class="shrink-0 rounded-md px-3 py-1.5 text-xs font-medium bg-gray-700 text-white hover:bg-gray-800"
          @click="resetTimer"
        >
          Reset
        </button>
        <button
          type="button"
          class="flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium"
          :class="workOrder.timer.status === 'running' ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-green-700 text-green-100 hover:bg-green-800'"
          @click="toggleTimer"
        >
          <Square v-if="workOrder.timer.status === 'running'" class="h-3.5 w-3.5" />
          <Play v-else class="h-3.5 w-3.5" />
          {{ workOrder.timer.status === 'running' ? 'Stop' : 'Start' }}
        </button>
        </div>
      </div>

      <!-- LOTO -->
      <div class="mt-3">
        <LotoPanel v-if="workOrder.loto.required" :key="workOrder.id" :work-order="workOrder" :equipment-name="asset?.name" />
        <div v-else class="flex items-center justify-between gap-3 rounded-md border border-dashed border-gray-200 p-3">
          <p class="text-sm text-gray-500">LOTO not marked as required for this job.</p>
          <button
            type="button"
            class="shrink-0 rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            @click="store.setLotoRequired(workOrder.id, true)"
          >
            Mark LOTO Required
          </button>
        </div>
      </div>

      <!-- Checklist -->
      <div class="mt-5">
        <p class="text-xs font-medium uppercase tracking-wide text-gray-500">Checklist</p>
        <ul class="mt-2 flex flex-col gap-1.5">
          <li v-for="item in workOrder.checklist" :key="item.id" class="group flex items-center gap-2">
            <input
              :id="item.id"
              type="checkbox"
              :checked="item.done"
              class="h-4 w-4 rounded border-gray-300"
              @change="store.toggleChecklistItem(workOrder.id, item.id)"
            />
            <label :for="item.id" class="flex-1 text-sm" :class="item.done ? 'text-gray-400 line-through' : 'text-gray-900'">
              {{ item.label }}
            </label>
            <button
              type="button"
              class="shrink-0 rounded p-0.5 text-red-600 opacity-0 hover:bg-red-100 hover:text-red-600 group-hover:opacity-100"
              title="Remove item"
              @click="store.removeChecklistItem(workOrder.id, item.id)"
            >
              <X class="h-3.5 w-3.5" />
            </button>
          </li>
          <li v-if="!workOrder.checklist.length" class="text-sm text-gray-500">No checklist items yet.</li>
        </ul>

        <div class="mt-2">
          <button
            v-if="!showAddChecklistItem"
            type="button"
            class="flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            @click="showAddChecklistItem = true"
          >
            <Plus class="h-3.5 w-3.5" />
            Add Item
          </button>
          <div v-else class="flex gap-2">
            <input
              v-model="newChecklistLabel"
              type="text"
              placeholder="Checklist item"
              class="flex-1 rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-gray-500 focus:outline-none"
              @keyup.enter="submitChecklistItem"
              @keyup.esc="showAddChecklistItem = false"
            />
            <button type="button" class="shrink-0 rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800" @click="submitChecklistItem">Add</button>
            <button type="button" class="shrink-0 rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50" @click="showAddChecklistItem = false">Cancel</button>
          </div>
        </div>
      </div>

      <!-- Materials & stock -->
      <div v-if="showMaterialAvailability" class="mt-5">
        <p class="text-xs font-medium uppercase tracking-wide text-gray-500">Materials &amp; Stock</p>
        <div class="mt-2">
          <MaterialAvailabilityPanel :materials="workOrder.materials" :project-id="workOrder.projectId" :work-order-id="workOrder.id" />
        </div>
      </div>

      <!-- Materials -->
      <div class="mt-5">
        <p class="text-xs font-medium uppercase tracking-wide text-gray-500">Materials Used</p>
        <div class="mt-2">
          <MaterialLoggingSection
            :materials="workOrder.materials"
            :editable="materialLoggingEditable"
            @add="(item) => store.addMaterial(workOrder.id, item)"
          />
        </div>
      </div>

      <!-- Labor summary -->
      <div class="mt-5 flex items-center justify-between rounded-md border border-gray-200 p-3">
        <div>
          <p class="text-xs font-medium uppercase tracking-wide text-gray-500">Hours Logged</p>
          <p class="mt-1 text-sm text-gray-900">{{ totalHours }}h across {{ laborForThisOrder.length }} {{ laborForThisOrder.length === 1 ? 'entry' : 'entries' }}</p>
        </div>
        <button
          type="button"
          class="shrink-0 rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
          @click="$emit('open-labor-log', workOrder.id)"
        >
          Log Hours →
        </button>
      </div>
    </div>
  </div>
</template>
