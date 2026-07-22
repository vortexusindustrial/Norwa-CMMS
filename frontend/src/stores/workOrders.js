import { defineStore } from 'pinia'
import { ref } from 'vue'
import { workOrders as mockWorkOrders, laborEntries as mockLaborEntries } from '../data/workOrders'

export const useWorkOrdersStore = defineStore('workOrders', () => {
  const workOrders = ref(mockWorkOrders)
  const laborEntries = ref(mockLaborEntries)

  function workOrderById(id) {
    return workOrders.value.find((wo) => wo.id === id) ?? null
  }

  function assignTechnician(woId, technicianId) {
    const wo = workOrderById(woId)
    if (!wo) return
    wo.technicianId = technicianId
    if (wo.status === 'unassigned') wo.status = 'assigned'
  }

  function toggleChecklistItem(woId, itemId) {
    const item = workOrderById(woId)?.checklist.find((i) => i.id === itemId)
    if (item) item.done = !item.done
  }

  function startTimer(woId) {
    const wo = workOrderById(woId)
    if (!wo || wo.timer.status === 'running') return
    wo.timer.status = 'running'
    wo.timer.startedAt = new Date().toISOString()
    if (wo.status === 'assigned') wo.status = 'in_progress'
  }

  function stopTimer(woId) {
    const wo = workOrderById(woId)
    if (!wo || wo.timer.status !== 'running') return
    const elapsed = Math.max(Math.floor((Date.now() - new Date(wo.timer.startedAt).getTime()) / 60000), 0)
    wo.timer.totalMinutes += elapsed
    wo.timer.status = 'stopped'
    wo.timer.startedAt = null
  }

  function resetTimer(woId) {
    const wo = workOrderById(woId)
    if (!wo) return
    wo.timer.status = 'stopped'
    wo.timer.totalMinutes = 0
    wo.timer.startedAt = null
  }

  function signOffLoto(woId, signedOffBy) {
    const wo = workOrderById(woId)
    if (!wo || !wo.loto.required || wo.loto.status === 'signed_off') return
    wo.loto.status = 'signed_off'
    wo.loto.signedOffBy = signedOffBy
    wo.loto.signedOffAt = new Date().toISOString()
  }

  function addMaterial(woId, item) {
    const wo = workOrderById(woId)
    if (!wo) return
    wo.materials.push(item)
  }

  function createWorkOrder({ title, priority = 'medium', technicianId = null, team = null, location = null }) {
    const wo = {
      id: `WO-${Date.now()}`,
      title,
      description: '',
      priority,
      status: technicianId ? 'assigned' : 'unassigned',
      technicianId,
      team,
      projectId: null,
      assetId: null,
      location, // { address, placeId, lat, lng } | null — free-typed, unlike siteFor() which derives from an asset
      createdDate: new Date().toISOString().slice(0, 10),
      scheduledDate: null,
      checklist: [],
      loto: { required: false, status: 'not_required', signedOffBy: null, signedOffAt: null },
      timer: { status: 'stopped', totalMinutes: 0, startedAt: null },
      materials: [],
    }
    workOrders.value.unshift(wo)
    return wo
  }

  // Work orders finish in 'completed' status the moment the technician's
  // checklist is done, but still need a supervisor/manager review before
  // they're fully closed — that gap is what the Approval-Pending Queue on
  // the Reports page surfaces. closedOut defaults to false for any work
  // order that predates the field.
  function closeOutWorkOrder(woId) {
    const wo = workOrderById(woId)
    if (!wo || wo.status !== 'completed' || wo.closedOut) return
    wo.closedOut = true
  }

  function addLaborEntry(entry) {
    laborEntries.value.push({ id: `LAB-${Date.now()}`, ...entry })
  }

  function updateLaborEntry(id, patch) {
    const entry = laborEntries.value.find((e) => e.id === id)
    if (entry) Object.assign(entry, patch)
  }

  function removeLaborEntry(id) {
    laborEntries.value = laborEntries.value.filter((e) => e.id !== id)
  }

  return {
    workOrders,
    laborEntries,
    workOrderById,
    assignTechnician,
    toggleChecklistItem,
    startTimer,
    stopTimer,
    resetTimer,
    signOffLoto,
    closeOutWorkOrder,
    addMaterial,
    createWorkOrder,
    addLaborEntry,
    updateLaborEntry,
    removeLaborEntry,
  }
})
