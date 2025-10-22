AI Convention Aligner - All Project FilesThis file contains the complete source code for the ai-convention-aligner package. The content for each file is provided below, clearly marked with its intended file path.File Path: /.gitignore# Dependencies
/node_modules

# Build output
/dist

# IDE
.vscode
.idea

# OS
.DS_Store
Thumbs.db

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
File Path: /package.json{
  "name": "ai-convention-aligner",
  "version": "0.1.0",
  "description": "A CLI to inspect a monorepo and generate granular, path-specific AI instructions from built-in and custom conventions.",
  "bin": {
    "ai-aligner": "./dist/cli.js"
  },
  "scripts": {
    "build": "tsc && node ./scripts/copy-templates.js",
    "prepublishOnly": "npm run build"
  },
  "keywords": [
    "copilot",
    "github-copilot",
    "ai",
    "conventions",
    "monorepo",
    "cli",
    "open-source"
  ],
  "author": "Your Name / Community",
  "license": "MIT",
  "devDependencies": {
    "@types/glob": "^8.1.0",
    "@types/inquirer": "^9.0.7",
    "@types/node": "^20.11.24",
    "typescript": "^5.3.3"
  },
  "dependencies": {
    "commander": "^12.0.0",
    "glob": "^10.3.10",
    "inquirer": "^9.2.15"
  },
  "files": [
    "dist/**/*",
    "README.md"
  ]
}
File Path: /README.md# AI Convention Aligner

`ai-convention-aligner` is a powerful CLI tool that scans your monorepo (or single project) and automatically generates granular, path-specific instruction files for AI agents like GitHub Copilot.

Instead of writing messy, one-size-fits-all instruction files, this tool inspects your projects and applies pre-configured, best-practice conventions for the exact technologies you're using (Vue, React, NestJS, Tailwind, etc.).

## Features

- **Smart Inspection**: Automatically detects technologies by scanning `package.json`, config files (`tailwind.config.js`, etc.), and file types (`*.vue`).
- **Granular Generation**: Creates small, specific instruction files (e.g., `my-app.vue-core.md`, `my-app.style-tailwind.md`) in your `.github/instructions/` directory.
- **Correct Scoping**: Automatically writes the correct `applyTo` glob patterns in each file's header.
- **Built-in Conventions**: Comes with a powerful set of built-in rules for most common web technologies.
- **Extensible**: Easily add your own custom rules for your team's internal packages or unique coding patterns.

## Getting Started

### 1. Install

Install the package as a dev dependency in your monorepo's root:

