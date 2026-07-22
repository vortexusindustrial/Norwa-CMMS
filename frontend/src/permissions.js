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
  procurement: {
    [ROLES.ADMIN]: 'full',
    [ROLES.MANAGER]: 'full',
    [ROLES.SUPERVISOR]: 'scoped',
    [ROLES.TECHNICIAN]: 'none',
  },
  reports: {
    [ROLES.ADMIN]: 'full',
    [ROLES.MANAGER]: 'full',
    [ROLES.SUPERVISOR]: 'scoped',
    [ROLES.TECHNICIAN]: 'none',
  },
  administration: {
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
