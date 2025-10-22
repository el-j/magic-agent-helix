MagicAgentHelix - All Project Files (Monorepo)This file contains the complete source code for the magic-agent-helix monorepo.The monorepo contains four packages:/packages/magic-helix-core: The pure logic engine (the "brain")./packages/magic-agent-helix: The Node.js CLI tool (the "body")./packages/vscode-magic-helix: The VS Code extension wrapper (the "interface")./packages/magic-helix-web: A Vue.js web playground (the "demo").File Path: /file-list.md (For your reference)# MagicAgentHelix - Project File List

Here is the complete file structure for the monorepo.

## Root Directory (`/`)

* `.biome.json`
* `.gitignore`
* `.releaserc.json`
* `package.json` (Monorepo Root)
* `README.md` (Monorepo Root)
* `tsconfig.base.json`
* `vitest.config.ts`

## `.github/` Directory

* **`.github/workflows/`**
    * `.github/workflows/release.yml`
    * `.github/workflows/deploy-web.yml` (NEW - Deploys playground)

## `.vscode/` Directory (For Dev Mode)

* `.vscode/launch.json`

## `packages/` Directory

### Core Logic (`packages/magic-helix-core/`)

* `packages/magic-helix-core/package.json`
* `packages/magic-helix-core/README.md`
* `packages/magic-helix-core/tsconfig.json`
* `packages/magic-helix-core/scripts/copy-templates.js`
* **`packages/magic-helix-core/src/`**
    * `packages/magic-helix-core/src/index.ts`
    * `packages/magic-helix-core/src/types.ts`
    * `packages/magic-helix-core/src/built-in-config.ts`
    * `packages/magic-helix-core/src/config-merger.ts`
    * `packages/magic-helix-core/src/config-merger.test.ts`
    * `packages/magic-helix-core/src/analysis.ts`
    * `packages/magic-helix-core/src/analysis.test.ts`
    * **`packages/magic-helix-core/src/default_templates/`**
        * (All 10 template .md files)

### CLI Package (`packages/magic-agent-helix/`)

* `packages/magic-agent-helix/package.json`
* `packages/magic-agent-helix/README.md`
* `packages/magic-agent-helix/tsconfig.json`
* **`packages/magic-agent-helix/src/`**
    * `packages/magic-agent-helix/src/cli.ts`
    * **`packages/magic-agent-helix/src/commands/`**
        * `packages/magic-agent-helix/src/commands/init.ts`
        * `packages/magic-agent-helix/src/commands/run.ts`
    * **`packages/magic-agent-helix/src/utils/`**
        * `packages/magic-agent-helix/src/utils/config-loader.ts`
        * `packages/magic-agent-helix/src/utils/config-loader.test.ts`
        * `packages/magic-agent-helix/src/utils/file-system.ts`
        * `packages/magic-agent-helix/src/utils/file-system.test.ts`

### VS Code Plugin (`packages/vscode-magic-helix/`)

* `packages/vscode-magic-helix/package.json`
* `packages/vscode-magic-helix/README.md`
* `packages/vscode-magic-helix/tsconfig.json`
* `packages/vscode-magic-helix/.vscodeignore`
* **`packages/vscode-magic-helix/src/`**
    * `packages/vscode-magic-helix/src/extension.ts`
    * **`packages/vscode-magic-helix/src/test/`**
        * `packages/vscode-magic-helix/src/test/runTest.ts`
        * `packages/vscode-magic-helix/src/test/suite/`
            * `packages/vscode-magic-helix/src/test/suite/extension.test.ts`
            * `packages/vscode-magic-helix/src/test/suite/index.ts`

### Web Playground (`packages/magic-helix-web/`) (NEW)

* `packages/magic-helix-web/package.json`
* `packages/magic-helix-web/README.md`
* `packages/magic-helix-web/tsconfig.json`
* `packages/magic-helix-web/vite.config.ts`
* `packages/magic-helix-web/tailwind.config.js`
* `packages/magic-helix-web/postcss.config.js`
* `packages/magic-helix-web/index.html`
* **`packages/magic-helix-web/src/`**
    * `packages/magic-helix-web/src/main.ts`
    * `packages/magic-helix-web/src/App.vue`
    * `packages/magic-helix-web/src/primevue-config.ts`
    * `packages/magic-helix-web/src/shims-vue.d.ts`
