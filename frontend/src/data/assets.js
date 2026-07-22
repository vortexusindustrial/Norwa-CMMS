// Single source of truth for asset status. Every status-derived visual —
// tree dots, detail badges, and summary stats — reads from ASSET_STATUS_META
// so they can never drift out of sync. Mirrors the pattern in projects.js.
export const ASSET_STATUSES = ['operational', 'under_maintenance', 'fault', 'decommissioned']

export const ASSET_STATUS_META = {
  operational: { label: 'Operational', badgeClass: 'bg-green-100 text-green-700', dotClass: 'bg-green-500' },
  under_maintenance: { label: 'Under Maintenance', badgeClass: 'bg-amber-100 text-amber-700', dotClass: 'bg-amber-500' },
  fault: { label: 'Fault', badgeClass: 'bg-red-100 text-red-700', dotClass: 'bg-red-500' },
  decommissioned: { label: 'Decommissioned', badgeClass: 'bg-gray-100 text-gray-500', dotClass: 'bg-gray-400' },
}

// IoT/telemetry health, separate from asset lifecycle status above — a unit
// can be 'operational' but reporting a 'warning' from a sensor trend.
export const HEALTH_STATUS_META = {
  healthy: { label: 'Healthy', badgeClass: 'bg-green-100 text-green-700', textClass: 'text-green-600', strokeColor: '#22C55E' },
  warning: { label: 'Attention', badgeClass: 'bg-amber-100 text-amber-700', textClass: 'text-amber-600', strokeColor: '#F59E0B' },
  critical: { label: 'Critical', badgeClass: 'bg-red-100 text-red-700', textClass: 'text-red-600', strokeColor: '#EF4444' },
  offline: { label: 'Offline', badgeClass: 'bg-gray-100 text-gray-500', textClass: 'text-gray-400', strokeColor: '#9CA3AF' },
}

export const LOCATION_TYPE_LABEL = {
  site: 'Site',
  building: 'Building',
  zone: 'Zone',
  room: 'Room',
}

// Location registry — a separate hierarchy from asset parent/child, so a
// site's physical layout can be browsed independently of equipment nesting.
export const locations = [
  { id: 'LOC-TR', name: 'Two Rivers Mall', type: 'site', parentId: null, projectId: 'PRJ-2026-001' },
  { id: 'LOC-TR-B1', name: 'Plant Room, Level B1', type: 'room', parentId: 'LOC-TR' },
  { id: 'LOC-TR-L2', name: 'Level 2, Retail Wing', type: 'floor', parentId: 'LOC-TR' },

  { id: 'LOC-GC', name: 'Garden City Mall', type: 'site', parentId: null, projectId: 'PRJ-2026-003' },
  { id: 'LOC-GC-YARD', name: 'Generator Yard', type: 'room', parentId: 'LOC-GC' },

  { id: 'LOC-JKIA', name: 'JKIA Cargo Terminal', type: 'site', parentId: null, projectId: 'PRJ-2026-006' },
  { id: 'LOC-JKIA-C1', name: 'Cold Storage Chamber 1', type: 'room', parentId: 'LOC-JKIA' },
  { id: 'LOC-JKIA-C2', name: 'Cold Storage Chamber 2', type: 'room', parentId: 'LOC-JKIA' },

  { id: 'LOC-KAREN', name: 'Karen Business Park', type: 'site', parentId: null, projectId: 'PRJ-2026-007' },
  { id: 'LOC-KAREN-CORE', name: 'Elevator Core, Main Building', type: 'zone', parentId: 'LOC-KAREN' },
]

function trend(...values) {
  return values
}

