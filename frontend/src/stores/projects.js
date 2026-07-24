import { defineStore } from 'pinia'
import { ref } from 'vue'
import { projects as mockProjects } from '../data/projects'

// persist: true (see stores/persistPlugin.js) — work order status rolls up
// into project status (see startWorkIfAssigned/completeIfInProgress below),
// and workOrders is persisted, so this has to be too or the two would drift
// out of sync across a reload.
export const useProjectsStore = defineStore('projects', () => {
  const projects = ref(mockProjects)

  function projectById(id) {
    return projects.value.find((p) => p.id === id) ?? null
  }

  function assignTechnician(projectId, technicianId) {
    const project = projectById(projectId)
    if (!project) return
    project.technicianId = technicianId
    if (project.status === 'queued') project.status = 'assigned'
  }

  // A project has no timer/checklist of its own — its pipeline is rolled up
  // from whichever of its work orders (see workOrders store) are furthest
  // along, regardless of which technician is on which one. Not called
  // directly from the UI; workOrders store calls these when a work order's
  // own timer/checklist state changes.
  function startWorkIfAssigned(projectId) {
    const project = projectById(projectId)
    if (!project || project.status !== 'assigned') return
    project.status = 'in_progress'
  }

  function completeIfInProgress(projectId) {
    const project = projectById(projectId)
    if (!project || project.status !== 'in_progress') return
    project.status = 'completed'
  }

  return { projects, projectById, assignTechnician, startWorkIfAssigned, completeIfInProgress }
})
