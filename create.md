MagicAgentHelix - All Project Files (Monorepo)This file contains the complete source code for the magic-agent-helix monorepo.The monorepo contains two packages:/packages/magic-agent-helix: The CLI tool./packages/vscode-magic-helix: The VS Code extension wrapper.File Path: /file-list.md (For your reference)# MagicAgentHelix - Project File List

Here is the complete file structure for the monorepo.

## Root Directory (`/`)

* `.biome.json`
* `.gitignore`
* `.releaserc.json`
* `package.json` (Monorepo Root)
* `README.md` (Monorepo Root)
* `tsconfig.base.json` (NEW - Base TSConfig)
* `vitest.config.ts`

## `.github/` Directory

* **`.github/workflows/`**
    * `.github/workflows/release.yml`

## `.vscode/` Directory (For Dev Mode)

* `.vscode/launch.json` (NEW - Enables F5 "Run Extension")

## `packages/` Directory

### CLI Package (`packages/magic-agent-helix/`)

* `packages/magic-agent-helix/package.json` (CLI Package)
* `packages/magic-agent-helix/README.md` (CLI Readme)
* `packages/magic-agent-helix/tsconfig.json` (CLI TSConfig)
* `packages/magic-agent-helix/scripts/copy-templates.js`
* **`packages/magic-agent-helix/src/`**
    * `packages/magic-agent-helix/src/built-in-config.ts`
    * `packages/magic-agent-helix/src/cli.ts`
    * `packages/magic-agent-helix/src/types.ts`
    * **`packages/magic-agent-helix/src/commands/`**
        * `packages/magic-agent-helix/src/commands/init.ts`
        * `packages/magic-agent-helix/src/commands/run.ts`
    * **`packages/magic-agent-helix/src/core/`**
        * `packages/magic-agent-helix/src/core/config-merger.ts`
        * `packages/magic-agent-helix/src/core/config-merger.test.ts`
    * **`packages/magic-agent-helix/src/default_templates/`**
        * (All 10 template .md files)

### VS Code Plugin (`packages/vscode-magic-helix/`) (NEW)

* `packages/vscode-magic-helix/package.json` (VS Code Extension Manifest)
* `packages/vscode-magic-helix/README.md` (VS Code Readme)
* `packages/vscode-magic-helix/tsconfig.json` (VS Code TSConfig)
* `packages/vscode-magic-helix/.vscodeignore` (NEW)
* **`packages/vscode-magic-helix/src/`**
    * `packages/vscode-magic-helix/src/extension.ts` (NEW - Plugin Entry Point)
File Path: /.gitignore# Dependencies
/node_modules
/packages/**/node_modules

# Build output
/packages/**/dist

# Release binaries
/packages/magic-agent-helix/release

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

