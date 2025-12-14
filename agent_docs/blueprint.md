MagicAgentHelix - Project Blueprint Prompt1. USER: TWEAK THIS SECTIONDefine the core names for your project.The prompt will replace the defaults with your new names.[DEFAULT_PROJECT_NAME] = "MagicAgentHelix"[DEFAULT_PROJECT_KEBAB] = "magic-agent-helix"[DEFAULT_CLI_COMMAND] = "magic-helix"[DEFAULT_PUBLISHER_NAME] = "YOUR_PUBLISHER_NAME"[DEFAULT_GITHUB_USERNAME] = "YOUR_USERNAME"[DEFAULT_AUTHOR_NAME] = "Your Name / Community"2. AI: EXECUTE THESE INSTRUCTIONSYou are an expert monorepo architect. Your task is to generate a complete, production-ready, 4-package monorepo based on the project names above and the file structure below.You MUST:Read the user's variables in the "TWEAK THIS SECTION".In all file paths and file contents below, replace the [DEFAULT_...] placeholders with the user's new values.Generate every single file with its exact, correct file path and full content as specified.The final output should be the complete, ready-to-use monorepo structure.3. AI: PROJECT FILE STRUCTURE & CONTENTFile Path: /file-list.md (For your reference)# [DEFAULT_PROJECT_NAME] - Project File List

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
    * `.github/workflows/deploy-web.yml`

## `.vscode/` Directory (For Dev Mode)

* `.vscode/launch.json`

## `packages/` Directory

### Core Logic (`packages/[DEFAULT_PROJECT_KEBAB]-core/`)

* `packages/[DEFAULT_PROJECT_KEBAB]-core/package.json`
* `packages/[DEFAULT_PROJECT_KEBAB]-core/README.md`
* `packages/[DEFAULT_PROJECT_KEBAB]-core/tsconfig.json`
* `packages/[DEFAULT_PROJECT_KEBAB]-core/scripts/copy-templates.js`
* **`packages/[DEFAULT_PROJECT_KEBAB]-core/src/`**
    * `packages/[DEFAULT_PROJECT_KEBAB]-core/src/index.ts`
    * `packages/[DEFAULT_PROJECT_KEBAB]-core/src/types.ts`
    * `packages/[DEFAULT_PROJECT_KEBAB]-core/src/built-in-config.ts`
    * `packages/[DEFAULT_PROJECT_KEBAB]-core/src/config-merger.ts`
    * `packages/[DEFAULT_PROJECT_KEBAB]-core/src/config-merger.test.ts`
    * `packages/[DEFAULT_PROJECT_KEBAB]-core/src/analysis.ts`
    * `packages/[DEFAULT_PROJECT_KEBAB]-core/src/analysis.test.ts`
    * **`packages/[DEFAULT_PROJECT_KEBAB]-core/src/default_templates/`**
        * (All 10 template .md files)

### CLI Package (`packages/[DEFAULT_PROJECT_KEBAB]/`)

* `packages/[DEFAULT_PROJECT_KEBAB]/package.json`
* `packages/[DEFAULT_PROJECT_KEBAB]/README.md`
* `packages/[DEFAULT_PROJECT_KEBAB]/tsconfig.json`
* **`packages/[DEFAULT_PROJECT_KEBAB]/src/`**
    * `packages/[DEFAULT_PROJECT_KEBAB]/src/cli.ts`
    * **`packages/[DEFAULT_PROJECT_KEBAB]/src/commands/`**
        * `packages/[DEFAULT_PROJECT_KEBAB]/src/commands/init.ts`
        * `packages/[DEFAULT_PROJECT_KEBAB]/src/commands/run.ts`
    * **`packages/[DEFAULT_PROJECT_KEBAB]/src/utils/`**
        * `packages/[DEFAULT_PROJECT_KEBAB]/src/utils/config-loader.ts`
        * `packages/[DEFAULT_PROJECT_KEBAB]/src/utils/config-loader.test.ts`
        * `packages/[DEFAULT_PROJECT_KEBAB]/src/utils/file-system.ts`
        * `packages/[DEFAULT_PROJECT_KEBAB]/src/utils/file-system.test.ts`

### VS Code Plugin (`packages/vscode-[DEFAULT_PROJECT_KEBAB]/`)

* `packages/vscode-[DEFAULT_PROJECT_KEBAB]/package.json`
* `packages/vscode-[DEFAULT_PROJECT_KEBAB]/README.md`
* `packages/vscode-[DEFAULT_PROJECT_KEBAB]/tsconfig.json`
* `packages/vscode-[DEFAULT_PROJECT_KEBAB]/.vscodeignore`
* **`packages/vscode-[DEFAULT_PROJECT_KEBAB]/src/`**
    * `packages/vscode-[DEFAULT_PROJECT_KEBAB]/src/extension.ts`
    * **`packages/vscode-[DEFAULT_PROJECT_KEBAB]/src/test/`**
        * `packages/vscode-[DEFAULT_PROJECT_KEBAB]/src/test/runTest.ts`
        * `packages/vscode-[DEFAULT_PROJECT_KEBAB]/src/test/suite/`
            * `packages/vscode-[DEFAULT_PROJECT_KEBAB]/src/test/suite/extension.test.ts`
            * `packages/vscode-[DEFAULT_PROJECT_KEBAB]/src/test/suite/index.ts`

### Web Playground (`packages/[DEFAULT_PROJECT_KEBAB]-web/`)

* `packages/[DEFAULT_PROJECT_KEBAB]-web/package.json`
* `packages/[DEFAULT_PROJECT_KEBAB]-web/README.md`
* `packages/[DEFAULT_PROJECT_KEBAB]-web/tsconfig.json`
* `packages/[DEFAULT_PROJECT_KEBAB]-web/vite.config.ts`
* `packages/[DEFAULT_PROJECT_KEBAB]-web/tailwind.config.js`
* `packages/[DEFAULT_PROJECT_KEBAB]-web/postcss.config.js`
* `packages/[DEFAULT_PROJECT_KEBAB]-web/index.html`
* **`packages/[DEFAULT_PROJECT_KEBAB]-web/src/`**
    * `packages/[DEFAULT_PROJECT_KEBAB]-web/src/main.ts`
    * `packages/[DEFAULT_PROJECT_KEBAB]-web/src/App.vue`
    * `packages/[DEFAULT_PROJECT_KEBAB]-web/src/primevue-config.ts`
    * `packages/[DEFAULT_PROJECT_KEBAB]-web/src/shims-vue.d.ts`
File Path: /.gitignore# Dependencies
/node_modules
/packages/**/node_modules

# Build output
/packages/**/dist

# Release binaries
/packages/[DEFAULT_PROJECT_KEBAB]/release

# Web App Build
/packages/[DEFAULT_PROJECT_KEBAB]-web/dist

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
  "name": "[DEFAULT_PROJECT_KEBAB]-monorepo",
  "version": "0.1.0",
  "private": true,
  "description": "Monorepo for [DEFAULT_PROJECT_NAME] CLI, VS Code Extension, and Web Playground",
  "workspaces": [
    "packages/*"
  ],
  "engines": {
    "node": "^20.11.1 || >=22.0.0"
  },
  "scripts": {
    "build": "npm run build --workspaces",
    "build:core": "npm run build --workspace=[DEFAULT_PROJECT_KEBAB]-core",
    "build:cli": "npm run build --workspace=[DEFAULT_PROJECT_KEBAB]",
    "build:vscode": "npm run build --workspace=vscode-[DEFAULT_PROJECT_KEBAB]",
    "build:web": "npm run build --workspace=[DEFAULT_PROJECT_KEBAB]-web",
    "dev:web": "npm run dev --workspace=[DEFAULT_PROJECT_KEBAB]-web",
    "lint": "biome lint .",
    "format": "biome format --write .",
    "test": "vitest run",
    "test:vscode": "npm run test --workspace=vscode-[DEFAULT_PROJECT_KEBAB]",
    "test:all": "npm run test && npm run test:vscode",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "semantic-release": "semantic-release"
  },
  "keywords": [
    "[DEFAULT_PROJECT_KEBAB]",
    "copilot",
    "ai"
  ],
  "author": "[DEFAULT_AUTHOR_NAME]",
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
File Path: /.releaserc.json{
  "branches": [
    "main",
    "development",
    {
      "name": "feature/*",
      "prerelease": "beta"
    }
  ],
  "plugins": [
    [
      "@semantic-release/commit-analyzer",
      {
        "preset": "conventionalcommits",
        "releaseRules": [
          {
            "type": "build",
            "scope": "deps",
            "release": "patch"
          }
        ]
      }
    ],
    [
      "@semantic-release/release-notes-generator",
      {
        "preset": "conventionalcommits"
      }
    ],
    [
      "@semantic-release/changelog",
      {
        "changelogFile": "packages/[DEFAULT_PROJECT_KEBAB]/CHANGELOG.md"
      }
    ],
    [
      "@semantic-release/npm",
      {
        "pkgRoot": "packages/[DEFAULT_PROJECT_KEBAB]"
      }
    ],
    [
      "@semantic-release/npm",
      {
        "pkgRoot": "packages/[DEFAULT_PROJECT_KEBAB]-core"
      }
    ],
    [
      "@semantic-release/exec",
      {
        "prepareCmd": "npm run build:pkg --workspace=[DEFAULT_PROJECT_KEBAB]"
      }
    ],
    [
      "@semantic-release/github",
      {
        "assets": "packages/[DEFAULT_PROJECT_KEBAB]/release/*"
      }
    ]
  ]
}
File Path: /.github/workflows/release.ymlname: Release & Publish

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
File Path: /.github/workflows/deploy-web.ymlname: Deploy Web Playground to GitHub Pages

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
        run: npm run build --workspace=[DEFAULT_PROJECT_KEBAB]-web -- --base=./[DEFAULT_PROJECT_KEBAB]/

      - name: Setup GitHub Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          # Upload the built web app
          path: 'packages/[DEFAULT_PROJECT_KEBAB]-web/dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
