<script setup>
import { ref, reactive, computed } from 'vue'
import { Plus } from 'lucide-vue-next'
import { ROLES } from '../../permissions'
import { USER_STATUS_META } from '../../data/administration'

const props = defineProps({
  users: { type: Array, required: true },
})

const emit = defineEmits(['change-role', 'toggle-status', 'add-user'])

const roleOptions = Object.values(ROLES)

const sorted = computed(() => [...props.users].sort((a, b) => a.name.localeCompare(b.name)))

const showForm = ref(false)
const form = reactive({ name: '', email: '', role: ROLES.TECHNICIAN })
function submit() {
  if (!form.name.trim() || !form.email.trim()) return
  emit('add-user', { name: form.name.trim(), email: form.email.trim(), role: form.role })
  form.name = ''
  form.email = ''
  form.role = ROLES.TECHNICIAN
  showForm.value = false
}

function formatLastLogin(iso) {
  if (!iso) return 'Never'
  return new Date(iso).toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' })
}
</script>

<template>
  <div class="rounded-lg border border-gray-200 bg-white p-5">
    <div class="flex items-center justify-between gap-3">
      <p class="text-xs text-gray-500">{{ users.length }} users</p>
      <button
        type="button"
        class="flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
        @click="showForm = !showForm"
      >
        <Plus class="h-3.5 w-3.5" />
        Add User
      </button>
    </div>

    <div v-if="showForm" class="mt-3 grid grid-cols-2 gap-2 rounded-md border border-gray-200 p-3 sm:grid-cols-4">
      <input v-model="form.name" type="text" placeholder="Full name" class="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none" />
      <input v-model="form.email" type="email" placeholder="Email" class="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none" />
      <select v-model="form.role" class="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none">
        <option v-for="role in roleOptions" :key="role" :value="role">{{ role }}</option>
      </select>
      <div class="flex gap-2">
        <button type="button" class="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800" @click="submit">Save</button>
        <button type="button" class="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50" @click="showForm = false">Cancel</button>
      </div>
    </div>

    <div class="mt-4 overflow-x-auto">
      <table class="w-full border-collapse text-sm">
        <thead>
          <tr class="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
            <th class="px-3 py-2">User</th>
            <th class="px-3 py-2">Role</th>
            <th class="px-3 py-2">Status</th>
            <th class="px-3 py-2">Last Login</th>
            <th class="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in sorted" :key="user.id" class="border-b border-gray-100 last:border-0">
            <td class="px-3 py-2">
              <p class="font-medium text-gray-900">{{ user.name }}</p>
              <p class="text-xs text-gray-500">{{ user.email }}</p>
            </td>
            <td class="px-3 py-2">
              <select
                :value="user.role"
                class="rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-gray-500 focus:outline-none"
                @change="emit('change-role', user.id, $event.target.value)"
              >
                <option v-for="role in roleOptions" :key="role" :value="role">{{ role }}</option>
              </select>
            </td>
            <td class="px-3 py-2">
              <span class="rounded px-2 py-0.5 text-xs font-medium" :class="USER_STATUS_META[user.status].badgeClass">
                {{ USER_STATUS_META[user.status].label }}
              </span>
            </td>
            <td class="px-3 py-2 text-gray-500">{{ formatLastLogin(user.lastLogin) }}</td>
            <td class="px-3 py-2 text-right">
              <button
                type="button"
                class="rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                @click="emit('toggle-status', user.id)"
              >
                {{ user.status === 'active' ? 'Suspend' : 'Reactivate' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
