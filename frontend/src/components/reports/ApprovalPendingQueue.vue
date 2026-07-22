<script setup>
import { ref } from 'vue'
import { projects } from '../../data/projects'
import { assetById } from '../../data/assets'
import { totalCostFor } from '../../data/stock'
import { formatCurrency } from '../../utils/currency'

defineProps({
  boms: { type: Array, required: true },
  purchaseRequests: { type: Array, required: true },
  workOrders: { type: Array, required: true },
})

const emit = defineEmits(['approve-bom', 'reject-bom', 'approve-pr', 'reject-pr', 'close-out'])

function projectFor(bom) {
  return projects.find((p) => p.id === bom.projectId) ?? null
}

const rejectingBomId = ref(null)
const rejectReason = ref('')
function startReject(bomId) {
  rejectingBomId.value = bomId
  rejectReason.value = ''
}
function confirmReject(bomId) {
  if (!rejectReason.value.trim()) return
  emit('reject-bom', bomId, rejectReason.value.trim())
  rejectingBomId.value = null
  rejectReason.value = ''
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="rounded-lg border border-gray-200 bg-white p-5">
      <h3 class="text-sm font-semibold text-gray-900">BoM Approvals</h3>
      <div v-if="!boms.length" class="mt-3 rounded-md border border-dashed border-gray-200 p-4 text-center text-sm text-gray-500">
        No BoMs awaiting approval.
      </div>
      <ul v-else class="mt-3 flex flex-col gap-3">
        <li v-for="bom in boms" :key="bom.id" class="rounded-md border border-gray-200 p-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm font-medium text-gray-900">{{ projectFor(bom)?.name }}</p>
              <p class="mt-0.5 text-xs text-gray-500">
                {{ bom.id }} &middot; submitted by {{ bom.submittedBy }} on {{ bom.submittedDate }} &middot; {{ bom.items.length }} items &middot; {{ formatCurrency(totalCostFor(bom)) }}
              </p>
            </div>
            <div v-if="rejectingBomId !== bom.id" class="flex shrink-0 gap-1.5">
              <button type="button" class="rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50" @click="startReject(bom.id)">Reject</button>
              <button type="button" class="rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white hover:bg-gray-800" @click="emit('approve-bom', bom.id)">Approve</button>
            </div>
          </div>
          <div v-if="rejectingBomId === bom.id" class="mt-3">
            <textarea
              v-model="rejectReason"
              rows="2"
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
              placeholder="Explain what needs to change before resubmission..."
            />
            <div class="mt-2 flex justify-end gap-2">
              <button type="button" class="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50" @click="rejectingBomId = null">Cancel</button>
              <button
                type="button"
                class="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="!rejectReason.trim()"
                @click="confirmReject(bom.id)"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <div class="rounded-lg border border-gray-200 bg-white p-5">
      <h3 class="text-sm font-semibold text-gray-900">Purchase Requests</h3>
      <div v-if="!purchaseRequests.length" class="mt-3 rounded-md border border-dashed border-gray-200 p-4 text-center text-sm text-gray-500">
        No purchase requests awaiting approval.
      </div>
      <ul v-else class="mt-3 flex flex-col gap-3">
        <li v-for="pr in purchaseRequests" :key="pr.id" class="flex items-center justify-between gap-3 rounded-md border border-gray-200 p-4">
          <div>
            <p class="text-sm font-medium text-gray-900">{{ pr.partNumber }} — {{ pr.description }}</p>
            <p class="mt-0.5 text-xs text-gray-500">
              Qty {{ pr.qtyRequested }} {{ pr.uom }} &middot; {{ pr.reason === 'low_stock' ? 'Low stock' : 'Manual' }} &middot; requested by {{ pr.requestedBy }} on {{ pr.requestedDate }}
            </p>
          </div>
          <div class="flex shrink-0 gap-1.5">
            <button type="button" class="rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50" @click="emit('reject-pr', pr.id)">Reject</button>
            <button type="button" class="rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white hover:bg-gray-800" @click="emit('approve-pr', pr.id)">Approve</button>
          </div>
        </li>
      </ul>
    </div>

    <div class="rounded-lg border border-gray-200 bg-white p-5">
      <h3 class="text-sm font-semibold text-gray-900">Work Order Closeout</h3>
      <div v-if="!workOrders.length" class="mt-3 rounded-md border border-dashed border-gray-200 p-4 text-center text-sm text-gray-500">
        No completed work orders awaiting closeout.
      </div>
      <ul v-else class="mt-3 flex flex-col gap-3">
        <li v-for="wo in workOrders" :key="wo.id" class="flex items-center justify-between gap-3 rounded-md border border-gray-200 p-4">
          <div>
            <p class="text-sm font-medium text-gray-900">{{ wo.title }}</p>
            <p class="mt-0.5 text-xs text-gray-500">
              {{ wo.id }} &middot; {{ assetById(wo.assetId)?.name }} &middot; completed {{ wo.scheduledDate }} &middot; {{ (wo.timer.totalMinutes / 60).toFixed(1) }}h logged
            </p>
          </div>
          <button type="button" class="shrink-0 rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white hover:bg-gray-800" @click="emit('close-out', wo.id)">
            Close Out
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>