File Path: /.biome.json{
  "$schema": "[https://biomejs.dev/schemas/stable/schema.json](https://biomejs.dev/schemas/stable/schema.json)",
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "suspicious": {
        "noAny": "off"
      }
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 80
  },
  "javascript": {
    "formatter": {
      "semicolons": "always",
      "quoteStyle": "single",
      "trailingComma": "es5"
    }
  },
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "defaultBranch": "main"
  }
}
File Path: /vitest.config.tsimport { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Look for tests in core and cli packages
    include: [
      'packages/[DEFAULT_PROJECT_KEBAB]-core/src/**/*.test.ts',
      'packages/[DEFAULT_PROJECT_KEBAB]/src/**/*.test.ts',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      // Target only the core logic and cli utils for coverage
      include: [
        'packages/[DEFAULT_PROJECT_KEBAB]-core/src/**/*.ts',
        'packages/[DEFAULT_PROJECT_KEBAB]/src/utils/**/*.ts',
      ],
      exclude: [
        'packages/vscode-[DEFAULT_PROJECT_KEBAB]/**',
        'packages/[DEFAULT_PROJECT_KEBAB]-web/**',
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
File Path: /README.md (Monorepo Root)# ✨ [DEFAULT_PROJECT_NAME] Monorepo ✨

This is the main monorepo for the `[DEFAULT_PROJECT_KEBAB]` project, containing:

* `packages/[DEFAULT_PROJECT_KEBAB]-core`: The pure logic engine (the "brain").
* `packages/[DEFAULT_PROJECT_KEBAB]`: The core CLI tool (the "body").
* `packages/vscode-[DEFAULT_PROJECT_KEBAB]`: The VS Code extension (the "interface").
* `packages/[DEFAULT_PROJECT_KEBAB]-web`: A live web playground and demo (the "demo").

## Live Playground

**You can try [DEFAULT_PROJECT_NAME] live in your browser!**

Visit our GitHub Pages playground: **[https://[DEFAULT_GITHUB_USERNAME].github.io/[DEFAULT_PROJECT_KEBAB]/](https://[DEFAULT_GITHUB_USERNAME].github.io/[DEFAULT_PROJECT_KEBAB]/)**
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
6.  Open the Command Palette (Ctrl+Shift+P) and type: **"[DEFAULT_PROJECT_NAME]: Align Conventions"**.
7.  Press Enter. The plugin will run your local CLI code against the test project.
File Path: /.vscode/launch.json{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Run VS Code Extension (Dev Mode)",
      "type": "extensionHost",
      "request": "launch",
      "args": [
        "--extensionDevelopmentPath=${workspaceFolder}/packages/vscode-[DEFAULT_PROJECT_KEBAB]"
      ],
      "outFiles": [
        "${workspaceFolder}/packages/vscode-[DEFAULT_PROJECT_KEBAB]/dist/**/*.js"
      ],
      "preLaunchTask": "npm: build:vscode"
    }
  ]
}
File Path: /packages/[DEFAULT_PROJECT_KEBAB]-core/package.json{
  "name": "[DEFAULT_PROJECT_KEBAB]-core",
  "version": "0.1.0",
  "description": "Pure logic engine for [DEFAULT_PROJECT_NAME]. Contains no Node.js dependencies.",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc --build && node ./scripts/copy-templates.js"
  },
  "keywords": [
    "[DEFAULT_PROJECT_KEBAB]",
    "core",
    "pure"
  ],
  "author": "[DEFAULT_AUTHOR_NAME]",
  "license": "MIT",
  "files": [
    "dist/**/*"
  ]
}
File Path: /packages/[DEFAULT_PROJECT_KEBAB]-core/README.md# ✨ [DEFAULT_PROJECT_NAME] (Core Engine) ✨

This package contains the pure, dependency-free logic for the [DEFAULT_PROJECT_NAME] tool. It has no Node.js `fs` or `path` dependencies and can be run in any JavaScript environment (Node.js, Deno, Bun, Web Browser).

It is the "brain" of the operation.

See the [monorepo root README.md](../../README.md) for full usage and development instructions.
File Path: /packages/[DEFAULT_PROJECT_KEBAB]-core/tsconfig.json{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": [
    "src/**/*.ts"
  ],
  "references": []
}
File Path: /packages/[DEFAULT_PROJECT_KEBAB]-core/scripts/copy-templates.js// This script recursively copies the default templates
// from 'src/default_templates' into the build ('dist/default_templates')
// folder so the CLI package can find them.

const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '../src/default_templates');
const destDir = path.resolve(__dirname, '../dist/default_templates');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  if (!exists) {
    console.warn(`Source directory does not exist: ${src}`);
    return;
  }
  
  const stats = fs.statSync(src);
  const isDirectory = stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

if (!fs.existsSync(srcDir)) {
  console.log('No default_templates directory found in src. Skipping copy.');
} else {
  copyRecursiveSync(srcDir, destDir);
  console.log('Recursively copied default template files to dist/default_templates.');
}
File Path: /packages/[DEFAULT_PROJECT_KEBAB]-core/src/index.ts// This is the main export file for the pure core logic.
// The CLI package will import from here.

export * from './types';
export * from './built-in-config';
export * from './config-merger';
export * from './analysis';
File Path: /packages/[DEFAULT_PROJECT_KEBAB]-core/src/types.ts// This file defines the structure of the user-facing config file.

/**
 * Defines a mapping from an npm dependency to a tag.
 * e.g., { "vue": "framework-vue" }
 */
export type DependencyTagMap = Record<string, string>;

/**
 * Defines a mapping from a key config file to a tag.
 * e.g., { "tailwind.config.js": "style-tailwind" }
 */
export type ConfigFileTagMap = Record<string, string>;

/**
 * Defines a mapping from a file glob pattern to a tag.
 * e.g., { "src/**/*.vue": "framework-vue" }
 */
export type FileGlobTagMap = Record<string, string>;

/**
 * Defines the structure for mapping a tag to its templates.
 */
export type TagTemplateMap = Record<string, {
  template: string; // The filename in the user's template directory
  suffix: string;  // The suffix to append to the generated filename
}[]>;

/**
 * The structure of the [DEFAULT_CLI_COMMAND].config.json file.
 * This file is OPTIONAL and is used to *extend* the built-in conventions.
 */
export interface Config {
  /**
   * The AI agent target. 'github-copilot' is currently the only
   * supported target, which generates files in the .github/instructions/ directory.
   */
  target: 'github-copilot';
  
  /**
   * The *user's* local directory where their .md templates are stored
   * for their *custom* rules.
   * @default "ai_templates"
   */
  templateDirectory?: string;

  /**
   * The output directory for the generated instruction files.
   * @default ".github/instructions"
   */
  outputDirectory?: string;

  /**
   * Maps npm dependency names to "tags".
   * These are *merged* with the built-in rules.
   */
  dependencyTagMap?: DependencyTagMap;

