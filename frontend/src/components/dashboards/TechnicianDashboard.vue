<script setup>
import { computed } from "vue";
import { Package, Clock, FileWarning } from "lucide-vue-next";
import { useRouter } from "vue-router";
import { projects } from "../../data/projects";
import { assetById } from "../../data/assets";
import { useWorkOrdersStore } from "../../stores/workOrders";
import { CURRENT_TECHNICIAN_ID, PRIORITY_META, WORK_ORDER_STATUS_META, siteFor } from "../../data/workOrders";

const router = useRouter();
const store = useWorkOrdersStore();

const myWorkOrders = computed(() =>
  store.workOrders
    .filter((wo) => wo.technicianId === CURRENT_TECHNICIAN_ID)
    .map((wo) => ({
      id: wo.id,
      title: wo.title,
      project: projects.find((p) => p.id === wo.projectId)?.name ?? null,
      asset: wo.assetId ? (assetById(wo.assetId)?.name ?? null) : null,
      location: siteFor(wo)?.name ?? null,
      priorityMeta: PRIORITY_META[wo.priority],
      statusMeta: WORK_ORDER_STATUS_META[wo.status],
    }))
);

const quickActions = [
  { label: "Log Material Use", icon: Package, to: { name: "work-orders" } },
  {
    label: "Log Hours",
    icon: Clock,
    to: { name: "work-orders", query: { tab: "labor" } },
  },
  {
    label: "Report an Issue",
    icon: FileWarning,
    to: { name: "work-orders", query: { create: "true" } },
  },
];

function openChecklist(workOrderId) {
  router.push({ name: "work-orders", query: { wo: workOrderId } });
}
</script>

<template>
  <div>
    <h2 class="text-lg font-semibold text-gray-900">My Work</h2>
    <p class="mt-1 text-sm text-gray-500">
      Work orders assigned to you, and the projects they belong to.
    </p>

    <div class="mt-6 flex flex-col gap-3">
      <div
        v-for="order in myWorkOrders"
        :key="order.id"
        class="rounded-lg border border-gray-200 bg-white p-4"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-sm font-semibold text-gray-900">{{ order.title }}</p>
            <p class="mt-1 text-xs text-gray-500">{{ order.project }}</p>
            <p class="mt-0.5 text-xs text-gray-500">
              {{ order.asset }} · {{ order.location }}
            </p>
          </div>
          <div class="flex shrink-0 items-center gap-2">
            <span
              class="rounded-full px-2.5 py-1 text-xs font-medium"
              :class="order.priorityMeta.badgeClass"
            >
              {{ order.priorityMeta.label }}
            </span>
            <span
              class="rounded-full px-2.5 py-1 text-xs font-medium"
              :class="order.statusMeta.badgeClass"
            >
              {{ order.statusMeta.label }}
            </span>
          </div>
        </div>
        <button
          type="button"
          class="mt-3 rounded-md bg-gray-900 px-3 py-2 text-xs font-medium text-white hover:bg-gray-800"
          @click="openChecklist(order.id)"
        >
          Open Checklist
        </button>
      </div>
      <p v-if="!myWorkOrders.length" class="rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
        No work orders assigned to you right now.
      </p>
    </div>

    <div class="mt-6 rounded-lg border border-gray-200 bg-white p-5">
      <h3 class="text-sm font-semibold text-gray-900">Quick Actions</h3>
      <div class="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          v-for="action in quickActions"
          :key="action.label"
          type="button"
          @click="router.push(action.to)"
          class="flex items-center justify-center gap-2.5 rounded-md border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:flex-1"
        >
          <component :is="action.icon" class="h-4 w-4 shrink-0" />
          {{ action.label }}
        </button>
      </div>
    </div>
  </div>
</template>
