<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Plus, ClipboardList, Users, Clock } from 'lucide-vue-next'
import { useWorkOrdersStore } from '../stores/workOrders'
import { CURRENT_TECHNICIAN_ID, CURRENT_TEAM, TECHNICIANS, PRIORITIES, PRIORITY_META, siteFor } from '../data/workOrders'
import { usePermissions } from '../composables/usePermissions'
import WorkOrderFilters from '../components/workorders/WorkOrderFilters.vue'
import WorkOrderQueue from '../components/workorders/WorkOrderQueue.vue'
import WorkOrderDetailPanel from '../components/workorders/WorkOrderDetailPanel.vue'
import AssignmentBoard from '../components/workorders/AssignmentBoard.vue'
import LaborLogLedger from '../components/workorders/LaborLogLedger.vue'
import LocationAutocompleteInput from '../components/shared/LocationAutocompleteInput.vue'

const store = useWorkOrdersStore()
const { accessLevel } = usePermissions()
const route = useRoute()

const VALID_TABS = ['queue', 'board', 'labor']
const activeTab = ref(VALID_TABS.includes(route.query.tab) ? route.query.tab : 'queue')
const showAssignmentBoard = computed(() => accessLevel('workOrders.assignmentBoard') !== 'none')

const showNewWoMenu = ref(route.query.create === 'true' || route.query.create === 'emergency')
const newWoTitle = ref('')
const newWoPriority = ref(route.query.create === 'emergency' ? 'high' : 'medium')
const newWoTechnicianId = ref('')
const newWoLocationText = ref('')
const newWoLocation = ref(null) // geocoded place from the autocomplete, or null for free-typed text with no match selected

function onNewWoLocationInput(text) {
  newWoLocationText.value = text
  // Selecting a suggestion fills this in; editing the text afterwards
  // invalidates it so we never submit stale lat/lng for a changed address.
  if (newWoLocation.value && text !== newWoLocation.value.address) newWoLocation.value = null
}

function submitNewWorkOrder() {
  if (!newWoTitle.value.trim()) return
  const technician = TECHNICIANS.find((tech) => tech.id === newWoTechnicianId.value)
  const location = newWoLocation.value ?? (newWoLocationText.value.trim() ? { address: newWoLocationText.value.trim(), placeId: null, lat: null, lng: null } : null)
  const wo = store.createWorkOrder({
    title: newWoTitle.value.trim(),
    priority: newWoPriority.value,
    technicianId: technician?.id ?? null,
    team: technician?.team ?? null,
    location,
  })
  newWoTitle.value = ''
  newWoPriority.value = 'medium'
  newWoTechnicianId.value = ''
  newWoLocationText.value = ''
  newWoLocation.value = null
  showNewWoMenu.value = false
  activeTab.value = 'queue'
  selectedWorkOrderId.value = wo.id
}

// 'workOrders.queue' decides the base scope, independent of any filtering
// below it: 'none' (technician) sees only their own work — there's no
// "queue" to browse, just their assigned list — 'scoped' (supervisor) sees
// their team/shift, 'full' (admin/manager) sees everything. Admin/manager/
// supervisor never get a "My Assigned" toggle of their own (that concept
// doesn't apply to them); instead they can filter the queue down to any one
// technician via WorkOrderFilters below.
const queueLevel = computed(() => accessLevel('workOrders.queue'))
const queueLabel = computed(() => {
  if (queueLevel.value === 'none') return 'My Assigned'
  if (queueLevel.value === 'scoped') return `Team Queue — ${CURRENT_TEAM}`
  return 'All Work Orders'
})

const baseQueue = computed(() => {
  if (queueLevel.value === 'none') return store.workOrders.filter((wo) => wo.technicianId === CURRENT_TECHNICIAN_ID)
  if (queueLevel.value === 'scoped') return store.workOrders.filter((wo) => wo.team === CURRENT_TEAM)
  return store.workOrders
})

const filters = ref(null)
const filteredQueue = computed(() => {
  if (!filters.value) return baseQueue.value
  const f = filters.value
  return baseQueue.value.filter((wo) => {
    if (f.search && !wo.title.toLowerCase().includes(f.search) && !wo.id.toLowerCase().includes(f.search)) return false
    if (f.technicianId && wo.technicianId !== f.technicianId) return false
    if (f.status && wo.status !== f.status) return false
    if (f.priority && wo.priority !== f.priority) return false
    if (f.site && siteFor(wo)?.id !== f.site) return false
    if (f.dateFrom && (!wo.scheduledDate || wo.scheduledDate < f.dateFrom)) return false
    if (f.dateTo && (!wo.scheduledDate || wo.scheduledDate > f.dateTo)) return false
    return true
  })
})

