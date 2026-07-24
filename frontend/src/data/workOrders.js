import { assetById, locationPath } from './assets'

export const WORK_ORDER_STATUSES = ['unassigned', 'assigned', 'in_progress', 'on_hold', 'completed']

export const WORK_ORDER_STATUS_META = {
  unassigned: { label: 'Unassigned', badgeClass: 'bg-gray-100 text-gray-600' },
  assigned: { label: 'Assigned', badgeClass: 'bg-violet-100 text-violet-700' },
  in_progress: { label: 'In Progress', badgeClass: 'bg-amber-100 text-amber-700' },
  on_hold: { label: 'On Hold', badgeClass: 'bg-orange-100 text-orange-700' },
  completed: { label: 'Completed', badgeClass: 'bg-green-100 text-green-700' },
}

export const PRIORITIES = ['high', 'medium', 'low']

export const PRIORITY_META = {
  high: { label: 'High', badgeClass: 'bg-red-100 text-red-700' },
  medium: { label: 'Medium', badgeClass: 'bg-amber-100 text-amber-700' },
  low: { label: 'Low', badgeClass: 'bg-gray-100 text-gray-600' },
}

// Technician roster. Names match the field technicians already assigned to
// projects in projects.js, grouped into the two shift teams referenced by
// the "their team/shift" queue scoping. hourlyRate feeds the TCO dashboard's
// labor cost rollup (see ReportsPage.vue).
export const TECHNICIANS = [
  { id: 'TECH-001', name: 'Samuel Kiptoo', team: 'Team A - Day Shift', hourlyRate: 1200, phone: '+254 733 210 456' },
  { id: 'TECH-002', name: 'Elijah Mutuku', team: 'Team A - Day Shift', hourlyRate: 1100, phone: '+254 701 884 220' },
  { id: 'TECH-003', name: 'Faith Chebet', team: 'Team A - Day Shift', hourlyRate: 1250, phone: '+254 712 903 771' },
  { id: 'TECH-004', name: 'Dennis Otieno', team: 'Team B - Night Shift', hourlyRate: 1150, phone: '+254 720 556 812' },
  { id: 'TECH-005', name: 'Collins Barasa', team: 'Team B - Night Shift', hourlyRate: 1300, phone: '+254 733 447 190' },
  { id: 'TECH-006', name: 'Winnie Adhiambo', team: 'Team B - Night Shift', hourlyRate: 1200, phone: '+254 700 928 315' },
]

// There's no real technician directory behind login yet — mockLogin (see
// stores/auth.js) only derives a *role* from a keyword in the email, not an
// identity. Until real auth exists, "current technician" and "current team"
// are fixed to one demo identity, the same way TechnicianDashboard.vue and
// SupervisorDashboard.vue already show fixed mock data regardless of which
// email was used to sign in. This is what "My Assigned", "own hours only",
// and "their team/shift" scope against.
export const CURRENT_TECHNICIAN_ID = 'TECH-001'
export const CURRENT_TEAM = 'Team A - Day Shift'

export function technicianById(id) {
  return TECHNICIANS.find((tech) => tech.id === id) ?? null
}

let nextChecklistId = 1
function checklist(...labels) {
  return labels.map((entry) => ({
    id: `CHK-${String(nextChecklistId++).padStart(3, '0')}`,
    label: typeof entry === 'string' ? entry : entry.label,
    done: typeof entry === 'object' ? entry.done : false,
  }))
}

let nextLotoPointId = 1
function lotoPoints(...entries) {
  return entries.map(({ label, lockNumber = null }) => ({
    id: `LP-${String(nextLotoPointId++).padStart(3, '0')}`,
    label,
    lockNumber,
  }))
}

