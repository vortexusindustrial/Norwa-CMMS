<script setup>
import { ref, computed } from 'vue'
import { projects } from '../../data/projects'
import { costInfoFor, totalCostFor } from '../../data/stock'
import { formatCurrency } from '../../utils/currency'
import BomLineItemsTable from './BomLineItemsTable.vue'

const props = defineProps({
  boms: { type: Array, required: true },
})

const emit = defineEmits(['approve', 'reject'])

const pending = computed(() => props.boms.filter((bom) => bom.status === 'pending_approval'))

const selectedQueueId = ref(pending.value[0]?.id ?? null)
const selectedBom = computed(() => pending.value.find((bom) => bom.id === selectedQueueId.value) ?? null)

const showRejectForm = ref(false)
const rejectReason = ref('')

function projectFor(bom) {
  return projects.find((p) => p.id === bom.projectId) ?? null
}

function selectQueueItem(id) {
  selectedQueueId.value = id
  showRejectForm.value = false
  rejectReason.value = ''
}

function confirmApprove() {
  if (!selectedBom.value) return
  emit('approve', selectedBom.value.id)
}

function confirmReject() {
  if (!selectedBom.value || !rejectReason.value.trim()) return
  emit('reject', selectedBom.value.id, rejectReason.value.trim())
  showRejectForm.value = false
  rejectReason.value = ''
}
</script>

<template>
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
    <div class="lg:col-span-1">
      <div v-if="!pending.length" class="rounded-lg border border-gray-200 bg-white p-5 text-center text-sm text-gray-500">
        No BoMs awaiting approval.
      </div>
      <ul v-else class="flex flex-col gap-3">
        <li
          v-for="bom in pending"
          :key="bom.id"
          class="cursor-pointer rounded-lg border bg-white p-4 transition-colors"
          :class="bom.id === selectedQueueId ? 'border-gray-900' : 'border-gray-200 hover:bg-gray-50'"
          @click="selectQueueItem(bom.id)"
        >
          <p class="text-sm font-medium text-gray-900">{{ projectFor(bom)?.name }}</p>
          <p class="mt-1 text-xs text-gray-500">Submitted by {{ bom.submittedBy }} &middot; {{ bom.submittedDate }}</p>
          <p class="mt-2 text-xs text-gray-500">{{ bom.items.length }} items &middot; {{ formatCurrency(totalCostFor(bom)) }}</p>
        </li>
      </ul>
    </div>

    <div class="lg:col-span-2">
      <div v-if="!selectedBom" class="rounded-lg border border-gray-200 bg-white p-5 py-16 text-center text-sm text-gray-500">
        Select a BoM to review.
      </div>
      <div v-else class="rounded-lg border border-gray-200 bg-white p-5">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h3 class="text-base font-semibold text-gray-900">{{ projectFor(selectedBom)?.name }}</h3>
            <p class="mt-0.5 text-xs text-gray-500">
              {{ selectedBom.id }} &middot; submitted by {{ selectedBom.submittedBy }} on {{ selectedBom.submittedDate }}
            </p>
          </div>
        </div>

        <div class="mt-4">
          <BomLineItemsTable :items="selectedBom.items" readonly :cost-info-for="costInfoFor" />
        </div>

        <div v-if="!showRejectForm" class="mt-5 flex justify-end gap-2">
          <button
            type="button"
            class="rounded-md border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
            @click="showRejectForm = true"
          >
            Reject
          </button>
          <button
            type="button"
            class="rounded-md bg-gray-900 px-3 py-2 text-xs font-medium text-white hover:bg-gray-800"
            @click="confirmApprove"
          >
            Approve
          </button>
        </div>

        <div v-else class="mt-5">
          <label class="block text-xs font-medium text-gray-500">Rejection reason</label>
          <textarea
            v-model="rejectReason"
            rows="3"
            class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
            placeholder="Explain what needs to change before resubmission..."
          />
          <div class="mt-2 flex justify-end gap-2">
            <button
              type="button"
              class="rounded-md border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
              @click="showRejectForm = false"
            >
              Cancel
            </button>
            <button
              type="button"
              class="rounded-md bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="!rejectReason.trim()"
              @click="confirmReject"
            >
              Confirm Rejection
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
