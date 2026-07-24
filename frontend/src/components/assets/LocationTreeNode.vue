<script setup>
import { ref, computed } from 'vue'
import { ChevronRight, ChevronDown } from 'lucide-vue-next'
import { childLocationsOf, assetCountFor, LOCATION_TYPE_LABEL } from '../../data/assets'

const props = defineProps({
  location: { type: Object, required: true },
  selectedId: { type: String, default: null },
  depth: { type: Number, default: 0 },
})

defineEmits(['select'])

const expanded = ref(true)
const children = computed(() => childLocationsOf(props.location.id))
const count = computed(() => assetCountFor(props.location.id))
</script>

<template>
  <li>
    <div
      class="flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors"
      :class="location.id === selectedId ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-50'"
      :style="{ paddingLeft: `${8 + depth * 16}px` }"
      @click="$emit('select', location.id)"
    >
      <button
        v-if="children.length"
        type="button"
        class="shrink-0 rounded p-0.5"
        :class="location.id === selectedId ? 'hover:bg-white/10' : 'hover:bg-gray-200'"
        @click.stop="expanded = !expanded"
      >
        <ChevronDown v-if="expanded" class="h-3.5 w-3.5" />
        <ChevronRight v-else class="h-3.5 w-3.5" />
      </button>
      <span v-else class="w-4 shrink-0" />

      <span class="truncate font-medium">{{ location.name }}</span>
      <span class="shrink-0 text-xs" :class="location.id === selectedId ? 'text-gray-300' : 'text-gray-400'">
        {{ LOCATION_TYPE_LABEL[location.type] ?? location.type }}
      </span>
      <span
        class="ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-xs"
        :class="location.id === selectedId ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-500'"
      >
        {{ count }}
      </span>
    </div>

    <ul v-if="expanded && children.length" class="flex flex-col">
      <LocationTreeNode
        v-for="child in children"
        :key="child.id"
        :location="child"
        :selected-id="selectedId"
        :depth="depth + 1"
        @select="$emit('select', $event)"
      />
    </ul>
  </li>
</template>
