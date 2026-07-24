<script setup>
import { ref, computed } from "vue";
import { ChevronRight, ChevronDown, OctagonAlert } from "lucide-vue-next";
import {
  childrenOf,
  ASSET_STATUS_META,
  hasCriticalDescendant,
  rolledUpStatus,
} from "../../data/assets";

const props = defineProps({
  asset: { type: Object, required: true },
  selectedId: { type: String, default: null },
  visibleIds: { type: Object, default: null },
  depth: { type: Number, default: 0 },
});

const emit = defineEmits(["select"]);

const expanded = ref(true);

const allChildren = computed(() => childrenOf(props.asset.id));
const children = computed(() =>
  props.visibleIds
    ? allChildren.value.filter((child) => props.visibleIds.has(child.id))
    : allChildren.value,
);

const statusMeta = computed(
  () => ASSET_STATUS_META[rolledUpStatus(props.asset.id)],
);
const flagCritical = computed(() => hasCriticalDescendant(props.asset.id));
</script>

<template>
  <li>
    <div
      class="flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors"
      :class="
        asset.id === selectedId
          ? 'bg-gray-900 text-white'
          : 'text-gray-700 hover:bg-gray-50'
      "
      :style="{ paddingLeft: `${8 + depth * 16}px` }"
      @click="$emit('select', asset.id)"
    >
      <button
        v-if="children.length"
        type="button"
        class="shrink-0 rounded p-0.5"
        :class="
          asset.id === selectedId ? 'hover:bg-white/10' : 'hover:bg-gray-200'
        "
        @click.stop="expanded = !expanded"
      >
        <ChevronDown v-if="expanded" class="h-3.5 w-3.5" />
        <ChevronRight v-else class="h-3.5 w-3.5" />
      </button>
      <span v-else class="w-4 shrink-0" />

      <span
        class="h-2 w-2 shrink-0 rounded-full"
        :class="statusMeta.dotClass"
      />

      <span class="truncate font-medium">{{ asset.name }}</span>
      <OctagonAlert
        v-if="flagCritical"
        class="h-3.5 w-3.5 shrink-0 text-red-500"
        :class="asset.id === selectedId && 'text-red-300'"
        title="Contains an asset reporting critical health"
      />
      <span
        class="shrink-0 text-xs"
        :class="asset.id === selectedId ? 'text-gray-300' : 'text-gray-400'"
      >
        {{ asset.id }}
      </span>
    </div>

    <ul v-if="expanded && children.length" class="flex flex-col">
      <AssetTreeNode
        v-for="child in children"
        :key="child.id"
        :asset="child"
        :selected-id="selectedId"
        :visible-ids="visibleIds"
        :depth="depth + 1"
        @select="$emit('select', $event)"
      />
    </ul>
  </li>
</template>