File Path: /.gitignore# Dependencies
/node_modules
/packages/**/node_modules

# Build output
/packages/**/dist

# Release binaries
/packages/magic-agent-helix/release

# Web App Build
/packages/magic-helix-web/dist

# IDE
.vscode/
# Note: Don't ignore .vscode/launch.json
!.vscode/launch.json

.idea

# OS
.DS_Store
Thumbs.db

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Biome
.biome/

# Testing
/coverage/
.vscode-test/
storage/

# Semantic Release
.semantic-release-cache/
File Path: /package.json (Monorepo Root){
  "name": "magic-agent-helix-monorepo",
  "version": "0.1.0",
  "private": true,
  "description": "Monorepo for MagicAgentHelix CLI, VS Code Extension, and Web Playground",
  "workspaces": [
    "packages/*"
  ],
  "engines": {
    "node": "^20.11.1 || >=22.0.0"
  },
  "scripts": {
    "build": "npm run build --workspaces",
    "build:core": "npm run build --workspace=magic-helix-core",
    "build:cli": "npm run build --workspace=magic-agent-helix",
    "build:vscode": "npm run build --workspace=vscode-magic-helix",
    "build:web": "npm run build --workspace=magic-helix-web",
    "dev:web": "npm run dev --workspace=magic-helix-web",
    "lint": "biome lint .",
    "format": "biome format --write .",
    "test": "vitest run",
    "test:vscode": "npm run test --workspace=vscode-magic-helix",
    "test:all": "npm run test && npm run test:vscode",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "semantic-release": "semantic-release"
  },
  "keywords": [
    "magic-agent-helix",
    "copilot",
    "ai"
  ],
  "author": "Your Name / Community",
  "license": "MIT",
  "devDependencies": {
    "@biomejs/biome": "^2.2.7",
    "@semantic-release/changelog": "^6.0.3",
    "@semantic-release/exec": "^6.0.3",
    "@semantic-release/github": "^10.1.3",
    "@semantic-release/npm": "^12.0.1",
    "@types/mocha": "^10.0.7",
    "@types/node": "^20.11.0",
    "@types/vscode": "^1.85.0",
    "@vitejs/plugin-vue": "^5.1.0",
    "@vitest/coverage-v8": "^2.0.4",
    "@vscode/test-cli": "^0.0.9",
    "conventional-changelog-conventionalcommits": "^8.0.0",
    "mocha": "^10.7.0",
    "pkg": "^5.8.1",
    "semantic-release": "^24.0.0",
    "tailwindcss": "^3.4.7",
    "typescript": "^5.5.4",
    "vite": "^5.3.5",
    "vitest": "^2.0.4",
    "vue": "^3.4.34",
    "vue-tsc": "^2.0.29"
  }
}
File Path: /.releaserc.json(Content Unchanged - Still correctly publishes core and cli)File Path: /.github/workflows/release.ymlname: Release & Publish

on:
  push:
    branches:
      - main
      - development
      - 'feature/*'

jobs:
  release:
    name: Test, Build & Release
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          persist-credentials: false

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Lint Check
        run: npm run lint

      - name: Run Core & CLI Tests (Vitest)
        run: npm run test:coverage

      - name: Run VS Code Extension Tests
        run: npm run test:vscode

      - name: Build All Packages
        run: npm run build

      - name: Semantic Release
        run: npx semantic-release
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
          GH_TOKEN: ${{ secrets.GH_TOKEN }}
File Path: /.github/workflows/deploy-web.yml (NEW)name: Deploy Web Playground to GitHub Pages

on:
  # Runs on pushes targeting the main branch
  push:
    branches:
      - main

