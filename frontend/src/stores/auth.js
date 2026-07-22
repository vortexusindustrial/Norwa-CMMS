import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import call from '../utils/call'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null) // { name, roles }
  const isLoading = ref(false)
  const error = ref('')
  const checkedSession = ref(false)

  const isLoggedIn = computed(() => !!user.value)

  async function fetchCurrentUser() {
    const loggedUser = await call('frappe.auth.get_logged_user')
    if (!loggedUser || loggedUser === 'Guest') {
      user.value = null
      return
    }
    const roleRows = await call('frappe.client.get_list', {
      doctype: 'Has Role',
      filters: { parent: loggedUser, parenttype: 'User' },
      fields: ['role'],
      limit_page_length: 0,
    })
    user.value = {
      name: loggedUser,
      roles: roleRows.map((row) => row.role),
    }
  }

  async function ensureSessionChecked() {
    if (checkedSession.value) return
    try {
      await fetchCurrentUser()
    } catch {
      user.value = null
    } finally {
      checkedSession.value = true
    }
  }

  async function login(usr, pwd) {
    isLoading.value = true
    error.value = ''
    try {
      if (import.meta.env.DEV) {
        // No bench/backend to authenticate against yet. import.meta.env.DEV
        // is statically false in production builds, so this branch is
        // dead-code-eliminated and can't ship as a real auth bypass.
        await mockLogin(usr, pwd)
      } else {
        await call('login', { usr, pwd })
        await fetchCurrentUser()
      }
      checkedSession.value = true
    } catch (err) {
      error.value = err.messages?.[0] || err.message || 'Invalid email or password'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function mockLogin(usr, pwd) {
    if (!usr || !pwd) {
      throw new Error('Enter an email and password')
    }
    await new Promise((resolve) => setTimeout(resolve, 300))
    user.value = { name: usr, roles: [mockRoleFor(usr)] }
  }

  function mockRoleFor(email) {
    const lower = email.toLowerCase()
    if (lower.includes('admin')) return 'System Administrator'
    if (lower.includes('manager')) return 'Maintenance Manager'
    if (lower.includes('supervisor')) return 'Shift Supervisor'
    return 'Field Technician'
  }

  async function logout() {
    if (!import.meta.env.DEV) {
      await call('logout')
    }
    user.value = null
  }

  return {
    user,
    isLoading,
    error,
    isLoggedIn,
    fetchCurrentUser,
    ensureSessionChecked,
    login,
    logout,
  }
})
