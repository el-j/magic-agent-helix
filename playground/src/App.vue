<template>
  <div class="min-h-screen bg-gray-900">
    <!-- Hero Section -->
    <HeroSection />

    <!-- Features Section -->
    <FeaturesSection />

    <!-- Languages Section -->
    <LanguagesSection />

    <!-- Live Demo Section -->
    <div id="live-demo" class="demo-section">
      <div class="max-w-6xl mx-auto px-4 md:px-8 py-16">
        <div class="section-header">
          <span class="section-badge">Try It Now</span>
          <h2 class="section-title">Live Demo</h2>
          <p class="section-description">
            Upload your project or paste a GitHub URL to see MagicAgentHelix in action. 
            Analyze languages, detect frameworks, and generate instruction files instantly.
          </p>
        </div>

        <!-- Load Options -->
        <div class="demo-card">
          <h3 class="demo-card-title">Load Project</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Local Folder -->
          <div class="space-y-2">
            <label class="text-sm text-gray-400">From Local Folder</label>
            <Button
              label="Select Project Folder"
              icon="pi pi-folder-open"
              @click="_handleSelectProject"
              :loading="isLoading"
              class="w-full bg-green-500 hover:bg-green-600 border-green-500"
            />
          </div>

          <!-- Git URL -->
          <div class="space-y-2">
            <label class="text-sm text-gray-400">From GitHub/GitLab URL</label>
            <div class="flex gap-2">
              <InputText
                v-model="gitUrl"
                placeholder="https://github.com/owner/repo"
                class="flex-1"
                :disabled="isLoading"
              />
              <Button
                icon="pi pi-download"
                @click="_handleLoadFromGit"
                :loading="isLoadingGit"
                :disabled="!gitUrl || isLoading"
                class="bg-blue-500 hover:bg-blue-600 border-blue-500"
              />
            </div>
            </div>
          </div>
        </div>

        <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
        <Message v-if="errorGit" severity="error" :closable="false">{{ errorGit }}</Message>

        <div v-if="analysisResult" class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">

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
                @click="_handleDownloadZip"
                class="bg-blue-500 hover:bg-blue-600 border-blue-500"
                :disabled="!generatedFiles.length"
              />
              <Button
                label="Download Individual Files"
                icon="pi pi-file"
                @click="_handleDownloadAll"
                class="bg-green-500 hover:bg-green-600 border-green-500"
                :disabled="!generatedFiles.length"
              />
            </div>
            <Accordion value="0">
              <AccordionPanel v-for="(file, index) in generatedFiles" :key="index" :value="String(index)">
                <AccordionHeader>{{ file.name }}</AccordionHeader>
                <AccordionContent>
                  <InstructionFileEditor
                    :file="file"
                    :index="index"
                    @download="_handleDownloadFile"
                    @reset="_handleResetFile"
                  />
                </AccordionContent>
              </AccordionPanel>
            </Accordion>
            <div v-if="!generatedFiles.length" class="p-4 text-center text-gray-400">
              No instruction files were generated.
            </div>
          </Panel>
        </div>

        <div v-if="isAnyLoading" class="flex flex-col items-center justify-center p-16 bg-gray-800 rounded-lg shadow-lg mt-8">
          <ProgressSpinner strokeWidth="4" class="w-16 h-16 text-green-500" />
          <p class="mt-4 text-xl text-gray-300">{{ currentlyProcessing || 'Loading...' }}</p>
        </div>
      </div>
    </div>

    <!-- Download Section -->
    <DownloadSection />

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-links">
          <a href="https://github.com/el-j/magic-agent-helix" target="_blank">
            <i class="pi pi-github"></i> GitHub
          </a>
          <a href="https://www.npmjs.com/package/@el-j/magic-agent-helix" target="_blank">
            <i class="pi pi-box"></i> NPM
          </a>
          <a href="https://github.com/el-j/magic-agent-helix/blob/main/README.md" target="_blank">
            <i class="pi pi-book"></i> Docs
          </a>
        </div>
        <p class="footer-text">
          Built with ❤️ by el-j • Open Source MIT License • © 2025
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">

