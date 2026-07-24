<script setup>
import { ref, computed } from 'vue'
import { List, Map } from 'lucide-vue-next'
import { useProjectsStore } from '../stores/projects'
import { usePermissions } from '../composables/usePermissions'
import { CURRENT_TECHNICIAN_ID } from '../data/workOrders'
import ProjectList from '../components/projects/ProjectList.vue'
import ProjectDetailPanel from '../components/projects/ProjectDetailPanel.vue'
import ProjectsMap from '../components/projects/ProjectsMap.vue'

const store = useProjectsStore()
const { accessLevel } = usePermissions()

// 'scoped' (technician) only ever sees the project they're assigned to —
// everyone else (admin/manager 'full', supervisor 'view') sees the full list.
const visibleProjects = computed(() =>
  accessLevel('projects') === 'scoped'
    ? store.projects.filter((p) => p.technicianId === CURRENT_TECHNICIAN_ID)
    : store.projects
)

const viewMode = ref('list') // 'list' | 'map'
const selectedProjectId = ref(visibleProjects.value[0]?.id ?? null)

const selectedProject = computed(() => store.projectById(selectedProjectId.value))
const canAssign = computed(() => accessLevel('projects.assignment') === 'full')

function handleSelectFromMap(id) {
  selectedProjectId.value = id
  viewMode.value = 'list'
}

function handleAssign({ projectId, technicianId }) {
  store.assignTechnician(projectId, technicianId)
}
</script>

<template>
  <div>
    <div class="flex items-start justify-between gap-4">
      <div>
        <h2 class="text-lg font-semibold text-gray-900">Projects</h2>
        <p class="mt-1 text-sm text-gray-500">
          Sales-originated projects, site/client details, and status tracking.
        </p>
      </div>

      <div class="flex shrink-0 items-center gap-1 rounded-md border border-gray-200 p-1">
        <button
          type="button"
          class="flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium"
          :class="viewMode === 'list' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-50'"
          @click="viewMode = 'list'"
        >
          <List class="h-3.5 w-3.5" />
          List
        </button>
        <button
          type="button"
          class="flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium"
          :class="viewMode === 'map' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-50'"
          @click="viewMode = 'map'"
        >
          <Map class="h-3.5 w-3.5" />
          Map
        </button>
      </div>
    </div>

    <div v-show="viewMode === 'list'" class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div class="lg:col-span-1">
        <ProjectList :projects="visibleProjects" :selected-id="selectedProjectId" @select="selectedProjectId = $event" />
      </div>
      <div class="lg:col-span-2">
        <ProjectDetailPanel :project="selectedProject" :can-assign="canAssign" @assign="handleAssign" />
      </div>
    </div>

    <div v-show="viewMode === 'map'" class="mt-6">
      <ProjectsMap :projects="visibleProjects" :active="viewMode === 'map'" @select-project="handleSelectFromMap" />
    </div>
  </div>
</template>
