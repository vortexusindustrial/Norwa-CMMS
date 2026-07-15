<script setup>
import { Package, Clock, FileWarning } from 'lucide-vue-next'

const myWorkOrders = [
  {
    title: 'Pump seal failure',
    project: 'Westlands Bottling — Line B Overhaul',
    asset: 'Pump P-204',
    location: 'Plant 2 · Line B',
    priority: 'High',
    status: 'Assigned',
  },
  {
    title: 'Sensor recalibration',
    project: 'Plant 1 Preventive Maintenance',
    asset: 'Tank Sensor T-3-01',
    location: 'Plant 1 · Tank 3',
    priority: 'Low',
    status: 'In Progress',
  },
]

const priorityStyles = {
  High: 'bg-red-100 text-red-700',
  Medium: 'bg-amber-100 text-amber-700',
  Low: 'bg-gray-100 text-gray-600',
}

const statusStyles = {
  Assigned: 'border border-amber-300 text-amber-700',
  'In Progress': 'bg-gray-900 text-white',
}

const quickActions = [
  { label: 'Log Material Use', icon: Package },
  { label: 'Log Hours', icon: Clock },
  { label: 'Report an Issue', icon: FileWarning },
]
</script>

<template>
  <div>
    <h2 class="text-lg font-semibold text-gray-900">My Work</h2>
    <p class="mt-1 text-sm text-gray-500">Work orders assigned to you, and the projects they belong to.</p>

    <div class="mt-6 flex flex-col gap-3">
      <div v-for="order in myWorkOrders" :key="order.title" class="rounded-lg border border-gray-200 bg-white p-4">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-sm font-semibold text-gray-900">{{ order.title }}</p>
            <p class="mt-1 text-xs text-gray-500">{{ order.project }}</p>
            <p class="mt-0.5 text-xs text-gray-500">{{ order.asset }} · {{ order.location }}</p>
          </div>
          <div class="flex shrink-0 items-center gap-2">
            <span class="rounded-full px-2.5 py-1 text-xs font-medium" :class="priorityStyles[order.priority]">
              {{ order.priority }}
            </span>
            <span class="rounded-full px-2.5 py-1 text-xs font-medium" :class="statusStyles[order.status]">
              {{ order.status }}
            </span>
          </div>
        </div>
        <button
          type="button"
          class="mt-3 rounded-md bg-gray-900 px-3 py-2 text-xs font-medium text-white hover:bg-gray-800"
        >
          Open Checklist
        </button>
      </div>
    </div>

    <div class="mt-6 rounded-lg border border-gray-200 bg-white p-5">
      <h3 class="text-sm font-semibold text-gray-900">Quick Actions</h3>
      <div class="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          v-for="action in quickActions"
          :key="action.label"
          type="button"
          class="flex items-center justify-center gap-2.5 rounded-md border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:flex-1"
        >
          <component :is="action.icon" class="h-4 w-4 shrink-0" />
          {{ action.label }}
        </button>
      </div>
    </div>
  </div>
</template>
