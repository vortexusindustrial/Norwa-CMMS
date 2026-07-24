import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { vendors as mockVendors } from '../data/vendors'

// persist: true (see stores/persistPlugin.js) keeps vendor edits across a reload.
export const useVendorsStore = defineStore('vendors', () => {
  const vendors = ref(mockVendors)

  const activeVendors = computed(() => vendors.value.filter((v) => v.status === 'active'))

  function vendorById(id) {
    return vendors.value.find((v) => v.id === id) ?? null
  }

  function addVendor(vendor) {
    vendors.value.push({
      id: `VND-${Date.now()}`,
      status: 'active',
      ...vendor,
    })
  }

  function updateVendor(id, changes) {
    const vendor = vendorById(id)
    if (!vendor) return
    Object.assign(vendor, changes)
  }

  // Deactivate rather than delete — historical POs reference vendors by
  // name and shouldn't be orphaned by a vendor record disappearing.
  function toggleVendorStatus(id) {
    const vendor = vendorById(id)
    if (!vendor) return
    vendor.status = vendor.status === 'active' ? 'inactive' : 'active'
  }

  return {
    vendors,
    activeVendors,
    vendorById,
    addVendor,
    updateVendor,
    toggleVendorStatus,
  }
}, { persist: true })