# Allow one concurrent deployment
concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  deploy:
    name: Build and Deploy
    runs-on: ubuntu-latest
    
    # Grant GITHUB_TOKEN permissions to deploy to GitHub Pages
    permissions:
      contents: read
      pages: write
      id-token: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Build Web Playground
        # Use --base=./ for correct relative paths on GitHub Pages
        run: npm run build --workspace=magic-helix-web

      - name: Setup GitHub Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          # Upload the built web app
          path: 'packages/magic-helix-web/dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
File Path: /.biome.json(Content Unchanged)File Path: /vitest.config.tsimport { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Look for tests in core and cli packages
    include: [
      'packages/magic-helix-core/src/**/*.test.ts',
      'packages/magic-agent-helix/src/**/*.test.ts',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      // Target only the core logic and cli utils for coverage
      include: [
        'packages/magic-helix-core/src/**/*.ts',
        'packages/magic-agent-helix/src/utils/**/*.ts',
      ],
      exclude: [
        'packages/vscode-magic-helix/**',
        'packages/magic-helix-web/**',
      ],
    },
    globals: true,
  },
});
File Path: /tsconfig.base.json{
  "compilerOptions": {
    "module": "commonjs",
    "target": "es2020",
    "lib": [
      "es2020",
      "DOM",
      "DOM.Iterable"
    ],
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "composite": true,
    "declaration": true,
    "sourceMap": true
  }
}
File Path: /README.md (Monorepo Root)# ✨ MagicAgentHelix Monorepo ✨

This is the main monorepo for the `magic-agent-helix` project, containing:

* `packages/magic-helix-core`: The pure logic engine (the "brain").
* `packages/magic-agent-helix`: The core CLI tool (the "body").
* `packages/vscode-magic-helix`: The VS Code extension (the "interface").
* `packages/magic-helix-web`: A live web playground and demo (the "demo").

## Live Playground

**You can try MagicAgentHelix live in your browser!**

