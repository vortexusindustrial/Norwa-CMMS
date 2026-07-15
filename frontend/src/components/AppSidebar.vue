<script setup>
import { computed } from 'vue'
import {
  LayoutDashboard,
  Briefcase,
  ClipboardList,
  Boxes,
  Wrench,
  Package,
  BarChart3,
  Settings,
} from 'lucide-vue-next'
import { usePermissions } from '../composables/usePermissions'

const { canView } = usePermissions()

const allLinks = [
  { to: '/cmms/app', label: 'Dashboard', icon: LayoutDashboard, section: 'dashboard' },
  { to: '/cmms/app/projects', label: 'Projects', icon: Briefcase, section: 'projects' },
  { to: '/cmms/app/bom', label: 'Bill of Materials', icon: ClipboardList, section: 'bom' },
  { to: '/cmms/app/assets', label: 'Assets', icon: Boxes, section: 'assets' },
  { to: '/cmms/app/work-orders', label: 'Work Orders', icon: Wrench, section: 'workOrders' },
  { to: '/cmms/app/procurement', label: 'Store & Procurement', icon: Package, section: 'procurement' },
  { to: '/cmms/app/reports', label: 'Reports', icon: BarChart3, section: 'reports' },
  { to: '/cmms/app/admin', label: 'Administration', icon: Settings, section: 'administration' },
]

const links = computed(() => allLinks.filter((link) => canView(link.section)))
</script>

<template>
  <aside class="flex w-60 shrink-0 flex-col border-r border-gray-200 bg-white">
    <div class="px-4 py-4 text-lg font-semibold text-gray-900">Norwa CMMS</div>
    <nav class="flex flex-col gap-1 px-2">
      <RouterLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        exact-active-class="bg-gray-100 text-gray-900"
      >
        <component :is="link.icon" class="h-4 w-4 shrink-0" />
        {{ link.label }}
      </RouterLink>
    </nav>
  </aside>
</template>