  /**
   * Maps key config files (relative to project root) to tags.
   * These are *merged* with the built-in rules.
   */
  configFileTagMap?: ConfigFileTagMap;

  /**
   * Maps file glob patterns (relative to project root) to tags.
   * These are *merged* with the built-in rules.
   */
  fileGlobTagMap?: FileGlobTagMap;

  /**
   * A map of "tags" to the template files that should be applied.
   * These are *merged* with the built-in rules.
   */
  tagTemplateMap?: TagTemplateMap;
}

/**
 * Data required by the pure analysis function.
 * This is provided by the impure CLI (or a Web UI).
 */
export interface ProjectAnalysisData {
  dependencies: Record<string, string>; // All deps from package.json
  configFiles: string[]; // List of config filenames found at project root
  projectFiles: string[]; // List of all file paths found in the project
}
File Path: /packages/[DEFAULT_PROJECT_KEBAB]-core/src/built-in-config.tsimport { Config } from './types';

/**
 * This is the "brain" of the tool.
 * It contains all the pre-configured rules for common frameworks and tools.
 * This configuration is used automatically, so the user doesn't have to
 * create a config file for basic projects.
 */
export const BUILT_IN_CONFIG: Config = {
  target: 'github-copilot',
  templateDirectory: 'ai_templates', // User's custom template dir
  outputDirectory: '.github/instructions', // Default output dir

  dependencyTagMap: {
    // Frameworks
    'vue': 'framework-vue',
    'react': 'framework-react',
    '@angular/core': 'framework-angular',
    '@nestjs/core': 'framework-nestjs',

    // Styling
    'tailwindcss': 'style-tailwind',
    'primevue': 'style-primevue',
    '@mui/material': 'style-mui',
    'quasar': 'style-quasar',

    // Testing
    'vitest': 'test-vitest',
    'jest': 'test-jest',
    'cypress': 'test-cypress',
    'playwright': 'test-playwright',

    // State
    'rxjs': 'state-rxjs',
    'pinia': 'state-pinia',
    'redux': 'state-redux',
    'zustand': 'state-zustand',
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
      { template: 'vue/vue-core.md', suffix: 'vue-core.md' },
    ],
    'state-pinia': [
      { template: 'vue/vue-pinia.md', suffix: 'vue-pinia.md' },
    ],
    'style-primevue': [
      { template: 'vue/style-primevue.md', suffix: 'vue-style-primevue.md' },
    ],

    // React Projects
    'framework-react': [
      { template: 'react/react-core.md', suffix: 'react-core.md' },
    ],
    'state-zustand': [
      { template: 'react/react-zustand.md', suffix: 'react-zustand.md' },
    ],

    // NestJS Projects
    'framework-nestjs': [
      { template: 'nestjs/nestjs-core.md', suffix: 'nestjs-core.md' },
    ],

    // Generic
    'style-tailwind': [
      { template: 'generic/style-tailwind.md', suffix: 'style-tailwind.md' },
    ],
    'test-vitest': [
      { template: 'generic/test-vitest.md', suffix: 'test-vitest.md' },
    ],
    'lang-typescript': [
      { template: 'generic/lang-typescript.md', suffix: 'lang-typescript.md' },
    ],
    'state-rxjs': [
      { template: 'generic/state-rxjs.md', suffix: 'state-rxjs.md' },
    ],
  },
};
File Path: /packages/[DEFAULT_PROJECT_KEBAB]-core/src/config-merger.tsimport { Config } from './types';
import { BUILT_IN_CONFIG } from './built-in-config';

/**
 * Merges the base config with the user's partial config.
 * User's config values take precedence.
 * This is a PURE function.
 * @param userConfig The partial config loaded from the user's file.
 * @returns A complete, merged Config object.
 */
export function mergeConfigs(userConfig: Partial<Config>): Config {
  const base = BUILT_IN_CONFIG;
  
  return {
    target: userConfig.target || base.target,
    templateDirectory: userConfig.templateDirectory || base.templateDirectory,
    outputDirectory: userConfig.outputDirectory || base.outputDirectory,
    dependencyTagMap: {
      ...base.dependencyTagMap,
      ...(userConfig.dependencyTagMap || {}),
    },
    configFileTagMap: {
      ...base.configFileTagMap,
      ...(userConfig.configFileTagMap || {}),
    },
    fileGlobTagMap: {
      ...base.fileGlobTagMap,
      ...(userConfig.fileGlobTagMap || {}),
    },
    tagTemplateMap: {
      ...base.tagTemplateMap,
      ...(userConfig.tagTemplateMap || {}),
    },
  };
}
File Path: /packages/[DEFAULT_PROJECT_KEBAB]-core/src/config-merger.test.tsimport { describe, it, expect, vi } from 'vitest';
import { mergeConfigs } from './config-merger';
import { BUILT_IN_CONFIG } from './built-in-config';
import { Config } from './types';

// Mock the built-in config for isolation
vi.mock('./built-in-config', () => ({
  BUILT_IN_CONFIG: {
    target: 'github-copilot',
    templateDirectory: 'ai_templates',
    outputDirectory: '.github/instructions',
    dependencyTagMap: { vue: 'framework-vue' },
    configFileTagMap: { 'tsconfig.json': 'lang-typescript' },
    fileGlobTagMap: { 'src/**/*.vue': 'framework-vue' },
    tagTemplateMap: {
      'framework-vue': [
        { template: 'vue/vue-core.md', suffix: 'vue-core.md' },
      ],
    },
  },
}));

describe('mergeConfigs', () => {
  it('should return built-in config if user config is empty', () => {
    const userConfig = {};
    const merged = mergeConfigs(userConfig);
    expect(merged).toEqual(BUILT_IN_CONFIG);
  });

  it('should overwrite a base value', () => {
    const userConfig: Partial<Config> = {
      outputDirectory: '.custom-output',
    };
    const merged = mergeConfigs(userConfig);
    expect(merged.outputDirectory).toBe('.custom-output');
    expect(merged.target).toBe('github-copilot'); // from base
  });

  it('should merge maps deeply', () => {
    const userConfig: Partial<Config> = {
      dependencyTagMap: {
        'my-lib': 'custom-tag', // Add new
        'vue': 'custom-vue-tag', // Overwrite
      },
      tagTemplateMap: {
        'custom-tag': [
          { template: 'my-rule.md', suffix: 'my-rule.md' },
        ],
      },
    };
    const merged = mergeConfigs(userConfig);

    // Check dependency map
    expect(merged.dependencyTagMap).toEqual({
      'vue': 'custom-vue-tag', // Overwritten
      'my-lib': 'custom-tag', // Added
    });

    // Check tag template map
    expect(merged.tagTemplateMap).toEqual({
      'framework-vue': [ // From base
        { template: 'vue/vue-core.md', suffix: 'vue-core.md' },
      ],
      'custom-tag': [ // From user
        { template: 'my-rule.md', suffix: 'my-rule.md' },
      ],
    });
  });
});
File Path: /packages/[DEFAULT_PROJECT_KEBAB]-core/src/analysis.tsimport {
  DependencyTagMap,
  ConfigFileTagMap,
  FileGlobTagMap,
  ProjectAnalysisData,
} from './types';
// @ts-ignore: No types available for minimatch, but it's fine
import { minimatch } from 'minimatch';

/**
 * Analyzes a project's data to produce a set of tags.
 * This is a PURE function. It does not read files.
 *
 * @param data The project's dependencies and file lists.
 * @param depMap The merged dependency-to-tag map.
 * @param configMap The merged config-file-to-tag map.
 * @param globMap The merged file-glob-to-tag map.
 * @returns A Set of matching tags.
 */
export function analyzeProjectTags(
  data: ProjectAnalysisData,
  depMap: DependencyTagMap,
  configMap: ConfigFileTagMap,
  globMap: FileGlobTagMap
): Set<string> {
  
  const tags = new Set<string>();

  // Strategy 1: Analyze dependencies
  for (const dep in data.dependencies) {
    if (depMap[dep]) {
      tags.add(depMap[dep]);
    }
  }

  // Strategy 2: Analyze key config files
  for (const file in configMap) {
    const tag = configMap[file];
    if (data.configFiles.includes(file)) {
      tags.add(tag);
    }
  }

  // Strategy 3: Analyze file globs
  // This is the most expensive operation.
  for (const pattern in globMap) {
    const tag = globMap[pattern];
    // Check if any project file matches the glob pattern
    for (const projectFile of data.projectFiles) {
      if (minimatch(projectFile, pattern, { dot: true })) {
        tags.add(tag);
        break; // Found a match for this tag, move to next pattern
      }
    }
  }
  
  return tags;
}
File Path: /packages/[DEFAULT_PROJECT_KEBAB]-core/src/analysis.test.tsimport { describe, it, expect } from 'vitest';
import { analyzeProjectTags } from './analysis';
import { ProjectAnalysisData } from './types';
import { BUILT_IN_CONFIG } from './built-in-config';

