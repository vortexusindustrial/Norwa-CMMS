// Mock procurement data: purchase requests, component reservations, and
// purchase orders. Stock levels and costs still live in stock.js — this file
// only tracks the request/reservation/PO workflow layered on top of it.

export const PURCHASE_REQUEST_STATUSES = ['pending', 'approved', 'ordered', 'received', 'rejected']

export const PURCHASE_REQUEST_STATUS_META = {
  pending: { label: 'Pending', badgeClass: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Approved', badgeClass: 'bg-blue-100 text-blue-700' },
  ordered: { label: 'Ordered', badgeClass: 'bg-violet-100 text-violet-700' },
  received: { label: 'Received', badgeClass: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', badgeClass: 'bg-red-100 text-red-700' },
}

export const RESERVATION_STATUSES = ['active', 'released', 'consumed']

export const RESERVATION_STATUS_META = {
  active: { label: 'Reserved', badgeClass: 'bg-violet-100 text-violet-700' },
  consumed: { label: 'Consumed', badgeClass: 'bg-green-100 text-green-700' },
  released: { label: 'Released', badgeClass: 'bg-gray-100 text-gray-600' },
}

export const PO_STATUSES = ['draft', 'sent', 'acknowledged', 'partially_received', 'received', 'cancelled']

export const PO_STATUS_META = {
  draft: { label: 'Draft', badgeClass: 'bg-gray-100 text-gray-600' },
  sent: { label: 'Sent', badgeClass: 'bg-blue-100 text-blue-700' },
  acknowledged: { label: 'Acknowledged', badgeClass: 'bg-violet-100 text-violet-700' },
  partially_received: { label: 'Partially Received', badgeClass: 'bg-amber-100 text-amber-700' },
  received: { label: 'Received', badgeClass: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelled', badgeClass: 'bg-red-100 text-red-700' },
}

export const purchaseRequests = [
  {
    id: 'PR-2026-001',
    partNumber: 'REFRIG-UNIT-10T',
    description: 'Refrigeration condensing unit, 10 ton',
    uom: 'Unit',
    qtyRequested: 1,
    reason: 'low_stock',
    status: 'approved',
    requestedDate: '2026-07-14',
    requestedBy: 'System (low stock)',
    poId: 'PO-2026-001',
  },
  {
    id: 'PR-2026-002',
    partNumber: 'FIRE-PUMP-DIESEL',
    description: 'Diesel fire pump set, 750GPM',
    uom: 'Unit',
    qtyRequested: 1,
    reason: 'low_stock',
    status: 'ordered',
    requestedDate: '2026-07-12',
    requestedBy: 'System (low stock)',
    poId: 'PO-2026-001',
  },
  {
    id: 'PR-2026-003',
    partNumber: 'BMS-CTRL-01',
    description: 'BMS zone controller module',
    uom: 'Unit',
    qtyRequested: 4,
    reason: 'manual',
    status: 'pending',
    requestedDate: '2026-07-16',
    requestedBy: "Michael Ndung'u",
    poId: null,
  },
]

export const reservations = [
  {
    id: 'RSV-2026-001',
    partNumber: 'INSUL-FOAM-25',
    description: 'Closed-cell foam pipe insulation, 25mm',
    uom: 'Meter',
    qtyReserved: 3,
    reservedFor: { type: 'workOrder', id: 'WO-2026-101', label: 'Chilled water pump vibration inspection' },
    reservedBy: 'Samuel Kiptoo',
    reservedDate: '2026-07-17',
    status: 'consumed',
  },
  {
    id: 'RSV-2026-002',
    partNumber: 'CHW-PUMP-050',
    description: 'Chilled water circulation pump, 5.5kW',
    uom: 'Unit',
    qtyReserved: 1,
    reservedFor: { type: 'bom', id: 'BOM-2026-001', label: 'Project PRJ-2026-001 BoM' },
    reservedBy: "Michael Ndung'u",
    reservedDate: '2026-07-15',
    status: 'active',
  },
  {
    id: 'RSV-2026-003',
    partNumber: 'PUMP-TRANS-15',
    description: 'Transfer pump, 15kW',
    uom: 'Unit',
    qtyReserved: 1,
    reservedFor: { type: 'workOrder', id: 'WO-2026-102', label: 'Refrigeration condensing unit fault — Cold Chamber 1' },
    reservedBy: 'Dennis Otieno',
    reservedDate: '2026-07-16',
    status: 'active',
  },
]

export const purchaseOrders = [
  {
    id: 'PO-2026-001',
    vendorName: 'Kentherm Industrial Supplies',
    requestIds: ['PR-2026-001', 'PR-2026-002'],
    status: 'sent',
    poDate: '2026-07-14',
    expectedDate: '2026-08-01',
  },
]