import { ref, watch } from "vue";
import HeroSection from "./components/HeroSection.vue";
import FeaturesSection from "./components/FeaturesSection.vue";
import LanguagesSection from "./components/LanguagesSection.vue";
import DownloadSection from "./components/DownloadSection.vue";
import InstructionFileEditor from "./components/InstructionFileEditor.vue";
import ProjectInfoCard from "./components/ProjectInfoCard.vue";
import { useFileManagement } from "./composables/useFileManagement";
import { useGitLoader } from "./composables/useGitLoader";
// Composables
import { useProjectAnalysis } from "./composables/useProjectAnalysis";

// Use composables
const { isLoading, error, currentFile, analysisResult, selectProject } =
	useProjectAnalysis();

const {
	isLoading: isLoadingGit,
	error: errorGit,
	currentFile: currentFileGit,
	analysisResult: analysisResultGit,
	loadFromGitUrl,
} = useGitLoader();

const gitUrl = ref("");

const {
	generatedFiles,
	hasFiles,
	generateFiles,
	downloadSingleFile,
	downloadAllFiles,
	downloadAsZipArchive,
	resetFileContent,
} = useFileManagement();

// Watch for analysis result changes and generate files (from local)
watch(analysisResult, (newResult) => {
	if (newResult) {
		generateFiles(newResult.name, newResult.tags);
	}
});

// Watch for analysis result changes and generate files (from git)
watch(analysisResultGit, (newResult) => {
	if (newResult) {
		analysisResult.value = newResult; // Merge to main result
		generateFiles(newResult.name, newResult.tags);
	}
});

// Merge loading states and current file
const isAnyLoading = ref(false);
const currentlyProcessing = ref("");
watch([isLoading, isLoadingGit, currentFile, currentFileGit], () => {
	isAnyLoading.value = isLoading.value || isLoadingGit.value;
	currentlyProcessing.value = currentFile.value || currentFileGit.value;
});

// Event handlers
const _handleSelectProject = async () => {
	await selectProject();
};

const _handleLoadFromGit = async () => {
	if (gitUrl.value) {
		await loadFromGitUrl(gitUrl.value);
	}
};

const _handleDownloadFile = (file: { name: string; content: string }) => {
	downloadSingleFile(file);
};

const _handleDownloadAll = () => {
	downloadAllFiles();
};

const _handleDownloadZip = () => {
	downloadAsZipArchive();
};

const _handleResetFile = (index: number) => {
	if (analysisResult.value) {
		resetFileContent(
			index,
			analysisResult.value.name,
			analysisResult.value.tags,
		);
	}
};
</script>

<style scoped>
.demo-section {
  background: linear-gradient(180deg, rgba(31, 41, 55, 0.5) 0%, transparent 100%);
  border-top: 1px solid rgb(55, 65, 81);
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: rgba(249, 115, 22, 0.1);
  border: 1px solid rgba(249, 115, 22, 0.2);
  border-radius: 9999px;
  color: rgb(251, 146, 60);
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
}

.section-title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  color: white;
  margin-bottom: 1.5rem;
}

.section-description {
  font-size: 1.25rem;
  color: rgb(156, 163, 175);
  max-width: 48rem;
  margin: 0 auto;
  line-height: 1.8;
}

.demo-card {
  background: rgba(31, 41, 55, 0.6);
  border: 2px solid rgb(55, 65, 81);
  border-radius: 1rem;
  padding: 2rem;
  backdrop-filter: blur(8px);
  margin-bottom: 1.5rem;
}

.demo-card-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1.5rem;
}

.footer {
  background: rgba(17, 24, 39, 0.8);
  border-top: 1px solid rgb(55, 65, 81);
  padding: 3rem 2rem;
  margin-top: 4rem;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  text-align: center;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.footer-links a {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgb(156, 163, 175);
  text-decoration: none;
  transition: color 0.3s ease;
  font-size: 1.125rem;
}

.footer-links a:hover {
  color: rgb(96, 165, 250);
}

.footer-text {
  color: rgb(107, 114, 128);
  font-size: 0.875rem;
}
</style>