describe('analyzeProjectTags', () => {
  const { dependencyTagMap, configFileTagMap, fileGlobTagMap } = BUILT_IN_CONFIG;

  it('should return framework-vue for vue dependency', () => {
    const data: ProjectAnalysisData = {
      dependencies: { 'vue': '3.0.0' },
      configFiles: [],
      projectFiles: [],
    };
    const tags = analyzeProjectTags(data, dependencyTagMap, configFileTagMap, fileGlobTagMap);
    expect(tags).toContain('framework-vue');
  });

  it('should return style-tailwind for tailwind.config.js', () => {
    const data: ProjectAnalysisData = {
      dependencies: {},
      configFiles: ['tailwind.config.js'],
      projectFiles: [],
    };
    const tags = analyzeProjectTags(data, dependencyTagMap, configFileTagMap, fileGlobTagMap);
    expect(tags).toContain('style-tailwind');
  });

  it('should return framework-vue for .vue file glob', () => {
    const data: ProjectAnalysisData = {
      dependencies: {},
      configFiles: [],
      projectFiles: ['src/components/MyButton.vue', 'README.md'],
    };
    const tags = analyzeProjectTags(data, dependencyTagMap, configFileTagMap, fileGlobTagMap);
    expect(tags).toContain('framework-vue');
  });

  it('should return multiple tags for a complex project', () => {
    const data: ProjectAnalysisData = {
      dependencies: { 'react': '18.0.0', 'vitest': '2.0.0' },
      configFiles: ['tsconfig.json'],
      projectFiles: ['src/App.tsx', 'src/stores/useStore.ts'],
    };
    const tags = analyzeProjectTags(data, dependencyTagMap, configFileTagMap, fileGlobTagMap);
    expect(tags).toContain('framework-react');
    expect(tags).toContain('test-vitest');
    expect(tags).toContain('lang-typescript');
  });
});
File Path: /packages/[DEFAULT_PROJECT_KEBAB]-core/src/default_templates/generic/lang-typescript.md# Language: TypeScript

* **ALWAYS** use strict mode (`"strict": true`).

* **AVOID** the `any` type. Prefer `unknown` when the type is truly unknown.

* **ALWAYS** use `interface` for public API definitions (e.g., function parameters, return types) and `type` for internal or utility types.

* **ALWAYS** use optional chaining (`?.`) and nullish coalescing (`??`) over `&&` checks.

* **NEVER** use `require`. Always use ES module `import`.
File Path: /packages/[DEFAULT_PROJECT_KEBAB]-core/src/default_templates/generic/state-rxjs.md# State: RxJS

* **ALWAYS** suffix observables with a dollar sign (`$`). E.g., `const users$ = ...`

* **ALWAYS** use `takeUntil(this.destroy$)` or `take(1)` to prevent memory leaks in components or services.

* **PREFER** using functional pipe operators (`pipe(map(...), filter(...))`).

* **AVOID** nesting subscriptions. Use higher-order mapping operators like `switchMap`, `mergeMap`, or `concatMap`.
File Path: /packages/[DEFAULT_PROJECT_KEBAB]-core/src/default_templates/generic/style-tailwind.md# Styling: TailwindCSS

* **ALWAYS** use Tailwind utility classes for styling.

* **AVOID** writing custom CSS files. If you must, place it in a single `global.css` or component-scoped `<style>` tag.

* **ALWAYS** use theme-aware classes (e.g., `bg-primary`, `text-text-primary`) if they are defined in `tailwind.config.js`.

* **DO NOT** use arbitrary values (`[23px]`) unless absolutely necessary. Stick to the theme's spacing scale (`p-2`, `m-4`).
File Path: /packages/[DEFAULT_PROJECT_KEBAB]-core/src/default_templates/generic/test-vitest.md# Testing: Vitest

* **ALWAYS** use `vi.mock('path/to/module')` for mocking dependencies.

* **PREFER** `describe`, `it`, `expect` syntax.

* **USE** `vi.spyOn(object, 'methodName')` to spy on method calls.

* **REMEMBER** to call `vi.clearAllMocks()` or `vi.restoreAllMocks()` in an `afterEach` block to ensure test isolation.
File Path: /packages/[DEFAULT_PROJECT_KEBAB]-core/src/default_templates/nestjs/nestjs-core.md# Framework: NestJS

* **ALWAYS** follow the standard `Module -> Controller -> Service` pattern.
* **Services** should contain all business logic.
* **Controllers** should be as thin as possible, handling only HTTP requests, DTO validation, and responses.
* **Modules** should define clear boundaries between domains.
* **USE** DTOs (Data Transfer Objects) for all controller inputs.
* **USE** built-in dependency injection (DI). Do not manually instantiate services.
* **PREFER** custom decorators for request properties (e.g., `@GetUser() user`).
File Path: /packages/[DEFAULT_PROJECT_KEBAB]-core/src/default_templates/react/react-core.md# Framework: React

* **ALWAYS** use Functional Components with Hooks.
* **DO NOT** use Class-based Components.
* **USE** `useState` for simple component state and `useReducer` for complex state logic.
* **ALWAYS** include a `key` prop when rendering lists.
* **MEMOIZE** functions passed to child components with `useCallback` to prevent unnecessary re-renders.
* **MEMOIZE** expensive computations or objects with `useMemo`.
* **NAME** components using PascalCase (e.g., `MyButton`).
File Path: /packages/[DEFAULT_PROJECT_KEBAB]-core/src/default_templates/react/react-zustand.md# State: Zustand

* **ALWAYS** define stores using the `create` function.
* **ALWAYS** define actions as methods inside the `create` function, e.g., `increment: () => set((state) => ({ count: state.count + 1 }))`.
* **DO NOT** mutate state directly. Always use the `set` function.
* **PREFER** using selectors to subscribe to specific slices of state to prevent unnecessary re-renders:
  `const count = useStore((state) => state.count);`
File Path: /packages/[DEFAULT_PROJECT_KEBAB]-core/src/default_templates/vue/style-primevue.md# Styling: PrimeVue

* **ALWAYS** use PrimeVue's PassThrough (PT) system for custom styling.
* **DO NOT** use deep selectors (`::v-deep`) to override component styles.
* **PREFER** defining a custom preset for site-wide consistency over inline PT props.
* **USE** Tailwind utilities directly within the PT object.
  Example:
  `pt: { root: { class: 'bg-blue-500 rounded-md' } }`
File Path: /packages/[DEFAULT_PROJECT_KEBAB]-core/src/default_templates/vue/vue-core.md# Framework: Vue 3

* **ALWAYS** use `<script setup>` for all new components.
* **ALWAYS** use the Composition API. Do not use the Options API.
* **DEFINE** props and emits using `defineProps` and `defineEmits`.
* **NAME** components using PascalCase (e.g., `MyButton.vue`).
* **USE** `ref` for primitive values and `reactive` for objects.
* **USE** `computed` for derived state.
* **NEVER** use `v-if` and `v-for` on the same element.
File Path: /packages/[DEFAULT_PROJECT_KEBAB]-core/src/default_templates/vue/vue-pinia.md# State: Pinia

* **ALWAYS** use "Setup Stores" (defining stores as a function) instead of "Option Stores".
  Example:
  `export const useCounterStore = defineStore('counter', () => { ... })`
* **DEFINE** state with `ref()` or `reactive()`.
* **DEFINE** getters with `computed()`.
* **DEFINE** actions as normal functions.
* **DO NOT** destructure the store directly, as it will break reactivity. Use `storeToRefs()`:
  `const { count } = storeToRefs(counterStore);`