const requestedWorkOrderId = baseQueue.value.find((wo) => wo.id === route.query.wo)?.id ?? null
const selectedWorkOrderId = ref(requestedWorkOrderId ?? baseQueue.value[0]?.id ?? null)
const selectedWorkOrder = computed(() => store.workOrderById(selectedWorkOrderId.value))

const laborFocusId = ref(null)
function openLaborLog(woId) {
  laborFocusId.value = woId
  activeTab.value = 'labor'
}
</script>

<template>
  <div>
    <div class="flex items-start justify-between gap-4">
      <div>
        <h2 class="text-lg font-semibold text-gray-900">Work Orders</h2>
        <p class="mt-1 text-sm text-gray-500">
          Repair work, preventive maintenance, and technician assignments.
        </p>
      </div>

      <div class="flex shrink-0 items-center gap-2">
        <div class="relative">
          <button
            type="button"
            class="flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            @click="showNewWoMenu = !showNewWoMenu"
          >
            <Plus class="h-3.5 w-3.5" />
            New Work Order
          </button>
          <div v-if="showNewWoMenu" class="absolute right-0 z-10 mt-1 w-72 rounded-md border border-gray-200 bg-white p-3 shadow-sm">
            <label class="block text-xs font-medium text-gray-700">
              Title
              <input
                v-model="newWoTitle"
                type="text"
                placeholder="e.g. Pump seal failure"
                class="mt-1 block w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-sm"
              />
            </label>
            <label class="mt-2 block text-xs font-medium text-gray-700">
              Location / Site (optional)
              <LocationAutocompleteInput
                class="mt-1"
                :model-value="newWoLocationText"
                placeholder="Search for a site..."
                @update:model-value="onNewWoLocationInput"
                @select="newWoLocation = $event"
              />
            </label>
            <label class="mt-2 block text-xs font-medium text-gray-700">
              Priority
              <select v-model="newWoPriority" class="mt-1 block w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-sm">
                <option v-for="p in PRIORITIES" :key="p" :value="p">{{ PRIORITY_META[p].label }}</option>
              </select>
            </label>
            <label class="mt-2 block text-xs font-medium text-gray-700">
              Technician (optional)
              <select v-model="newWoTechnicianId" class="mt-1 block w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-sm">
                <option value="">Unassigned</option>
                <option v-for="tech in TECHNICIANS" :key="tech.id" :value="tech.id">{{ tech.name }}</option>
              </select>
            </label>
            <button
              type="button"
              :disabled="!newWoTitle.trim()"
              class="mt-3 w-full rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              @click="submitNewWorkOrder"
            >
              Create Work Order
            </button>
          </div>
        </div>

        <div class="flex items-center gap-1 rounded-md border border-gray-200 p-1">
          <button
            type="button"
            class="flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium"
            :class="activeTab === 'queue' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-50'"
            @click="activeTab = 'queue'"
          >
            <ClipboardList class="h-3.5 w-3.5" />
            Queue
          </button>
          <button
            v-if="showAssignmentBoard"
            type="button"
            class="flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium"
            :class="activeTab === 'board' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-50'"
            @click="activeTab = 'board'"
          >
            <Users class="h-3.5 w-3.5" />
            Assignment Board
          </button>
          <button
            type="button"
            class="flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium"
            :class="activeTab === 'labor' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-50'"
            @click="activeTab = 'labor'"
          >
            <Clock class="h-3.5 w-3.5" />
            Labor Log
          </button>
        </div>
      </div>
    </div>

    <div v-show="activeTab === 'queue'" class="mt-6">
      <div class="mb-4 flex items-center justify-between gap-3">
        <h3 class="text-sm font-semibold text-gray-900">{{ queueLabel }}</h3>
        <span class="text-xs text-gray-500">{{ filteredQueue.length }} of {{ baseQueue.length }}</span>
      </div>

      <!-- Search/filter toolbar only makes sense once there's more than a
           handful of orders to sift through, i.e. for anyone browsing a
           real queue rather than just their own assigned list. -->
      <WorkOrderFilters v-if="queueLevel !== 'none'" class="mb-4" @change="filters = $event" />

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div class="lg:col-span-1">
          <WorkOrderQueue :work-orders="filteredQueue" :selected-id="selectedWorkOrderId" @select="selectedWorkOrderId = $event" />
        </div>
        <div class="lg:col-span-2">
          <WorkOrderDetailPanel :work-order="selectedWorkOrder" @open-labor-log="openLaborLog" />
        </div>
      </div>
    </div>

    <div v-if="showAssignmentBoard" v-show="activeTab === 'board'" class="mt-6">
      <AssignmentBoard :work-orders="store.workOrders" />
    </div>

    <div v-show="activeTab === 'labor'" class="mt-6">
      <LaborLogLedger :work-orders="store.workOrders" :focused-work-order-id="laborFocusId" />
    </div>
  </div>
</template>
