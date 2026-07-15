<script setup>
import { computed } from 'vue'
import { usePermissions } from '../composables/usePermissions'
import { ROLES } from '../permissions'
import ManagementDashboard from '../components/dashboards/ManagementDashboard.vue'
import SupervisorDashboard from '../components/dashboards/SupervisorDashboard.vue'
import TechnicianDashboard from '../components/dashboards/TechnicianDashboard.vue'

const { roles } = usePermissions()

// A user can hold more than one role — pick the broadest view they qualify
// for rather than the narrowest.
const dashboard = computed(() => {
  if (roles.value.includes(ROLES.ADMIN) || roles.value.includes(ROLES.MANAGER)) {
    return ManagementDashboard
  }
  if (roles.value.includes(ROLES.SUPERVISOR)) {
    return SupervisorDashboard
  }
  return TechnicianDashboard
})
</script>

<template>
  <component :is="dashboard" />
</template>
