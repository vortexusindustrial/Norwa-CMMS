<script setup>
import { computed } from 'vue'
import { Play, Square, ShieldCheck, ShieldAlert } from 'lucide-vue-next'
import { projects } from '../../data/projects'
import { assetById } from '../../data/assets'
import { WORK_ORDER_STATUS_META, PRIORITY_META, technicianById, elapsedMinutes, siteFor } from '../../data/workOrders'
import { usePermissions } from '../../composables/usePermissions'
import { useAuthStore } from '../../stores/auth'
import { useWorkOrdersStore } from '../../stores/workOrders'
import MaterialLoggingSection from './MaterialLoggingSection.vue'

const props = defineProps({
  workOrder: { type: Object, default: null },
})

const emit = defineEmits(['open-labor-log'])

const auth = useAuthStore()
const store = useWorkOrdersStore()
const { accessLevel } = usePermissions()

const materialLoggingEditable = computed(() => accessLevel('workOrders.materialLogging') === 'full')

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
      <div v-if="workOrder.loto.required" class="mt-3 flex items-center justify-between rounded-md border p-3" :class="workOrder.loto.status === 'signed_off' ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'">
        <div class="flex items-center gap-2">
          <ShieldCheck v-if="workOrder.loto.status === 'signed_off'" class="h-4 w-4 text-green-600" />
          <ShieldAlert v-else class="h-4 w-4 text-amber-600" />
          <div>
            <p class="text-sm font-medium text-gray-900">Lockout/Tagout</p>
            <p class="text-xs text-gray-500">
              <template v-if="workOrder.loto.status === 'signed_off'">
                Signed off by {{ workOrder.loto.signedOffBy }} on {{ formatDate(workOrder.loto.signedOffAt) }}
              </template>
              <template v-else>Required before work can proceed — not yet signed off.</template>
            </p>
          </div>
        </div>
        <button
          v-if="workOrder.loto.status !== 'signed_off'"
          type="button"
          class="shrink-0 rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800"
          @click="store.signOffLoto(workOrder.id, auth.user?.name ?? 'Unknown')"
        >
          Sign Off
        </button>
      </div>

      <!-- Checklist -->
      <div class="mt-5">
        <p class="text-xs font-medium uppercase tracking-wide text-gray-500">Checklist</p>
        <ul class="mt-2 flex flex-col gap-1.5">
          <li v-for="item in workOrder.checklist" :key="item.id" class="flex items-center gap-2">
            <input
              :id="item.id"
              type="checkbox"
              :checked="item.done"
              class="h-4 w-4 rounded border-gray-300"
              @change="store.toggleChecklistItem(workOrder.id, item.id)"
            />
            <label :for="item.id" class="text-sm" :class="item.done ? 'text-gray-400 line-through' : 'text-gray-900'">
              {{ item.label }}
            </label>
          </li>
        </ul>
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
