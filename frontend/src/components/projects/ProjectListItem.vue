<script setup>
import { computed } from 'vue'
import { PROJECT_STATUS_META } from '../../data/projects'

const props = defineProps({
  project: { type: Object, required: true },
  selected: { type: Boolean, default: false },
})

defineEmits(['click'])

const dateFormatter = new Intl.DateTimeFormat('en-KE', { month: 'short', day: 'numeric', year: 'numeric' })

function formatDate(iso) {
  return dateFormatter.format(new Date(iso))
}

const statusMeta = computed(() => PROJECT_STATUS_META[props.project.status])
</script>

<template>
  <li
    class="cursor-pointer rounded-lg border bg-white p-4 transition-colors"
    :class="selected ? 'border-gray-900' : 'border-gray-200 hover:bg-gray-50'"
    @click="$emit('click')"
  >
    <div class="flex items-start justify-between gap-3">
      <p class="text-sm font-medium text-gray-900">{{ project.name }}</p>
      <span class="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium" :class="statusMeta.badgeClass">
        {{ statusMeta.label }}
      </span>
    </div>
    <p class="mt-1 text-xs text-gray-500">{{ project.client.name }}</p>
    <p class="mt-2 text-xs text-gray-500">
      {{ formatDate(project.dates.start) }} &ndash; {{ formatDate(project.dates.targetEnd) }}
    </p>
  </li>
</template>