export const workOrders = [
  {
    id: 'WO-2026-101',
    title: 'Chilled water pump vibration inspection',
    description: 'Vibration on P-1A trending above baseline for 3 consecutive IoT readings — inspect bearings before it trips.',
    priority: 'high',
    status: 'in_progress',
    technicianId: 'TECH-001',
    team: 'Team A - Day Shift',
    projectId: 'PRJ-2026-001',
    assetId: 'AST-1001',
    createdDate: '2026-07-16',
    scheduledDate: '2026-07-17',
    checklist: checklist(
      { label: 'Isolate pump and apply LOTO', done: true },
      { label: 'Inspect bearing housing for wear', done: true },
      { label: 'Record vibration reading with handheld meter', done: false },
      { label: 'Compare against baseline and log result', done: false }
    ),
    loto: {
      required: true,
      status: 'signed_off',
      permitNumber: 'LOTO-2026-101',
      isolatedAt: '2026-07-17T07:15:00+03:00',
      points: lotoPoints({ label: 'Pump motor isolator MI-1A locked out', lockNumber: 'LK-2201' }),
      signedOffBy: 'Samuel Kiptoo',
      signedOffAt: '2026-07-17T07:15:00+03:00',
    },
    // Stopped rather than 'running' with a fixed startedAt: elapsedMinutes()
    // computes now() - startedAt, so a hardcoded past timestamp would make
    // the seed's "live" timer balloon by however long it's been since this
    // file was authored. The technician resumes it with Start.
    timer: { status: 'stopped', totalMinutes: 45, startedAt: null },
    materials: [{ partNumber: 'INSUL-FOAM-25', description: 'Closed-cell foam pipe insulation, 25mm', qtyUsed: 3, uom: 'Meter' }],
  },
  {
    id: 'WO-2026-102',
    title: 'Refrigeration condensing unit fault — Cold Chamber 1',
    description: 'Condensing unit tripped offline after refrigerant pressure collapsed. Chamber 1 temperature at risk.',
    priority: 'high',
    status: 'assigned',
    technicianId: 'TECH-005',
    team: 'Team B - Night Shift',
    projectId: 'PRJ-2026-006',
    assetId: 'AST-3001',
    createdDate: '2026-07-16',
    scheduledDate: '2026-07-17',
    checklist: checklist('Confirm chamber temp is holding on backup', 'Isolate and apply LOTO', 'Leak-test refrigerant circuit', 'Re-gas and restart compressor'),
    loto: { required: true, status: 'pending', permitNumber: null, isolatedAt: null, points: [], signedOffBy: null, signedOffAt: null },
    timer: { status: 'stopped', totalMinutes: 0, startedAt: null },
    materials: [],
  },
  {
    id: 'WO-2026-103',
    title: 'Standby generator quarterly service',
    description: 'Routine quarterly service: oil, filters, and load-bank test per manufacturer schedule.',
    priority: 'medium',
    status: 'completed',
    technicianId: 'TECH-003',
    team: 'Team A - Day Shift',
    projectId: 'PRJ-2026-003',
    assetId: 'AST-2000',
    createdDate: '2026-07-01',
    scheduledDate: '2026-07-05',
    checklist: checklist(
      { label: 'Change engine oil and filter', done: true },
      { label: 'Inspect coolant and belts', done: true },
      { label: 'Run load-bank test', done: true }
    ),
    loto: { required: false, status: 'not_required', permitNumber: null, isolatedAt: null, points: [], signedOffBy: null, signedOffAt: null },
    timer: { status: 'stopped', totalMinutes: 150, startedAt: null },
    materials: [{ partNumber: 'GEN-OIL-15W40', description: 'Diesel engine oil, 15W-40', qtyUsed: 20, uom: 'Litre' }],
  },
  {
    id: 'WO-2026-104',
    title: 'Elevator Car 2 door operator service',
    description: 'Door operator flagged during routine check; car taken out of service pending repair.',
    priority: 'medium',
    status: 'on_hold',
    technicianId: 'TECH-006',
    team: 'Team B - Night Shift',
    projectId: 'PRJ-2026-007',
    assetId: 'AST-4002',
    createdDate: '2026-07-15',
    scheduledDate: '2026-07-18',
    checklist: checklist({ label: 'Take car out of service', done: true }, 'Replace door operator belt', 'Re-test full door cycle'),
    loto: {
      required: true,
      status: 'signed_off',
      permitNumber: 'LOTO-2026-104',
      isolatedAt: '2026-07-15T16:00:00+03:00',
      points: lotoPoints({ label: 'Car 2 main disconnect locked', lockNumber: 'LK-4402' }),
      signedOffBy: 'Winnie Adhiambo',
      signedOffAt: '2026-07-15T16:00:00+03:00',
    },
    timer: { status: 'stopped', totalMinutes: 30, startedAt: null },
    materials: [],
  },
  {
    id: 'WO-2026-105',
    title: 'BMS zone controller comms check',
    description: 'Intermittent comms drop reported by site staff on Z-3. Not IoT-flagged yet — investigate proactively.',
    priority: 'low',
    status: 'unassigned',
    technicianId: null,
    team: 'Team A - Day Shift',
    projectId: 'PRJ-2026-001',
    assetId: 'AST-1003',
    createdDate: '2026-07-16',
    scheduledDate: null,
    checklist: checklist('Check BACnet network cabling', 'Verify controller firmware version'),
    loto: { required: false, status: 'not_required', permitNumber: null, isolatedAt: null, points: [], signedOffBy: null, signedOffAt: null },
    timer: { status: 'stopped', totalMinutes: 0, startedAt: null },
    materials: [],
  },
  {
    id: 'WO-2026-106',
    title: 'Elevator Car 1 quarterly inspection',
    description: "Routine statutory inspection ahead of insurer's quarterly compliance check.",
    priority: 'low',
    status: 'assigned',
    technicianId: 'TECH-006',
    team: 'Team B - Night Shift',
    projectId: 'PRJ-2026-007',
    assetId: 'AST-4001',
    createdDate: '2026-07-14',
    scheduledDate: '2026-07-19',
    checklist: checklist('Test emergency brake', 'Test alarm and intercom', 'Log ride count and motor temp trend'),
    loto: { required: false, status: 'not_required', permitNumber: null, isolatedAt: null, points: [], signedOffBy: null, signedOffAt: null },
    timer: { status: 'stopped', totalMinutes: 0, startedAt: null },
    materials: [],
  },
  {
    id: 'WO-2026-107',
    title: 'Cold Chamber 2 preventive maintenance',
    description: 'Scheduled preventive maintenance on the healthy condensing unit while Chamber 1 is down, to avoid a second failure.',
    priority: 'medium',
    status: 'assigned',
    technicianId: 'TECH-005',
    team: 'Team B - Night Shift',
    projectId: 'PRJ-2026-006',
    assetId: 'AST-3011',
    createdDate: '2026-07-16',
    scheduledDate: '2026-07-18',
    checklist: checklist('Inspect refrigerant pressure trend', 'Clean condenser coil', 'Verify compressor amp draw'),
    loto: { required: true, status: 'pending', permitNumber: null, isolatedAt: null, points: [], signedOffBy: null, signedOffAt: null },
    timer: { status: 'stopped', totalMinutes: 0, startedAt: null },
    materials: [],
  },
  {
    id: 'WO-2026-108',
    title: 'Chiller plant BMS zone recalibration',
    description: 'Annual recalibration of the zone controller sensors against the chiller plant setpoints.',
    priority: 'low',
    status: 'completed',
    technicianId: 'TECH-001',
    team: 'Team A - Day Shift',
    projectId: 'PRJ-2026-001',
    assetId: 'AST-1000',
    createdDate: '2026-06-20',
    scheduledDate: '2026-06-25',
    checklist: checklist({ label: 'Recalibrate temperature sensors', done: true }, { label: 'Verify setpoints against BMS schedule', done: true }),
    loto: { required: false, status: 'not_required', permitNumber: null, isolatedAt: null, points: [], signedOffBy: null, signedOffAt: null },
    timer: { status: 'stopped', totalMinutes: 95, startedAt: null },
    materials: [],
  },

  // --- Closed-out history, kept minimal — these exist to give the MTTR
  // trend report (see ReportsPage.vue) more than one month of data.
  {
    id: 'WO-2026-109',
    title: 'Cold Chamber 1 condensing unit repair',
    description: 'Refrigerant leak repair and compressor replacement.',
    priority: 'high',
    status: 'completed',
    technicianId: 'TECH-005',
    team: 'Team B - Night Shift',
    projectId: 'PRJ-2026-006',
    assetId: 'AST-3001',
    createdDate: '2026-02-10',
    scheduledDate: '2026-02-12',
    checklist: checklist({ label: 'Isolate and recover refrigerant', done: true }, { label: 'Replace compressor', done: true }),
    loto: {
      required: true,
      status: 'signed_off',
      permitNumber: 'LOTO-2026-109',
      isolatedAt: '2026-02-12T09:00:00+03:00',
      points: lotoPoints({ label: 'Condensing unit compressor isolator locked', lockNumber: 'LK-3301' }),
      signedOffBy: 'Collins Barasa',
      signedOffAt: '2026-02-12T09:00:00+03:00',
    },
    timer: { status: 'stopped', totalMinutes: 220, startedAt: null },
    materials: [],
    closedOut: true,
  },
  {
    id: 'WO-2026-110',
    title: 'Elevator Car 2 door operator repair',
    description: 'Door operator motor replacement after repeated stalling.',
    priority: 'medium',
    status: 'completed',
    technicianId: 'TECH-004',
    team: 'Team B - Night Shift',
    projectId: 'PRJ-2026-007',
    assetId: 'AST-4002',
    createdDate: '2026-03-08',
    scheduledDate: '2026-03-10',
    checklist: checklist({ label: 'Take car out of service', done: true }, { label: 'Replace door operator motor', done: true }),
    loto: {
      required: true,
      status: 'signed_off',
      permitNumber: 'LOTO-2026-110',
      isolatedAt: '2026-03-10T10:00:00+03:00',
      points: lotoPoints({ label: 'Car 2 main disconnect locked', lockNumber: 'LK-4402' }),
      signedOffBy: 'Dennis Otieno',
      signedOffAt: '2026-03-10T10:00:00+03:00',
    },
    timer: { status: 'stopped', totalMinutes: 180, startedAt: null },
    materials: [],
    closedOut: true,
  },
  {
    id: 'WO-2026-111',
    title: 'Chilled water pump P-1A seal replacement',
    description: 'Mechanical seal replacement following minor leak.',
    priority: 'medium',
    status: 'completed',
    technicianId: 'TECH-002',
    team: 'Team A - Day Shift',
    projectId: 'PRJ-2026-001',
    assetId: 'AST-1001',
    createdDate: '2026-04-14',
    scheduledDate: '2026-04-15',
    checklist: checklist({ label: 'Isolate pump and apply LOTO', done: true }, { label: 'Replace mechanical seal', done: true }),
    loto: {
      required: true,
      status: 'signed_off',
      permitNumber: 'LOTO-2026-111',
      isolatedAt: '2026-04-15T08:00:00+03:00',
      points: lotoPoints({ label: 'Pump motor isolator MI-1A locked out', lockNumber: 'LK-2201' }),
      signedOffBy: 'Elijah Mutuku',
      signedOffAt: '2026-04-15T08:00:00+03:00',
    },
    timer: { status: 'stopped', totalMinutes: 90, startedAt: null },
    materials: [],
    closedOut: true,
  },
  {
    id: 'WO-2026-112',
    title: 'Standby generator starter fault',
    description: 'Starter motor fault preventing auto-start on transfer test.',
    priority: 'high',
    status: 'completed',
    technicianId: 'TECH-003',
    team: 'Team A - Day Shift',
    projectId: 'PRJ-2026-003',
    assetId: 'AST-2000',
    createdDate: '2026-05-18',
    scheduledDate: '2026-05-19',
    checklist: checklist({ label: 'Diagnose starter circuit', done: true }, { label: 'Replace starter motor', done: true }),
    loto: {
      required: true,
      status: 'signed_off',
      permitNumber: 'LOTO-2026-112',
      isolatedAt: '2026-05-19T11:00:00+03:00',
      points: lotoPoints({ label: 'Generator control panel isolator locked', lockNumber: 'LK-2001' }),
      signedOffBy: 'Faith Chebet',
      signedOffAt: '2026-05-19T11:00:00+03:00',
    },
    timer: { status: 'stopped', totalMinutes: 130, startedAt: null },
    materials: [],
    closedOut: true,
  },
  {
    id: 'WO-2026-113',
    title: 'Cold Chamber 2 condensing unit inspection fault',
    description: 'Compressor amp draw spike traced to a failing contactor.',
    priority: 'medium',
    status: 'completed',
    technicianId: 'TECH-006',
    team: 'Team B - Night Shift',
    projectId: 'PRJ-2026-006',
    assetId: 'AST-3011',
    createdDate: '2026-06-08',
    scheduledDate: '2026-06-09',
    checklist: checklist({ label: 'Diagnose contactor fault', done: true }, { label: 'Replace contactor', done: true }),
    loto: {
      required: true,
      status: 'signed_off',
      permitNumber: 'LOTO-2026-113',
      isolatedAt: '2026-06-09T09:30:00+03:00',
      points: lotoPoints({ label: 'Condensing unit compressor isolator locked', lockNumber: 'LK-3311' }),
      signedOffBy: 'Winnie Adhiambo',
      signedOffAt: '2026-06-09T09:30:00+03:00',
    },
    timer: { status: 'stopped', totalMinutes: 100, startedAt: null },
    materials: [],
    closedOut: true,
  },
  {
    id: 'WO-2026-114',
    title: 'Elevator Car 1 motor temp fault',
    description: 'Motor running hot under load — cooling fan bearing replaced.',
    priority: 'medium',
    status: 'completed',
    technicianId: 'TECH-001',
    team: 'Team A - Day Shift',
    projectId: 'PRJ-2026-007',
    assetId: 'AST-4001',
    createdDate: '2026-07-08',
    scheduledDate: '2026-07-09',
    checklist: checklist({ label: 'Diagnose motor cooling fan', done: true }, { label: 'Replace fan bearing', done: true }),
    loto: {
      required: true,
      status: 'signed_off',
      permitNumber: 'LOTO-2026-114',
      isolatedAt: '2026-07-09T14:00:00+03:00',
      points: lotoPoints({ label: 'Car 1 main disconnect locked', lockNumber: 'LK-4401' }),
      signedOffBy: 'Samuel Kiptoo',
      signedOffAt: '2026-07-09T14:00:00+03:00',
    },
    timer: { status: 'stopped', totalMinutes: 60, startedAt: null },
    materials: [],
    closedOut: true,
  },
]

