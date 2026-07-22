import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { accessLevelFor } from '../permissions'

// Mounted under /cmms — Frappe reserves the bare /app, /login, /api, /desk,
// /assets, /files, and /private paths for its own routing, so this app's
// routes must not collide with those.
const routes = [
  { path: '/', redirect: '/cmms' },
  { path: '/cmms', name: 'landing', component: () => import('../pages/LandingPage.vue') },
  { path: '/cmms/login', name: 'login', component: () => import('../pages/LoginPage.vue') },
  {
    path: '/cmms/app',
    component: () => import('../layouts/AppShellLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('../pages/DashboardPage.vue'),
        meta: { section: 'dashboard' },
      },
      {
        path: 'projects',
        name: 'projects',
        component: () => import('../pages/ProjectsPage.vue'),
        meta: { section: 'projects' },
      },
      {
        path: 'bom',
        name: 'bill-of-materials',
        component: () => import('../pages/BillOfMaterialsPage.vue'),
        meta: { section: 'bom' },
      },
      {
        path: 'assets',
        name: 'assets',
        component: () => import('../pages/AssetsPage.vue'),
        meta: { section: 'assets' },
      },
      {
        path: 'work-orders',
        name: 'work-orders',
        component: () => import('../pages/WorkOrdersPage.vue'),
        meta: { section: 'workOrders' },
      },
      {
        path: 'procurement',
        name: 'procurement',
        component: () => import('../pages/StoreProcurementPage.vue'),
        meta: { section: 'procurement' },
      },
      {
        path: 'reports',
        name: 'reports',
        component: () => import('../pages/ReportsPage.vue'),
        meta: { section: 'reports' },
      },
      {
        path: 'admin',
        name: 'administration',
        component: () => import('../pages/AdministrationPage.vue'),
        meta: { section: 'administration' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  await auth.ensureSessionChecked()

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { path: '/cmms/login', query: { redirect: to.fullPath } }
  }
  if (to.name === 'login' && auth.isLoggedIn) {
    return { path: '/cmms/app' }
  }
  if (to.meta.section && accessLevelFor(to.meta.section, auth.user?.roles ?? []) === 'none') {
    return { path: '/cmms/app' }
  }
})

export default router
