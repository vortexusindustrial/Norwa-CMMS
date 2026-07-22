<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const email = ref('')
const password = ref('')

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const isDev = import.meta.env.DEV

async function handleSubmit() {
  try {
    await auth.login(email.value, password.value)
    router.push(route.query.redirect || '/cmms/app')
  } catch {
    // auth.error already holds the message for display below
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4">
    <form
      class="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-8 shadow-sm"
      @submit.prevent="handleSubmit"
    >
      <h1 class="text-lg font-semibold text-gray-900">Sign in to Norwa CMMS</h1>
      <p class="mt-1 text-sm text-gray-500">Use your Frappe account credentials.</p>
      <p v-if="isDev" class="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
        Dev mode: no backend yet, any email/password signs you in. Include
        admin / manager / supervisor / technician in the email to test that
        role's dashboard.
      </p>

      <label class="mt-6 block text-sm font-medium text-gray-700" for="email">Email</label>
      <input
        id="email"
        v-model="email"
        type="email"
        required
        autocomplete="username"
        class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-gray-500 focus:outline-none"
      />

      <label class="mt-4 block text-sm font-medium text-gray-700" for="password">Password</label>
      <input
        id="password"
        v-model="password"
        type="password"
        required
        autocomplete="current-password"
        class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-gray-500 focus:outline-none"
      />

      <p v-if="auth.error" class="mt-4 text-sm text-red-600">{{ auth.error }}</p>

      <button
        type="submit"
        :disabled="auth.isLoading"
        class="mt-6 w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {{ auth.isLoading ? 'Signing in…' : 'Sign In' }}
      </button>
    </form>
  </div>
</template>
