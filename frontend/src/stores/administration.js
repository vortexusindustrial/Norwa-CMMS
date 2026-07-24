import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  users as mockUsers,
  auditLogEntries as mockAuditLog,
  systemHealth as mockSystemHealth,
  defaultSettings,
} from '../data/administration'

export const useAdministrationStore = defineStore('administration', () => {
  const users = ref(mockUsers)
  // Deliberately no delete/removeAuditEntry action here — the Audit Log is
  // view-only for every role, Admin included (see permissions.js).
  const auditLog = ref(mockAuditLog)
  const systemHealth = ref(mockSystemHealth)
  const settings = ref({ ...defaultSettings })

  function logAction(actor, action, entity, details) {
    auditLog.value.unshift({
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor,
      action,
      entity,
      details,
    })
  }

  function userById(id) {
    return users.value.find((u) => u.id === id) ?? null
  }

  function updateUserRole(userId, role, actor) {
    const user = userById(userId)
    if (!user || user.role === role) return
    const previousRole = user.role
    user.role = role
    logAction(actor, 'Changed user role', user.id, `${user.name}: ${previousRole} -> ${role}`)
  }

  function toggleUserStatus(userId, actor) {
    const user = userById(userId)
    if (!user) return
    user.status = user.status === 'active' ? 'suspended' : 'active'
    logAction(actor, user.status === 'active' ? 'Reactivated user' : 'Deactivated user', user.id, user.name)
  }

  function addUser(item, actor) {
    const user = { id: `USR-${Date.now()}`, status: 'active', lastLogin: null, ...item }
    users.value.push(user)
    logAction(actor, 'Added user', user.id, `${user.name} (${user.role})`)
    return user
  }

  function updateSettings(patch, actor) {
    Object.assign(settings.value, patch)
    logAction(actor, 'Updated global settings', 'SETTINGS', Object.keys(patch).join(', '))
  }

  // Mock "check now" — re-rolls latency and bumps the last-sync timestamp,
  // simulating a fresh ping to ERPNext with no real backend behind it.
  function refreshSystemHealth() {
    systemHealth.value.lastSyncAt = new Date().toISOString()
    systemHealth.value.apiLatencyMs = 100 + Math.round(Math.random() * 120)
  }

  return {
    users,
    auditLog,
    systemHealth,
    settings,
    userById,
    updateUserRole,
    toggleUserStatus,
    addUser,
    updateSettings,
    refreshSystemHealth,
  }
})
