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
          @click="selectProject"
          :loading="isLoading"
          class="bg-green-500 hover:bg-green-600 border-green-500"
        />
      </header>

      <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>

      <div v-if="analysisResult" class="grid grid-cols-1 md:grid-cols-3 gap-6">

        <!-- Column 1: Project Info & Tags -->
        <div class="md:col-span-1">
          <Card class="bg-gray-800 shadow-lg">
            <template #title>
              <span class="text-gray-100">Project: {{ analysisResult.name }}</span>
            </template>
            <template #subtitle>
              <span class="text-gray-400">{{ analysisResult.path }}</span>
            </template>
            <template #content>
              <p class="text-lg font-semibold mb-3 text-gray-200">Detected Tags:</p>
              <div v-if="analysisResult.tags.length" class="flex flex-wrap gap-2">
                <Tag v-for="tag in analysisResult.tags" :key="tag" :value="tag" severity="success" class="bg-green-600 text-white"></Tag>
              </div>
              <p v-else class="text-gray-400">No matching tags found.</p>
            </template>
          </Card>
        </div>

        <!-- Column 2: Generated Files -->
        <div class="md:col-span-2">
          <Panel header="Generated Instruction Files" class="bg-gray-800 shadow-lg" :toggleable="true">
            <Accordion :activeIndex="0">
              <AccordionTab v-for="(file, index) in generatedFiles" :key="index" :header="file.name">
                <div class="bg-gray-900 p-4 rounded-md">
                  <pre class="whitespace-pre-wrap text-sm text-gray-300">{{ file.content }}</pre>
                </div>
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
import { ref } from 'vue';
import {
  analyzeProjectTags,
  mergeConfigs,
  BUILT_IN_CONFIG,
  Config,
  ProjectAnalysisData,
  TagTemplateMap
} from 'magic-helix-core';

// PrimeVue Components (local registration)
import Button from 'primevue/button';
import Card from 'primevue/card';
import Tag from 'primevue/tag';
import Message from 'primevue/message';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import ProgressSpinner from 'primevue/progressspinner';
import Panel from 'primevue/panel';

// --- State ---
const isLoading = ref(false);
const error = ref<string | null>(null);
const currentFile = ref<string>('');
const analysisResult = ref<{ name: string, path: string, tags: string[] } | null>(null);
const generatedFiles = ref<{ name: string, content: string }[]>([]);

// --- Mock Templates ---
// In a real browser app, we can't read the .md files from the core package.
// We'd have to either fetch them from a URL or, for this demo, just mock them.
const mockTemplates: Record<string, string> = {
  'vue/vue-core.md': '# Vue Core Rules\n- Use Composition API.\n- Use <script setup>.',
  'vue/vue-pinia.md': '# Pinia Rules\n- Use setup stores.',
  'vue/style-primevue.md': '# PrimeVue Rules\n- Use PassThrough (PT) for styling.',
  'react/react-core.md': '# React Core Rules\n- Use Functional Components and Hooks.',
  'react/react-zustand.md': '# Zustand Rules\n- Define actions in the store.',
  'nestjs/nestjs-core.md': '# NestJS Rules\n- Use Module > Controller > Service.',
  'generic/style-tailwind.md': '# Tailwind Rules\n- Use utility classes.',
  'generic/test-vitest.md': '# Vitest Rules\n- Use `vi.mock()` for dependencies.',
  'generic/lang-typescript.md': '# TypeScript Rules\n- Avoid `any`.',
  'generic/state-rxjs.md': '# RxJS Rules\n- Suffix observables with `$`.'
};

/**
 * Main function to select and scan a project folder.
 */
async function selectProject() {
  // @ts-ignore: File System Access API may not be in all TS libs
  if (!window.showDirectoryPicker) {
    error.value = 'File System Access API is not supported in this browser. Please use a modern browser like Chrome or Edge.';
    return;
  }

  isLoading.value = true;
  error.value = null;
  analysisResult.value = null;
  generatedFiles.value = [];

  try {
    // 1. Get Directory Handle
    // @ts-ignore
    const dirHandle = await window.showDirectoryPicker();

    // 2. Scan Files and build Analysis Data (in-browser)
    const { analysisData, projectName } = await scanDirectory(dirHandle);

    // 3. Load & Merge Config (pure logic)
    // For this demo, we're not loading a user config, just using the built-in one.
    const config = mergeConfigs({}); // Pass empty user config
    const { dependencyTagMap, configFileTagMap, fileGlobTagMap, tagTemplateMap } = config;

    // 4. Run Analysis (pure logic)
    const tags = analyzeProjectTags(
      analysisData,
      dependencyTagMap,
      configFileTagMap,
      fileGlobTagMap
    );

    // 5. Generate File Content (Mocked)
    const files: { name: string, content: string }[] = [];
    for (const tag of tags) {
      const templates = tagTemplateMap[tag as keyof TagTemplateMap];
      if (templates) {
        for (const t of templates) {
          const content = mockTemplates[t.template as keyof typeof mockTemplates] || `# Mock Content for ${t.template}`;
          const header = `---
# Auto-generated by magic-helix for: ${projectName}
# Source Template: ${t.template}
applyTo: "approximated/path/src/**/*"
---
`;
          files.push({
            name: `${projectName}.${t.suffix}`,
            content: header + '\n' + content,
          });
        }
      }
    }

    // 6. Set results
    analysisResult.value = { name: projectName, path: dirHandle.name, tags: Array.from(tags) };
    generatedFiles.value = files;

  } catch (err: any) {
    if (err.name === 'AbortError') {
      error.value = 'Folder selection was cancelled.';
    } else {
      error.value = `An error occurred: ${err.message}`;
      console.error(err);
    }
  } finally {
    isLoading.value = false;
    currentFile.value = '';
  }
}

/**
 * Recursively scans a directory handle and builds the ProjectAnalysisData.
 */
async function scanDirectory(dirHandle: any): Promise<{ analysisData: ProjectAnalysisData, projectName: string }> {
  let dependencies = {};
  const configFiles: string[] = [];
  const projectFiles: string[] = [];
  let projectName = dirHandle.name.replace(/@/g, '').replace(/\//g, '-');

  // Helper function to scan
  async function recursiveScan(handle: any, currentPath: string) {
    for await (const entry of handle.values()) {
      const entryPath = currentPath ? `${currentPath}/${entry.name}` : entry.name;
      currentFile.value = entryPath; // Update loading message

      if (entry.kind === 'file') {
        projectFiles.push(entryPath);

        // Check for package.json at root
        if (entryPath === 'package.json') {
          try {
            const file = await entry.getFile();
            const text = await file.text();
            const pkg = JSON.parse(text);
            projectName = (pkg.name || projectName).replace(/@/g, '').replace(/\//g, '-');
            dependencies = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
          } catch (e) {
            console.warn('Could not parse package.json', e);
          }
        }

        // Check for config files at root
        if (currentPath === '') {
           if (entry.name.endsWith('.config.js') || entry.name.endsWith('.config.ts') || entry.name === 'tsconfig.json') {
             configFiles.push(entry.name);
           }
        }

      } else if (entry.kind === 'directory') {
        // Don't scan node_modules, dist, .git, etc.
        if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== '.git' && entry.name !== '.vscode') {
          await recursiveScan(entry, entryPath);
        }
      }
    }
  }

  await recursiveScan(dirHandle, '');

  return {
    analysisData: { dependencies, configFiles, projectFiles },
    projectName
  };
}
</script>

<style>
/* Basic styles for index.css if you don't have one */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Ensure PrimeVue components are clickable */
[data-pc-section="header"] {
  cursor: pointer;
}
</style>