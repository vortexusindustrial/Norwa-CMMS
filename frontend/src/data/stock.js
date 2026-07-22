// Mock stock/parts catalog, keyed by part number. This is the source of
// truth for current unit cost and on-hand quantity — BoM line items only
// carry an estimatedUnitCost fallback for parts not yet in this catalog.
// reorderPoint is the on-hand threshold below which the procurement store
// auto-generates a purchase request (see stores/procurement.js).
export const stockCatalog = {
  'CHW-PUMP-050': { description: 'Chilled water circulation pump, 5.5kW', uom: 'Unit', onHand: 1, unitCost: 178000, reorderPoint: 2 },
  'DUCT-GI-24G': { description: 'Galvanized iron ducting sheet, 24 gauge', uom: 'Sheet', onHand: 55, unitCost: 3100, reorderPoint: 20 },
  'BMS-CTRL-01': { description: 'BMS zone controller module', uom: 'Unit', onHand: 2, unitCost: 43500, reorderPoint: 3 },
  // INSUL-FOAM-25 intentionally has no catalog entry — a non-stock/specialty
  // part, so its BoM line item falls back to estimatedUnitCost.
  'FILT-MEDIA-M1': { description: 'Multi-media filtration sand/gravel pack', uom: 'Bag', onHand: 40, unitCost: 2050, reorderPoint: 15 },
  'CHLOR-DOSE-P2': { description: 'Chlorine dosing pump, 20L/h', uom: 'Unit', onHand: 1, unitCost: 71000, reorderPoint: 2 },
  'PIPE-UPVC-110': { description: 'uPVC pipe, 110mm, 6m length', uom: 'Length', onHand: 100, unitCost: 3650, reorderPoint: 25 },
  'PUMP-TRANS-15': { description: 'Transfer pump, 15kW', uom: 'Unit', onHand: 2, unitCost: 205000, reorderPoint: 2 },
  'VALVE-GATE-100': { description: 'Gate valve, 100mm', uom: 'Unit', onHand: 20, unitCost: 8200, reorderPoint: 10 },
  'GEN-1000KVA': { description: '1000kVA standby diesel generator', uom: 'Unit', onHand: 1, unitCost: 18500000, reorderPoint: 1 },
  'ATS-PANEL-1000A': { description: 'Automatic transfer switch panel, 1000A', uom: 'Unit', onHand: 1, unitCost: 950000, reorderPoint: 1 },
  'CABLE-CU-95': { description: 'Copper power cable, 95mm2', uom: 'Meter', onHand: 150, unitCost: 2750, reorderPoint: 50 },
  'SPKLR-HEAD-K5': { description: 'Sprinkler head, K5.6 pendant', uom: 'Unit', onHand: 150, unitCost: 900, reorderPoint: 50 },
  'FIRE-PUMP-DIESEL': { description: 'Diesel fire pump set, 750GPM', uom: 'Unit', onHand: 0, unitCost: 4300000, reorderPoint: 1 },
  'PIPE-STEEL-150': { description: 'Black steel pipe, 150mm, sch40', uom: 'Length', onHand: 30, unitCost: 12800, reorderPoint: 10 },
  'RISER-VALVE-SET': { description: 'Riser valve assembly set', uom: 'Set', onHand: 10, unitCost: 39500, reorderPoint: 5 },
  'FLOW-SWITCH-01': { description: 'Waterflow switch, paddle type', uom: 'Unit', onHand: 30, unitCost: 6000, reorderPoint: 10 },
  'FIRE-ALARM-PANEL': { description: 'Addressable fire alarm control panel', uom: 'Unit', onHand: 1, unitCost: 610000, reorderPoint: 1 },
  'REFRIG-UNIT-10T': { description: 'Refrigeration condensing unit, 10 ton', uom: 'Unit', onHand: 0, unitCost: 1900000, reorderPoint: 1 },
  'PANEL-INSUL-100': { description: 'Insulated cold room panel, 100mm', uom: 'Sqm', onHand: 150, unitCost: 5400, reorderPoint: 50 },
  'TEMP-LOGGER-01': { description: 'Continuous temperature data logger', uom: 'Unit', onHand: 8, unitCost: 24500, reorderPoint: 5 },
  'ELEV-CTRL-MRL': { description: 'Machine-room-less elevator controller', uom: 'Unit', onHand: 4, unitCost: 1250000, reorderPoint: 2 },
  'ELEV-CAB-PANEL': { description: 'Cabin interior panel set', uom: 'Set', onHand: 4, unitCost: 380000, reorderPoint: 2 },
  'ELEV-CABLE-STEEL': { description: 'Steel suspension cable, 12mm', uom: 'Meter', onHand: 480, unitCost: 1900, reorderPoint: 100 },
}

// Parts currently at or below their reorder point.
export function lowStockParts() {
  return Object.entries(stockCatalog)
    .filter(([, stock]) => stock.onHand <= stock.reorderPoint)
    .map(([partNumber, stock]) => ({ partNumber, ...stock }))
}

export function stockFor(partNumber) {
  return stockCatalog[partNumber] ?? null
}

// Resolves the unit cost to use for a BoM line item: the catalog's current
// price when the part is stocked, otherwise the line item's own estimate.
export function costInfoFor(item) {
  const stock = stockFor(item.partNumber)
  if (stock) return { unitCost: stock.unitCost, fromCatalog: true }
  return { unitCost: item.estimatedUnitCost, fromCatalog: false }
}

// Total cost across all of a BoM's line items. Single source for the
// summary figure shown in both BomProjectList and BomApprovalQueue.
export function totalCostFor(bom) {
  return bom.items.reduce((sum, item) => sum + item.qtyRequired * costInfoFor(item).unitCost, 0)
}
