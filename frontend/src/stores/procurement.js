import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { purchaseRequests as mockPurchaseRequests, reservations as mockReservations, purchaseOrders as mockPurchaseOrders } from '../data/procurement'
import { stockCatalog, lowStockParts } from '../data/stock'

export const useProcurementStore = defineStore('procurement', () => {
  const purchaseRequests = ref(mockPurchaseRequests)
  const reservations = ref(mockReservations)
  const purchaseOrders = ref(mockPurchaseOrders)

  // Auto-generate a pending request for any low-stock part that doesn't
  // already have an open one (pending/approved/ordered) — mirrors what a
  // real reorder-point trigger would do on stock level changes.
  function syncLowStockRequests() {
    for (const part of lowStockParts()) {
      const hasOpenRequest = purchaseRequests.value.some(
        (pr) => pr.partNumber === part.partNumber && ['pending', 'approved', 'ordered'].includes(pr.status)
      )
      if (hasOpenRequest) continue
      purchaseRequests.value.push({
        id: `PR-${Date.now()}-${part.partNumber}`,
        partNumber: part.partNumber,
        description: part.description,
        uom: part.uom,
        qtyRequested: Math.max(part.reorderPoint - part.onHand, 1),
        reason: 'low_stock',
        status: 'pending',
        requestedDate: new Date().toISOString().slice(0, 10),
        requestedBy: 'System (low stock)',
        poId: null,
      })
    }
  }
  syncLowStockRequests()

  function requestById(id) {
    return purchaseRequests.value.find((pr) => pr.id === id) ?? null
  }

  function createManualRequest(item) {
    purchaseRequests.value.push({
      id: `PR-${Date.now()}`,
      reason: 'manual',
      status: 'pending',
      requestedDate: new Date().toISOString().slice(0, 10),
      poId: null,
      ...item,
    })
  }

  function approveRequest(id) {
    const pr = requestById(id)
    if (!pr || pr.status !== 'pending') return
    pr.status = 'approved'
  }

  function rejectRequest(id) {
    const pr = requestById(id)
    if (!pr || pr.status !== 'pending') return
    pr.status = 'rejected'
  }

  function poById(id) {
    return purchaseOrders.value.find((po) => po.id === id) ?? null
  }

  // "Trigger" — raises a PO against a set of approved requests, without any
  // vendor record management (no vendor CRUD lives here, just the name).
  function createPurchaseOrder(vendorName, requestIds) {
    const po = {
      id: `PO-${Date.now()}`,
      vendorName,
      requestIds,
      status: 'draft',
      poDate: new Date().toISOString().slice(0, 10),
      expectedDate: null,
    }
    purchaseOrders.value.push(po)
    for (const id of requestIds) {
      const pr = requestById(id)
      if (pr) {
        pr.poId = po.id
        pr.status = 'ordered'
      }
    }
    return po
  }

  // "Track" — status updates only, e.g. sent -> acknowledged -> received.
  function updatePoStatus(poId, status) {
    const po = poById(poId)
    if (!po) return
    po.status = status
    if (status === 'received') {
      for (const id of po.requestIds) {
        const pr = requestById(id)
        if (pr) pr.status = 'received'
      }
    }
  }

  function reservationById(id) {
    return reservations.value.find((r) => r.id === id) ?? null
  }

  function reserveComponent(item) {
    reservations.value.push({
      id: `RSV-${Date.now()}`,
      status: 'active',
      reservedDate: new Date().toISOString().slice(0, 10),
      ...item,
    })
  }

  function releaseReservation(id) {
    const reservation = reservationById(id)
    if (!reservation || reservation.status !== 'active') return
    reservation.status = 'released'
  }

  function consumeReservation(id) {
    const reservation = reservationById(id)
    if (!reservation || reservation.status !== 'active') return
    reservation.status = 'consumed'
    const stock = stockCatalog[reservation.partNumber]
    if (stock) stock.onHand = Math.max(stock.onHand - reservation.qtyReserved, 0)
  }

  const lowStock = computed(() => lowStockParts())

  return {
    purchaseRequests,
    reservations,
    purchaseOrders,
    lowStock,
    requestById,
    createManualRequest,
    approveRequest,
    rejectRequest,
    poById,
    createPurchaseOrder,
    updatePoStatus,
    reservationById,
    reserveComponent,
    releaseReservation,
    consumeReservation,
  }
})
