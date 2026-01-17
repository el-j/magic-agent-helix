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

    // Python frameworks
    django: 'framework-django',
    flask: 'framework-flask',
    fastapi: 'framework-fastapi',

    // Go frameworks
    'github.com/gin-gonic/gin': 'framework-gin',
    'github.com/gofiber/fiber': 'framework-fiber',

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
    pytest: 'test-pytest',

    // State
    rxjs: 'state-rxjs',
    pinia: 'state-pinia',
    redux: 'state-redux',
    zustand: 'state-zustand',
  },

  configFileTagMap: {
    // Detect key configs - removed language-specific entries, now handled by plugins
    'tailwind.config.js': 'style-tailwind',
    'tailwind.config.ts': 'style-tailwind',
    'vite.config.ts': 'build-vite',
    'vite.config.js': 'build-vite',
  },

  fileGlobTagMap: {
    // Detect file types - removed language-specific entries, now handled by plugins
  },

  tagTemplateMap: {
    // Vue Projects - templates now provided by plugins
    'framework-vue': [],
    'state-pinia': [],
    'style-primevue': [],
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

    // Generic - templates now provided by plugins
    'style-tailwind': [],
    'style-mui': [
      { template: 'generic/style-mui.md', suffix: 'mui.instructions.md' },
    ],
    'test-vitest': [],
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
    // Language-specific templates removed - now provided by language plugins
  },
};