// Standalone labor ledger — entries reference a work order rather than
// nesting inside it, so the Labor Log tab can list/filter across every work
// order from one place instead of duplicating an entry form per WO.
export const laborEntries = [
  { id: 'LAB-001', workOrderId: 'WO-2026-101', technicianId: 'TECH-001', date: '2026-07-17', hours: 0.75, notes: 'Isolation, LOTO, and bearing inspection.' },
  { id: 'LAB-002', workOrderId: 'WO-2026-103', technicianId: 'TECH-003', date: '2026-07-05', hours: 2.5, notes: 'Full quarterly service and load-bank test.' },
  { id: 'LAB-003', workOrderId: 'WO-2026-104', technicianId: 'TECH-006', date: '2026-07-15', hours: 0.5, notes: 'Fault diagnosis, car taken out of service.' },
  { id: 'LAB-004', workOrderId: 'WO-2026-108', technicianId: 'TECH-001', date: '2026-06-25', hours: 1.5, notes: 'Sensor recalibration against BMS schedule.' },
  { id: 'LAB-005', workOrderId: 'WO-2026-108', technicianId: 'TECH-002', date: '2026-06-25', hours: 0.25, notes: 'Assisted with setpoint verification.' },
]

export function workOrderById(id) {
  return workOrders.find((wo) => wo.id === id) ?? null
}

export function elapsedMinutes(wo) {
  if (wo.timer.status !== 'running' || !wo.timer.startedAt) return wo.timer.totalMinutes
  const runningMinutes = Math.floor((Date.now() - new Date(wo.timer.startedAt).getTime()) / 60000)
  return wo.timer.totalMinutes + Math.max(runningMinutes, 0)
}

// Work orders don't carry a location directly — they inherit the site of
// the asset they're raised against, via the location registry in assets.js.
export function siteFor(wo) {
  const asset = wo.assetId ? assetById(wo.assetId) : null
  if (!asset) return null
  return locationPath(asset.locationId)[0] ?? null
}
