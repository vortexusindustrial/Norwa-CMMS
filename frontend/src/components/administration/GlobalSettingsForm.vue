<script setup>
import { reactive, watch, ref } from 'vue'

const props = defineProps({
  settings: { type: Object, required: true },
})

const emit = defineEmits(['save'])

const form = reactive({ ...props.settings })
watch(
  () => props.settings,
  (settings) => Object.assign(form, settings),
  { deep: true }
)

const saved = ref(false)
function submit() {
  emit('save', { ...form })
  saved.value = true
  setTimeout(() => (saved.value = false), 2000)
}
</script>

<template>
  <div class="rounded-lg border border-gray-200 bg-white p-5">
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <label class="block">
        <span class="text-xs font-medium text-gray-500">Organization Name</span>
        <input v-model="form.orgName" type="text" class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none" />
      </label>
      <label class="block">
        <span class="text-xs font-medium text-gray-500">Default Currency</span>
        <input v-model="form.defaultCurrency" type="text" class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none" />
      </label>
      <label class="block">
        <span class="text-xs font-medium text-gray-500">Timezone</span>
        <input v-model="form.timezone" type="text" class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none" />
      </label>
      <label class="block">
        <span class="text-xs font-medium text-gray-500">Low-Stock Reorder Buffer (%)</span>
        <input v-model.number="form.lowStockBufferPct" type="number" min="0" max="100" class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none" />
      </label>
      <label class="block">
        <span class="text-xs font-medium text-gray-500">Notification Email</span>
        <input v-model="form.notificationEmail" type="email" class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none" />
      </label>
      <label class="block">
        <span class="text-xs font-medium text-gray-500">Session Timeout (minutes)</span>
        <input v-model.number="form.sessionTimeoutMinutes" type="number" min="5" class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none" />
      </label>
    </div>

    <div class="mt-5 flex items-center gap-3">
      <button type="button" class="rounded-md bg-gray-900 px-3 py-2 text-xs font-medium text-white hover:bg-gray-800" @click="submit">
        Save Settings
      </button>
      <span v-if="saved" class="text-xs font-medium text-green-700">Saved.</span>
    </div>
  </div>
</template>
