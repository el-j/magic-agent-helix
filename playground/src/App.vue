<template>
  <div class="min-h-screen bg-gray-900 p-4 md:p-8">
    <div class="max-w-6xl mx-auto">
      <header class="flex items-center justify-between mb-8">
        <h1 class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
          ✨ MagicAgentHelix Playground
        </h1>
        <Button
          label="Select Project Folder"
          icon="pi pi-folder-open"
          @click="handleSelectProject"
          :loading="isLoading"
          class="bg-green-500 hover:bg-green-600 border-green-500"
        />
      </header>

      <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>

      <div v-if="analysisResult" class="grid grid-cols-1 md:grid-cols-3 gap-6">

        <!-- Column 1: Project Info & Tags -->
        <div class="md:col-span-1">
          <ProjectInfoCard
            :project-name="analysisResult.name"
            :project-path="analysisResult.path"
            :tags="analysisResult.tags"
          />
        </div>

        <!-- Column 2: Generated Files -->
        <div class="md:col-span-2">
          <Panel header="Generated Instruction Files" class="bg-gray-800 shadow-lg" :toggleable="true">
            <div class="mb-4 flex gap-2">
              <Button
                label="Download All as ZIP"
                icon="pi pi-download"
                @click="handleDownloadZip"
                class="bg-blue-500 hover:bg-blue-600 border-blue-500"
                :disabled="!generatedFiles.length"
              />
              <Button
                label="Download Individual Files"
                icon="pi pi-file"
                @click="handleDownloadAll"
                class="bg-green-500 hover:bg-green-600 border-green-500"
                :disabled="!generatedFiles.length"
              />
            </div>
            <Accordion :activeIndex="0">
              <AccordionTab v-for="(file, index) in generatedFiles" :key="index" :header="file.name">
                <InstructionFileEditor
                  :file="file"
                  :index="index"
                  @download="handleDownloadFile"
                  @reset="handleResetFile"
                />
              </AccordionTab>
            </Accordion>
            <div v-if="!generatedFiles.length" class="p-4 text-center text-gray-400">
              No instruction files were generated.
            </div>
          </Panel>
        </div>

      </div>

      <div v-if="isLoading" class="flex flex-col items-center justify-center p-16 bg-gray-800 rounded-lg shadow-lg mt-8">
        <ProgressSpinner strokeWidth="4" class="w-16 h-16 text-green-500" />
        <p class="mt-4 text-xl text-gray-300">Scanning project: {{ currentFile }}...</p>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

// Composables
import { useProjectAnalysis } from "./composables/useProjectAnalysis";
import { useFileManagement } from "./composables/useFileManagement";

// Components
import ProjectInfoCard from "./components/ProjectInfoCard.vue";
import InstructionFileEditor from "./components/InstructionFileEditor.vue";

// PrimeVue Components (local registration)
import Button from "primevue/button";
import Message from "primevue/message";
import ProgressSpinner from "primevue/progressspinner";
import Panel from "primevue/panel";

// Use composables
const { isLoading, error, currentFile, analysisResult, selectProject } =
	useProjectAnalysis();

const {
	generatedFiles,
	hasFiles,
	generateFiles,
	downloadSingleFile,
	downloadAllFiles,
	downloadAsZipArchive,
	resetFileContent,
} = useFileManagement();

// Watch for analysis result changes and generate files
watch(analysisResult, (newResult) => {
	if (newResult) {
		generateFiles(newResult.name, newResult.tags);
	}
});

// Event handlers
const handleSelectProject = async () => {
	await selectProject();
};

const handleDownloadFile = (file: { name: string; content: string }) => {
	downloadSingleFile(file);
};

const handleDownloadAll = () => {
	downloadAllFiles();
};

const handleDownloadZip = () => {
	downloadAsZipArchive();
};

const handleResetFile = (index: number) => {
	if (analysisResult.value) {
		resetFileContent(
			index,
			analysisResult.value.name,
			analysisResult.value.tags,
		);
	}
};
</script>