File Path: /packages/[DEFAULT_PROJECT_KEBAB]/package.json{
  "name": "[DEFAULT_PROJECT_KEBAB]",
  "version": "0.1.0",
  "description": "A CLI to inspect a project and generate granular, path-specific AI instructions for agents like GitHub Copilot.",
  "engines": {
    "node": "^20.11.1 || >=22.0.0"
  },
  "bin": {
    "[DEFAULT_CLI_COMMAND]": "./dist/cli.js"
  },
  "scripts": {
    "build": "tsc --build",
    "build:pkg": "pkg ."
  },
  "keywords": [
    "[DEFAULT_PROJECT_KEBAB]",
    "copilot",
    "github-copilot",
    "ai"
  ],
  "author": "[DEFAULT_AUTHOR_NAME]",
  "license": "MIT",
  "publishConfig": {
    "access": "public"
  },
  "pkg": {
    "scripts": "dist/cli.js",
    "assets": [
      "../../node_modules/[DEFAULT_PROJECT_KEBAB]-core/dist/default_templates/**/*"
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
    "[DEFAULT_PROJECT_KEBAB]-core": "workspace:^0.1.0",
    "ora": "^9.0.0",
    "piccolors": "^1.0.1"
  },
  "files": [
    "dist/**/*",
    "README.md",
    "CHANGELOG.md"
  ]
}
File Path: /packages/[DEFAULT_PROJECT_KEBAB]/tsconfig.json{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": [
    "src/**/*.ts"
  ],
  "references": [
    {
      "path": "../[DEFAULT_PROJECT_KEBAB]-core"
    }
  ]
}
File Path: /packages/[DEFAULT_PROJECT_KEBAB]/README.md# ✨ [DEFAULT_PROJECT_NAME] (The CLI) ✨

This is the core CLI package for [DEFAULT_PROJECT_NAME]. It contains all the logic for scanning projects and generating AI instruction files.

It is designed to be used in two ways:
1.  As an `npm` package (`npx [DEFAULT_CLI_COMMAND] run`).
2.  As a standalone binary (downloaded from GitHub Releases).

See the [monorepo root README.md](../../README.md) for full usage and development instructions.
File Path: /packages/[DEFAULT_PROJECT_KEBAB]/src/cli.ts#!/usr/bin/env node

import { Command } from 'commander';
import { run } from './commands/run';
import { init } from './commands/init';
import pc from 'piccolors';
// Import package.json to read version
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pkg = require('../package.json');

// This is the main entry point for the CLI tool.
// It uses 'commander' to set up sub-commands: 'init' and 'run'.

async function main() {
  const program = new Command();
  
  program
    .name('[DEFAULT_CLI_COMMAND]')
    .description('[DEFAULT_PROJECT_NAME] CLI for aligning AI instructions in your monorepo.')
    .version(pkg.version);

  program
    .command('init')
    .description('Initialize a custom [DEFAULT_CLI_COMMAND].config.json to extend the built-in rules.')
    .action(init);

  program
    .command('run')
    .description('Scan the monorepo and generate AI instruction files based on built-in and custom rules.')
    .action(run);

  // Set 'run' as the default command if no other command is specified
  if (process.argv.length < 3) {
    program.action(run);
  }

  await program.parseAsync(process.argv);
}

main().catch((err) => {
  console.error(pc.red(`❌ An unexpected error occurred: ${err.message}`));
  process.exit(1);
});
File Path: /packages/[DEFAULT_PROJECT_KEBAB]/src/commands/init.tsimport * as fs from 'fs';
import * as path from 'path';
import inquirer from 'inquirer';
import ora from 'ora';
import pc from 'piccolors';
import gradient from 'gradient-string';
import { Config } from '[DEFAULT_PROJECT_KEBAB]-core'; // Import from CORE

// --- CONFIGURATION ---
const CONFIG_FILENAME = '[DEFAULT_CLI_COMMAND].config.json';
const DEFAULT_TEMPLATE_DIR = 'ai_templates';

// This is the *minimal* config file 'init' will create.
const MINIMAL_USER_CONFIG: Omit<Config, 'target' | 'outputDirectory' | 'templateDirectory'> & Partial<Config> = {
  // Omit fields that are provided by the base config
  dependencyTagMap: {
    // "my-internal-package": "domain-my-rules"
  },
  configFileTagMap: {
    // "my-custom-config.json": "domain-my-rules"
  },
  fileGlobTagMap: {
    // "src/specific-folder/**/*.ts": "domain-my-rules"
  },
  tagTemplateMap: {
    // "domain-my-rules": [
    //   { "template": "my-custom-rule.md", "suffix": "my-rule.md" }
    // ]
  },
};

/**
 * The 'init' command.
 */
export async function init() {
  const spinner = ora(pc.bold('Initializing [DEFAULT_PROJECT_NAME] for custom rules...')).start();
  
  const configPath = path.resolve(process.cwd(), CONFIG_FILENAME);
  const templatePath = path.resolve(process.cwd(), DEFAULT_TEMPLATE_DIR);

  // Check if config file already exists
  if (fs.existsSync(configPath)) {
    spinner.stop();
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: `A ${CONFIG_FILENAME} file already exists. Do you want to overwrite it with a minimal example?`,
        default: false,
      },
    ]);
    if (!overwrite) {
      spinner.warn(pc.yellow('Operation cancelled.'));
      return;
    }
    spinner.start('Overwriting existing config...');
  }

  // 1. Write the minimal config file
  try {
    fs.writeFileSync(
      configPath,
      JSON.stringify(MINIMAL_USER_CONFIG, null, 2),
      'utf-8'
    );
    spinner.succeed(pc.green(`Created minimal config file: ${pc.bold(CONFIG_FILENAME)}`));
  } catch (e) {
    spinner.fail(pc.red(`Error writing config file: ${e.message}`));
    return;
  }
  
  spinner.start('Creating templates directory...');

  // 2. Create the templates directory
  if (!fs.existsSync(templatePath)) {
    fs.mkdirSync(templatePath, { recursive: true });
  }

  // 3. Copy *one* example file to show them how it works
  const exampleTemplatePath = path.resolve(templatePath, 'my-custom-rule.md');
  if (!fs.existsSync(exampleTemplatePath)) {
    fs.writeFileSync(
      exampleTemplatePath,
      '# My Team\'s Custom Rule\n- This rule is specific to our "domain-my-rules" tag.\n- ALWAYS follow this important pattern.\n',
      'utf-8'
    );
    spinner.succeed(pc.green(`Created templates directory and example file: ${pc.bold(DEFAULT_TEMPLATE_DIR)}`));
  } else {
    spinner.succeed(pc.green(`Templates directory ${pc.bold(DEFAULT_TEMPLATE_DIR)} already exists.`));
  }

  console.log(
    gradient.pastel.multiline(
      '\n✨ Success! Your project is ready for custom rules. ✨'
    )
  );
  console.log(pc.cyan(`\nNext steps:`));
  console.log(`  1. Edit ${pc.bold(CONFIG_FILENAME)} to define your team's "tags".`);
  console.log(`  2. Add your custom .md instruction files to ${pc.bold(DEFAULT_TEMPLATE_DIR)}.`);
  console.log(`  3. Run ${pc.bold(`npx ${DEFAULT_CLI_COMMAND} run`)} to generate your files.`);
}
File Path: /packages/[DEFAULT_PROJECT_KEBAB]/src/commands/run.tsimport * as fs from 'fs';
import * as path from 'path';
import inquirer from 'inquirer';
import ora from 'ora';
import pc from 'piccolors';
import gradient from 'gradient-string';
import {
  TagTemplateMap,
  analyzeProjectTags, // PURE logic from core
  mergeConfigs, // PURE logic from core
} from '[DEFAULT_PROJECT_KEBAB]-core';
import { loadUserConfig } from '../utils/config-loader'; // IMPURE
import {
  findProjects, // IMPURE
  getProjectAnalysisData, // IMPURE
  readTemplate, // IMPURE
  pruneOldFiles, // IMPURE
  Project, // Type
} from '../utils/file-system'; // IMPURE

/**
 * The 'run' command.
 * Orchestrates the (impure) file system operations and
 * calls the (pure) core logic.
 */
