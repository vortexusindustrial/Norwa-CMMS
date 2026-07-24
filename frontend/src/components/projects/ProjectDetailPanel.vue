<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { PROJECT_STATUS_META } from "../../data/projects";
import {
  TECHNICIANS,
  WORK_ORDER_STATUS_META,
  technicianById,
} from "../../data/workOrders";
import { useWorkOrdersStore } from "../../stores/workOrders";
import ProjectStatusTracker from "./ProjectStatusTracker.vue";

const props = defineProps({
  project: { type: Object, default: null },
  canAssign: { type: Boolean, default: false },
});

const emit = defineEmits(["assign"]);

const router = useRouter();
const woStore = useWorkOrdersStore();

const dateFormatter = new Intl.DateTimeFormat("en-KE", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatDate(iso) {
  return dateFormatter.format(new Date(iso));
}

const statusMeta = computed(() =>
  props.project ? PROJECT_STATUS_META[props.project.status] : null,
);
const technician = computed(() =>
  props.project ? technicianById(props.project.technicianId) : null,
);

const relatedWorkOrders = computed(() =>
  props.project
    ? woStore.workOrders.filter((wo) => wo.projectId === props.project.id)
    : [],
);
const completedCount = computed(
  () =>
    relatedWorkOrders.value.filter((wo) => wo.status === "completed").length,
);

function onAssign(event) {
  emit("assign", {
    projectId: props.project.id,
    technicianId: event.target.value || null,
  });
}

function openWorkOrder(woId) {
  router.push({ name: "work-orders", query: { wo: woId } });
}
</script>

<template>
  <div class="rounded-lg border border-gray-200 bg-white p-5">
    <div v-if="!project" class="py-16 text-center text-sm text-gray-500">
      Select a project to view details.
    </div>
    <div v-else>
      <div class="flex items-start justify-between gap-3">
        <h3 class="text-base font-semibold text-gray-900">
          {{ project.name }}
        </h3>
        <span
          class="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium"
          :class="statusMeta.badgeClass"
        >
          {{ statusMeta.label }}
        </span>
      </div>

      <div class="mt-5">
        <ProjectStatusTracker :status="project.status" />
        <p
          v-if="
            project.status === 'assigned' || project.status === 'in_progress'
          "
          class="mt-2 text-xs text-gray-500"
        >
          <template v-if="relatedWorkOrders.length">
            {{ completedCount }} of {{ relatedWorkOrders.length }} work orders
            complete — status advances automatically as work orders progress.
          </template>
          <template v-else
            >No work orders logged against this project yet — status advances
            once one starts.</template
          >
        </p>
      </div>

      <div class="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <p class="text-xs font-medium uppercase tracking-wide text-gray-500">
            Client
          </p>
          <p class="mt-1.5 text-sm font-medium text-gray-900">
            {{ project.client.name }}
          </p>
          <p class="mt-0.5 text-sm text-gray-700">
            {{ project.client.contactPerson }}
          </p>
          <p class="mt-0.5 text-sm text-gray-500">{{ project.client.email }}</p>
          <p class="mt-0.5 text-sm text-gray-500">{{ project.client.phone }}</p>
        </div>

        <div>
          <p class="text-xs font-medium uppercase tracking-wide text-gray-500">
            Site
          </p>
          <p class="mt-1.5 text-sm text-gray-900">{{ project.site.address }}</p>
          <p class="mt-0.5 text-sm text-gray-500">{{ project.site.city }}</p>
        </div>

        <div>
          <p class="text-xs font-medium uppercase tracking-wide text-gray-500">
            Field Technician
          </p>
          <select
            v-if="canAssign"
            class="mt-1.5 w-full rounded-md border border-gray-300 py-1.5 pl-2 pr-8 text-sm text-gray-900"
            :value="project.technicianId ?? ''"
            @change="onAssign"
          >
            <option value="">Unassigned</option>
            <option v-for="tech in TECHNICIANS" :key="tech.id" :value="tech.id">
              {{ tech.name }}
            </option>
          </select>
          <template v-else-if="technician">
            <p class="mt-1.5 text-sm font-medium text-gray-900">
              {{ technician.name }}
            </p>
            <p class="mt-0.5 text-sm text-gray-500">{{ technician.phone }}</p>
          </template>
          <p v-else class="mt-1.5 text-sm text-gray-500">Unassigned</p>
        </div>

        <div>
          <p class="text-xs font-medium uppercase tracking-wide text-gray-500">
            Start Date
          </p>
          <p class="mt-1.5 text-sm text-gray-900">
            {{ formatDate(project.dates.start) }}
          </p>
        </div>

        <div>
          <p class="text-xs font-medium uppercase tracking-wide text-gray-500">
            Target Completion
          </p>
          <p class="mt-1.5 text-sm text-gray-900">
            {{ formatDate(project.dates.targetEnd) }}
          </p>
        </div>
      </div>

      <div class="mt-6">
        <p class="text-xs font-medium uppercase tracking-wide text-gray-500">
          Scope of Work
        </p>
        <p class="mt-1.5 text-sm leading-relaxed text-gray-700">
          {{ project.scope }}
        </p>
      </div>

      <div class="mt-6">
        <p class="text-xs font-medium uppercase tracking-wide text-gray-500">
          Work Orders
        </p>
        <ul v-if="relatedWorkOrders.length" class="mt-2 flex flex-col gap-2">
          <li
            v-for="wo in relatedWorkOrders"
            :key="wo.id"
            class="flex cursor-pointer items-center justify-between rounded-md border border-gray-200 px-3 py-2 hover:bg-gray-50"
            @click="openWorkOrder(wo.id)"
          >
            <span class="text-sm text-gray-900">{{ wo.title }}</span>
            <span
              class="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium"
              :class="WORK_ORDER_STATUS_META[wo.status].badgeClass"
            >
              {{ WORK_ORDER_STATUS_META[wo.status].label }}
            </span>
          </li>
        </ul>
        <p v-else class="mt-1.5 text-sm text-gray-500">
          No work orders raised against this project yet.
        </p>
      </div>
    </div>
  </div>
</template>