Visit our GitHub Pages playground: **[https://YOUR_USERNAME.github.io/magic-agent-helix/](https://YOUR_USERNAME.github.io/magic-agent-helix/)**
*(Note: You'll need to update this link after your first deployment)*

## Development

This is a monorepo using NPM workspaces.

1.  **Install:**
    ```bash
    npm install
    ```
2.  **Build All Packages:**
    ```bash
    npm run build
    ```
3.  **Run All Tests (from root):**
    ```bash
    # Run the core logic & CLI unit tests
    npm run test
    
    # Run the VS Code integration tests
    npm run test:vscode
    
    # Run everything
    npm run test:all
    ```
4.  **Run the Web Playground Locally:**
    ```bash
    npm run dev:web
    ```

### Testing the VS Code Plugin (Dev Mode)

This is the best way to test the CLI in a real-world scenario.

1.  Open this monorepo root folder in VS Code.
2.  Make sure you've run `npm install` and `npm run build` at least once.
3.  Go to the "Run and Debug" panel (Ctrl+Shift+D).
4.  Select **"Run VS Code Extension (Dev Mode)"** from the dropdown and press F5 (the green play button).
5.  A new VS Code window will open. Open any test project in this *new* window.
6.  Open the Command Palette (Ctrl+Shift+P) and type: **"MagicAgentHelix: Align Conventions"**.
7.  Press Enter. The plugin will run your local CLI code against the test project.
File Path: /.vscode/launch.json(Content Unchanged)File Path: /packages/magic-helix-core/package.json(Content Unchanged - version: "0.1.0")File Path: /packages/magic-helix-core/README.md(Content Unchanged)File Path: /packages/magic-helix-core/tsconfig.json(Content Unchanged)File Path: /packages/magic-helix-core/scripts/copy-templates.js(Content Unchanged)File Path: /packages/magic-helix-core/src/index.ts(Content Unchanged)File Path: /packages/magic-helix-core/src/types.ts(Content Unchanged)File Path: /packages/magic-helix-core/src/built-in-config.ts(Content Unchanged)File Path: /packages/magic-helix-core/src/config-merger.ts(Content Unchanged)File Path: /packages/magic-helix-core/src/config-merger.test.ts(Content Unchanged)File Path: /packages/magic-helix-core/src/analysis.ts(Content Unchanged)File Path: /packages/magic-helix-core/src/analysis.test.ts(Content Unchanged)File Path: /packages/magic-helix-core/src/default_templates/... (All 10 .md files)(Content Unchanged)File Path: /packages/magic-agent-helix/package.json{
  "name": "magic-agent-helix",
  "version": "0.1.0",
  "description": "A CLI to inspect a project and generate granular, path-specific AI instructions for agents like GitHub Copilot.",
  "engines": {
    "node": "^20.11.1 || >=22.0.0"
  },
  "bin": {
    "magic-helix": "./dist/cli.js"
  },
  "scripts": {
    "build": "tsc --build",
    "build:pkg": "pkg ."
  },
  "keywords": [
    "magic-agent-helix",
    "copilot",
    "github-copilot",
    "ai"
  ],
  "author": "Your Name / Community",
  "license": "MIT",
  "publishConfig": {
    "access": "public"
  },
  "pkg": {
    "scripts": "dist/cli.js",
    "assets": [
      "../../node_modules/magic-helix-core/dist/default_templates/**/*"
    ],
    "targets": [
      "node20-linux-x64",
      "node20-macos-x64",
      "node20-win-x64"
    ],
    "outputPath": "release"
  },
  "dependencies": {
    "commander": "^12.1.0",
    "glob": "^11.0.3",
    "gradient-string": "^3.0.0",
    "inquirer": "^10.1.2",
    "magic-helix-core": "workspace:^0.1.0",
    "ora": "^9.0.0",
    "piccolors": "^1.0.1"
  },
  "files": [
    "dist/**/*",
    "README.md",
    "CHANGELOG.md"
  ]
}
File Path: /packages/magic-agent-helix/tsconfig.json(Content Unchanged)File Path: /packages/magic-agent-helix/README.md(Content Unchanged)File Path: /packages/magic-agent-helix/src/cli.ts(Content Unchanged)File Path: /packages/magic-agent-helix/src/commands/init.ts(Content Unchanged)File Path: /packages/magic-agent-helix/src/commands/run.ts(Content Unchanged)File Path: /packages/magic-agent-helix/src/utils/config-loader.ts(Content Unchanged)File Path: /packages/magic-agent-helix/src/utils/config-loader.test.ts(Content Unchanged)File Path: /packages/magic-agent-helix/src/utils/file-system.ts(Content Unchanged)File Path: /packages/magic-agent-helix/src/utils/file-system.test.ts(Content Unchanged)File Path: /packages/vscode-magic-helix/package.json{
  "name": "vscode-magic-helix",
  "displayName": "MagicAgentHelix Runner",
  "description": "Runs the MagicAgentHelix CLI from the VS Code Command Palette.",
  "version": "0.1.0",
  "publisher": "YOUR_PUBLISHER_NAME",
  "repository": {
    "type": "git",
    "url": "[https://github.com/YOUR_USERNAME/magic-agent-helix.git](https://github.com/YOUR_USERNAME/magic-agent-helix.git)"
  },
  "engines": {
    "vscode": "^1.85.0"
  },
  "categories": [
    "Other"
  ],
  "activationEvents": [
    "onCommand:magic-helix.run"
  ],
  "main": "./dist/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "magic-helix.run",
        "title": "MagicAgentHelix: Align Conventions"
      }
    ]
  },
  "scripts": {
    "build": "tsc --build",
    "test": "vscode-test-cli run-tests dist/test/suite/index.js"
  },
  "dependencies": {
    "magic-agent-helix": "workspace:^0.1.0"
  }
}
File Path: /packages/vscode-magic-helix/tsconfig.json(Content Unchanged)File Path: /packages/vscode-magic-helix/README.md(Content Unchanged)File Path: /packages/vscode-magic-helix/.vscodeignore(Content Unchanged)File Path: /packages/vscode-magic-helix/src/extension.ts(Content Unchanged)File Path: /packages/vscode-magic-helix/src/test/runTest.ts(Content Unchanged)File Path: /packages/vscode-magic-helix/src/test/suite/index.ts(Content Unchanged)File Path: /packages/vscode-magic-helix/src/test/suite/extension.test.ts(Content Unchanged)File Path: /packages/magic-helix-web/package.json (NEW){
  "name": "magic-helix-web",
  "version": "0.1.0",
  "private": true,
  "description": "A web-based playground for the MagicAgentHelix core engine.",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "magic-helix-core": "workspace:^0.1.0",
    "primevue": "^4.0.0",
    "vue": "^3.4.34"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.1.0",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.39",
    "tailwindcss": "^3.4.7",
    "typescript": "^5.5.4",
    "vite": "^5.3.5",
    "vue-tsc": "^2.0.29"
  }
}
File Path: /packages/magic-helix-web/README.md (NEW)# ✨ MagicAgentHelix (Web Playground) ✨

