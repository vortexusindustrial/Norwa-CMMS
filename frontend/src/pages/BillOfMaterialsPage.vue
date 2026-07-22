<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { FileEdit, ClipboardCheck, PackageSearch, Plus } from 'lucide-vue-next'
import { projects } from '../data/projects'
import { useAuthStore } from '../stores/auth'
import { useBomStore } from '../stores/bom'
import BomProjectList from '../components/bom/BomProjectList.vue'
import BomEditor from '../components/bom/BomEditor.vue'
import BomApprovalQueue from '../components/bom/BomApprovalQueue.vue'
import BomReconciliation from '../components/bom/BomReconciliation.vue'

const auth = useAuthStore()
const bomStore = useBomStore()
const route = useRoute()

const VALID_TABS = ['editor', 'approvals', 'reconciliation']
const activeTab = ref(VALID_TABS.includes(route.query.tab) ? route.query.tab : 'editor')
const selectedBomId = ref(bomStore.boms[0]?.id ?? null) // shared between editor + reconciliation tabs only

const selectedBom = computed(() => bomStore.bomById(selectedBomId.value))

const showNewBomMenu = ref(false)
const projectsWithoutBom = computed(() =>
  projects.filter((project) => !bomStore.boms.some((bom) => bom.projectId === project.id))
)

function createDraftFor(projectId) {
  const bom = bomStore.createDraft(projectId)
  if (bom) selectedBomId.value = bom.id
  showNewBomMenu.value = false
}

function handleSubmit(bomId) {
  bomStore.submitForApproval(bomId, auth.user?.name ?? 'Unknown')
}

function handleApprove(bomId) {
  bomStore.approve(bomId, auth.user?.name ?? 'Unknown')
}

function handleReject(bomId, reason) {
  bomStore.reject(bomId, auth.user?.name ?? 'Unknown', reason)
}
</script>

<template>
  <div>
    <div class="flex items-start justify-between gap-4">
      <div>
        <h2 class="text-lg font-semibold text-gray-900">Bill of Materials</h2>
        <p class="mt-1 text-sm text-gray-500">
          BoM authoring, approval, and stock reconciliation against each project.
        </p>
      </div>

      <div class="flex shrink-0 items-center gap-1 rounded-md border border-gray-200 p-1">
        <button
          type="button"
          class="flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium"
          :class="activeTab === 'editor' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-50'"
          @click="activeTab = 'editor'"
        >
          <FileEdit class="h-3.5 w-3.5" />
          Editor
        </button>
        <button
          type="button"
          class="flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium"
          :class="activeTab === 'approvals' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-50'"
          @click="activeTab = 'approvals'"
        >
          <ClipboardCheck class="h-3.5 w-3.5" />
          Approvals
        </button>
        <button
          type="button"
          class="flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium"
          :class="activeTab === 'reconciliation' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-50'"
          @click="activeTab = 'reconciliation'"
        >
          <PackageSearch class="h-3.5 w-3.5" />
          Reconciliation
        </button>
      </div>
    </div>

    <div v-show="activeTab === 'editor'" class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div class="lg:col-span-1">
        <div class="relative mb-3">
          <button
            type="button"
            class="flex w-full items-center justify-center gap-1.5 rounded-md border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
            @click="showNewBomMenu = !showNewBomMenu"
          >
            <Plus class="h-3.5 w-3.5" />
            New BoM
          </button>
          <div v-if="showNewBomMenu" class="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white py-1 shadow-sm">
            <p v-if="!projectsWithoutBom.length" class="px-3 py-2 text-xs text-gray-500">
              All projects already have a BoM.
            </p>
            <button
              v-for="project in projectsWithoutBom"
              :key="project.id"
              type="button"
              class="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
              @click="createDraftFor(project.id)"
            >
              {{ project.name }}
            </button>
          </div>
        </div>
        <BomProjectList :boms="bomStore.boms" :selected-id="selectedBomId" @select="selectedBomId = $event" />
      </div>
      <div class="lg:col-span-2">
        <BomEditor :bom="selectedBom" @submit="handleSubmit" />
      </div>
    </div>

    <div v-show="activeTab === 'reconciliation'" class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div class="lg:col-span-1">
        <BomProjectList :boms="bomStore.boms" :selected-id="selectedBomId" @select="selectedBomId = $event" />
      </div>
      <div class="lg:col-span-2">
        <BomReconciliation :bom="selectedBom" />
      </div>
    </div>

    <div v-show="activeTab === 'approvals'" class="mt-6">
      <BomApprovalQueue :boms="bomStore.boms" @approve="handleApprove" @reject="handleReject" />
    </div>
  </div>
</template>
