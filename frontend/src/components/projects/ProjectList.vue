<script setup>
import ProjectListItem from './ProjectListItem.vue'

defineProps({
  projects: { type: Array, required: true },
  selectedId: { type: String, default: null },
})

defineEmits(['select'])
</script>

<template>
  <ul class="flex flex-col gap-3">
    <ProjectListItem
      v-for="project in projects"
      :key="project.id"
      :project="project"
      :selected="project.id === selectedId"
      @click="$emit('select', project.id)"
    />
  </ul>
</template>
