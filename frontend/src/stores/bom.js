import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { boms as mockBoms } from '../data/boms'

export const useBomStore = defineStore('bom', () => {
  const boms = ref(mockBoms)

  const pendingApprovals = computed(() => boms.value.filter((bom) => bom.status === 'pending_approval'))

  function bomById(id) {
    return boms.value.find((bom) => bom.id === id) ?? null
  }

  function createDraft(projectId) {
    if (boms.value.some((bom) => bom.projectId === projectId)) return null
    const bom = {
      id: `BOM-${Date.now()}`,
      projectId,
      status: 'draft',
      submittedBy: null,
      submittedDate: null,
      decidedBy: null,
      decidedDate: null,
      rejectionReason: null,
      items: [],
    }
    boms.value.push(bom)
    return bom
  }

  function submitForApproval(bomId, submittedBy) {
    const bom = bomById(bomId)
    if (!bom || bom.status !== 'draft') return
    bom.status = 'pending_approval'
    bom.submittedBy = submittedBy
    bom.submittedDate = new Date().toISOString().slice(0, 10)
  }

  function approve(bomId, decidedBy) {
    const bom = bomById(bomId)
    if (!bom || bom.status !== 'pending_approval') return
    bom.status = 'approved'
    bom.decidedBy = decidedBy
    bom.decidedDate = new Date().toISOString().slice(0, 10)
  }

  function reject(bomId, decidedBy, reason) {
    const bom = bomById(bomId)
    if (!bom || bom.status !== 'pending_approval') return
    bom.status = 'rejected'
    bom.decidedBy = decidedBy
    bom.decidedDate = new Date().toISOString().slice(0, 10)
    bom.rejectionReason = reason
  }

  function addLineItem(bomId, item) {
    const bom = bomById(bomId)
    if (!bom) return
    bom.items.push({ id: `ITM-${Date.now()}`, ...item })
  }

  function removeLineItem(bomId, itemId) {
    const bom = bomById(bomId)
    if (!bom) return
    bom.items = bom.items.filter((item) => item.id !== itemId)
  }

  function updateLineItemQty(bomId, itemId, qty) {
    const bom = bomById(bomId)
    const item = bom?.items.find((i) => i.id === itemId)
    if (item) item.qtyRequired = qty
  }

  function updateLineItemCost(bomId, itemId, cost) {
    const bom = bomById(bomId)
    const item = bom?.items.find((i) => i.id === itemId)
    if (item) item.estimatedUnitCost = cost
  }

  return {
    boms,
    pendingApprovals,
    bomById,
    createDraft,
    submitForApproval,
    approve,
    reject,
    addLineItem,
    removeLineItem,
    updateLineItemQty,
    updateLineItemCost,
  }
})
