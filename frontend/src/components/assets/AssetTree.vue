<script setup>
import { ref, computed } from "vue";
import { Search } from "lucide-vue-next";
import {
  assets,
  rootAssets,
  ancestorsOf,
  descendantsOf,
} from "../../data/assets";
import AssetTreeNode from "./AssetTreeNode.vue";

const props = defineProps({
  selectedId: { type: String, default: null },
  scopedIds: { type: Object, default: null },
});

defineEmits(["select"]);

const query = ref("");

const visibleIds = computed(() => {
  const term = query.value.trim().toLowerCase();
  if (!term) return props.scopedIds;

  const pool = props.scopedIds
    ? assets.filter((asset) => props.scopedIds.has(asset.id))
    : assets;
  const matches = pool.filter(
    (asset) =>
      asset.name.toLowerCase().includes(term) ||
      asset.id.toLowerCase().includes(term) ||
      asset.category.toLowerCase().includes(term),
  );
  const ids = new Set();
  matches.forEach((asset) => {
    ids.add(asset.id);
    ancestorsOf(asset.id).forEach((ancestor) => ids.add(ancestor.id));
    descendantsOf(asset.id).forEach((descendant) => ids.add(descendant.id));
  });
  if (props.scopedIds) {
    for (const id of ids) {
      if (!props.scopedIds.has(id)) ids.delete(id);
    }
  }
  return ids;
});

const roots = computed(() => {
  const all = rootAssets();
  return visibleIds.value
    ? all.filter((asset) => visibleIds.value.has(asset.id))
    : all;
});
</script>

<template>
  <div class="rounded-lg border border-gray-200 bg-white p-3">
    <div class="relative">
      <Search
        class="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400"
      />
      <input
        v-model="query"
        type="text"
        placeholder="Search assets..."
        class="w-full rounded-md border border-gray-300 py-1.5 pl-8 pr-3 text-sm focus:border-gray-500 focus:outline-none"
      />
    </div>

    <ul class="mt-2 flex flex-col">
      <AssetTreeNode
        v-for="asset in roots"
        :key="asset.id"
        :asset="asset"
        :selected-id="selectedId"
        :visible-ids="visibleIds"
        @select="$emit('select', $event)"
      />
    </ul>
    <p
      v-if="!roots.length && query"
      class="px-2 py-6 text-center text-sm text-gray-500"
    >
      No assets match "{{ query }}".
    </p>
    <p
      v-else-if="!roots.length"
      class="px-2 py-6 text-center text-sm text-gray-500"
    >
      No assets are tied to your current work orders.
    </p>
  </div>
</template>
