<script setup>
import { ref, computed, watch } from 'vue'
import { DollarSign, Clock, ClipboardCheck } from 'lucide-vue-next'
import { assets } from '../data/assets'
import { laborEntries, CURRENT_TEAM } from '../data/workOrders'
import { useAuthStore } from '../stores/auth'
import { useWorkOrdersStore } from '../stores/workOrders'
import { useBomStore } from '../stores/bom'
import { useProcurementStore } from '../stores/procurement'
import { usePermissions } from '../composables/usePermissions'
import TcoDashboard from '../components/reports/TcoDashboard.vue'
import MttrTrendReport from '../components/reports/MttrTrendReport.vue'
import ApprovalPendingQueue from '../components/reports/ApprovalPendingQueue.vue'

const auth = useAuthStore()
const woStore = useWorkOrdersStore()
const bomStore = useBomStore()
const procurementStore = useProcurementStore()
const { accessLevel } = usePermissions()

const TABS = [
  { id: 'tco', label: 'TCO Dashboard', icon: DollarSign, permKey: 'reports.tco' },
  { id: 'mttr', label: 'MTTR Trend', icon: Clock, permKey: 'reports.mttr' },
  { id: 'approvals', label: 'Approval-Pending Queue', icon: ClipboardCheck, permKey: 'reports.approvalQueue' },
]

const visibleTabs = computed(() => TABS.filter((tab) => accessLevel(tab.permKey) !== 'none'))
const activeTab = ref(visibleTabs.value[0]?.id ?? null)
watch(visibleTabs, (tabs) => {
  if (!tabs.some((tab) => tab.id === activeTab.value)) activeTab.value = tabs[0]?.id ?? null
})

// 'scoped' (supervisor) narrows the MTTR trend to their own team's repairs —
// mirrors the "their team only" scoping used across Work Orders/Procurement.
const mttrScopeTeam = computed(() => (accessLevel('reports.mttr') === 'scoped' ? CURRENT_TEAM : null))
const mttrScopeLabel = computed(() => (mttrScopeTeam.value ? `${mttrScopeTeam.value} only` : null))

const pendingCloseouts = computed(() => woStore.workOrders.filter((wo) => wo.status === 'completed' && !wo.closedOut))
const pendingPurchaseRequests = computed(() => procurementStore.purchaseRequests.filter((pr) => pr.status === 'pending'))
</script>

<template>
  <div>
    <div class="flex items-start justify-between gap-4">
      <div>
        <h2 class="text-lg font-semibold text-gray-900">Cost &amp; Reporting</h2>
        <p class="mt-1 text-sm text-gray-500">
          Total cost of ownership, MTTR trends, and the approval-pending queue.
        </p>
      </div>

      <div v-if="visibleTabs.length > 1" class="flex shrink-0 flex-wrap items-center gap-1 rounded-md border border-gray-200 p-1">
        <button
          v-for="tab in visibleTabs"
          :key="tab.id"
          type="button"
          class="flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium"
          :class="activeTab === tab.id ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-50'"
          @click="activeTab = tab.id"
        >
          <component :is="tab.icon" class="h-3.5 w-3.5" />
          {{ tab.label }}
        </button>
      </div>
    </div>

    <div v-if="!visibleTabs.length" class="mt-6 rounded-lg border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
      You don't have access to any Cost &amp; Reporting features.
    </div>

    <template v-else>
      <div v-show="activeTab === 'tco'" class="mt-6">
        <TcoDashboard :assets="assets" :work-orders="woStore.workOrders" :labor-entries="laborEntries" />
      </div>

      <div v-show="activeTab === 'mttr'" class="mt-6">
        <MttrTrendReport
          :work-orders="mttrScopeTeam ? woStore.workOrders.filter((wo) => wo.team === mttrScopeTeam) : woStore.workOrders"
          :scope-label="mttrScopeLabel"
        />
      </div>

      <div v-show="activeTab === 'approvals'" class="mt-6">
        <ApprovalPendingQueue
          :boms="bomStore.pendingApprovals"
          :purchase-requests="pendingPurchaseRequests"
          :work-orders="pendingCloseouts"
          @approve-bom="(id) => bomStore.approve(id, auth.user?.name ?? 'Unknown')"
          @reject-bom="(id, reason) => bomStore.reject(id, auth.user?.name ?? 'Unknown', reason)"
          @approve-pr="procurementStore.approveRequest"
          @reject-pr="procurementStore.rejectRequest"
          @close-out="woStore.closeOutWorkOrder"
        />
      </div>
    </template>
  </div>
</template>
