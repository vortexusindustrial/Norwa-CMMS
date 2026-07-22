<script setup>
import { ref, computed } from 'vue'
import { PencilLine } from 'lucide-vue-next'
import { projects } from '../../data/projects'
import { WORK_ORDER_STATUS_META, PRIORITY_META, TECHNICIANS, technicianById } from '../../data/workOrders'
import { usePermissions } from '../../composables/usePermissions'
import { useWorkOrdersStore } from '../../stores/workOrders'

const props = defineProps({
  workOrders: { type: Array, required: true },
})

const store = useWorkOrdersStore()
const { accessLevel } = usePermissions()

// 'full' (admin/supervisor): the assignee dropdown is always live.
// 'scoped' (manager, "view + override"): assignments render read-only until
// explicitly put into override mode for that one row.
const boardLevel = computed(() => accessLevel('workOrders.assignmentBoard'))
const overriding = ref(new Set())

function isEditable(woId) {
  return boardLevel.value === 'full' || overriding.value.has(woId)
}

function beginOverride(woId) {
  overriding.value = new Set(overriding.value).add(woId)
}

function projectName(id) {
  return projects.find((p) => p.id === id)?.name ?? '—'
}
</script>

<template>
  <div class="overflow-x-auto rounded-lg border border-gray-200 bg-white">
    <table class="w-full border-collapse text-sm">
      <thead>
        <tr class="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
          <th class="px-4 py-2.5">Work Order</th>
          <th class="px-4 py-2.5">Project</th>
          <th class="px-4 py-2.5">Priority</th>
          <th class="px-4 py-2.5">Status</th>
          <th class="px-4 py-2.5">Team</th>
          <th class="px-4 py-2.5">Assignee</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="wo in workOrders" :key="wo.id" class="border-b border-gray-100 last:border-0">
          <td class="px-4 py-2.5">
            <p class="font-medium text-gray-900">{{ wo.title }}</p>
            <p class="text-xs text-gray-400">{{ wo.id }}</p>
          </td>
          <td class="px-4 py-2.5 text-gray-700">{{ projectName(wo.projectId) }}</td>
          <td class="px-4 py-2.5">
            <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="PRIORITY_META[wo.priority].badgeClass">
              {{ PRIORITY_META[wo.priority].label }}
            </span>
          </td>
          <td class="px-4 py-2.5">
            <span class="rounded-full px-2.5 py-1 text-xs font-medium" :class="WORK_ORDER_STATUS_META[wo.status].badgeClass">
              {{ WORK_ORDER_STATUS_META[wo.status].label }}
            </span>
          </td>
          <td class="px-4 py-2.5 text-xs text-gray-500">{{ wo.team }}</td>
          <td class="px-4 py-2.5">
            <select
              v-if="isEditable(wo.id)"
              class="max-w-[12rem] rounded-md border border-gray-300 py-1 pl-2 pr-8 text-sm focus:border-gray-500 focus:outline-none"
              :value="wo.technicianId ?? ''"
              @change="store.assignTechnician(wo.id, $event.target.value || null)"
            >
              <option value="">Unassigned</option>
              <option v-for="tech in TECHNICIANS" :key="tech.id" :value="tech.id">{{ tech.name }}</option>
            </select>
            <div v-else class="flex items-center gap-2">
              <span class="text-gray-900">{{ technicianById(wo.technicianId)?.name ?? 'Unassigned' }}</span>
              <button
                type="button"
                title="Override assignment"
                class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                @click="beginOverride(wo.id)"
              >
                <PencilLine class="h-3.5 w-3.5" />
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
