import { defineStore } from "pinia";
import { ref } from "vue";
import {
  workOrders as mockWorkOrders,
  laborEntries as mockLaborEntries,
} from "../data/workOrders";
import { useProjectsStore } from "./projects";

// persist: true (see stores/persistPlugin.js) keeps timers, checklists,
// materials, and LOTO records across a reload — otherwise they silently
// reset to the seed data in data/workOrders.js.
export const useWorkOrdersStore = defineStore(
  "workOrders",
  () => {
    const workOrders = ref(mockWorkOrders);
    const laborEntries = ref(mockLaborEntries);

    function workOrderById(id) {
      return workOrders.value.find((wo) => wo.id === id) ?? null;
    }

    function assignTechnician(woId, technicianId) {
      const wo = workOrderById(woId);
      if (!wo) return;
      wo.technicianId = technicianId;
      if (wo.status === "unassigned") wo.status = "assigned";
    }

    // Work orders finish in 'completed' status the moment their checklist is
    // fully checked off (and back out of it if an item is unchecked or a new
    // one is added afterward) — there's no separate manual "mark complete"
    // action. When every work order under a project reaches 'completed', that
    // rolls up to complete the project too (see projects store).
    function syncStatusFromChecklist(wo) {
      const allDone =
        wo.checklist.length > 0 && wo.checklist.every((item) => item.done);
      if (allDone && wo.status === "in_progress") wo.status = "completed";
      else if (!allDone && wo.status === "completed") wo.status = "in_progress";

      if (!wo.projectId) return;
      const projectWorkOrders = workOrders.value.filter(
        (w) => w.projectId === wo.projectId,
      );
      const projectDone =
        projectWorkOrders.length > 0 &&
        projectWorkOrders.every((w) => w.status === "completed");
      if (projectDone) useProjectsStore().completeIfInProgress(wo.projectId);
    }

    function toggleChecklistItem(woId, itemId) {
      const wo = workOrderById(woId);
      const item = wo?.checklist.find((i) => i.id === itemId);
      if (!item) return;
      item.done = !item.done;
      syncStatusFromChecklist(wo);
    }

    function addChecklistItem(woId, label) {
      const wo = workOrderById(woId);
      if (!wo || !label.trim()) return;
      wo.checklist.push({
        id: `CHK-${Date.now()}`,
        label: label.trim(),
        done: false,
      });
      syncStatusFromChecklist(wo);
    }

    function removeChecklistItem(woId, itemId) {
      const wo = workOrderById(woId);
      if (!wo) return;
      wo.checklist = wo.checklist.filter((item) => item.id !== itemId);
      syncStatusFromChecklist(wo);
    }

    function startTimer(woId) {
      const wo = workOrderById(woId);
      if (!wo || wo.timer.status === "running") return;
      wo.timer.status = "running";
      wo.timer.startedAt = new Date().toISOString();
      if (wo.status === "assigned") wo.status = "in_progress";
      if (wo.projectId) useProjectsStore().startWorkIfAssigned(wo.projectId);
    }

    function stopTimer(woId) {
      const wo = workOrderById(woId);
      if (!wo || wo.timer.status !== "running") return;
      const elapsed = Math.max(
        Math.floor(
          (Date.now() - new Date(wo.timer.startedAt).getTime()) / 60000,
        ),
        0,
      );
      wo.timer.totalMinutes += elapsed;
      wo.timer.status = "stopped";
      wo.timer.startedAt = null;
    }

    function resetTimer(woId) {
      const wo = workOrderById(woId);
      if (!wo) return;
      wo.timer.status = "stopped";
      wo.timer.totalMinutes = 0;
      wo.timer.startedAt = null;
    }

    // Whether a job needs LOTO isn't always known when it's created (or by
    // whoever's quick-creating it) — this lets anyone viewing the work order
    // flag it on once they realize isolation is required, or back off a flag
    // set by mistake (only before anything's been signed off).
    function setLotoRequired(woId, required) {
      const wo = workOrderById(woId);
      if (!wo || wo.loto.status === "signed_off") return;
      wo.loto.required = required;
      wo.loto.status = required ? "pending" : "not_required";
    }

    function updateLotoPermit(woId, permitNumber) {
      const wo = workOrderById(woId);
      if (!wo || wo.loto.status === "signed_off") return;
      wo.loto.permitNumber = permitNumber;
    }

    function updateLotoIsolatedAt(woId, isolatedAt) {
      const wo = workOrderById(woId);
      if (!wo || wo.loto.status === "signed_off") return;
      wo.loto.isolatedAt = isolatedAt;
    }

    function addLotoPoint(woId, { label, lockNumber = null }) {
      const wo = workOrderById(woId);
      if (!wo || wo.loto.status === "signed_off" || !label.trim()) return;
      wo.loto.points.push({
        id: `LP-${Date.now()}`,
        label: label.trim(),
        lockNumber,
      });
    }

    function removeLotoPoint(woId, pointId) {
      const wo = workOrderById(woId);
      if (!wo || wo.loto.status === "signed_off") return;
      wo.loto.points = wo.loto.points.filter((point) => point.id !== pointId);
    }

    // A permit can't be signed off with no isolation points on record — that's
    // what actually makes this an editable LOTO panel rather than a rubber
    // stamp.
    function signOffLoto(woId, signedOffBy) {
      const wo = workOrderById(woId);
      if (
        !wo ||
        !wo.loto.required ||
        wo.loto.status === "signed_off" ||
        !wo.loto.points.length
      )
        return;
      wo.loto.status = "signed_off";
      wo.loto.signedOffBy = signedOffBy;
      wo.loto.signedOffAt = new Date().toISOString();
    }

    function addMaterial(woId, item) {
      const wo = workOrderById(woId);
      if (!wo) return;
      wo.materials.push(item);
    }

    function createWorkOrder({
      title,
      priority = "medium",
      technicianId = null,
      team = null,
      location = null,
    }) {
      const wo = {
        id: `WO-${Date.now()}`,
        title,
        description: "",
        priority,
        status: technicianId ? "assigned" : "unassigned",
        technicianId,
        team,
        projectId: null,
        assetId: null,
        location, // { address, placeId, lat, lng } | null — free-typed, unlike siteFor() which derives from an asset
        createdDate: new Date().toISOString().slice(0, 10),
        scheduledDate: null,
        checklist: [],
        loto: {
          required: false,
          status: "not_required",
          permitNumber: null,
          isolatedAt: null,
          points: [],
          signedOffBy: null,
          signedOffAt: null,
        },
        timer: { status: "stopped", totalMinutes: 0, startedAt: null },
        materials: [],
      };
      workOrders.value.unshift(wo);
      return wo;
    }

    // 'completed' (see syncStatusFromChecklist above) still needs a
    // supervisor/manager review before it's fully closed — that gap is what
    // the Approval-Pending Queue on the Reports page surfaces. closedOut
    // defaults to false for any work order that predates the field.
    function closeOutWorkOrder(woId) {
      const wo = workOrderById(woId);
      if (!wo || wo.status !== "completed" || wo.closedOut) return;
      wo.closedOut = true;
    }

    function addLaborEntry(entry) {
      laborEntries.value.push({ id: `LAB-${Date.now()}`, ...entry });
    }

    function updateLaborEntry(id, patch) {
      const entry = laborEntries.value.find((e) => e.id === id);
      if (entry) Object.assign(entry, patch);
    }

    function removeLaborEntry(id) {
      laborEntries.value = laborEntries.value.filter((e) => e.id !== id);
    }

    return {
      workOrders,
      laborEntries,
      workOrderById,
      assignTechnician,
      toggleChecklistItem,
      addChecklistItem,
      removeChecklistItem,
      startTimer,
      stopTimer,
      resetTimer,
      setLotoRequired,
      updateLotoPermit,
      updateLotoIsolatedAt,
      addLotoPoint,
      removeLotoPoint,
      signOffLoto,
      closeOutWorkOrder,
      addMaterial,
      createWorkOrder,
      addLaborEntry,
      updateLaborEntry,
      removeLaborEntry,
    };
  },
  { persist: true },
);