This package is a Vue 3 + Vite + PrimeVue application that acts as a live playground for the `magic-helix-core` engine.

It runs entirely in the browser using the File System Access API.

## Development

From the monorepo root, run:

```bash
npm run dev:web

---
---

# File Path: /packages/magic-helix-web/tsconfig.json (NEW)

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "module": "ESNext",
    "moduleResolution": "Node",
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "lib": [
      "ESNext",
      "DOM",
      "DOM.Iterable"
    ],
    "types": [
      "vite/client"
    ]
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.d.ts",
    "src/**/*.tsx",
    "src/**/*.vue"
  ],
  "references": [
    {
      "path": "../magic-helix-core"
    }
  ]
}
File Path: /packages/magic-helix-web/vite.config.ts (NEW)import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// [https://vitejs.dev/config/](https://vitejs.dev/config/)
export default defineConfig({
  plugins: [vue()],
  // Base path for GitHub Pages deployment
  base: process.env.NODE_ENV === 'production' ? '/magic-agent-helix/' : '/',
  build: {
    // Relative to the root of the package
    outDir: 'dist',
  },
});
File Path: /packages/magic-helix-web/tailwind.config.js (NEW)/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
    // Path to PrimeVue components
    '../../node_modules/primevue/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
File Path: /packages/magic-helix-web/postcss.config.js (NEW)export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
File Path: /packages/magic-helix-web/index.html (NEW)<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MagicAgentHelix Playground</title>
  </head>
  <body class="bg-gray-900 text-gray-100 antialiased">
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
File Path: /packages/magic-helix-web/src/main.ts (NEW)import { createApp } from 'vue';
import App from './App.vue';
import PrimeVue from 'primevue/config';
import { primeVueConfig } from './primevue-config';

// Import base Tailwind styles
import './index.css';

const app = createApp(App);

app.use(PrimeVue, primeVueConfig);

app.mount('#app');
File Path: /packages/magic-helix-web/src/primevue-config.ts (NEW)import 'primevue/resources/themes/aura-dark-green/theme.css';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Chip from 'primevue/chip';
import Divider from 'primevue/divider';
import ProgressSpinner from 'primevue/progressspinner';
import Tag from 'primevue/tag';
import Message from 'primevue/message';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import ScrollPanel from 'primevue/scrollpanel';
import Panel from 'primevue/panel';

// This is the "unstyled" mode config
export const primeVueConfig = {
  unstyled: false,
  // You can add global PT (PassThrough) options here
  // pt: {}
};

// This function is not used, but shows how you would
// register components manually if you didn't auto-import
export function registerPrimeVueComponents(app: any) {
  app.component('Button', Button);
  app.component('Card', Card);
  app.component('Chip', Chip);
  app.component('Divider', Divider);
  app.component('ProgressSpinner', ProgressSpinner);
  app.component('Tag', Tag);
  app.component('Message', Message);
  app.component('Accordion', Accordion);
  app.component('AccordionTab', AccordionTab);
  app.component('ScrollPanel', ScrollPanel);
  app.component('Panel', Panel);
}
File Path: /packages/magic-helix-web/src/shims-vue.d.ts (NEW)declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
File Path: /packages/magic-helix-web/src/App.vue (NEW)<template>
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
File Path: /packages/magic-helix-web/src/index.css (NEW - Create this file)/* This file is referenced in main.ts */
/* You can leave this empty, as App.vue imports Tailwind */