export async function run() {
  console.log(gradient.pastel.multiline('🤖 Running [DEFAULT_PROJECT_NAME]...'));
  
  const mainSpinner = ora('Loading configurations...').start();

  // 1. Load Configs (Impure)
  const userConfig = loadUserConfig();
  // (Pure)
  const config = mergeConfigs(userConfig);
  mainSpinner.succeed('Configuration loaded.');

  const {
    dependencyTagMap,
    configFileTagMap,
    fileGlobTagMap,
    tagTemplateMap,
  } = config;

  const userTemplateDir = path.resolve(process.cwd(), config.templateDirectory);
  const targetDir = path.resolve(process.cwd(), config.outputDirectory);

  // 2. Find all projects (Impure)
  const projectSpinner = ora('Scanning for projects...').start();
  const projects: Project[] = await findProjects();
  if (projects.length === 0) {
    projectSpinner.warn(
      pc.yellow('No projects found. Make sure your root package.json has a "workspaces" field.')
    );
    return;
  }
  projectSpinner.succeed(`Found ${projects.length} projects.`);

  // 3. Analyze dependencies and tag projects (Impure + Pure)
  const analyzeSpinner = ora('Analyzing project tags...').start();
  let totalTags = 0;
  for (const project of projects) {
    // (Impure) Get data from file system
    const analysisData = await getProjectAnalysisData(project);
    // (Pure) Get tags from data
    project.tags = analyzeProjectTags(
      analysisData,
      dependencyTagMap,
      configFileTagMap,
      fileGlobTagMap
    );
    totalTags += project.tags.size;
  }
  analyzeSpinner.succeed(`Project analysis complete. Found ${totalTags} tags.`);

  // 4. Ensure target directory exists (Impure)
  ensureTargetDir(targetDir);

  // 5. Generate files (Impure)
  console.log(pc.cyan(`\nGenerating instruction files in ${config.outputDirectory}...`));
  const generatedFiles: string[] = [];
  for (const project of projects) {
    if (project.tags.size === 0) {
      console.log(pc.gray(`  Skipping: ${project.name} (No matching tags)`));
      continue;
    }

    console.log(pc.bold(`  Processing: ${project.name}`));
    console.log(pc.gray(`    Tags: ${[...project.tags].join(', ')}`));

    const globPattern = `${project.path}/src/**/*.{ts,js,vue,tsx,jsx,go,py}`;

    for (const tag of project.tags) {
      const templates = tagTemplateMap[tag as keyof TagTemplateMap];
      if (!templates) continue;

      for (const t of templates) {
        // (Impure) Read template from file system
        const { content: templateContent, source } = readTemplate(
          userTemplateDir,
          t.template
        );
        
        if (!templateContent) {
          console.warn(
            pc.yellow(`    ⚠️  Template not found: ${t.template}`)
          );
          continue;
        }

        const header = `---
# Auto-generated by [DEFAULT_CLI_COMMAND] for: ${project.name}
# Source Template: ${t.template}
applyTo: "${globPattern}"
---
`;
        const fullContent = header + '\n' + templateContent;

        const outputFilename = `${project.name}.${t.suffix}`;
        const outputPath = path.join(targetDir, outputFilename);

        generatedFiles.push(outputFilename);
        fs.writeFileSync(outputPath, fullContent);
        console.log(
          pc.green(`    ✅ Generated: ${pc.bold(outputFilename)} (from ${source})`)
        );
      }
    }
  }

  // 6. Pruning (Impure)
  await pruneOldFiles(targetDir, generatedFiles);

  console.log(gradient.pastel.multiline('\n✨ Alignment complete! ✨'));

  if (config.target === 'github-copilot') {
    console.log(pc.cyan('\n--- VS Code + GitHub Copilot Tip ---'));
    console.log(
      'To maximize Copilot\'s awareness, add this to your workspace .vscode/settings.json:'
    );
    console.log(
      pc.gray(`
  "github.copilot.advanced": {
    "instructions": ".github/instructions"
  }
    `)
    );
  }
}

// --- HELPER FUNCTIONS ---

function ensureTargetDir(targetDir: string) {
  const spinner = ora(`Checking target directory: ${targetDir}`).start();
  if (!fs.existsSync(targetDir)) {
    spinner.text = 'Target directory not found. Creating...';
    try {
      fs.mkdirSync(targetDir, { recursive: true });
      spinner.succeed(`Created ${targetDir}`);
    } catch (error: any) {
      spinner.fail(
        pc.red(`Error creating directory: ${error.message}. Please check permissions.`)
      );
      process.exit(1);
    }
  } else {
    spinner.succeed('Target directory OK.');
  }
}
File Path: /packages/[DEFAULT_PROJECT_KEBAB]/src/utils/config-loader.tsimport * as fs from 'fs';
import * as path from 'path';
import pc from 'piccolors';
import { Config } from '[DEFAULT_PROJECT_KEBAB]-core';

export const CONFIG_FILENAME = '[DEFAULT_CLI_COMMAND].config.json';

/**
 * Loads the user's optional config file.
 * This is an IMPURE function (reads from fs).
 * @returns A partial Config object or an empty object.
 */
export function loadUserConfig(): Partial<Config> {
  const configPath = path.resolve(process.cwd(), CONFIG_FILENAME);
  
  if (!fs.existsSync(configPath)) {
    console.log(pc.gray('  No user config file found. Using built-in conventions only.'));
    return {};
  }
  
  try {
    console.log(pc.blue('  User config file found. Merging with built-in conventions.'));
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } catch (e: any) {
    console.error(
      pc.red(`❌ Error parsing ${CONFIG_FILENAME}: ${e.message}`)
    );
    console.warn(
      pc.yellow('  Please fix the JSON or remove the file. Using built-in conventions only.')
    );
    return {};
  }
}
File Path: /packages/[DEFAULT_PROJECT_KEBAB]/src/utils/config-loader.test.tsimport { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { loadUserConfig, CONFIG_FILENAME } from './config-loader';

vi.mock('fs');
vi.mock('path');
vi.spyOn(console, 'log').mockImplementation(() => {});
vi.spyOn(console, 'warn').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});

describe('loadUserConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (path.resolve as vi.Mock).mockReturnValue(CONFIG_FILENAME);
  });

  it('should return empty object if config file does not exist', () => {
    (fs.existsSync as vi.Mock).mockReturnValue(false);
    const config = loadUserConfig();
    expect(config).toEqual({});
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('No user config file found')
    );
  });

  it('should return parsed config if file exists and is valid', () => {
    const mockConfig = { dependencyTagMap: { 'my-lib': 'my-tag' } };
    (fs.existsSync as vi.Mock).mockReturnValue(true);
    (fs.readFileSync as vi.Mock).mockReturnValue(JSON.stringify(mockConfig));
    
    const config = loadUserConfig();
    
    expect(config).toEqual(mockConfig);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('User config file found')
    );
  });

  it('should return empty object and log error if config is invalid JSON', () => {
    (fs.existsSync as vi.Mock).mockReturnValue(true);
    (fs.readFileSync as vi.Mock).mockReturnValue('invalid json');
    
    const config = loadUserConfig();
    
    expect(config).toEqual({});
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Error parsing')
    );
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('Please fix the JSON')
    );
  });
});
File Path: /packages/[DEFAULT_PROJECT_KEBAB]/src/utils/file-system.tsimport * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import pc from 'piccolors';
import { ProjectAnalysisData } from '[DEFAULT_PROJECT_KEBAB]-core';

const ROOT_PACKAGE_JSON = path.resolve(process.cwd(), 'package.json');
const BUILT_IN_TEMPLATE_DIR = path.resolve(
  // Try to find the templates relative to the running script
  // This is for the `pkg` binary to find them
  path.dirname(process.execPath),
  'default_templates'
);

// Fallback for when running in 'dev' mode (e.g., npx)
const DEV_TEMPLATE_DIR = path.resolve(
  __dirname,
  '..',
  '..',
  '..',
  '[DEFAULT_PROJECT_KEBAB]-core',
  'dist',
  'default_templates'
);

export interface Project {
  name: string;
  path: string;
  tags: Set<string>;
}

/**
 * (Impure) Finds all projects in the monorepo.
 */
