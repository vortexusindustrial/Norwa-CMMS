<script setup>
import { ref, computed, watch } from 'vue'
import { Users, Shield, Server, History, Settings } from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'
import { useAdministrationStore } from '../stores/administration'
import { usePermissions } from '../composables/usePermissions'
import UserRoleManagement from '../components/administration/UserRoleManagement.vue'
import PermissionMatrix from '../components/administration/PermissionMatrix.vue'
import SystemHealthPanel from '../components/administration/SystemHealthPanel.vue'
import AuditLogTable from '../components/administration/AuditLogTable.vue'
import GlobalSettingsForm from '../components/administration/GlobalSettingsForm.vue'

const auth = useAuthStore()
const adminStore = useAdministrationStore()
const { accessLevel } = usePermissions()

const TABS = [
  { id: 'users', label: 'Users & Roles', icon: Users, permKey: 'administration.userManagement' },
  { id: 'matrix', label: 'Permission Matrix', icon: Shield, permKey: 'administration.permissionMatrix' },
  { id: 'health', label: 'System Health', icon: Server, permKey: 'administration.systemHealth' },
  { id: 'audit', label: 'Audit Log', icon: History, permKey: 'administration.auditLog' },
  { id: 'settings', label: 'Global Settings', icon: Settings, permKey: 'administration.globalSettings' },
]

const visibleTabs = computed(() => TABS.filter((tab) => accessLevel(tab.permKey) !== 'none'))
const activeTab = ref(visibleTabs.value[0]?.id ?? null)
watch(visibleTabs, (tabs) => {
  if (!tabs.some((tab) => tab.id === activeTab.value)) activeTab.value = tabs[0]?.id ?? null
})

const actorName = computed(() => auth.user?.name ?? 'Unknown')
</script>

<template>
  <div>
    <div class="flex items-start justify-between gap-4">
      <div>
        <h2 class="text-lg font-semibold text-gray-900">Administration</h2>
        <p class="mt-1 text-sm text-gray-500">
          User and role management, the permission matrix, integration health, and the audit log.
        </p>
      </div>

      <div v-if="visibleTabs.length > 1" class="flex shrink-0 flex-wrap items-center gap-1 rounded-md border border-gray-200 p-1">
        <button
          v-for="tab in visibleTabs"
          :key="tab.id"
          type="button"
          class="flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium"
          :class="activeTab === tab.id ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-50'"
          @click="activeTab = tab.id"
        >
          <component :is="tab.icon" class="h-3.5 w-3.5" />
          {{ tab.label }}
        </button>
      </div>
    </div>

    <div v-if="!visibleTabs.length" class="mt-6 rounded-lg border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
      You don't have access to any Administration features.
    </div>

    <template v-else>
      <div v-show="activeTab === 'users'" class="mt-6">
        <UserRoleManagement
          :users="adminStore.users"
          @change-role="(id, role) => adminStore.updateUserRole(id, role, actorName)"
          @toggle-status="(id) => adminStore.toggleUserStatus(id, actorName)"
          @add-user="(item) => adminStore.addUser(item, actorName)"
        />
      </div>

      <div v-show="activeTab === 'matrix'" class="mt-6">
        <PermissionMatrix />
      </div>

      <div v-show="activeTab === 'health'" class="mt-6">
        <SystemHealthPanel :health="adminStore.systemHealth" @refresh="adminStore.refreshSystemHealth" />
      </div>

      <div v-show="activeTab === 'audit'" class="mt-6">
        <AuditLogTable :entries="adminStore.auditLog" />
      </div>

      <div v-show="activeTab === 'settings'" class="mt-6">
        <GlobalSettingsForm :settings="adminStore.settings" @save="(patch) => adminStore.updateSettings(patch, actorName)" />
      </div>
    </template>
  </div>
</template>
