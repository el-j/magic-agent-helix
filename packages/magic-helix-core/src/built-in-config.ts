import type { MergedConfig } from './types';

/**
 * This is the "brain" of the tool.
 * It contains all the pre-configured rules for common frameworks and tools.
 * This configuration is used automatically, so the user doesn't have to
 * create a config file for basic projects.
 */
export const BUILT_IN_CONFIG: MergedConfig = {
  target: 'github-copilot',
  templateDirectory: 'ai_templates', // User's custom template dir
  outputDirectory: '.github/instructions', // Default output dir
  aiRefinement: {
    quality: 'standard',
    contextLevel: 'balanced',
    outputFormat: 'markdown',
    tokenBudget: 4000,
    includeExamples: true,
    includeBestPractices: true,
  },

  dependencyTagMap: {
    // Frameworks
    vue: 'framework-vue',
    react: 'framework-react',
    '@angular/core': 'framework-angular',
    '@nestjs/core': 'framework-nestjs',

    // Styling
    tailwindcss: 'style-tailwind',
    primevue: 'style-primevue',
    '@mui/material': 'style-mui',
    quasar: 'style-quasar',

    // Testing
    vitest: 'test-vitest',
    jest: 'test-jest',
    cypress: 'test-cypress',
    playwright: 'test-playwright',

    // State
    rxjs: 'state-rxjs',
    pinia: 'state-pinia',
    redux: 'state-redux',
    zustand: 'state-zustand',
  },

  configFileTagMap: {
    // Detect key configs
    'tailwind.config.js': 'style-tailwind',
    'tailwind.config.ts': 'style-tailwind',
    'vite.config.ts': 'build-vite',
    'vite.config.js': 'build-vite',
    'tsconfig.json': 'lang-typescript',
  },

  fileGlobTagMap: {
    // Detect file types
    'src/**/*.vue': 'framework-vue',
    'src/**/*.tsx': 'framework-react',
    'src/**/*.go': 'lang-go',
    'src/**/*.py': 'lang-python',
  },

  tagTemplateMap: {
    // Vue Projects
    'framework-vue': [
      { template: 'vue/vue-core.md', suffix: 'vue.instructions.md' },
    ],
    'state-pinia': [
      { template: 'vue/vue-pinia.md', suffix: 'vue-pinia.instructions.md' },
    ],
    'style-primevue': [
      {
        template: 'vue/style-primevue.md',
        suffix: 'vue-primevue.instructions.md',
      },
    ],
    'style-quasar': [
      { template: 'vue/style-quasar.md', suffix: 'vue-quasar.instructions.md' },
    ],

    // React Projects
    'framework-react': [
      { template: 'react/react-core.md', suffix: 'react.instructions.md' },
    ],
    'state-zustand': [
      {
        template: 'react/react-zustand.md',
        suffix: 'react-zustand.instructions.md',
      },
    ],

    // NestJS Projects
    'framework-nestjs': [
      { template: 'nestjs/nestjs-core.md', suffix: 'nestjs.instructions.md' },
    ],

    // Angular Projects
    'framework-angular': [
      {
        template: 'angular/angular-core.md',
        suffix: 'angular.instructions.md',
      },
    ],

    // Generic
    'style-tailwind': [
      {
        template: 'generic/style-tailwind.md',
        suffix: 'tailwind.instructions.md',
      },
    ],
    'style-mui': [
      { template: 'generic/style-mui.md', suffix: 'mui.instructions.md' },
    ],
    'test-vitest': [
      { template: 'generic/test-vitest.md', suffix: 'vitest.instructions.md' },
    ],
    'test-jest': [
      { template: 'generic/test-jest.md', suffix: 'jest.instructions.md' },
    ],
    'test-cypress': [
      {
        template: 'generic/test-cypress.md',
        suffix: 'cypress.instructions.md',
      },
    ],
    'test-playwright': [
      {
        template: 'generic/test-playwright.md',
        suffix: 'playwright.instructions.md',
      },
    ],
    'lang-typescript': [
      {
        template: 'generic/lang-typescript.md',
        suffix: 'typescript.instructions.md',
      },
    ],
    'lang-python': [
      { template: 'python/lang-python.md', suffix: 'python.instructions.md' },
    ],
    'lang-go': [{ template: 'go/lang-go.md', suffix: 'go.instructions.md' }],
    'state-rxjs': [
      { template: 'generic/state-rxjs.md', suffix: 'rxjs.instructions.md' },
    ],
    'state-redux': [
      { template: 'generic/state-redux.md', suffix: 'redux.instructions.md' },
    ],
  },
};
