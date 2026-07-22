<script setup>
import { ref, computed } from 'vue'
import { Search } from 'lucide-vue-next'

const props = defineProps({
  entries: { type: Array, required: true },
})

const search = ref('')

const rows = computed(() => {
  const term = search.value.trim().toLowerCase()
  const filtered = term
    ? props.entries.filter(
        (e) => e.actor.toLowerCase().includes(term) || e.action.toLowerCase().includes(term) || e.entity.toLowerCase().includes(term)
      )
    : props.entries
  return [...filtered].sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
})

function formatTimestamp(iso) {
  return new Date(iso).toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' })
}
</script>

<template>
  <div class="rounded-lg border border-gray-200 bg-white p-5">
    <div class="flex items-center justify-between gap-3">
      <p class="text-xs text-gray-500">{{ rows.length }} of {{ entries.length }} entries &middot; view only, entries cannot be deleted</p>
      <div class="relative w-64">
        <Search class="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
        <input
          v-model="search"
          type="text"
          placeholder="Search actor, action, entity..."
          class="w-full rounded-md border border-gray-300 py-1.5 pl-8 pr-3 text-sm focus:border-gray-500 focus:outline-none"
        />
      </div>
    </div>

    <div v-if="!rows.length" class="mt-4 rounded-md border border-dashed border-gray-200 p-4 text-center text-sm text-gray-500">
      No audit log entries match.
    </div>
    <div v-else class="mt-4 overflow-x-auto">
      <table class="w-full border-collapse text-sm">
        <thead>
          <tr class="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
            <th class="px-3 py-2">Timestamp</th>
            <th class="px-3 py-2">Actor</th>
            <th class="px-3 py-2">Action</th>
            <th class="px-3 py-2">Entity</th>
            <th class="px-3 py-2">Details</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="entry in rows" :key="entry.id" class="border-b border-gray-100 last:border-0">
            <td class="whitespace-nowrap px-3 py-2 text-gray-500">{{ formatTimestamp(entry.timestamp) }}</td>
            <td class="px-3 py-2 font-medium text-gray-900">{{ entry.actor }}</td>
            <td class="px-3 py-2 text-gray-700">{{ entry.action }}</td>
            <td class="px-3 py-2 text-gray-500">{{ entry.entity }}</td>
            <td class="px-3 py-2 text-gray-700">{{ entry.details }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