# Semantic Release
.semantic-release-cache/
File Path: /package.json (Monorepo Root){
  "name": "magic-agent-helix-monorepo",
  "version": "0.1.0",
  "private": true,
  "description": "Monorepo for MagicAgentHelix CLI and VS Code Extension",
  "workspaces": [
    "packages/*"
  ],
  "engines": {
    "node": "^20.11.1 || >=22.0.0"
  },
  "scripts": {
    "build": "npm run build --workspace=magic-agent-helix && npm run build --workspace=vscode-magic-helix",
    "build:cli": "npm run build --workspace=magic-agent-helix",
    "build:vscode": "npm run build --workspace=vscode-magic-helix",
    "lint": "biome lint .",
    "format": "biome format --write .",
    "test": "vitest run",
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
    "@types/node": "^20.11.0",
    "@types/vscode": "^1.85.0",
    "@vitest/coverage-v8": "^2.0.4",
    "conventional-changelog-conventionalcommits": "^8.0.0",
    "pkg": "^5.8.1",
    "semantic-release": "^24.0.0",
    "typescript": "^5.5.4",
    "vitest": "^2.0.4"
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
        "changelogFile": "packages/magic-agent-helix/CHANGELOG.md"
      }
    ],
    [
      "@semantic-release/npm",
      {
        "pkgRoot": "packages/magic-agent-helix"
      }
    ],
    [
      "@semantic-release/exec",
      {
        "prepareCmd": "npm run build:pkg --workspace=magic-agent-helix"
      }
    ],
    [
      "@semantic-release/github",
      {
        "assets": "packages/magic-agent-helix/release/*"
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

      - name: Test & Coverage
        run: npm run test:coverage

      - name: Build Packages
        run: npm run build

      - name: Semantic Release
        run: npx semantic-release
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
          GH_TOKEN: ${{ secrets.GH_TOKEN }}
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
    // Look for tests in *all* packages
    include: ['packages/**/*.test.ts', 'packages/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      // Target only the CLI for coverage, not the VSCode plugin wrapper
      include: ['packages/magic-agent-helix/src/**/*.ts'],
      exclude: ['packages/vscode-magic-helix/**'],
    },
    globals: true,
  },
});
File Path: /tsconfig.base.json (NEW){
  "compilerOptions": {
    "module": "commonjs",
    "target": "es2020",
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

* `packages/magic-agent-helix`: The core CLI tool, published to NPM and as cross-platform binaries.
* `packages/vscode-magic-helix`: The VS Code extension that provides a "Run" command.

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
3.  **Lint / Format / Test (from root):**
    ```bash
    npm run lint
    npm run format
    npm run test
    ```

### Testing the VS Code Plugin (Dev Mode)

This is the best way to test the CLI in a real-world scenario.

1.  Open this monorepo root folder in VS Code.
2.  Make sure you've run `npm install` and `npm run build` at least once.
3.  Go to the "Run and Debug" panel (Ctrl+Shift+D).
4.  Select **"Run VS Code Extension (Dev Mode)"** from the dropdown and press F5 (the green play button).
5.  A new VS Code window (the "Extension Development Host") will open. This window has your local `vscode-magic-helix` plugin installed.
6.  Open any test project (like a simple Vue or React app) in this *new* window.
7.  Open the Command Palette (Ctrl+Shift+P) and type: **"MagicAgentHelix: Align Conventions"**.
8.  Press Enter. The plugin will open a new terminal and run `npx magic-helix run`, executing your local CLI code against the test project.
File Path: /.vscode/launch.json (NEW){
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Run VS Code Extension (Dev Mode)",
      "type": "extensionHost",
      "request": "launch",
      "args": [
        "--extensionDevelopmentPath=${workspaceFolder}/packages/vscode-magic-helix"
      ],
      "outFiles": [
        "${workspaceFolder}/packages/vscode-magic-helix/dist/**/*.js"
      ],
      "preLaunchTask": "npm: build:vscode"
    }
  ]
}
File Path: /packages/magic-agent-helix/package.json (CLI){
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
    "build": "tsc --build && node ./scripts/copy-templates.js",
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
    "ora": "^9.0.0",
    "picocolors": "^1.0.1"
  },
  "files": [
    "dist/**/*",
    "README.md",
    "CHANGELOG.md"
  ]
}
File Path: /packages/magic-agent-helix/tsconfig.json (CLI){
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
File Path: /packages/magic-agent-helix/README.md (CLI)# ✨ MagicAgentHelix (The CLI) ✨

This is the core CLI package for MagicAgentHelix. It contains all the logic for scanning projects and generating AI instruction files.

It is designed to be used in two ways:
1.  As an `npm` package (`npx magic-helix run`).
2.  As a standalone binary (downloaded from GitHub Releases).

See the [monorepo root README.md](../../README.md) for full usage and development instructions.
File Path: /packages/magic-agent-helix/scripts/copy-templates.js// This script recursively copies the package's default templates
// from 'src/default_templates' into the build ('dist/default_templates')
// folder so the 'run' command can find them.

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
File Path: /packages/magic-agent-helix/src/built-in-config.ts(Content is identical to the previous version, just a new path)import { Config } from './types';
// ... (rest of the file is identical) ...
export const BUILT_IN_CONFIG: Config = {
  target: 'github-copilot',
// ... (rest of the file is identical) ...
};
File Path: /packages/magic-agent-helix/src/cli.ts(Content is identical to the previous version, just a new path)#!/usr/bin/env node
import { Command } from 'commander';
// ... (rest of the file is identical) ...
File Path: /packages/magic-agent-helix/src/types.ts(Content is identical to the previous version, just a new path)// This file defines the structure of the user-facing config file.
// ... (rest of the file is identical) ...
export interface Config {
// ... (rest of the file is identical) ...
}
File Path: /packages/magic-agent-helix/src/commands/init.ts(Content is identical to the previous version, just a new path)import * as fs from 'fs';
// ... (rest of the file is identical) ...
const CONFIG_FILENAME = 'magic-helix.config.json';
// ... (rest of the file is identical) ...
export async function init() {
// ... (rest of the file is identical) ...
}
File Path: /packages/magic-agent-helix/src/commands/run.ts(Content is identical to the previous version, just a new path)import * as fs from 'fs';
// ... (rest of the file is identical) ...
import {
  loadUserConfig,
  mergeConfigs,
  CONFIG_FILENAME,
} from '../core/config-merger';
// ... (rest of the file is identical) ...
export async function run() {
// ... (rest of the file is identical) ...
}
// ... (rest of the file is identical) ...
File Path: /packages/magic-agent-helix/src/core/config-merger.ts(Content is identical to the previous version, just a new path)import * as fs from 'fs';
// ... (rest of the file is identical) ...
export const CONFIG_FILENAME = 'magic-helix.config.json';
// ... (rest of the file is identical) ...
export function loadUserConfig(): Partial<Config> {
// ... (rest of the file is identical) ...
}
// ... (rest of the file is identical) ...
export function mergeConfigs(userConfig: Partial<Config>): Config {
// ... (rest of the file is identical) ...
}
File Path: /packages/magic-agent-helix/src/core/config-merger.test.ts(Content is identical to the previous version, just a new path)import { describe, it, expect, vi } from 'vitest';
// ... (rest of the file is identical) ...
File Path: /packages/magic-agent-helix/src/default_templates/... (All 10 .md files)(The content of these 10 template files is identical, they are just moved to this new path)# File Path: /packages/magic-agent-helix/src/default_templates/generic/lang-typescript.md
# Language: TypeScript
* **ALWAYS** use strict mode (`"strict": true`).
...
(...and so on for all 10 template files...)File Path: /packages/vscode-magic-helix/package.json (NEW){
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
    "build": "tsc --build"
  }
}
File Path: /packages/vscode-magic-helix/tsconfig.json (NEW){
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
File Path: /packages/vscode-magic-helix/README.md (NEW)# MagicAgentHelix VS Code Runner

This extension provides a simple command palette wrapper for the `magic-agent-helix` CLI.

## Features

* Adds the **"MagicAgentHelix: Align Conventions"** command to the command palette.
* Runs `npx magic-helix run` in an integrated terminal.

## Development

This package is intended to be developed as part of the `magic-agent-helix` monorepo. See the [monorepo root README.md](../../README.md) for full instructions on how to run this in "Dev Mode".
File Path: /packages/vscode-magic-helix/.vscodeignore (NEW)dist/**
node_modules/**
src/**
File Path: /packages/vscode-magic-helix/src/extension.ts (NEW)import * as vscode from 'vscode';

let terminal: vscode.Terminal | undefined;

export function activate(context: vscode.ExtensionContext) {

  // Register the main command
  let disposable = vscode.commands.registerCommand('magic-helix.run', () => {
    
    // Check for open workspace
    if (!vscode.workspace.workspaceFolders) {
      vscode.window.showErrorMessage('MagicAgentHelix: You must have a project or folder open.');
      return;
    }

    // Use the existing terminal or create a new one
    if (!terminal || terminal.exitStatus) {
      terminal = vscode.window.createTerminal('MagicAgentHelix');
    }

    terminal.show();
    terminal.sendText('npx magic-helix run');
    
    vscode.window.showInformationMessage('Running MagicAgentHelix...');
  });

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {
  if (terminal) {
    terminal.dispose();
  }
}
