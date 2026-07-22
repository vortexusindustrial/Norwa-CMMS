<script setup>
import { computed } from 'vue'
import { PROJECT_STATUS_META } from '../../data/projects'
import ProjectStatusTracker from './ProjectStatusTracker.vue'

const props = defineProps({
  project: { type: Object, default: null },
})

const dateFormatter = new Intl.DateTimeFormat('en-KE', { month: 'short', day: 'numeric', year: 'numeric' })

function formatDate(iso) {
  return dateFormatter.format(new Date(iso))
}

const statusMeta = computed(() => (props.project ? PROJECT_STATUS_META[props.project.status] : null))
</script>

<template>
  <div class="rounded-lg border border-gray-200 bg-white p-5">
    <div v-if="!project" class="py-16 text-center text-sm text-gray-500">Select a project to view details.</div>
    <div v-else>
      <div class="flex items-start justify-between gap-3">
        <h3 class="text-base font-semibold text-gray-900">{{ project.name }}</h3>
        <span class="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium" :class="statusMeta.badgeClass">
          {{ statusMeta.label }}
        </span>
      </div>

      <div class="mt-5">
        <ProjectStatusTracker :status="project.status" />
      </div>

      <div class="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <p class="text-xs font-medium uppercase tracking-wide text-gray-500">Client</p>
          <p class="mt-1.5 text-sm font-medium text-gray-900">{{ project.client.name }}</p>
          <p class="mt-0.5 text-sm text-gray-700">{{ project.client.contactPerson }}</p>
          <p class="mt-0.5 text-sm text-gray-500">{{ project.client.email }}</p>
          <p class="mt-0.5 text-sm text-gray-500">{{ project.client.phone }}</p>
        </div>

        <div>
          <p class="text-xs font-medium uppercase tracking-wide text-gray-500">Site</p>
          <p class="mt-1.5 text-sm text-gray-900">{{ project.site.address }}</p>
          <p class="mt-0.5 text-sm text-gray-500">{{ project.site.city }}</p>
        </div>

        <div v-if="project.technician">
          <p class="text-xs font-medium uppercase tracking-wide text-gray-500">Field Technician</p>
          <p class="mt-1.5 text-sm font-medium text-gray-900">{{ project.technician.name }}</p>
          <p class="mt-0.5 text-sm text-gray-500">{{ project.technician.phone }}</p>
        </div>

        <div>
          <p class="text-xs font-medium uppercase tracking-wide text-gray-500">Start Date</p>
          <p class="mt-1.5 text-sm text-gray-900">{{ formatDate(project.dates.start) }}</p>
        </div>

        <div>
          <p class="text-xs font-medium uppercase tracking-wide text-gray-500">Target Completion</p>
          <p class="mt-1.5 text-sm text-gray-900">{{ formatDate(project.dates.targetEnd) }}</p>
        </div>
      </div>

      <div class="mt-6">
        <p class="text-xs font-medium uppercase tracking-wide text-gray-500">Scope of Work</p>
        <p class="mt-1.5 text-sm leading-relaxed text-gray-700">{{ project.scope }}</p>
      </div>
    </div>
  </div>
</template>