export async function findProjects(): Promise<Project[]> {
  const projects: Project[] = [];

  if (!fs.existsSync(ROOT_PACKAGE_JSON)) {
    throw new Error('No root package.json found. Cannot find projects.');
  }

  const rootPkg = JSON.parse(fs.readFileSync(ROOT_PACKAGE_JSON, 'utf-8'));
  const workspaces = rootPkg.workspaces?.packages || rootPkg.workspaces || [];

  // 1. Add root project
  projects.push({
    name: rootPkg.name
      ? rootPkg.name.replace(/@/g, '').replace(/\//g, '-')
      : 'root-project',
    path: '.',
    tags: new Set<string>(),
  });

  if (workspaces.length === 0) {
    return projects;
  }

  // 2. Add workspace projects
  const packageJsonPaths = await glob(
    workspaces.map((w: string) => `${w}/package.json`)
  );

  for (const pkgPath of packageJsonPaths) {
    try {
      const pkgContent = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      projects.push({
        name: pkgContent.name.replace(/@/g, '').replace(/\//g, '-'),
        path: path.dirname(pkgPath),
        tags: new Set<string>(),
      });
    } catch (e) {
      console.warn(
        pc.yellow(`⚠️  Skipping invalid package.json: ${pkgPath}`)
      );
    }
  }

  return projects;
}

/**
 * (Impure) Reads all necessary files for a project.
 */
export async function getProjectAnalysisData(
  project: Project
): Promise<ProjectAnalysisData> {
  const projectRoot = path.resolve(process.cwd(), project.path);
  
  // 1. Get Dependencies
  let dependencies = {};
  try {
    const pkgPath = path.join(projectRoot, 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      dependencies = {
        ...(pkg.dependencies || {}),
        ...(pkg.devDependencies || {}),
      };
    }
  } catch (e: any) {
    console.warn(
      pc.yellow(`⚠️  Could not parse package.json for ${project.name}: ${e.message}`)
    );
  }

  // 2. Get Config Files (just the filenames)
  const configFiles: string[] = [];
  try {
    const allFiles = fs.readdirSync(projectRoot);
    allFiles.forEach(file => {
      // Simple check for files at root
      if (file.endsWith('.config.js') || file.endsWith('.config.ts') || file === 'tsconfig.json') {
        configFiles.push(file);
      }
    });
  } catch (e: any) {
     console.warn(
      pc.yellow(`⚠️  Error scanning config files for ${project.name}: ${e.message}`)
    );
  }

  // 3. Get All Project Files (relative paths)
  let projectFiles: string[] = [];
  try {
    projectFiles = await glob('**/*', {
      cwd: projectRoot,
      nodir: true,
      dot: true,
      ignore: ['node_modules/**', 'dist/**', '.git/**'],
    });
  } catch (e: any) {
    console.warn(
      pc.yellow(`⚠️  Error scanning file globs for ${project.name}: ${e.message}`)
    );
  }
  
  return { dependencies, configFiles, projectFiles };
}

/**
 * (Impure) Reads a template file.
 * Tries user's custom dir first, then falls back to built-in.
 */
export function readTemplate(
  userTemplateDir: string,
  templateFile: string
): { content: string | null; source: string } {
  
  // 1. Try user's custom template directory
  try {
    const userPath = path.join(userTemplateDir, templateFile);
    if (fs.existsSync(userPath)) {
      return {
        content: fs.readFileSync(userPath, 'utf-8'),
        source: pc.magenta('Custom'),
      };
    }
  } catch (e) {
    // Ignore and fall through
  }

  // 2. Try built-in templates (dev mode)
  try {
    const devPath = path.join(DEV_TEMPLATE_DIR, templateFile);
     if (fs.existsSync(devPath)) {
        return {
          content: fs.readFileSync(devPath, 'utf-8'),
          source: pc.blue('Built-in (dev)'),
        };
     }
  } catch (e) {
     // Ignore and fall through
  }

  // 3. Try built-in templates (pkg binary)
  try {
    const pkgPath = path.join(BUILT_IN_TEMPLATE_DIR, templateFile);
    if (fs.existsSync(pkgPath)) {
      return {
        content: fs.readFileSync(pkgPath, 'utf-8'),
        source: pc.blue('Built-in (pkg)'),
      };
    }
  } catch (e) {
    // Ignore and fall through
  }
  
  return { content: null, source: 'Not Found' };
}

/**
 * (Impure) Asks user to prune old, un-generated files.
 */
export async function pruneOldFiles(targetDir: string, generatedFiles: string[]) {
  const existingFiles = fs
    .readdirSync(targetDir)
    .filter((f) => f.endsWith('.md'));

  const oldFiles = existingFiles.filter((f) => !generatedFiles.includes(f));

  if (oldFiles.length > 0) {
    console.warn(
      pc.yellow(`\n⚠️  Found ${oldFiles.length} instruction files that are no longer generated:`)
    );
    oldFiles.forEach((f) => console.warn(pc.yellow(`  - ${f}`)));

    const { prune } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'prune',
        message: `Do you want to delete these ${oldFiles.length} old files?`,
        default: false,
      },
    ]);

    if (prune) {
      let deleteCount = 0;
      for (const file of oldFiles) {
        try {
          fs.unlinkSync(path.join(targetDir, file));
          deleteCount++;
        } catch (e: any) {
          console.error(pc.red(`  ❌ Error deleting ${file}: ${e.message}`));
        }
      }
      console.log(pc.green(`✅ Pruned ${deleteCount} old files.`));
    }
  }
}
File Path: /packages/[DEFAULT_PROJECT_KEBAB]/src/utils/file-system.test.tsimport { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import { findProjects, getProjectAnalysisData } from './file-system';

vi.mock('fs');
vi.mock('glob');
vi.mock('path', async () => {
  const actualPath = await vi.importActual<typeof path>('path');
  return {
    ...actualPath,
    resolve: vi.fn((...args) => args.join('/')),
    join: vi.fn((...args) => args.join('/')),
    dirname: vi.fn(actualPath.dirname),
  };
});
vi.spyOn(console, 'warn').mockImplementation(() => {});

describe('findProjects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should find root project and workspace projects', async () => {
    (fs.existsSync as vi.Mock).mockReturnValue(true);
    (fs.readFileSync as vi.Mock).mockImplementation((p) => {
      if (p === 'CWD/package.json' || p === './package.json') {
        return JSON.stringify({ name: 'root', workspaces: ['packages/*'] });
      }
      if (p === 'packages/app-one/package.json') {
        return JSON.stringify({ name: '@scope/app-one' });
      }
      return '{}';
    });
    (glob as unknown as vi.Mock).mockResolvedValue(['packages/app-one/package.json']);
    (path.resolve as vi.Mock).mockImplementation((...args) => (args.includes('package.json') ? './package.json' : 'CWD'));
    
    const projects = await findProjects();
    
    expect(projects).toHaveLength(2);
    expect(projects[0].name).toBe('root');
    expect(projects[1].name).toBe('scope-app-one');
    expect(projects[1].path).toBe('packages/app-one');
  });

  it('should throw if no root package.json is found', async () => {
    (fs.existsSync as vi.Mock).mockReturnValue(false);
    (path.resolve as vi.Mock).mockImplementation(() => 'CWD/package.json');
    await expect(findProjects()).rejects.toThrow('No root package.json found');
  });
});

describe('getProjectAnalysisData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (path.resolve as vi.Mock).mockImplementation((...args) => args.join('/'));
  });
  
  it('should read deps, config files, and project files', async () => {
    (fs.existsSync as vi.Mock).mockReturnValue(true);
    (fs.readFileSync as vi.Mock).mockImplementation((p) => {
      if (p.endsWith('package.json')) {
        return JSON.stringify({ dependencies: { vue: '3.0.0' } });
      }
      return '';
    });
    (fs.readdirSync as vi.Mock).mockReturnValue(['tailwind.config.js', 'README.md']);
    (glob as unknown as vi.Mock).mockResolvedValue(['src/main.ts', 'tailwind.config.js']);

    const project = { name: 'test-project', path: 'packages/test', tags: new Set<string>() };
    const data = await getProjectAnalysisData(project);

    expect(data.dependencies).toEqual({ vue: '3.0.0' });
    expect(data.configFiles).toEqual(['tailwind.config.js']);
    expect(data.projectFiles).toEqual(['src/main.ts', 'tailwind.config.js']);
  });
});
File Path: /packages/vscode-[DEFAULT_PROJECT_KEBAB]/package.json{
  "name": "vscode-[DEFAULT_PROJECT_KEBAB]",
  "displayName": "[DEFAULT_PROJECT_NAME] Runner",
  "description": "Runs the [DEFAULT_PROJECT_NAME] CLI from the VS Code Command Palette.",
  "version": "0.1.0",
  "publisher": "[DEFAULT_PUBLISHER_NAME]",
  "repository": {
    "type": "git",
    "url": "[https://github.com/](https://github.com/)[DEFAULT_GITHUB_USERNAME]/[DEFAULT_PROJECT_KEBAB].git"
  },
  "engines": {
    "vscode": "^1.85.0"
  },
  "categories": [
    "Other"
  ],
  "activationEvents": [
    "onCommand:[DEFAULT_CLI_COMMAND].run"
  ],
  "main": "./dist/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "[DEFAULT_CLI_COMMAND].run",
        "title": "[DEFAULT_PROJECT_NAME]: Align Conventions"
      }
    ]
  },
  "scripts": {
    "build": "tsc --build",
    "test": "vscode-test-cli run-tests dist/test/suite/index.js"
  },
  "dependencies": {
    "[DEFAULT_PROJECT_KEBAB]": "workspace:^0.1.0"
  }
}
File Path: /packages/vscode-[DEFAULT_PROJECT_KEBAB]/tsconfig.json{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "lib": [
      "es2020"
    ]
  },
  "include": [
    "src"
  ],
  "references": []
}
File Path: /packages/vscode-[DEFAULT_PROJECT_KEBAB]/README.md# [DEFAULT_PROJECT_NAME] VS Code Runner

