<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Wrench, Boxes, Clock, ClipboardCheck, AlertTriangle, Plus, Package, Users } from 'lucide-vue-next'
import { usePermissions } from '../../composables/usePermissions'

const { canView } = usePermissions()
const router = useRouter()

const stats = [
  { label: 'Open Work Orders', value: '47', hint: '12 high priority', icon: Wrench, accent: 'border-l-blue-500' },
  { label: 'Assets Under Management', value: '1,284', hint: '96.8% operational', icon: Boxes, accent: 'border-l-green-500' },
  { label: 'MTTR', value: '3.4h', hint: 'Down from 4.1h last month', icon: Clock, accent: 'border-l-amber-500' },
  { label: 'Pending Approvals', value: '9', hint: 'BoM, purchase requests, closeouts', icon: ClipboardCheck, accent: 'border-l-purple-500' },
]

const recentWorkOrders = [
  { title: 'Pump seal failure', location: 'Plant 2 · Line B', time: '2 hours ago', priority: 'High', status: 'Assigned' },
  { title: 'Scheduled lubrication', location: 'Warehouse · Conveyor 4', time: '4 hours ago', priority: 'Medium', status: 'In Progress' },
  { title: 'Sensor recalibration', location: 'Plant 1 · Tank 3', time: '6 hours ago', priority: 'Low', status: 'Resolved' },
]

const priorityStyles = {
  High: 'bg-red-100 text-red-700',
  Medium: 'bg-amber-100 text-amber-700',
  Low: 'bg-gray-100 text-gray-600',
}

const statusStyles = {
  Assigned: 'bg-gray-900 text-white',
  'In Progress': 'bg-gray-900 text-white',
  Resolved: 'border border-gray-300 text-gray-600',
}

const allQuickActions = [
  { label: 'Emergency Work Order', icon: AlertTriangle, emphasis: true, section: null, to: { name: 'work-orders', query: { create: 'emergency' } } },
  { label: 'New Work Order', icon: Plus, section: null, to: { name: 'work-orders', query: { create: 'true' } } },
  { label: 'Review BoM Approvals', icon: ClipboardCheck, section: 'bom', to: { name: 'bill-of-materials', query: { tab: 'approvals' } } },
  { label: 'Purchase Requests', icon: Package, section: 'procurement', to: { name: 'procurement', query: {tab: 'requests'} } },
  { label: 'Asset Inspection', icon: Boxes, section: 'assets', to: { name: 'assets' } },
  { label: 'User & Role Management', icon: Users, section: 'administration', to: { name: 'administration' } },
]


const quickActions = computed(() =>
  allQuickActions.filter((action) => !action.section || canView(action.section))
)

function handleQuickAction(action) {
  if (action.to) {
    router.push(action.to)
  } else {
    // Placeholder for actions that don't navigate to a route
  }
}
</script>

<template>
  <div>
    <h2 class="text-lg font-semibold text-gray-900">Operations Dashboard</h2>
    <p class="mt-1 text-sm text-gray-500">Asset health, open work orders, and approvals across Norwa CMMS.</p>

    <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="stat in stats"
        :key="stat.label"
        :class="stat.accent"
        class="rounded-lg border border-gray-200 border-l-4 bg-white p-4"
      >
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-gray-600">{{ stat.label }}</span>
          <component :is="stat.icon" class="h-4 w-4 text-gray-400" />
        </div>
        <p class="mt-3 text-2xl font-semibold text-gray-900">{{ stat.value }}</p>
        <p class="mt-1 text-xs text-gray-500">{{ stat.hint }}</p>
      </div>
    </div>

    <div class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div class="rounded-lg border border-gray-200 bg-white p-5 lg:col-span-2">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-semibold text-gray-900">Recent Work Orders</h3>
          <button
            @click="router.push({ name: 'work-orders' })"
            class="text-sm font-medium text-gray-900 hover:underline"
          >
            View All
          </button>
        </div>
        <ul class="mt-4 flex flex-col gap-3">
          <li
            v-for="order in recentWorkOrders"
            :key="order.title"
            class="flex items-center justify-between rounded-md border border-gray-200 px-4 py-3"
          >
            <div>
              <p class="text-sm font-medium text-gray-900">{{ order.title }}</p>
              <p class="mt-0.5 text-xs text-gray-500">{{ order.location }} · {{ order.time }}</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="rounded-full px-2.5 py-1 text-xs font-medium" :class="priorityStyles[order.priority]">
                {{ order.priority }}
              </span>
              <span class="rounded-full px-2.5 py-1 text-xs font-medium" :class="statusStyles[order.status]">
                {{ order.status }}
              </span>
            </div>
          </li>
        </ul>
      </div>

      <div class="rounded-lg border border-gray-200 bg-white p-5">
        <h3 class="text-sm font-semibold text-gray-900">Quick Actions</h3>
        <div class="mt-4 flex flex-col gap-2">
          <button
            v-for="action in quickActions"
            :key="action.label"
            type="button"
            @click="handleQuickAction(action)"
            class="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-sm font-medium"
            :class="
              action.emphasis
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
            "
          >
            <component :is="action.icon" class="h-4 w-4 shrink-0" />
            {{ action.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
