// Source of truth for BoM status. Every status-derived visual reads
// from BOM_STATUS_META. Badge-only display.
export const BOM_STATUSES = ['draft', 'pending_approval', 'approved', 'rejected']

export const BOM_STATUS_META = {
  draft: { label: 'Draft', badgeClass: 'bg-gray-100 text-gray-600' },
  pending_approval: { label: 'Pending Approval', badgeClass: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Approved', badgeClass: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', badgeClass: 'bg-red-100 text-red-700' },
}

export const boms = [
  {
    id: 'BOM-2026-001',
    projectId: 'PRJ-2026-001',
    status: 'draft',
    submittedBy: null,
    submittedDate: null,
    decidedBy: null,
    decidedDate: null,
    rejectionReason: null,
    items: [
      { id: 'ITM-001', partNumber: 'CHW-PUMP-050', description: 'Chilled water circulation pump, 5.5kW', uom: 'Unit', qtyRequired: 2, estimatedUnitCost: 185000 },
      { id: 'ITM-002', partNumber: 'DUCT-GI-24G', description: 'Galvanized iron ducting sheet, 24 gauge', uom: 'Sheet', qtyRequired: 40, estimatedUnitCost: 3200 },
      { id: 'ITM-003', partNumber: 'BMS-CTRL-01', description: 'BMS zone controller module', uom: 'Unit', qtyRequired: 6, estimatedUnitCost: 42000 },
      { id: 'ITM-004', partNumber: 'INSUL-FOAM-25', description: 'Closed-cell foam pipe insulation, 25mm', uom: 'Meter', qtyRequired: 120, estimatedUnitCost: 450 },
    ],
  },
  {
    id: 'BOM-2026-002',
    projectId: 'PRJ-2026-002',
    status: 'pending_approval',
    submittedBy: 'Peter Mwangi',
    submittedDate: '2026-07-10',
    decidedBy: null,
    decidedDate: null,
    rejectionReason: null,
    items: [
      { id: 'ITM-005', partNumber: 'FILT-MEDIA-M1', description: 'Multi-media filtration sand/gravel pack', uom: 'Bag', qtyRequired: 60, estimatedUnitCost: 2100 },
      { id: 'ITM-006', partNumber: 'CHLOR-DOSE-P2', description: 'Chlorine dosing pump, 20L/h', uom: 'Unit', qtyRequired: 3, estimatedUnitCost: 68000 },
      { id: 'ITM-007', partNumber: 'PIPE-UPVC-110', description: 'uPVC pipe, 110mm, 6m length', uom: 'Length', qtyRequired: 80, estimatedUnitCost: 3800 },
      { id: 'ITM-008', partNumber: 'PUMP-TRANS-15', description: 'Transfer pump, 15kW', uom: 'Unit', qtyRequired: 4, estimatedUnitCost: 210000 },
      { id: 'ITM-009', partNumber: 'VALVE-GATE-100', description: 'Gate valve, 100mm', uom: 'Unit', qtyRequired: 12, estimatedUnitCost: 8500 },
    ],
  },
  {
    id: 'BOM-2026-003',
    projectId: 'PRJ-2026-003',
    status: 'approved',
    submittedBy: 'Susan Achieng',
    submittedDate: '2026-01-20',
    decidedBy: "Michael Ndung'u",
    decidedDate: '2026-01-22',
    rejectionReason: null,
    items: [
      { id: 'ITM-010', partNumber: 'GEN-1000KVA', description: '1000kVA standby diesel generator', uom: 'Unit', qtyRequired: 1, estimatedUnitCost: 18500000 },
      { id: 'ITM-011', partNumber: 'ATS-PANEL-1000A', description: 'Automatic transfer switch panel, 1000A', uom: 'Unit', qtyRequired: 1, estimatedUnitCost: 950000 },
      { id: 'ITM-012', partNumber: 'CABLE-CU-95', description: 'Copper power cable, 95mm2', uom: 'Meter', qtyRequired: 150, estimatedUnitCost: 2800 },
    ],
  },
  {
    id: 'BOM-2026-004',
    projectId: 'PRJ-2026-004',
    status: 'pending_approval',
    submittedBy: 'Daniel Kiprotich',
    submittedDate: '2026-07-12',
    decidedBy: null,
    decidedDate: null,
    rejectionReason: null,
    items: [
      { id: 'ITM-013', partNumber: 'SPKLR-HEAD-K5', description: 'Sprinkler head, K5.6 pendant', uom: 'Unit', qtyRequired: 320, estimatedUnitCost: 950 },
      { id: 'ITM-014', partNumber: 'FIRE-PUMP-DIESEL', description: 'Diesel fire pump set, 750GPM', uom: 'Unit', qtyRequired: 2, estimatedUnitCost: 4200000 },
      { id: 'ITM-015', partNumber: 'PIPE-STEEL-150', description: 'Black steel pipe, 150mm, sch40', uom: 'Length', qtyRequired: 90, estimatedUnitCost: 12500 },
      { id: 'ITM-016', partNumber: 'RISER-VALVE-SET', description: 'Riser valve assembly set', uom: 'Set', qtyRequired: 22, estimatedUnitCost: 38000 },
      { id: 'ITM-017', partNumber: 'FLOW-SWITCH-01', description: 'Waterflow switch, paddle type', uom: 'Unit', qtyRequired: 22, estimatedUnitCost: 6200 },
      { id: 'ITM-018', partNumber: 'FIRE-ALARM-PANEL', description: 'Addressable fire alarm control panel', uom: 'Unit', qtyRequired: 1, estimatedUnitCost: 620000 },
    ],
  },
  {
    id: 'BOM-2026-005',
    projectId: 'PRJ-2026-006',
    status: 'rejected',
    submittedBy: 'James Odhiambo',
    submittedDate: '2026-02-25',
    decidedBy: "Michael Ndung'u",
    decidedDate: '2026-02-27',
    rejectionReason: 'Refrigerant unit spec does not match approved cold-chain standard; resubmit with R448A-rated units.',
    items: [
      { id: 'ITM-019', partNumber: 'REFRIG-UNIT-10T', description: 'Refrigeration condensing unit, 10 ton', uom: 'Unit', qtyRequired: 2, estimatedUnitCost: 1850000 },
      { id: 'ITM-020', partNumber: 'PANEL-INSUL-100', description: 'Insulated cold room panel, 100mm', uom: 'Sqm', qtyRequired: 280, estimatedUnitCost: 5400 },
      { id: 'ITM-021', partNumber: 'TEMP-LOGGER-01', description: 'Continuous temperature data logger', uom: 'Unit', qtyRequired: 8, estimatedUnitCost: 24500 },
    ],
  },
  {
    id: 'BOM-2026-006',
    projectId: 'PRJ-2026-007',
    status: 'approved',
    submittedBy: 'Alice Wambui',
    submittedDate: '2025-11-05',
    decidedBy: "Michael Ndung'u",
    decidedDate: '2025-11-08',
    rejectionReason: null,
    items: [
      { id: 'ITM-022', partNumber: 'ELEV-CTRL-MRL', description: 'Machine-room-less elevator controller', uom: 'Unit', qtyRequired: 4, estimatedUnitCost: 1250000 },
      { id: 'ITM-023', partNumber: 'ELEV-CAB-PANEL', description: 'Cabin interior panel set', uom: 'Set', qtyRequired: 4, estimatedUnitCost: 380000 },
      { id: 'ITM-024', partNumber: 'ELEV-CABLE-STEEL', description: 'Steel suspension cable, 12mm', uom: 'Meter', qtyRequired: 480, estimatedUnitCost: 1900 },
    ],
  },
]
