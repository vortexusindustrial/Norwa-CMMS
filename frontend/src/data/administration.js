// Mock platform administration data: the user directory, audit log, ERPNext
// integration health, and global settings. There's no real user directory
// behind login yet (see stores/auth.js's mockLogin) — this list is
// illustrative, reusing names that already appear elsewhere in the mock
// data (BoM submitters/approvers, work order technicians) for continuity.
import { ROLES } from '../permissions'

export const USER_STATUSES = ['active', 'suspended']

export const USER_STATUS_META = {
  active: { label: 'Active', badgeClass: 'bg-green-100 text-green-700' },
  suspended: { label: 'Suspended', badgeClass: 'bg-gray-100 text-gray-500' },
}

export const users = [
  { id: 'USR-001', name: 'Grace Wanjiru', email: 'grace.wanjiru@norwa.africa', role: ROLES.ADMIN, status: 'active', lastLogin: '2026-07-17T07:05:00+03:00' },
  { id: 'USR-002', name: "Michael Ndung'u", email: 'michael.ndungu@norwa.africa', role: ROLES.MANAGER, status: 'active', lastLogin: '2026-07-17T08:12:00+03:00' },
  { id: 'USR-003', name: 'Peter Mwangi', email: 'peter.mwangi@norwa.africa', role: ROLES.MANAGER, status: 'active', lastLogin: '2026-07-16T17:40:00+03:00' },
  { id: 'USR-004', name: 'Susan Achieng', email: 'susan.achieng@norwa.africa', role: ROLES.MANAGER, status: 'active', lastLogin: '2026-07-15T12:20:00+03:00' },
  { id: 'USR-005', name: 'Brian Mwendwa', email: 'brian.mwendwa@norwa.africa', role: ROLES.SUPERVISOR, status: 'active', lastLogin: '2026-07-17T06:30:00+03:00' },
  { id: 'USR-006', name: 'Alice Nyambura', email: 'alice.nyambura@norwa.africa', role: ROLES.SUPERVISOR, status: 'active', lastLogin: '2026-07-16T22:10:00+03:00' },
  { id: 'USR-007', name: 'Samuel Kiptoo', email: 'samuel.kiptoo@norwa.africa', role: ROLES.TECHNICIAN, status: 'active', lastLogin: '2026-07-17T07:20:00+03:00' },
  { id: 'USR-008', name: 'Elijah Mutuku', email: 'elijah.mutuku@norwa.africa', role: ROLES.TECHNICIAN, status: 'active', lastLogin: '2026-07-16T15:05:00+03:00' },
  { id: 'USR-009', name: 'Faith Chebet', email: 'faith.chebet@norwa.africa', role: ROLES.TECHNICIAN, status: 'active', lastLogin: '2026-07-17T06:45:00+03:00' },
  { id: 'USR-010', name: 'Dennis Otieno', email: 'dennis.otieno@norwa.africa', role: ROLES.TECHNICIAN, status: 'suspended', lastLogin: '2026-06-02T09:00:00+03:00' },
  { id: 'USR-011', name: 'Collins Barasa', email: 'collins.barasa@norwa.africa', role: ROLES.TECHNICIAN, status: 'active', lastLogin: '2026-07-16T23:15:00+03:00' },
  { id: 'USR-012', name: 'Winnie Adhiambo', email: 'winnie.adhiambo@norwa.africa', role: ROLES.TECHNICIAN, status: 'active', lastLogin: '2026-07-15T21:50:00+03:00' },
]

// View-only — there is deliberately no delete/remove action anywhere in
// stores/administration.js or the Audit Log UI, for any role including Admin.
export const auditLogEntries = [
  { id: 'AUD-001', timestamp: '2026-07-17T08:15:00+03:00', actor: "Michael Ndung'u", action: 'Approved BoM', entity: 'BOM-2026-003', details: 'Approved for Karen Business Park project.' },
  { id: 'AUD-002', timestamp: '2026-07-16T17:42:00+03:00', actor: 'Peter Mwangi', action: 'Submitted BoM', entity: 'BOM-2026-002', details: 'Submitted for approval.' },
  { id: 'AUD-003', timestamp: '2026-07-16T09:30:00+03:00', actor: 'Grace Wanjiru', action: 'Deactivated user', entity: 'USR-010', details: 'Suspended pending HR review.' },
  { id: 'AUD-004', timestamp: '2026-07-15T16:05:00+03:00', actor: 'Alice Nyambura', action: 'Assigned work order', entity: 'WO-2026-104', details: 'Assigned to Winnie Adhiambo, Team B - Night Shift.' },
  { id: 'AUD-005', timestamp: '2026-07-14T11:00:00+03:00', actor: 'System (low stock)', action: 'Raised purchase request', entity: 'PR-2026-001', details: 'REFRIG-UNIT-10T below reorder point.' },
  { id: 'AUD-006', timestamp: '2026-07-10T10:15:00+03:00', actor: 'Grace Wanjiru', action: 'Updated global settings', entity: 'SETTINGS', details: 'Changed low-stock buffer from 10% to 15%.' },
]

export const systemHealth = {
  erpnextConnection: 'connected', // 'connected' | 'degraded' | 'down'
  lastSyncAt: '2026-07-17T08:00:00+03:00',
  syncQueueDepth: 0,
  apiLatencyMs: 142,
  recentErrors: [],
}

export const defaultSettings = {
  orgName: 'Norwa Africa',
  defaultCurrency: 'KES',
  timezone: 'Africa/Nairobi',
  lowStockBufferPct: 15,
  notificationEmail: 'ops@norwa.africa',
  sessionTimeoutMinutes: 60,
}
