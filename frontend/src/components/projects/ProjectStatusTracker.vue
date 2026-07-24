<script setup>
import { computed } from 'vue'
import { Check } from 'lucide-vue-next'
import { PROJECT_STATUSES, PROJECT_STATUS_META } from '../../data/projects'

const props = defineProps({
  status: { type: String, required: true },
})

const currentOrder = computed(() => PROJECT_STATUS_META[props.status]?.order ?? 0)

const steps = computed(() =>
  PROJECT_STATUSES.map((key) => {
    const order = PROJECT_STATUS_META[key].order
    return {
      key,
      label: PROJECT_STATUS_META[key].label,
      state: order < currentOrder.value ? 'done' : order === currentOrder.value ? 'current' : 'upcoming',
    }
  })
)
</script>

<template>
  <ol class="flex items-center">
    <li v-for="(step, i) in steps" :key="step.key" class="flex flex-1 items-center last:flex-none">
      <div class="flex flex-col items-center gap-1.5">
        <span
          class="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold"
          :class="{
            'bg-gray-900 text-white': step.state === 'done',
            'bg-gray-900 text-white ring-4 ring-gray-200': step.state === 'current',
            'border border-gray-300 bg-white text-gray-400': step.state === 'upcoming',
          }"
        >
          <Check v-if="step.state === 'done'" class="h-3.5 w-3.5" />
          <span v-else>{{ i + 1 }}</span>
        </span>
        <span class="text-xs font-medium" :class="step.state === 'upcoming' ? 'text-gray-400' : 'text-gray-900'">
          {{ step.label }}
        </span>
      </div>
      <div
        v-if="i < steps.length - 1"
        class="mx-2 h-0.5 flex-1"
        :class="step.state === 'done' ? 'bg-gray-900' : 'bg-gray-200'"
      />
    </li>
  </ol>
</template>
