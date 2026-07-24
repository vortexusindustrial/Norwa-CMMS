<script setup>
import { ref, computed, watch } from "vue";
import { Info, HeartPulse, ExternalLink, OctagonAlert } from "lucide-vue-next";
import { projects } from "../../data/projects";
import {
  ASSET_STATUS_META,
  ancestorsOf,
  childrenOf,
  locationPath,
  erpnextUrl,
  hasCriticalDescendant,
  rolledUpStatus,
} from "../../data/assets";
import AssetHealthPanel from "./AssetHealthPanel.vue";

const props = defineProps({
  asset: { type: Object, default: null },
  scopedIds: { type: Object, default: null },
});

defineEmits(["select-asset"]);

const activeTab = ref("overview");

watch(
  () => props.asset?.id,
  () => {
    activeTab.value = "overview";
  },
);

const dateFormatter = new Intl.DateTimeFormat("en-KE", {
  month: "short",
  day: "numeric",
  year: "numeric",
});
function formatDate(iso) {
  return dateFormatter.format(new Date(iso));
}

const statusMeta = computed(() =>
  props.asset ? ASSET_STATUS_META[rolledUpStatus(props.asset.id)] : null,
);
const project = computed(() =>
  props.asset
    ? (projects.find((p) => p.id === props.asset.projectId) ?? null)
    : null,
);
const breadcrumb = computed(() =>
  props.asset ? locationPath(props.asset.locationId) : [],
);
const ancestors = computed(() =>
  props.asset ? ancestorsOf(props.asset.id) : [],
);
const children = computed(() => {
  if (!props.asset) return [];
  const all = childrenOf(props.asset.id);
  return props.scopedIds
    ? all.filter((child) => props.scopedIds.has(child.id))
    : all;
});
</script>

<template>
  <div class="rounded-lg border border-gray-200 bg-white p-5">
    <div v-if="!asset" class="py-16 text-center text-sm text-gray-500">
      Select an asset to view details.
    </div>

    <div v-else>
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-xs text-gray-500">
            {{ asset.id }} &middot; {{ asset.category }}
          </p>
          <h3 class="mt-0.5 text-base font-semibold text-gray-900">
            {{ asset.name }}
          </h3>
        </div>
        <div class="flex shrink-0 items-center gap-2">
          <span
            class="rounded-full px-2.5 py-1 text-xs font-medium"
            :class="statusMeta.badgeClass"
          >
            {{ statusMeta.label }}
          </span>
          <a
            :href="erpnextUrl(asset)"
            target="_blank"
            rel="noopener"
            class="flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            <ExternalLink class="h-3.5 w-3.5" />
            ERPNext
          </a>
        </div>
      </div>

      <div
        v-if="ancestors.length"
        class="mt-3 flex flex-wrap items-center gap-1 text-xs text-gray-500"
      >
        <template v-for="(ancestor, i) in ancestors" :key="ancestor.id">
          <button
            type="button"
            class="hover:text-gray-900 hover:underline"
            @click="$emit('select-asset', ancestor.id)"
          >
            {{ ancestor.name }}
          </button>
          <span>/</span>
        </template>
        <span class="text-gray-700">{{ asset.name }}</span>
      </div>

      <div
        class="mt-4 flex w-fit items-center gap-1 rounded-md border border-gray-200 p-1"
      >
        <button
          type="button"
          class="flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium"
          :class="
            activeTab === 'overview'
              ? 'bg-gray-900 text-white'
              : 'text-gray-700 hover:bg-gray-50'
          "
          @click="activeTab = 'overview'"
        >
          <Info class="h-3.5 w-3.5" />
          Overview
        </button>
        <button
          type="button"
          class="flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium"
          :class="
            activeTab === 'health'
              ? 'bg-gray-900 text-white'
              : 'text-gray-700 hover:bg-gray-50'
          "
          @click="activeTab = 'health'"
        >
          <HeartPulse class="h-3.5 w-3.5" />
          Health & Telemetry
        </button>
      </div>

      <div v-show="activeTab === 'overview'" class="mt-5">
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <p
              class="text-xs font-medium uppercase tracking-wide text-gray-500"
            >
              Manufacturer / Model
            </p>
            <p class="mt-1.5 text-sm text-gray-900">
              {{ asset.manufacturer }} &middot; {{ asset.model }}
            </p>
          </div>
          <div>
            <p
              class="text-xs font-medium uppercase tracking-wide text-gray-500"
            >
              Serial Number
            </p>
            <p class="mt-1.5 text-sm text-gray-900">{{ asset.serialNumber }}</p>
          </div>
          <div>
            <p
              class="text-xs font-medium uppercase tracking-wide text-gray-500"
            >
              Installed
            </p>
            <p class="mt-1.5 text-sm text-gray-900">
              {{ formatDate(asset.installDate) }}
            </p>
          </div>
          <div>
            <p
              class="text-xs font-medium uppercase tracking-wide text-gray-500"
            >
              Warranty Expiry
            </p>
            <p class="mt-1.5 text-sm text-gray-900">
              {{ formatDate(asset.warrantyExpiry) }}
            </p>
          </div>
          <div>
            <p
              class="text-xs font-medium uppercase tracking-wide text-gray-500"
            >
              Location
            </p>
            <p class="mt-1.5 text-sm text-gray-900">
              {{ breadcrumb.map((l) => l.name).join(" / ") }}
            </p>
          </div>
          <div v-if="project">
            <p
              class="text-xs font-medium uppercase tracking-wide text-gray-500"
            >
              Project
            </p>
            <p class="mt-1.5 text-sm text-gray-900">{{ project.name }}</p>
          </div>
        </div>

        <div v-if="children.length" class="mt-6">
          <p class="text-xs font-medium uppercase tracking-wide text-gray-500">
            Child Assets
          </p>
          <ul class="mt-2 flex flex-col gap-2">
            <li
              v-for="child in children"
              :key="child.id"
              class="flex cursor-pointer items-center justify-between rounded-md border border-gray-200 px-3 py-2 hover:bg-gray-50"
              @click="$emit('select-asset', child.id)"
            >
              <div class="flex items-center gap-2">
                <span
                  class="h-2 w-2 shrink-0 rounded-full"
                  :class="ASSET_STATUS_META[rolledUpStatus(child.id)].dotClass"
                />
                <span class="text-sm text-gray-900">{{ child.name }}</span>
                <OctagonAlert
                  v-if="hasCriticalDescendant(child.id)"
                  class="h-3.5 w-3.5 shrink-0 text-red-500"
                  title="Contains an asset reporting critical health"
                />
              </div>
              <span class="text-xs text-gray-400">{{ child.id }}</span>
            </li>
          </ul>
        </div>
      </div>

      <div v-show="activeTab === 'health'" class="mt-5">
        <AssetHealthPanel :asset="asset" />
      </div>
    </div>
  </div>
</template>
