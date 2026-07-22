<script setup>
import { ref, computed, watch } from "vue";
import { useRoute } from "vue-router";
import {
  PackageSearch,
  ClipboardList,
  Boxes,
  Truck,
  Building2,
} from "lucide-vue-next";
import { stockCatalog } from "../data/stock";
import { CURRENT_TECHNICIAN_ID, CURRENT_TEAM } from "../data/workOrders";
import { useWorkOrdersStore } from "../stores/workOrders";
import { useProcurementStore } from "../stores/procurement";
import { useVendorsStore } from "../stores/vendors";
import { usePermissions } from "../composables/usePermissions";
import StockAvailabilityPanel from "../components/procurement/StockAvailabilityPanel.vue";
import PurchaseRequestQueue from "../components/procurement/PurchaseRequestQueue.vue";
import ComponentReservationTracker from "../components/procurement/ComponentReservationTracker.vue";
import VendorPoStatus from "../components/procurement/VendorPoStatus.vue";
import VendorManagement from "../components/procurement/VendorManagement.vue";

const route = useRoute();
const woStore = useWorkOrdersStore();
const procurementStore = useProcurementStore();
const vendorsStore = useVendorsStore();
const { accessLevel } = usePermissions();

const TABS = [
  {
    id: "stock",
    label: "Stock Availability",
    icon: PackageSearch,
    permKey: "procurement.stockCheck",
  },
  {
    id: "requests",
    label: "Purchase Requests",
    icon: ClipboardList,
    permKey: "procurement.purchaseRequestQueue",
  },
  {
    id: "reservations",
    label: "Reservations",
    icon: Boxes,
    permKey: "procurement.componentReservation",
  },
  {
    id: "po",
    label: "Vendor / PO Status",
    icon: Truck,
    permKey: "procurement.vendorPoStatus",
  },
  {
    id: "vendors",
    label: "Vendor Management",
    icon: Building2,
    permKey: "procurement.vendorManagement",
  },
];

const visibleTabs = computed(() =>
  TABS.filter((tab) => accessLevel(tab.permKey) !== "none"),
);
const activeTab = ref(
  visibleTabs.value.some((tab) => tab.id === route.query.tab)
    ? route.query.tab
    : (visibleTabs.value[0]?.id ?? null),
);
// Roles are fixed per session today, but guard against the active tab ever
// landing on one this user can't see (e.g. a future role switch).
watch(visibleTabs, (tabs) => {
  if (!tabs.some((tab) => tab.id === activeTab.value))
    activeTab.value = tabs[0]?.id ?? null;
});

// 'full' sees the whole catalog; 'scoped' (supervisor) narrows to parts
// touched by their team's work orders; 'view' (technician) narrows further
// to just their own
const stockAccessLevel = computed(() => accessLevel("procurement.stockCheck"));
const stockScopeLabel = computed(() => {
  if (stockAccessLevel.value === "scoped") return `${CURRENT_TEAM}'s jobs`;
  if (stockAccessLevel.value === "view") return "your assigned jobs";
  return null;
});
const scopedPartNumbers = computed(() => {
  if (stockAccessLevel.value === "full") return null;
  const relevantWorkOrders =
    stockAccessLevel.value === "scoped"
      ? woStore.workOrders.filter((wo) => wo.team === CURRENT_TEAM)
      : woStore.workOrders.filter(
          (wo) => wo.technicianId === CURRENT_TECHNICIAN_ID,
        );
  return new Set(
    relevantWorkOrders.flatMap((wo) => wo.materials.map((m) => m.partNumber)),
  );
});
const stockParts = computed(() => {
  const all = Object.entries(stockCatalog).map(([partNumber, stock]) => ({
    partNumber,
    ...stock,
  }));
  if (!scopedPartNumbers.value) return all;
  return all.filter((part) => scopedPartNumbers.value.has(part.partNumber));
});

const reservationsEditable = computed(
  () => accessLevel("procurement.componentReservation") === "full",
);
const poEditable = computed(
  () =>
    accessLevel("procurement.vendorPoStatus") !== "none" &&
    accessLevel("procurement.vendorPoStatus") !== "view",
);
</script>

<template>
  <div>
    <div class="flex items-start justify-between gap-4">
      <div>
        <h2 class="text-lg font-semibold text-gray-900">
          Store &amp; Procurement
        </h2>
        <p class="mt-1 text-sm text-gray-500">
          Stock checks, component reservations, and purchase requests.
        </p>
      </div>

      <div
        v-if="visibleTabs.length > 1"
        class="flex shrink-0 flex-wrap items-center gap-1 rounded-md border border-gray-200 p-1"
      >
        <button
          v-for="tab in visibleTabs"
          :key="tab.id"
          type="button"
          class="flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium"
          :class="
            activeTab === tab.id
              ? 'bg-gray-900 text-white'
              : 'text-gray-700 hover:bg-gray-50'
          "
          @click="activeTab = tab.id"
        >
          <component :is="tab.icon" class="h-3.5 w-3.5" />
          {{ tab.label }}
        </button>
      </div>
    </div>

    <div
      v-if="!visibleTabs.length"
      class="mt-6 rounded-lg border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500"
    >
      You don't have access to any Store &amp; Procurement features.
    </div>

    <template v-else>
      <div v-show="activeTab === 'stock'" class="mt-6">
        <StockAvailabilityPanel
          :parts="stockParts"
          :scope-label="stockScopeLabel"
        />
      </div>

      <div v-show="activeTab === 'requests'" class="mt-6">
        <PurchaseRequestQueue
          :requests="procurementStore.purchaseRequests"
          @approve="procurementStore.approveRequest"
          @reject="procurementStore.rejectRequest"
          @create-po="procurementStore.createPurchaseOrder"
          @create-manual="procurementStore.createManualRequest"
        />
      </div>

      <div v-show="activeTab === 'reservations'" class="mt-6">
        <ComponentReservationTracker
          :reservations="procurementStore.reservations"
          :editable="reservationsEditable"
          @reserve="procurementStore.reserveComponent"
          @release="procurementStore.releaseReservation"
          @consume="procurementStore.consumeReservation"
        />
      </div>

      <div v-show="activeTab === 'po'" class="mt-6">
        <VendorPoStatus
          :purchase-orders="procurementStore.purchaseOrders"
          :requests="procurementStore.purchaseRequests"
          :editable="poEditable"
          @update-status="procurementStore.updatePoStatus"
        />
      </div>

      <div v-show="activeTab === 'vendors'" class="mt-6">
        <VendorManagement
          :vendors="vendorsStore.vendors"
          @add-vendor="vendorsStore.addVendor"
          @update-vendor="vendorsStore.updateVendor"
          @toggle-status="vendorsStore.toggleVendorStatus"
        />
      </div>
    </template>
  </div>
</template>
