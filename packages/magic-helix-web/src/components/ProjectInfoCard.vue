<template>
  <Card class="bg-gray-800 shadow-lg">
    <template #title>
      <span class="text-gray-100">Project: {{ projectName }}</span>
    </template>
    <template #subtitle>
      <span class="text-gray-400">{{ projectPath }}</span>
    </template>
    <template #content>
      <p class="text-lg font-semibold mb-3 text-gray-200">Detected Tags:</p>
      <div v-if="tags.length" class="flex flex-wrap gap-2">
        <Tag v-for="tag in tags" :key="tag" :value="tag" severity="success" class="bg-green-600 text-white"></Tag>
      </div>
      <p v-else class="text-gray-400">No matching tags found.</p>
    </template>
  </Card>
</template>

<script setup lang="ts">
import Card from "primevue/card";
import Tag from "primevue/tag";

interface Props {
	projectName: string;
	projectPath: string;
	tags: string[];
}

defineProps<Props>();
</script>