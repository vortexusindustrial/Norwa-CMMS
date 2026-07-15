<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const pageTitle = computed(() =>
  String(route.name)
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
)

async function handleSignOut() {
  await auth.logout()
  router.push('/cmms/login')
}
</script>

<template>
  <header class="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
    <h1 class="text-base font-medium text-gray-900">{{ pageTitle }}</h1>
    <div class="flex items-center gap-4">
      <span class="text-sm text-gray-500">{{ auth.user?.name }}</span>
      <button
        type="button"
        class="text-sm font-medium text-gray-600 hover:text-gray-900"
        @click="handleSignOut"
      >
        Sign Out
      </button>
    </div>
  </header>
</template>