This extension provides a simple command palette wrapper for the `[DEFAULT_PROJECT_KEBAB]` CLI.

## Features

* Adds the **"[DEFAULT_PROJECT_NAME]: Align Conventions"** command to the command palette.
* Runs `npx [DEFAULT_CLI_COMMAND] run` in an integrated terminal.

## Development

This package is intended to be developed as part of the `[DEFAULT_PROJECT_KEBAB]` monorepo. See the [monorepo root README.md](../../README.md) for full instructions on how to run this in "Dev Mode".
File Path: /packages/vscode-[DEFAULT_PROJECT_KEBAB]/.vscodeignoredist/**
node_modules/**
src/**
File Path: /packages/vscode-[DEFAULT_PROJECT_KEBAB]/src/extension.tsimport * as vscode from 'vscode';

let terminal: vscode.Terminal | undefined;

export function activate(context: vscode.ExtensionContext) {

  // Register the main command
  let disposable = vscode.commands.registerCommand('[DEFAULT_CLI_COMMAND].run', () => {
    
    // Check for open workspace
    if (!vscode.workspace.workspaceFolders) {
      vscode.window.showErrorMessage('[DEFAULT_PROJECT_NAME]: You must have a project or folder open.');
      return;
    }

    // Use the existing terminal or create a new one
    if (!terminal || terminal.exitStatus) {
      terminal = vscode.window.createTerminal('[DEFAULT_PROJECT_NAME]');
    }

    terminal.show();
    terminal.sendText('npx [DEFAULT_CLI_COMMAND] run');
    
    vscode.window.showInformationMessage('Running [DEFAULT_PROJECT_NAME]...');
  });

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {
  if (terminal) {
    terminal.dispose();
  }
}
File Path: /packages/vscode-[DEFAULT_PROJECT_KEBAB]/src/test/runTest.tsimport { runTests } from '@vscode/test-cli';
import * as path from 'path';

async function main() {
  try {
    // The folder containing the Extension Manifest package.json
    // Passed to `--extensionDevelopmentPath`
    const extensionDevelopmentPath = path.resolve(__dirname, '../../');

    // The path to the extension test script
    // Passed to --extensionTestsPath
    const extensionTestsPath = path.resolve(__dirname, './suite/index');

    // Download VS Code, unzip it and run the integration test
    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
    });
  } catch (err) {
    console.error('Failed to run tests', err);
    process.exit(1);
  }
}

main();
File Path: /packages/vscode-[DEFAULT_PROJECT_KEBAB]/src/test/suite/index.tsimport * as path from 'path';
import * as Mocha from 'mocha';
import { glob } from 'glob';

export async function run(): Promise<void> {
  // Create the mocha test
  const mocha = new Mocha({
    ui: 'tdd',
    color: true,
  });

  const testsRoot = path.resolve(__dirname, '..');

  const files = await glob('**/**.test.js', { cwd: testsRoot });
  
  // Add files to the test suite
  files.forEach((f) => mocha.addFile(path.resolve(testsRoot, f)));

  return new Promise((c, e) => {
    try {
      // Run the mocha test
      mocha.run((failures) => {
        if (failures > 0) {
          e(new Error(`${failures} tests failed.`));
        } else {
          c();
        }
      });
    } catch (err) {
      console.error(err);
      e(err);
    }
  });
}
File Path: /packages/vscode-[DEFAULT_PROJECT_KEBAB]/src/test/suite/extension.test.tsimport * as assert from 'assert';
import * as vscode from 'vscode';
import { suite, test } from 'mocha';

suite('Extension Test Suite', () => {
  test('Should register the command', async () => {
    // Wait for the extension to activate
    await vscode.extensions.getExtension('[DEFAULT_PUBLISHER_NAME].vscode-[DEFAULT_PROJECT_KEBAB]')?.activate();
    
    const commands = await vscode.commands.getCommands(true);
    const commandExists = commands.includes('[DEFAULT_CLI_COMMAND].run');
    
    assert.strictEqual(
      commandExists,
      true,
      `The command "[DEFAULT_CLI_COMMAND].run" is not registered.`
    );
  });
});
File Path: /packages/[DEFAULT_PROJECT_KEBAB]-web/package.json{
  "name": "[DEFAULT_PROJECT_KEBAB]-web",
  "version": "0.1.0",
  "private": true,
  "description": "A web-based playground for the [DEFAULT_PROJECT_NAME] core engine.",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "[DEFAULT_PROJECT_KEBAB]-core": "workspace:^0.1.0",
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
File Path: /packages/[DEFAULT_PROJECT_KEBAB]-web/README.md# ✨ [DEFAULT_PROJECT_NAME] (Web Playground) ✨

This package is a Vue 3 + Vite + PrimeVue application that acts as a live playground for the `[DEFAULT_PROJECT_KEBAB]-core` engine.

It runs entirely in the browser using the File System Access API.

## Development

From the monorepo root, run:

```bash
npm run dev:web

---
---

# File Path: /packages/[DEFAULT_PROJECT_KEBAB]-web/tsconfig.json
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
      "path": "../[DEFAULT_PROJECT_KEBAB]-core"
    }
  ]
}
File Path: /packages/[DEFAULT_PROJECT_KEBAB]-web/vite.config.tsimport { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// [https://vitejs.dev/config/](https://vitejs.dev/config/)
export default defineConfig({
  plugins: [vue()],
  // Base path for GitHub Pages deployment
  base: process.env.NODE_ENV === 'production' ? '/[DEFAULT_PROJECT_KEBAB]/' : '/',
  build: {
    // Relative to the root of the package
    outDir: 'dist',
  },
});
File Path: /packages/[DEFAULT_PROJECT_KEBAB]-web/tailwind.config.js/** @type {import('tailwindcss').Config} */
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
File Path: /packages/[DEFAULT_PROJECT_KEBAB]-web/postcss.config.jsexport default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
File Path: /packages/[DEFAULT_PROJECT_KEBAB]-web/index.html<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>[DEFAULT_PROJECT_NAME] Playground</title>
  </head>
  <body class="bg-gray-900 text-gray-100 antialiased">
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
File Path: /packages/[DEFAULT_PROJECT_KEBAB]-web/src/main.tsimport { createApp } from 'vue';
import App from './App.vue';
import PrimeVue from 'primevue/config';
import { primeVueConfig } from './primevue-config';

// Import base Tailwind styles
import './index.css';

const app = createApp(App);

app.use(PrimeVue, primeVueConfig);

app.mount('#app');
File Path: /packages/[DEFAULT_PROJECT_KEBAB]-web/src/primevue-config.tsimport 'primevue/resources/themes/aura-dark-green/theme.css';
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
File Path: /packages/[DEFAULT_PROJECT_KEBAB]-web/src/shims-vue.d.tsdeclare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
File Path: /packages/[DEFAULT_PROJECT_KEBAB]-web/src/App.vue<template>
  <div class="min-h-screen bg-gray-900 p-4 md:p-8">
    <div class="max-w-6xl mx-auto">
      <header class="flex items-center justify-between mb-8">
        <h1 class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
          ✨ [DEFAULT_PROJECT_NAME] Playground
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
} from '[DEFAULT_PROJECT_KEBAB]-core';

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
# Auto-generated by [DEFAULT_CLI_COMMAND] for: ${projectName}
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
File Path: /packages/[DEFAULT_PROJECT_KEBAB]-web/src/index.css/* This file is referenced in main.ts */
@tailwind base;
@tailwind components;
@tailwind utilities;
