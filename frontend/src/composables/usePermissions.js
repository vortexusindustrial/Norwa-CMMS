import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/auth'
import { accessLevelFor } from '../permissions'

export function usePermissions() {
  const auth = useAuthStore()
  const { user } = storeToRefs(auth)

  const roles = computed(() => user.value?.roles ?? [])

  function accessLevel(section) {
    return accessLevelFor(section, roles.value)
  }

  function canView(section) {
    return accessLevel(section) !== 'none'
  }

  function isScoped(section) {
    return accessLevel(section) === 'scoped'
  }

  return { roles, accessLevel, canView, isScoped }
}