// Flat asset list. Hierarchy is expressed via parentId (equipment nesting,
// e.g. a pump under its chiller plant) — independent of locationId, which
// places the asset in the location registry above.
export const assets = [
  // --- Two Rivers Mall HVAC ---
  {
    id: 'AST-1000',
    acquisitionCost: 12500000,
    name: 'Chiller Plant CH-1',
    category: 'HVAC',
    status: 'operational',
    parentId: null,
    locationId: 'LOC-TR-B1',
    projectId: 'PRJ-2026-001',
    erpnextAssetId: 'ACC-ASS-2026-00011',
    manufacturer: 'Trane',
    model: 'CVHF-500',
    serialNumber: 'TR-CVHF-88213',
    installDate: '2026-05-12',
    warrantyExpiry: '2029-05-12',
    health: {
      status: 'healthy',
      healthScore: 94,
      lastReadingAt: '2026-07-16T07:40:00+03:00',
      metrics: [
        { key: 'condenser_temp', label: 'Condenser Temp', unit: '°C', value: 31.4, range: [20, 38], status: 'healthy', trend: trend(29, 30, 30.5, 31, 30.8, 31.2, 31.4) },
        { key: 'runtime', label: 'Runtime (24h)', unit: 'hrs', value: 18.2, range: [0, 24], status: 'healthy', trend: trend(16, 17, 18, 17.5, 18.6, 18, 18.2) },
      ],
      alerts: [],
    },
  },
  {
    id: 'AST-1001',
    acquisitionCost: 178000,
    name: 'Chilled Water Pump P-1A',
    category: 'HVAC',
    status: 'operational',
    parentId: 'AST-1000',
    locationId: 'LOC-TR-B1',
    projectId: 'PRJ-2026-001',
    erpnextAssetId: 'ACC-ASS-2026-00012',
    manufacturer: 'Grundfos',
    model: 'NK 80-250',
    serialNumber: 'GF-NK80-55210',
    installDate: '2026-05-12',
    warrantyExpiry: '2028-05-12',
    health: {
      status: 'warning',
      healthScore: 76,
      lastReadingAt: '2026-07-16T07:38:00+03:00',
      metrics: [
        { key: 'vibration', label: 'Vibration', unit: 'mm/s', value: 5.8, range: [0, 4.5], status: 'warning', trend: trend(3.2, 3.4, 3.9, 4.6, 5.1, 5.5, 5.8) },
        { key: 'bearing_temp', label: 'Bearing Temp', unit: '°C', value: 58, range: [30, 65], status: 'warning', trend: trend(48, 50, 52, 54, 55, 57, 58) },
      ],
      alerts: [
        { id: 'ALT-101', severity: 'warning', message: 'Vibration trending above 4.5mm/s baseline for 3 consecutive readings.', timestamp: '2026-07-16T06:00:00+03:00' },
      ],
    },
  },
  {
    id: 'AST-1002',
    acquisitionCost: 178000,
    name: 'Chilled Water Pump P-1B',
    category: 'HVAC',
    status: 'operational',
    parentId: 'AST-1000',
    locationId: 'LOC-TR-B1',
    projectId: 'PRJ-2026-001',
    erpnextAssetId: 'ACC-ASS-2026-00013',
    manufacturer: 'Grundfos',
    model: 'NK 80-250',
    serialNumber: 'GF-NK80-55211',
    installDate: '2026-05-12',
    warrantyExpiry: '2028-05-12',
    health: {
      status: 'healthy',
      healthScore: 91,
      lastReadingAt: '2026-07-16T07:38:00+03:00',
      metrics: [
        { key: 'vibration', label: 'Vibration', unit: 'mm/s', value: 2.1, range: [0, 4.5], status: 'healthy', trend: trend(2.4, 2.3, 2.2, 2.0, 2.1, 2.0, 2.1) },
        { key: 'bearing_temp', label: 'Bearing Temp', unit: '°C', value: 41, range: [30, 65], status: 'healthy', trend: trend(40, 41, 40, 42, 41, 41, 41) },
      ],
      alerts: [],
    },
  },
  {
    id: 'AST-1003',
    acquisitionCost: 43500,
    name: 'BMS Zone Controller Z-3',
    category: 'Controls',
    status: 'operational',
    parentId: 'AST-1000',
    locationId: 'LOC-TR-L2',
    projectId: 'PRJ-2026-001',
    erpnextAssetId: 'ACC-ASS-2026-00014',
    manufacturer: 'Honeywell',
    model: 'Spyder BACnet',
    serialNumber: 'HW-SPY-30442',
    installDate: '2026-05-20',
    warrantyExpiry: '2028-05-20',
    health: {
      status: 'healthy',
      healthScore: 98,
      lastReadingAt: '2026-07-16T07:41:00+03:00',
      metrics: [
        { key: 'uptime', label: 'Comms Uptime', unit: '%', value: 99.8, range: [95, 100], status: 'healthy', trend: trend(99.5, 99.6, 99.7, 99.9, 99.8, 99.9, 99.8) },
      ],
      alerts: [],
    },
  },

  // --- Garden City Mall backup power ---
  {
    id: 'AST-2000',
    acquisitionCost: 18500000,
    name: 'Standby Generator G-1',
    category: 'Power',
    status: 'operational',
    parentId: null,
    locationId: 'LOC-GC-YARD',
    projectId: 'PRJ-2026-003',
    erpnextAssetId: 'ACC-ASS-2026-00021',
    manufacturer: 'Cummins',
    model: 'C1000D5',
    serialNumber: 'CU-C1000-77102',
    installDate: '2026-03-15',
    warrantyExpiry: '2031-03-15',
    health: {
      status: 'healthy',
      healthScore: 96,
      lastReadingAt: '2026-07-16T07:30:00+03:00',
      metrics: [
        { key: 'engine_temp', label: 'Engine Temp', unit: '°C', value: 82, range: [60, 105], status: 'healthy', trend: trend(78, 80, 81, 79, 82, 81, 82) },
        { key: 'oil_pressure', label: 'Oil Pressure', unit: 'bar', value: 4.1, range: [3, 5.5], status: 'healthy', trend: trend(4.3, 4.2, 4.2, 4.0, 4.1, 4.1, 4.1) },
      ],
      alerts: [],
    },
  },
  {
    id: 'AST-2001',
    acquisitionCost: 950000,
    name: 'ATS Panel',
    category: 'Power',
    status: 'operational',
    parentId: 'AST-2000',
    locationId: 'LOC-GC-YARD',
    projectId: 'PRJ-2026-003',
    erpnextAssetId: 'ACC-ASS-2026-00022',
    manufacturer: 'ASCO',
    model: '4000 Series',
    serialNumber: 'ASCO-4000-19087',
    installDate: '2026-03-15',
    warrantyExpiry: '2029-03-15',
    health: {
      status: 'healthy',
      healthScore: 99,
      lastReadingAt: '2026-07-16T07:30:00+03:00',
      metrics: [
        { key: 'transfer_count', label: 'Transfers (30d)', unit: '', value: 2, range: [0, 10], status: 'healthy', trend: trend(0, 0, 1, 1, 1, 2, 2) },
      ],
      alerts: [],
    },
  },

  // --- JKIA cold storage ---
  {
    id: 'AST-3000',
    acquisitionCost: 3500000,
    name: 'Cold Storage Chamber 1',
    category: 'Refrigeration',
    status: 'fault',
    parentId: null,
    locationId: 'LOC-JKIA-C1',
    projectId: 'PRJ-2026-006',
    erpnextAssetId: 'ACC-ASS-2026-00031',
    manufacturer: 'Carrier',
    model: 'ColdRoom-10T',
    serialNumber: 'CR-CLD10-40881',
    installDate: '2026-08-25',
    warrantyExpiry: '2030-08-25',
    health: {
      status: 'healthy',
      healthScore: 90,
      lastReadingAt: '2026-07-16T07:35:00+03:00',
      metrics: [
        { key: 'chamber_temp', label: 'Chamber Temp', unit: '°C', value: -18.2, range: [-22, -16], status: 'healthy', trend: trend(-18.6, -18.4, -18.1, -18.3, -18, -18.2, -18.2) },
      ],
      alerts: [],
    },
  },
  {
    id: 'AST-3001',
    acquisitionCost: 1900000,
    name: 'Refrigeration Condensing Unit 1',
    category: 'Refrigeration',
    status: 'fault',
    parentId: 'AST-3000',
    locationId: 'LOC-JKIA-C1',
    projectId: 'PRJ-2026-006',
    erpnextAssetId: 'ACC-ASS-2026-00032',
    manufacturer: 'Bitzer',
    model: '4TES-9Y',
    serialNumber: 'BZ-4TES-60217',
    installDate: '2026-08-25',
    warrantyExpiry: '2030-08-25',
    health: {
      status: 'critical',
      healthScore: 22,
      lastReadingAt: '2026-07-16T07:12:00+03:00',
      metrics: [
        { key: 'refrigerant_pressure', label: 'Refrigerant Pressure', unit: 'bar', value: 2.1, range: [6, 12], status: 'critical', trend: trend(9.8, 9.2, 8.1, 6.4, 4.0, 2.9, 2.1) },
        { key: 'compressor_amps', label: 'Compressor Draw', unit: 'A', value: 0, range: [8, 22], status: 'critical', trend: trend(18, 19, 17, 12, 4, 0, 0) },
      ],
      alerts: [
        { id: 'ALT-301', severity: 'critical', message: 'Refrigerant pressure collapsed below safe operating range — compressor tripped offline.', timestamp: '2026-07-16T07:12:00+03:00' },
      ],
    },
  },
  {
    id: 'AST-3010',
    acquisitionCost: 3500000,
    name: 'Cold Storage Chamber 2',
    category: 'Refrigeration',
    status: 'operational',
    parentId: null,
    locationId: 'LOC-JKIA-C2',
    projectId: 'PRJ-2026-006',
    erpnextAssetId: 'ACC-ASS-2026-00033',
    manufacturer: 'Carrier',
    model: 'ColdRoom-10T',
    serialNumber: 'CR-CLD10-40882',
    installDate: '2026-08-25',
    warrantyExpiry: '2030-08-25',
    health: {
      status: 'healthy',
      healthScore: 93,
      lastReadingAt: '2026-07-16T07:35:00+03:00',
      metrics: [
        { key: 'chamber_temp', label: 'Chamber Temp', unit: '°C', value: -17.8, range: [-22, -16], status: 'healthy', trend: trend(-18, -17.9, -17.7, -17.9, -17.8, -17.6, -17.8) },
      ],
      alerts: [],
    },
  },
  {
    id: 'AST-3011',
    acquisitionCost: 1900000,
    name: 'Refrigeration Condensing Unit 2',
    category: 'Refrigeration',
    status: 'operational',
    parentId: 'AST-3010',
    locationId: 'LOC-JKIA-C2',
    projectId: 'PRJ-2026-006',
    erpnextAssetId: 'ACC-ASS-2026-00034',
    manufacturer: 'Bitzer',
    model: '4TES-9Y',
    serialNumber: 'BZ-4TES-60218',
    installDate: '2026-08-25',
    warrantyExpiry: '2030-08-25',
    health: {
      status: 'healthy',
      healthScore: 89,
      lastReadingAt: '2026-07-16T07:35:00+03:00',
      metrics: [
        { key: 'refrigerant_pressure', label: 'Refrigerant Pressure', unit: 'bar', value: 9.4, range: [6, 12], status: 'healthy', trend: trend(9.0, 9.2, 9.1, 9.3, 9.5, 9.3, 9.4) },
        { key: 'compressor_amps', label: 'Compressor Draw', unit: 'A', value: 15, range: [8, 22], status: 'healthy', trend: trend(14, 15, 16, 15, 14, 15, 15) },
      ],
      alerts: [],
    },
  },

  // --- Karen Business Park elevators ---
  {
    id: 'AST-4000',
    acquisitionCost: 2500000,
    name: 'Elevator Bank A',
    category: 'Vertical Transport',
    status: 'operational',
    parentId: null,
    locationId: 'LOC-KAREN-CORE',
    projectId: 'PRJ-2026-007',
    erpnextAssetId: 'ACC-ASS-2026-00041',
    manufacturer: 'KONE',
    model: 'MonoSpace DX',
    serialNumber: 'KN-MSDX-90011',
    installDate: '2026-02-10',
    warrantyExpiry: '2031-02-10',
    health: { status: 'healthy', healthScore: 95, lastReadingAt: '2026-07-16T07:20:00+03:00', metrics: [], alerts: [] },
  },
  {
    id: 'AST-4001',
    acquisitionCost: 4200000,
    name: 'Elevator Car 1',
    category: 'Vertical Transport',
    status: 'operational',
    parentId: 'AST-4000',
    locationId: 'LOC-KAREN-CORE',
    projectId: 'PRJ-2026-007',
    erpnextAssetId: 'ACC-ASS-2026-00042',
    manufacturer: 'KONE',
    model: 'MonoSpace DX',
    serialNumber: 'KN-MSDX-90012',
    installDate: '2026-02-10',
    warrantyExpiry: '2031-02-10',
    health: {
      status: 'healthy',
      healthScore: 92,
      lastReadingAt: '2026-07-16T07:20:00+03:00',
      metrics: [
        { key: 'ride_count', label: 'Rides (24h)', unit: '', value: 214, range: [0, 400], status: 'healthy', trend: trend(180, 190, 205, 198, 210, 200, 214) },
        { key: 'motor_temp', label: 'Motor Temp', unit: '°C', value: 46, range: [20, 70], status: 'healthy', trend: trend(42, 43, 45, 44, 46, 45, 46) },
      ],
      alerts: [],
    },
  },
  {
    id: 'AST-4002',
    acquisitionCost: 4200000,
    name: 'Elevator Car 2',
    category: 'Vertical Transport',
    status: 'under_maintenance',
    parentId: 'AST-4000',
    locationId: 'LOC-KAREN-CORE',
    projectId: 'PRJ-2026-007',
    erpnextAssetId: 'ACC-ASS-2026-00043',
    manufacturer: 'KONE',
    model: 'MonoSpace DX',
    serialNumber: 'KN-MSDX-90013',
    installDate: '2026-02-10',
    warrantyExpiry: '2031-02-10',
    health: {
      status: 'offline',
      healthScore: 0,
      lastReadingAt: '2026-07-15T16:05:00+03:00',
      metrics: [],
      alerts: [
        { id: 'ALT-402', severity: 'warning', message: 'Taken offline for scheduled door operator service; telemetry paused.', timestamp: '2026-07-15T16:05:00+03:00' },
      ],
    },
  },
  {
    id: 'AST-4003',
    acquisitionCost: 4200000,
    name: 'Elevator Car 3',
    category: 'Vertical Transport',
    status: 'operational',
    parentId: 'AST-4000',
    locationId: 'LOC-KAREN-CORE',
    projectId: 'PRJ-2026-007',
    erpnextAssetId: 'ACC-ASS-2026-00044',
    manufacturer: 'KONE',
    model: 'MonoSpace DX',
    serialNumber: 'KN-MSDX-90014',
    installDate: '2026-02-10',
    warrantyExpiry: '2031-02-10',
    health: {
      status: 'healthy',
      healthScore: 90,
      lastReadingAt: '2026-07-16T07:20:00+03:00',
      metrics: [
        { key: 'ride_count', label: 'Rides (24h)', unit: '', value: 189, range: [0, 400], status: 'healthy', trend: trend(150, 160, 170, 165, 180, 175, 189) },
        { key: 'motor_temp', label: 'Motor Temp', unit: '°C', value: 44, range: [20, 70], status: 'healthy', trend: trend(41, 42, 43, 42, 44, 43, 44) },
      ],
      alerts: [],
    },
  },
]

