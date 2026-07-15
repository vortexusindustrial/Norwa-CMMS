<script setup>
import { Users, Wrench, Clock, ClipboardList, Package, CalendarClock } from 'lucide-vue-next'

const stats = [
  { label: "Today's Team Work Orders", value: '11', hint: '3 unassigned', icon: Wrench, accent: 'border-l-blue-500' },
  { label: 'Technicians on Shift', value: '6', hint: '2 on break', icon: Users, accent: 'border-l-green-500' },
  { label: 'Team MTTR', value: '2.9h', hint: 'This shift, vs 3.4h site-wide', icon: Clock, accent: 'border-l-amber-500' },
]

const teamWorkOrders = [
  { title: 'Pump seal failure', assignee: 'Unassigned', time: '2 hours ago', priority: 'High', status: 'Unassigned' },
  { title: 'Scheduled lubrication', assignee: 'J. Mwangi', time: '4 hours ago', priority: 'Medium', status: 'In Progress' },
  { title: 'Belt tension check', assignee: 'A. Otieno', time: '5 hours ago', priority: 'Low', status: 'In Progress' },
]

const priorityStyles = {
  High: 'bg-red-100 text-red-700',
  Medium: 'bg-amber-100 text-amber-700',
  Low: 'bg-gray-100 text-gray-600',
}

const statusStyles = {
  Unassigned: 'border border-amber-300 text-amber-700',
  'In Progress': 'bg-gray-900 text-white',
}

const quickActions = [
  { label: 'Assign Technician', icon: Users },
  { label: 'View Shift Schedule', icon: CalendarClock },
  { label: 'Log Team Hours', icon: ClipboardList },
  { label: "Check Stock for Today's Jobs", icon: Package },
]
</script>

<template>
  <div>
    <h2 class="text-lg font-semibold text-gray-900">Shift Dashboard</h2>
    <p class="mt-1 text-sm text-gray-500">Your team's assignments, work orders, and shift hours.</p>

    <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
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
          <h3 class="text-sm font-semibold text-gray-900">Team Work Orders</h3>
          <RouterLink to="/cmms/app/work-orders" class="text-sm font-medium text-gray-900 hover:underline">
            View All
          </RouterLink>
        </div>
        <ul class="mt-4 flex flex-col gap-3">
          <li
            v-for="order in teamWorkOrders"
            :key="order.title"
            class="flex items-center justify-between rounded-md border border-gray-200 px-4 py-3"
          >
            <div>
              <p class="text-sm font-medium text-gray-900">{{ order.title }}</p>
              <p class="mt-0.5 text-xs text-gray-500">{{ order.assignee }} · {{ order.time }}</p>
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
            class="flex items-center gap-2.5 rounded-md border border-gray-200 px-3 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <component :is="action.icon" class="h-4 w-4 shrink-0" />
            {{ action.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
