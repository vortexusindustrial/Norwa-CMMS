<script setup>
import { ref, reactive, computed } from 'vue'
import { Plus } from 'lucide-vue-next'
import { VENDOR_STATUS_META } from '../../data/vendors'

const props = defineProps({
  vendors: { type: Array, required: true },
})

const emit = defineEmits(['add-vendor', 'update-vendor', 'toggle-status'])

const sorted = computed(() => [...props.vendors].sort((a, b) => a.name.localeCompare(b.name)))

const showForm = ref(false)
const form = reactive({ name: '', contactName: '', email: '', phone: '', address: '' })
function submit() {
  if (!form.name.trim() || !form.email.trim()) return
  emit('add-vendor', {
    name: form.name.trim(),
    contactName: form.contactName.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    address: form.address.trim(),
  })
  form.name = ''
  form.contactName = ''
  form.email = ''
  form.phone = ''
  form.address = ''
  showForm.value = false
}

const editingId = ref(null)
const editForm = reactive({ name: '', contactName: '', email: '', phone: '', address: '' })
function startEdit(vendor) {
  editingId.value = vendor.id
  editForm.name = vendor.name
  editForm.contactName = vendor.contactName
  editForm.email = vendor.email
  editForm.phone = vendor.phone
  editForm.address = vendor.address
}
function saveEdit(id) {
  if (!editForm.name.trim() || !editForm.email.trim()) return
  emit('update-vendor', id, {
    name: editForm.name.trim(),
    contactName: editForm.contactName.trim(),
    email: editForm.email.trim(),
    phone: editForm.phone.trim(),
    address: editForm.address.trim(),
  })
  editingId.value = null
}
</script>

<template>
  <div class="rounded-lg border border-gray-200 bg-white p-5">
    <div class="flex items-center justify-between gap-3">
      <p class="text-xs text-gray-500">{{ vendors.length }} vendors</p>
      <button
        type="button"
        class="flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
        @click="showForm = !showForm"
      >
        <Plus class="h-3.5 w-3.5" />
        Add Vendor
      </button>
    </div>

    <div v-if="showForm" class="mt-3 grid grid-cols-2 gap-2 rounded-md border border-gray-200 p-3 sm:grid-cols-3">
      <input v-model="form.name" type="text" placeholder="Vendor name" class="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none" />
      <input v-model="form.contactName" type="text" placeholder="Contact name" class="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none" />
      <input v-model="form.email" type="email" placeholder="Email" class="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none" />
      <input v-model="form.phone" type="text" placeholder="Phone" class="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none" />
      <input v-model="form.address" type="text" placeholder="Address" class="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none sm:col-span-2" />
      <div class="flex gap-2">
        <button type="button" class="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800" @click="submit">Save</button>
        <button type="button" class="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50" @click="showForm = false">Cancel</button>
      </div>
    </div>

    <div v-if="!sorted.length" class="mt-4 rounded-md border border-dashed border-gray-200 p-4 text-center text-sm text-gray-500">
      No vendors added yet.
    </div>
    <ul v-else class="mt-4 flex flex-col gap-3">
      <li v-for="vendor in sorted" :key="vendor.id" class="rounded-md border border-gray-200 p-4">
        <template v-if="editingId === vendor.id">
          <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <input v-model="editForm.name" type="text" placeholder="Vendor name" class="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none" />
            <input v-model="editForm.contactName" type="text" placeholder="Contact name" class="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none" />
            <input v-model="editForm.email" type="email" placeholder="Email" class="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none" />
            <input v-model="editForm.phone" type="text" placeholder="Phone" class="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none" />
            <input v-model="editForm.address" type="text" placeholder="Address" class="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none sm:col-span-2" />
          </div>
          <div class="mt-3 flex justify-end gap-2">
            <button type="button" class="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800" @click="saveEdit(vendor.id)">Save</button>
            <button type="button" class="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50" @click="editingId = null">Cancel</button>
          </div>
        </template>
        <template v-else>
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm font-medium text-gray-900">{{ vendor.name }}</p>
              <p class="mt-0.5 text-xs text-gray-500">{{ vendor.contactName }} &middot; {{ vendor.email }}</p>
              <p class="mt-0.5 text-xs text-gray-500">{{ vendor.phone }}<span v-if="vendor.address"> &middot; {{ vendor.address }}</span></p>
            </div>
            <span class="shrink-0 rounded px-2 py-0.5 text-xs font-medium" :class="VENDOR_STATUS_META[vendor.status].badgeClass">
              {{ VENDOR_STATUS_META[vendor.status].label }}
            </span>
          </div>
          <div class="mt-3 flex justify-end gap-1.5">
            <button
              type="button"
              class="rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
              @click="startEdit(vendor)"
            >
              Edit
            </button>
            <button
              type="button"
              class="rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
              @click="emit('toggle-status', vendor.id)"
            >
              {{ vendor.status === 'active' ? 'Deactivate' : 'Reactivate' }}
            </button>
          </div>
        </template>
      </li>
    </ul>
  </div>
</template>
