<script setup>
import { ref, computed } from 'vue'
import { ShieldCheck, ShieldAlert, Plus, X } from 'lucide-vue-next'
import { useAuthStore } from '../../stores/auth'
import { useWorkOrdersStore } from '../../stores/workOrders'

const props = defineProps({
  workOrder: { type: Object, required: true },
  equipmentName: { type: String, default: null },
})

const auth = useAuthStore()
const store = useWorkOrdersStore()

const loto = computed(() => props.workOrder.loto)
const locked = computed(() => loto.value.status === 'signed_off') // permit closed — record only, no more edits

const dateTimeFormatter = new Intl.DateTimeFormat('en-KE', { dateStyle: 'medium', timeStyle: 'short' })
function formatDateTime(iso) {
  return iso ? dateTimeFormatter.format(new Date(iso)) : '—'
}

// <input type="datetime-local"> needs 'YYYY-MM-DDTHH:mm' in local time, not
// the ISO/offset string the store holds.
function toLocalInputValue(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const permitNumber = ref(loto.value.permitNumber ?? '')
function commitPermit() {
  store.updateLotoPermit(props.workOrder.id, permitNumber.value.trim() || null)
}

const isolatedAtInput = ref(toLocalInputValue(loto.value.isolatedAt))
function commitIsolatedAt() {
  store.updateLotoIsolatedAt(props.workOrder.id, isolatedAtInput.value ? new Date(isolatedAtInput.value).toISOString() : null)
}

const showAddPoint = ref(false)
const newPointLabel = ref('')
const newPointLock = ref('')
function submitPoint() {
  if (!newPointLabel.value.trim()) return
  store.addLotoPoint(props.workOrder.id, { label: newPointLabel.value, lockNumber: newPointLock.value.trim() || null })
  newPointLabel.value = ''
  newPointLock.value = ''
  showAddPoint.value = false
}

const canSignOff = computed(() => !locked.value && loto.value.points.length > 0)

function signOff() {
  if (!canSignOff.value) return
  store.signOffLoto(props.workOrder.id, auth.user?.name ?? 'Unknown')
}
</script>

<template>
  <div class="rounded-md border p-3" :class="locked ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'">
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <ShieldCheck v-if="locked" class="h-4 w-4 shrink-0 text-green-600" />
        <ShieldAlert v-else class="h-4 w-4 shrink-0 text-amber-600" />
        <p class="text-sm font-medium text-gray-900">
          Lockout/Tagout<template v-if="equipmentName"> — {{ equipmentName }}</template>
        </p>
      </div>
      <span v-if="locked" class="shrink-0 text-xs text-gray-500">
        Signed off by {{ loto.signedOffBy }} on {{ formatDateTime(loto.signedOffAt) }}
      </span>
      <button
        v-else-if="!loto.points.length"
        type="button"
        class="shrink-0 text-xs text-gray-500 underline hover:text-gray-700"
        @click="store.setLotoRequired(workOrder.id, false)"
      >
        Not required for this job
      </button>
    </div>

    <div class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
      <label class="block text-xs font-medium text-gray-600">
        Permit Number
        <input
          v-if="!locked"
          v-model="permitNumber"
          type="text"
          placeholder="LOTO-2026-XXX"
          class="mt-1 block w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-gray-500 focus:outline-none"
          @blur="commitPermit"
          @keyup.enter="commitPermit"
        />
        <p v-else class="mt-1 text-sm text-gray-900">{{ loto.permitNumber ?? '—' }}</p>
      </label>

      <label class="block text-xs font-medium text-gray-600">
        Isolated At
        <input
          v-if="!locked"
          v-model="isolatedAtInput"
          type="datetime-local"
          class="mt-1 block w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-gray-500 focus:outline-none"
          @change="commitIsolatedAt"
        />
        <p v-else class="mt-1 text-sm text-gray-900">{{ formatDateTime(loto.isolatedAt) }}</p>
      </label>
    </div>

    <div class="mt-3">
      <p class="text-xs font-medium uppercase tracking-wide text-gray-500">Isolation Points</p>
      <ul class="mt-1.5 flex flex-col gap-1.5">
        <li
          v-for="point in loto.points"
          :key="point.id"
          class="group flex items-center justify-between gap-2 rounded-md border border-gray-200 bg-white px-2.5 py-1.5"
        >
          <span class="text-sm text-gray-900">
            {{ point.label }}
            <span v-if="point.lockNumber" class="text-gray-400">· Lock {{ point.lockNumber }}</span>
          </span>
          <button
            v-if="!locked"
            type="button"
            class="shrink-0 rounded p-0.5 text-red-600 opacity-0 hover:bg-red-100 group-hover:opacity-100"
            title="Remove isolation point"
            @click="store.removeLotoPoint(workOrder.id, point.id)"
          >
            <X class="h-3.5 w-3.5" />
          </button>
        </li>
        <li v-if="!loto.points.length" class="text-sm text-gray-500">No isolation points logged yet.</li>
      </ul>

      <div v-if="!locked" class="mt-2">
        <button
          v-if="!showAddPoint"
          type="button"
          class="flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
          @click="showAddPoint = true"
        >
          <Plus class="h-3.5 w-3.5" />
          Add Isolation Point
        </button>
        <div v-else class="mt-1 grid grid-cols-2 gap-2 rounded-md border border-gray-200 bg-white p-2.5 sm:grid-cols-4">
          <input
            v-model="newPointLabel"
            type="text"
            placeholder="e.g. Main disconnect locked"
            class="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none sm:col-span-2"
            @keyup.enter="submitPoint"
          />
          <input
            v-model="newPointLock"
            type="text"
            placeholder="Lock/tag #"
            class="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none"
            @keyup.enter="submitPoint"
          />
          <div class="col-span-2 flex gap-2 sm:col-span-1">
            <button type="button" class="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800" @click="submitPoint">Add</button>
            <button type="button" class="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50" @click="showAddPoint = false">Cancel</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!locked" class="mt-3 flex items-center justify-between gap-2">
      <p v-if="!canSignOff" class="text-xs text-amber-700">Log at least one isolation point before signing off.</p>
      <span v-else />
      <button
        type="button"
        :disabled="!canSignOff"
        class="shrink-0 rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
        @click="signOff"
      >
        Sign Off
      </button>
    </div>
  </div>
</template>