export function assetById(id) {
  return assets.find((asset) => asset.id === id) ?? null
}

export function childrenOf(assetId) {
  return assets.filter((asset) => asset.parentId === assetId)
}

export function rootAssets() {
  return assets.filter((asset) => asset.parentId === null)
}

// Walks up the parentId chain, root-first, excluding the asset itself.
export function ancestorsOf(assetId) {
  const chain = []
  let current = assetById(assetId)
  while (current?.parentId) {
    current = assetById(current.parentId)
    if (current) chain.unshift(current)
  }
  return chain
}

// Every asset below this one in the hierarchy, at any depth.
export function descendantsOf(assetId) {
  const found = []
  let frontier = childrenOf(assetId)
  while (frontier.length) {
    found.push(...frontier)
    frontier = frontier.flatMap((asset) => childrenOf(asset.id))
  }
  return found
}

// True when any descendant is reporting critical health — the signal a
// collapsed parent row surfaces so a failing component isn't hidden a few
// levels down (e.g. a condensing unit fault under an otherwise-fine chamber).
export function hasCriticalDescendant(assetId) {
  return descendantsOf(assetId).some((asset) => asset.health.status === 'critical')
}

export function locationById(id) {
  return locations.find((location) => location.id === id) ?? null
}

export function childLocationsOf(locationId) {
  return locations.filter((location) => location.parentId === locationId)
}

export function rootLocations() {
  return locations.filter((location) => location.parentId === null)
}

// Root-first breadcrumb of location names, e.g. "Two Rivers Mall / Plant Room, Level B1".
export function locationPath(locationId) {
  const path = []
  let current = locationById(locationId)
  while (current) {
    path.unshift(current)
    current = current.parentId ? locationById(current.parentId) : null
  }
  return path
}

export function assetsAtLocation(locationId) {
  return assets.filter((asset) => asset.locationId === locationId)
}

// Recursive count of assets at this location and every descendant location —
// what the location registry shows as a site/building's total asset count.
export function assetCountFor(locationId) {
  const descendantIds = new Set([locationId])
  let frontier = [locationId]
  while (frontier.length) {
    const next = locations.filter((location) => frontier.includes(location.parentId))
    next.forEach((location) => descendantIds.add(location.id))
    frontier = next.map((location) => location.id)
  }
  return assets.filter((asset) => descendantIds.has(asset.locationId)).length
}

// Frappe/ERPNext desk route for the Asset doctype — the CMMS app is mounted
// under /cmms while the desk owns /app on the same origin (see router.js).
export function erpnextUrl(asset) {
  return `/app/asset/${asset.erpnextAssetId}`
}