\`\`\`bash
npm install ai-convention-aligner --save-dev
\`\`\`

### 2. Run

Run the tool to scan your project(s) and generate the instruction files:

\`\`\`bash
npx ai-aligner run
\`\`\`

The tool will scan all workspaces defined in your root `package.json` (and the root project itself) and place the generated files in `.github/instructions/`.

### 3. (Optional) Extend with Custom Rules

To add your own team-specific rules:

1.  Run the `init` command to create a config file:
    \`\`\`bash
    npx ai-aligner init
    \`\`\`
2.  This creates two things:
    * `ai-aligner.config.json`: A minimal config file.
    * `ai_templates/`: A folder to store your custom `.md` template files.
3.  Add your custom rule to `ai_templates/` (e.g., `my-custom-rule.md`).
4.  Edit `ai-aligner.config.json` to tell the tool when to apply your rule:

    \`\`\`json
    {
      // ...
      "dependencyTagMap": {
        "my-internal-package": "domain-my-rules"
      },
      // ...
      "tagTemplateMap": {
        "domain-my-rules": [
          { "template": "my-custom-rule.md", "suffix": "my-rule.md" }
        ]
      }
    }
    \`\`\`
5.  Re-run `npx ai-aligner run`. The tool will merge its built-in rules with your custom ones.

### 4. Configure VS Code (Recommended)

To ensure GitHub Copilot *always* reads these files, add this to your workspace's `.vscode/settings.json`:

\`\`\`json
{
  "github.copilot.advanced": {
    "instructions": ".github/instructions"
  }
}
\`\`\`

Restart VS Code, and you're all set!
File Path: /tsconfig.json{
  "compilerOptions": {
    "module": "commonjs",
    "target": "es2020",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "resolveJsonModule": true
  },
  "include": [
    "src/**/*.ts"
  ]
}
File Path: /scripts/copy-templates.js// This script recursively copies the package's default templates
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
File Path: /src/built-in-config.tsimport { Config } from './types';

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
File Path: /src/cli.ts#!/usr/bin/env node

import { Command } from 'commander';
import { run } from './commands/run';
import { init } from './commands/init';

// This is the main entry point for the CLI tool.
// It uses 'commander' to set up sub-commands: 'init' and 'run'.

async function main() {
  const program = new Command();
  
  program
    .name('ai-aligner')
    .description('A CLI to align AI instructions in your monorepo.')
    .version('0.1.0'); // This should match package.json

  program
    .command('init')
    .description('Initialize a custom ai-aligner.config.json to extend the built-in rules.')
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
  console.error(`❌ An unexpected error occurred: ${err.message}`);
  process.exit(1);
});
File Path: /src/types.ts// This file defines the structure of the user-facing config file.

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
 * The structure of the ai-aligner.config.json file.
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
File Path: /src/commands/init.tsimport * as fs from 'fs';
import * as path from 'path';
import inquirer from 'inquirer';
import { Config } from '../types';

// --- CONFIGURATION ---
const CONFIG_FILENAME = 'ai-aligner.config.json';
const DEFAULT_TEMPLATE_DIR = 'ai_templates';

// This is the *minimal* config file 'init' will create.
// It's designed for users who want to *extend* the built-in rules.
const MINIMAL_USER_CONFIG: Config = {
  target: 'github-copilot',
  templateDirectory: DEFAULT_TEMPLATE_DIR,
  outputDirectory: '.github/instructions',
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
 * Creates a minimal config file and template directory
 * for users who want to *extend* the built-in conventions.
 */
export async function init() {
  console.log('🤖 Initializing AI Aligner for custom rules...');
  
  const configPath = path.resolve(process.cwd(), CONFIG_FILENAME);
  const templatePath = path.resolve(process.cwd(), DEFAULT_TEMPLATE_DIR);

  // Check if config file already exists
  if (fs.existsSync(configPath)) {
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: `A ${CONFIG_FILENAME} file already exists. Do you want to overwrite it with a minimal example?`,
        default: false,
      },
    ]);
    if (!overwrite) {
      console.log('Operation cancelled.');
      return;
    }
  }

  // 1. Write the minimal config file
  fs.writeFileSync(
    configPath,
    JSON.stringify(MINIMAL_USER_CONFIG, null, 2),
    'utf-8'
  );
  console.log(`✅ Created minimal config file: ${CONFIG_FILENAME}`);

  // 2. Create the templates directory
  if (!fs.existsSync(templatePath)) {
    fs.mkdirSync(templatePath, { recursive: true });
    console.log(`✅ Created templates directory: ${DEFAULT_TEMPLATE_DIR}`);
  }

  // 3. Copy *one* example file to show them how it works
  const exampleTemplatePath = path.resolve(templatePath, 'my-custom-rule.md');
  if (!fs.existsSync(exampleTemplatePath)) {
    fs.writeFileSync(
      exampleTemplatePath,
      '# My Team\'s Custom Rule\n- This rule is specific to our "domain-my-rules" tag.\n- ALWAYS follow this important pattern.\n',
      'utf-8'
    );
    console.log(`✅ Added example template: ${DEFAULT_TEMPLATE_DIR}/my-custom-rule.md`);
  }

  console.log(
    `\n✨ Success! Edit ${CONFIG_FILENAME} and add files to ${DEFAULT_TEMPLATE_DIR} to define your team's *custom* conventions.`
  );
  console.log(`The tool will *merge* your rules with its built-in rules for Vue, React, etc.`);
  console.log(`Run 'npx ai-aligner run' to generate your instruction files.`);
}
File Path: /src/commands/run.tsimport * as fs from 'fs';
import * as path from 'path';
import inquirer from 'inquirer';
import { glob } from 'glob';
import {
  Config,
  DependencyTagMap,
  ConfigFileTagMap,
  FileGlobTagMap,
  TagTemplateMap,
} from '../types';
import { BUILT_IN_CONFIG } from '../built-in-config';

