export const ROLES = {
  ADMIN: 'System Administrator',
  MANAGER: 'Maintenance Manager',
  SUPERVISOR: 'Shift Supervisor',
  TECHNICIAN: 'Field Technician',
}

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
    [ROLES.SUPERVISOR]: 'view',
    [ROLES.TECHNICIAN]: 'scoped',
  },

  'projects.list': {
    [ROLES.ADMIN]: 'full',
    [ROLES.MANAGER]: 'full',
    [ROLES.SUPERVISOR]: 'view',
    [ROLES.TECHNICIAN]: 'scoped', 
  },
  'projects.detail': {
    [ROLES.ADMIN]: 'full',
    [ROLES.MANAGER]: 'full',
    [ROLES.SUPERVISOR]: 'view',
    [ROLES.TECHNICIAN]: 'scoped',
  },
  'projects.assignment': {
    [ROLES.ADMIN]: 'full',
    [ROLES.MANAGER]: 'full',
    [ROLES.SUPERVISOR]: 'full', 
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
    [ROLES.TECHNICIAN]: 'view',
  },

  'assets.detail': {
    [ROLES.ADMIN]: 'full',
    [ROLES.MANAGER]: 'full',
    [ROLES.SUPERVISOR]: 'scoped', 
    [ROLES.TECHNICIAN]: 'view', 
  },
  'assets.health': {
    [ROLES.ADMIN]: 'full',
    [ROLES.MANAGER]: 'full',
    [ROLES.SUPERVISOR]: 'scoped', 
    [ROLES.TECHNICIAN]: 'view',
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
    [ROLES.SUPERVISOR]: 'scoped', 
    [ROLES.TECHNICIAN]: 'none',
  },
  'workOrders.myAssigned': {
    [ROLES.ADMIN]: 'view',
    [ROLES.MANAGER]: 'view',
    [ROLES.SUPERVISOR]: 'view',
    [ROLES.TECHNICIAN]: 'full', 
  },
  'workOrders.detail': {
    [ROLES.ADMIN]: 'full',
    [ROLES.MANAGER]: 'full',
    [ROLES.SUPERVISOR]: 'full',
    [ROLES.TECHNICIAN]: 'scoped', 
  },
  'workOrders.assignmentBoard': {
    [ROLES.ADMIN]: 'full',
    [ROLES.MANAGER]: 'scoped', 
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
    [ROLES.TECHNICIAN]: 'scoped', 
  },
  
  'workOrders.materialAvailability': {
    [ROLES.ADMIN]: 'full',
    [ROLES.MANAGER]: 'full',
    [ROLES.SUPERVISOR]: 'full',
    [ROLES.TECHNICIAN]: 'scoped', 
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
    [ROLES.SUPERVISOR]: 'scoped', 
    [ROLES.TECHNICIAN]: 'none',
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
    [ROLES.TECHNICIAN]: 'none',
  },
  'procurement.vendorPoStatus': {
    [ROLES.ADMIN]: 'full',
    [ROLES.MANAGER]: 'scoped', 
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
    [ROLES.SUPERVISOR]: 'scoped', 
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
    [ROLES.ADMIN]: 'view', 
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
