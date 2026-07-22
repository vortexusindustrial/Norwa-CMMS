export const ROLES = {
  ADMIN: 'System Administrator',
  MANAGER: 'Maintenance Manager',
  SUPERVISOR: 'Shift Supervisor',
  TECHNICIAN: 'Field Technician',
}

// 'full' | 'scoped' | 'view' | 'none'. Nav-item granularity for now —
// finer-grained checks (per button, per column) can key into the same
// sections as those pages get built out.
export const SECTION_ACCESS = {
  dashboard: {
    [ROLES.ADMIN]: 'full',
    [ROLES.MANAGER]: 'full',
    [ROLES.SUPERVISOR]: 'full',
    [ROLES.TECHNICIAN]: 'full',
  },
  projects: {
    [ROLES.ADMIN]: 'full',
    [ROLES.MANAGER]: 'full',
    [ROLES.SUPERVISOR]: 'none',
    [ROLES.TECHNICIAN]: 'none',
  },
  bom: {
    [ROLES.ADMIN]: 'full',
    [ROLES.MANAGER]: 'full',
    [ROLES.SUPERVISOR]: 'none',
    [ROLES.TECHNICIAN]: 'none',
  },
  assets: {
    [ROLES.ADMIN]: 'full',
    [ROLES.MANAGER]: 'full',
    [ROLES.SUPERVISOR]: 'scoped',
    [ROLES.TECHNICIAN]: 'none',
  },
  workOrders: {
    [ROLES.ADMIN]: 'full',
    [ROLES.MANAGER]: 'full',
    [ROLES.SUPERVISOR]: 'scoped',
    [ROLES.TECHNICIAN]: 'full',
  },
  
  'workOrders.queue': {
    [ROLES.ADMIN]: 'full',
    [ROLES.MANAGER]: 'full',
    [ROLES.SUPERVISOR]: 'scoped', // their team/shift only
    [ROLES.TECHNICIAN]: 'none',
  },
  'workOrders.myAssigned': {
    [ROLES.ADMIN]: 'view',
    [ROLES.MANAGER]: 'view',
    [ROLES.SUPERVISOR]: 'view',
    [ROLES.TECHNICIAN]: 'full', // technician's home screen
  },
  'workOrders.detail': {
    [ROLES.ADMIN]: 'full',
    [ROLES.MANAGER]: 'full',
    [ROLES.SUPERVISOR]: 'full',
    [ROLES.TECHNICIAN]: 'scoped', // their own orders only
  },
  'workOrders.assignmentBoard': {
    [ROLES.ADMIN]: 'full',
    [ROLES.MANAGER]: 'scoped', // view + override
    [ROLES.SUPERVISOR]: 'full',
    [ROLES.TECHNICIAN]: 'none',
  },
  'workOrders.materialLogging': {
    [ROLES.ADMIN]: 'full',
    [ROLES.MANAGER]: 'view',
    [ROLES.SUPERVISOR]: 'view',
    [ROLES.TECHNICIAN]: 'full',
  },
  'workOrders.laborLog': {
    [ROLES.ADMIN]: 'full',
    [ROLES.MANAGER]: 'full',
    [ROLES.SUPERVISOR]: 'full',
    [ROLES.TECHNICIAN]: 'scoped', // own hours only
  },
  procurement: {
    [ROLES.ADMIN]: 'full',
    [ROLES.MANAGER]: 'full',
    [ROLES.SUPERVISOR]: 'scoped',
    [ROLES.TECHNICIAN]: 'none',
  },
  
  'procurement.stockCheck': {
    [ROLES.ADMIN]: 'full',
    [ROLES.MANAGER]: 'full',
    [ROLES.SUPERVISOR]: 'scoped', // parts needed for their shift's jobs
    [ROLES.TECHNICIAN]: 'view',
  },
  'procurement.purchaseRequestQueue': {
    [ROLES.ADMIN]: 'full',
    [ROLES.MANAGER]: 'full',
    [ROLES.SUPERVISOR]: 'none',
    [ROLES.TECHNICIAN]: 'none',
  },
  'procurement.componentReservation': {
    [ROLES.ADMIN]: 'full',
    [ROLES.MANAGER]: 'full',
    [ROLES.SUPERVISOR]: 'view',
    [ROLES.TECHNICIAN]: 'view',
  },
  'procurement.vendorPoStatus': {
    [ROLES.ADMIN]: 'full',
    [ROLES.MANAGER]: 'scoped', // trigger + track status, not vendor record management
    [ROLES.SUPERVISOR]: 'none',
    [ROLES.TECHNICIAN]: 'none',
  },
  'procurement.vendorManagement': {
    [ROLES.ADMIN]: 'full',
    [ROLES.MANAGER]: 'none',
    [ROLES.SUPERVISOR]: 'none',
    [ROLES.TECHNICIAN]: 'none',
  },

  reports: {
    [ROLES.ADMIN]: 'full',
    [ROLES.MANAGER]: 'full',
    [ROLES.SUPERVISOR]: 'scoped',
    [ROLES.TECHNICIAN]: 'none',
  },

  'reports.tco': {
    [ROLES.ADMIN]: 'full',
    [ROLES.MANAGER]: 'full',
    [ROLES.SUPERVISOR]: 'none',
    [ROLES.TECHNICIAN]: 'none',
  },
  'reports.mttr': {
    [ROLES.ADMIN]: 'full',
    [ROLES.MANAGER]: 'full',
    [ROLES.SUPERVISOR]: 'scoped', // their team only
    [ROLES.TECHNICIAN]: 'none',
  },
  'reports.approvalQueue': {
    [ROLES.ADMIN]: 'full',
    [ROLES.MANAGER]: 'full',
    [ROLES.SUPERVISOR]: 'none',
    [ROLES.TECHNICIAN]: 'none',
  },
  administration: {
    [ROLES.ADMIN]: 'full',
    [ROLES.MANAGER]: 'none',
    [ROLES.SUPERVISOR]: 'none',
    [ROLES.TECHNICIAN]: 'none',
  },
  // Sub-feature grants within the Administration page. All admin-only —
  // no other role reaches this page at all (see 'administration' above) —
  // except auditLog, which is capped at 'view' for every role including
  // Admin: deletion is blocked in the UI regardless of who's looking.
  'administration.userManagement': {
    [ROLES.ADMIN]: 'full',
    [ROLES.MANAGER]: 'none',
    [ROLES.SUPERVISOR]: 'none',
    [ROLES.TECHNICIAN]: 'none',
  },
  'administration.permissionMatrix': {
    [ROLES.ADMIN]: 'full',
    [ROLES.MANAGER]: 'none',
    [ROLES.SUPERVISOR]: 'none',
    [ROLES.TECHNICIAN]: 'none',
  },
  'administration.systemHealth': {
    [ROLES.ADMIN]: 'full',
    [ROLES.MANAGER]: 'none',
    [ROLES.SUPERVISOR]: 'none',
    [ROLES.TECHNICIAN]: 'none',
  },
  'administration.auditLog': {
    [ROLES.ADMIN]: 'view', // deletion blocked even for Admin
    [ROLES.MANAGER]: 'none',
    [ROLES.SUPERVISOR]: 'none',
    [ROLES.TECHNICIAN]: 'none',
  },
  'administration.globalSettings': {
    [ROLES.ADMIN]: 'full',
    [ROLES.MANAGER]: 'none',
    [ROLES.SUPERVISOR]: 'none',
    [ROLES.TECHNICIAN]: 'none',
  },
}

const LEVEL_RANK = { full: 3, scoped: 2, view: 1, none: 0 }

export function accessLevelFor(section, roles = []) {
  const levels = roles.map((role) => SECTION_ACCESS[section]?.[role] ?? 'none')
  return levels.reduce((best, level) => (LEVEL_RANK[level] > LEVEL_RANK[best] ? level : best), 'none')
}
