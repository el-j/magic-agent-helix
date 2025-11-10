<template>
  <div class="space-y-3">
    <div class="flex gap-2">
      <Button
        label="Download"
        icon="pi pi-download"
        size="small"
        @click="$emit('download', file)"
        class="bg-purple-500 hover:bg-purple-600 border-purple-500"
      />
      <Button
        label="Reset to Default"
        icon="pi pi-refresh"
        size="small"
        @click="$emit('reset', index)"
        class="bg-orange-500 hover:bg-orange-600 border-orange-500"
      />
    </div>
    <Textarea
      v-model="file.content"
      :auto-resize="true"
      rows="10"
      class="w-full bg-gray-900 text-gray-300 border-gray-600 font-mono text-sm"
      placeholder="Edit the instruction file content..."
    />
  </div>
</template>

<script setup lang="ts">


interface Props {
	file: { name: string; content: string };
	index: number;
}

interface Emits {
	download: [file: { name: string; content: string }];
	reset: [index: number];
}

defineProps<Props>();
defineEmits<Emits>();
</script>
