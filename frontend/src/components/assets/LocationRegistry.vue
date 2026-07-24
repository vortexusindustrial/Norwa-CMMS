<script setup>
import { ref, computed } from "vue";
import { MapPin } from "lucide-vue-next";
import { projects } from "../../data/projects";
import {
  rootLocations,
  childLocationsOf,
  locationById,
  locationPath,
  assetsAtLocation,
  ASSET_STATUS_META,
  LOCATION_TYPE_LABEL,
  rolledUpStatus,
} from "../../data/assets";
import LocationTreeNode from "./LocationTreeNode.vue";

defineEmits(["select-asset"]);

const selectedLocationId = ref(rootLocations()[0]?.id ?? null);
const selectedLocation = computed(() => locationById(selectedLocationId.value));
const breadcrumb = computed(() =>
  selectedLocation.value ? locationPath(selectedLocation.value.id) : [],
);
const directAssets = computed(() =>
  selectedLocation.value ? assetsAtLocation(selectedLocation.value.id) : [],
);
const childLocations = computed(() =>
  selectedLocation.value ? childLocationsOf(selectedLocation.value.id) : [],
);
const project = computed(() =>
  selectedLocation.value?.projectId
    ? (projects.find((p) => p.id === selectedLocation.value.projectId) ?? null)
    : null,
);
</script>

<template>
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
    <div class="lg:col-span-1 rounded-lg border border-gray-200 bg-white p-3">
      <ul class="flex flex-col">
        <LocationTreeNode
          v-for="location in rootLocations()"
          :key="location.id"
          :location="location"
          :selected-id="selectedLocationId"
          @select="selectedLocationId = $event"
        />
      </ul>
    </div>

    <div class="lg:col-span-2 rounded-lg border border-gray-200 bg-white p-5">
      <div
        v-if="!selectedLocation"
        class="py-16 text-center text-sm text-gray-500"
      >
        Select a location to view details.
      </div>

      <div v-else>
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="flex items-center gap-1 text-xs text-gray-500">
              <MapPin class="h-3.5 w-3.5" />
              {{ breadcrumb.map((l) => l.name).join(" / ") }}
            </p>
            <h3 class="mt-0.5 text-base font-semibold text-gray-900">
              {{ selectedLocation.name }}
            </h3>
          </div>
          <span
            class="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600"
          >
            {{
              LOCATION_TYPE_LABEL[selectedLocation.type] ??
              selectedLocation.type
            }}
          </span>
        </div>

        <p v-if="project" class="mt-3 text-sm text-gray-500">
          Project: {{ project.name }}
        </p>

        <div v-if="childLocations.length" class="mt-5">
          <p class="text-xs font-medium uppercase tracking-wide text-gray-500">
            Sub-locations
          </p>
          <ul class="mt-2 flex flex-col gap-2">
            <li
              v-for="child in childLocations"
              :key="child.id"
              class="cursor-pointer rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 hover:bg-gray-50"
              @click="selectedLocationId = child.id"
            >
              {{ child.name }}
            </li>
          </ul>
        </div>

        <div class="mt-5">
          <p class="text-xs font-medium uppercase tracking-wide text-gray-500">
            Assets at this Location
          </p>
          <ul v-if="directAssets.length" class="mt-2 flex flex-col gap-2">
            <li
              v-for="asset in directAssets"
              :key="asset.id"
              class="flex cursor-pointer items-center justify-between rounded-md border border-gray-200 px-3 py-2 hover:bg-gray-50"
              @click="$emit('select-asset', asset.id)"
            >
              <div class="flex items-center gap-2">
                <span
                  class="h-2 w-2 shrink-0 rounded-full"
                  :class="ASSET_STATUS_META[rolledUpStatus(asset.id)].dotClass"
                />
                <span class="text-sm text-gray-900">{{ asset.name }}</span>
              </div>
              <span class="text-xs text-gray-400">{{ asset.id }}</span>
            </li>
          </ul>
          <p v-else class="mt-2 text-sm text-gray-500">
            No assets placed directly at this location.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