// --- CONFIGURATION ---
const CONFIG_FILENAME = 'ai-aligner.config.json';
const ROOT_PACKAGE_JSON = path.resolve(process.cwd(), 'package.json');
const BUILT_IN_TEMPLATE_DIR = path.resolve(__dirname, '..', 'default_templates');

// --- TYPES ---
interface Project {
  name: string; // Sanitized package name, e.g., 'scope-my-app'
  path: string; // Relative path from root, e.g., 'packages/my-app'
  tags: Set<string>;
}

/**
 * The 'run' command.
 * Scans the monorepo and generates instruction files.
 */
export async function run() {
  console.log('🤖 Running AI Convention Aligner...');

  // 1. Load Configs (Built-in + Optional User)
  const userConfig = loadUserConfig();
  const config = mergeConfigs(BUILT_IN_CONFIG, userConfig);

  const { 
    dependencyTagMap, 
    configFileTagMap,
    fileGlobTagMap,
    tagTemplateMap, 
  } = config;
  
  const userTemplateDir = path.resolve(process.cwd(), config.templateDirectory);
  const targetDir = path.resolve(process.cwd(), config.outputDirectory);

  // 2. Find all projects
  const projects = await findProjects();
  if (projects.length === 0) {
    console.warn(
      'No projects found. Make sure your root package.json has a "workspaces" field.'
    );
    return;
  }
  console.log(
    `Found ${projects.length} projects. Analyzing dependencies using all rules...`
  );

  // 3. Analyze dependencies and tag projects
  for (const project of projects) {
    await analyzeProject(project, dependencyTagMap, configFileTagMap, fileGlobTagMap);
  }

  // 4. Ensure target directory exists
  ensureTargetDir(targetDir);

  // 5. Generate files
  const generatedFiles: string[] = [];
  for (const project of projects) {
    if (project.tags.size === 0) {
      console.log(`\nSkipping: ${project.name} (No matching tags)`);
      continue;
    }

    console.log(`\nProcessing: ${project.name} (Tags: ${[...project.tags].join(', ')})`);

    const globPattern = `${project.path}/src/**/*.{ts,js,vue,tsx,jsx,go,py}`;

    for (const tag of project.tags) {
      const templates = tagTemplateMap[tag];
      if (!templates) continue;

      for (const t of templates) {
        // Check for template in user's dir *first*, then fall back to built-in
        let templateContent = readTemplate(userTemplateDir, t.template);
        let source = 'Custom';

        if (!templateContent) {
          templateContent = readTemplate(BUILT_IN_TEMPLATE_DIR, t.template);
          source = 'Built-in';
        }
        
        if (!templateContent) {
            console.warn(`  ⚠️  Template not found: ${t.template}`);
            continue;
        }

        const header = \`---
# Auto-generated by ai-aligner for: \${project.name}
# Source Template: \${t.template} (\${source})
applyTo: "\${globPattern}"
---
\`;
        const fullContent = header + '\n' + templateContent;
        
        const outputFilename = \`\${project.name}.\${t.suffix}\`;
        const outputPath = path.join(targetDir, outputFilename);
        
        generatedFiles.push(outputFilename);
        fs.writeFileSync(outputPath, fullContent);
        console.log(\`  ✅ Generated: \${outputFilename} (from \${source})\`);
      }
    }
  }

  // 6. Pruning: Ask to remove old files
  await pruneOldFiles(targetDir, generatedFiles);

  console.log('\n✨ Alignment complete!');
  console.log(\`Generated files are in: \${config.outputDirectory}\`);

  if (config.target === 'github-copilot') {
    console.log('\n--- VS Code + GitHub Copilot Tip ---');
    console.log('To maximize Copilot\'s awareness, add this to your workspace .vscode/settings.json:');
    console.log(\`
  "github.copilot.advanced": {
    "instructions": ".github/instructions"
  }
    \`);
    console.log('This tells Copilot to *always* read these files. Restart VS Code after adding.');
  }
}

// --- HELPER FUNCTIONS ---

function loadUserConfig(): Partial<Config> {
  const configPath = path.resolve(process.cwd(), CONFIG_FILENAME);
  if (!fs.existsSync(configPath)) {
    console.log('No user config file found. Using built-in conventions only.');
    return {};
  }
  try {
    console.log('User config file found. Merging with built-in conventions.');
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } catch (e) {
    console.error(\`❌ Error parsing \${CONFIG_FILENAME}: \${e.message}\`);
    console.log('Please fix the JSON or remove the file. Using built-in conventions only.');
    return {};
  }
}

function mergeConfigs(base: Config, user: Partial<Config>): Config {
  return {
    target: user.target || base.target,
    templateDirectory: user.templateDirectory || base.templateDirectory,
    outputDirectory: user.outputDirectory || base.outputDirectory,
    dependencyTagMap: {
      ...base.dependencyTagMap,
      ...(user.dependencyTagMap || {}),
    },
    configFileTagMap: {
      ...base.configFileTagMap,
      ...(user.configFileTagMap || {}),
    },
    fileGlobTagMap: {
      ...base.fileGlobTagMap,
      ...(user.fileGlobTagMap || {}),
    },
    tagTemplateMap: {
      ...base.tagTemplateMap,
      ...(user.tagTemplateMap || {}),
    },
  };
}

function ensureTargetDir(targetDir: string) {
  if (!fs.existsSync(targetDir)) {
    console.log(\`Target directory not found. Creating it at \${targetDir}\`);
    try {
      fs.mkdirSync(targetDir, { recursive: true });
      console.log(\`✅ Created \${targetDir}\`);
    } catch (error) {
      console.error(
        \`❌ Error creating directory: \${error.message}. Please check permissions.\`
      );
      process.exit(1);
    }
  }
}

async function findProjects(): Promise<Project[]> {
  const projects: Project[] = [];
  
  if (!fs.existsSync(ROOT_PACKAGE_JSON)) {
    console.warn('No root package.json found. Cannot find projects.');
    return [];
  }
  
  const rootPkg = JSON.parse(fs.readFileSync(ROOT_PACKAGE_JSON, 'utf-8'));
  const workspaces = rootPkg.workspaces?.packages || rootPkg.workspaces || [];

  // 1. Add root project
  projects.push({
    name: rootPkg.name ? rootPkg.name.replace(/@/g, '').replace(/\//g, '-') : 'root-project',
    path: '.',
    tags: new Set<string>(),
  });

  if (workspaces.length === 0) {
    console.log('No workspaces found. Analyzing root project only.');
    return projects;
  }

  // 2. Add workspace projects
  const packageJsonPaths = await glob(
    workspaces.map((w: string) => \`\${w}/package.json\`)
  );

  for (const pkgPath of packageJsonPaths) {
    try {
      const pkgContent = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      projects.push({
        name: pkgContent.name.replace(/@/g, '').replace(/\//g, '-'), // e.g., @scope/my-app -> scope-my-app
        path: path.dirname(pkgPath),
        tags: new Set<string>(),
      });
    } catch(e) {
      console.warn(\`⚠️  Skipping invalid package.json: \${pkgPath}\`);
    }
  }
    
  return projects;
}

async function analyzeProject(
  project: Project,
  depMap: DependencyTagMap,
  configMap: ConfigFileTagMap,
  globMap: FileGlobTagMap
) {
  const projectRoot = path.resolve(process.cwd(), project.path);

  // Strategy 1: Analyze package.json dependencies
  try {
    const pkgPath = path.join(projectRoot, 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      const allDeps = {
        ...(pkg.dependencies || {}),
        ...(pkg.devDependencies || {}),
      };

      for (const dep in allDeps) {
        if (depMap[dep]) {
          project.tags.add(depMap[dep]);
        }
      }
    }
  } catch (e) {
    console.warn(\`⚠️  Could not parse package.json for \${project.name}: \${e.message}\`);
  }
  
  // Strategy 2: Analyze key config files
  try {
    for (const file in configMap) {
      const tag = configMap[file];
      const configPath = path.join(projectRoot, file);
      if (fs.existsSync(configPath)) {
        project.tags.add(tag);
      }
    }
  } catch (e) {
     console.warn(\`⚠️  Error scanning config files for \${project.name}: \${e.message}\`);
  }

  // Strategy 3: Analyze file globs
  try {
    for (const pattern in globMap) {
      const tag = globMap[pattern];
      // Use 'glob' package for async globbing
      const results = await glob(pattern, {
        cwd: projectRoot,
        nodir: true,
        dot: true, // Include dotfiles if needed, though 'src' patterns usually don't
      });
      if (results.length > 0) {
        project.tags.add(tag);
      }
    }
  } catch (e) {
    console.warn(\`⚠️  Error scanning file globs for \${project.name}: \${e.message}\`);
  }
}

function readTemplate(dir: string, templateFile: string): string | null {
  const p = path.join(dir, templateFile);
  try {
    return fs.readFileSync(p, 'utf-8');
  } catch (e) {
    return null; // Will be handled in the main function
  }
}

async function pruneOldFiles(targetDir: string, generatedFiles: string[]) {
  const existingFiles = fs
    .readdirSync(targetDir)
    .filter(f => f.endsWith('.md'));
    
  const oldFiles = existingFiles.filter(f => !generatedFiles.includes(f));

  if (oldFiles.length > 0) {
    console.warn(\`\n⚠️  Found \${oldFiles.length} instruction files that are no longer generated:\`);
    oldFiles.forEach(f => console.warn(\`  - \${f}\`));
    
    const { prune } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'prune',
        message: \`Do you want to delete these \${oldFiles.length} old files?\`,
        default: false,
      },
    ]);

    if (prune) {
      let deleteCount = 0;
      for (const file of oldFiles) {
        try {
          fs.unlinkSync(path.join(targetDir, file));
          deleteCount++;
        } catch (e) {
          console.error(\`  ❌ Error deleting \${file}: \${e.message}\`);
        }
      }
      console.log(\`✅ Pruned \${deleteCount} old files.\`);
    }
  }
}
File Path: /src/default_templates/generic/lang-typescript.md# Language: TypeScript

* **ALWAYS** use strict mode (`"strict": true`).

* **AVOID** the `any` type. Prefer `unknown` when the type is truly unknown.

* **ALWAYS** use `interface` for public API definitions (e.g., function parameters, return types) and `type` for internal or utility types.

* **ALWAYS** use optional chaining (`?.`) and nullish coalescing (`??`) over `&&` checks.

* **NEVER** use `require`. Always use ES module `import` syntax.
File Path: /src/default_templates/generic/state-rxjs.md# State: RxJS
- **ALWAYS** suffix Observable variables with a `$` (e.g., `users$`).
- **ALWAYS** use `BehaviorSubject` for state that needs to be "replayed" to new subscribers.
- **ALWAYS** `pipe()` operators. Do not use chained `.` operators.
- **NEVER** forget to `unsubscribe()`. Manage subscriptions in a central way, e.g., a `destroy$` Subject that completes `onComponentDestroy`.
- **PREFER** `switchMap` for handling new inner observables (like HTTP requests) and `mergeMap` for parallel operations.
File Path: /src/default_templates/generic/style-tailwind.md# Styling: Tailwind CSS
- **ALWAYS** use Tailwind utility classes for all styling.
- **NEVER** write custom CSS in `<style>` blocks or `.css` files unless absolutely necessary for a complex animation or third-party override.
- **LAYOUT**: Use `flex` and `grid` for all page and component layouts.
- **NAMING**: Do not use `@apply`. Stick to utility classes in the HTML/JSX.
- **RESPONSIVE**: Use responsive prefixes (`sm:`, `md:`, `lg:`) for all layouts.
File Path: /src/default_templates/generic/test-vitest.md# Testing: Vitest
- **ALWAYS** use `describe`, `it`, and `expect` syntax.
- **ALWAYS** mock dependencies using `vi.mock()`.
- **ALWAYS** clean up mocks after each test using `afterEach(() => { vi.restoreAllMocks(); })`.
- Use `it.todo('should do a thing')` for pending tests.
- For component testing, prefer `@vitest/ui` for a visual runner.
File Path: /src/default_templates/nestjs/nestjs-core.md# Framework: NestJS
- **ALWAYS** follow the standard architecture: `Module` > `Controller` > `Service`.
- **CONTROLLERS** should *only* handle HTTP request/response logic and DTO validation.
- **SERVICES** should contain *all* business logic.
- **ALWAYS** use DTOs (Data Transfer Objects) for `POST`/`PUT` bodies and validate them with `class-validator`.
- **ALWAYS** use Dependency Injection. Never instantiate services manually.
- **MODULES**: Keep modules granular. Import only what is needed.
File Path: /src/default_templates/react/react-core.md# Framework: React
- **ALWAYS** use Functional Components with Hooks.
- **NEVER** use Class Components.
- **HOOKS**: Use `useState` for simple component state and `useReducer` for complex state logic.
- **EFFECTS**: `useEffect` dependencies must be complete. Use `eslint-plugin-react-hooks`.
- **MEMOIZATION**: Use `useCallback` for functions passed as props and `useMemo` for expensive calculations.
- **NAMING**: Files should be `PascalCase.tsx` (e.g., `MyComponent.tsx`).
File Path: /src/default_templates/react/react-zustand.md# State: Zustand
- **ALWAYS** use Zustand for global state management.
- Define stores in `src/stores/` or `src/hooks/`.
- **PREFER** the `create(set => ({ ... }))` syntax.
- **ACTIONS** should be defined as methods inside the created store object.
- **NEVER** mutate state directly. Always use the `set` function.
- `set({ count: state.count + 1 })`
File Path: /src/default_templates/vue/style-primevue.md# UI Library: PrimeVue
- **ALWAYS** use PrimeVue components for UI elements (Button, InputText, DataTable).
- **STYLING**: Use PrimeVue's "pass-through" (PT) properties to apply Tailwind classes for customization.
- **NEVER** override PrimeVue styles with global CSS.
- **ICONS**: Use the icon library configured with PrimeVue (e.g., PrimeIcons or MDI).
- **FORMS**: Use `vee-validate` in combination with PrimeVue form components.
File Path: /src/default_templates/vue/vue-core.md# Framework: Vue 3
- **ALWAYS** use Vue 3.
- **ALWAYS** use the Composition API.
- **NEVER** use the Options API.
- **ALWAYS** use `<script setup lang="ts">`.
- Props and emits should be defined with `defineProps` and `defineEmits`.
- **REACTIVITY**: Use `ref()` for primitive values and `reactive()` for objects.
File Path: /src/default_templates/vue/vue-pinia.md# State: Pinia
- **ALWAYS** use Pinia for global state management.
- Define stores in the `src/stores` directory (e.g., `useUserStore.ts`).
- **ALWAYS** use the `setup` store syntax (function-based) instead of the `options` store syntax.
- **NEVER** access `localStorage` directly from a component. Encapsulate this logic within the Pinia store itself.
File Path: /file-list.md (For your reference)# AI Convention Aligner - Project File List

Here is the complete file structure for the package. Use this as your guide for creating the correct folders and files.

## Root Directory (`/`)

* `.gitignore`

* `package.json`

* `README.md`

* `tsconfig.json`

## `scripts/` Directory

* `scripts/copy-templates.js`

## `src/` Directory

* `src/built-in-config.ts`

* `src/cli.ts`

* `src/types.ts`

### `src/commands/` Directory

* `src/commands/init.ts`

* `src/commands/run.ts`

### `src/default_templates/` Directory

* **`src/default_templates/generic/`**

  * `src/default_templates/generic/lang-typescript.md`

  * `src/default_templates/generic/state-rxjs.md`

  * `src/default_templates/generic/style-tailwind.md`

  * `src/default_templates/generic/test-vitest.md`

* **`src/default_templates/nestjs/`**

  * `src/default_templates/nestjs/nestjs-core.md`

* **`src/default_templates/react/`**

  * `src/default_templates/react/react-core.md`

  * `src/default_templates/react/react-zustand.md`

* **`src/default_templates/vue/`**

  * `src/default_templates/vue/style-primevue.md`

  * `src/default_templates/vue/vue-core.md`

  * `src/default_templates/vue/vue-pinia.md`
