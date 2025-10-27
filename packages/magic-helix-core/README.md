# MagicHelix Core

The core library for MagicAgentHelix. Provides project analysis, configuration merging, and tag detection logic.

## 📦 Installation

```bash
npm install magic-helix-core
```

## 🎯 Purpose

This package is the brain of MagicAgentHelix. It:

1. **Analyzes projects** to detect frameworks, libraries, and conventions
2. **Merges configurations** (built-in + user custom)
3. **Tags files** based on dependencies, config files, and file patterns
4. **Provides built-in templates** for common frameworks

## 🔧 Usage

### Basic Analysis

```typescript
import { analyzeProjectTags, mergeConfigs } from 'magic-helix-core';

// Load and merge configuration
const config = mergeConfigs(userConfig);

// Analyze a project
const analysisData = {
  dependencies: {
    'vue': '^3.4.0',
    'tailwindcss': '^3.4.0',
    'vitest': '^2.0.0'
  },
  configFiles: ['tsconfig.json', 'vite.config.ts'],
  projectFiles: ['src/App.vue', 'src/main.ts']
};

const tags = analyzeProjectTags(
  analysisData,
  config.dependencyTagMap,
  config.configFileTagMap,
  config.fileGlobTagMap
);

console.log(tags);
// Set { 'framework-vue', 'style-tailwind', 'test-vitest', 'lang-typescript' }
```

### Configuration Merging

```typescript
import { loadUserConfig, mergeConfigs } from 'magic-helix-core';

// Load user config from file (or pass custom config)
const userConfig = loadUserConfig('./custom-config.json');

// Merge with built-in configuration
const mergedConfig = mergeConfigs(userConfig);

// Access the merged configuration
console.log(mergedConfig.dependencyTagMap);
console.log(mergedConfig.tagTemplateMap);
```

## 📚 API Reference

### `analyzeProjectTags(analysisData, dependencyTagMap, configFileTagMap, fileGlobTagMap)`

Analyzes project data and returns a set of applicable tags.

**Parameters:**
- `analysisData: ProjectAnalysisData` - Project information
  - `dependencies: Record<string, string>` - Package dependencies
  - `configFiles: string[]` - Configuration files found
  - `projectFiles: string[]` - All project files
- `dependencyTagMap: DependencyTagMap` - Maps package names to tags
- `configFileTagMap: ConfigFileTagMap` - Maps config files to tags
- `fileGlobTagMap: FileGlobTagMap` - Maps file patterns to tags

**Returns:** `Set<string>` - Set of applicable tags

### `mergeConfigs(userConfig)`

Merges user configuration with built-in defaults.

**Parameters:**
- `userConfig: Partial<Config>` - Optional user configuration

**Returns:** `MergedConfig` - Complete merged configuration

### `loadUserConfig(configPath?)`

Loads user configuration from a file.

**Parameters:**
- `configPath?: string` - Optional path to config file (defaults to `ai-aligner.config.json`)

**Returns:** `Partial<Config>` - Loaded user configuration or empty object

## 🏗️ Built-in Configuration

The core includes comprehensive built-in detection for:

### Frameworks
- Vue.js (`vue`)
- React (`react`)
- Angular (`@angular/core`)
- NestJS (`@nestjs/core`)

### Styling
- Tailwind CSS (`tailwindcss`)
- PrimeVue (`primevue`)
- Material-UI (`@mui/material`)
- Quasar (`quasar`)

### Testing
- Vitest (`vitest`)
- Jest (`jest`)
- Cypress (`cypress`)
- Playwright (`playwright`)

### State Management
- RxJS (`rxjs`)
- Pinia (`pinia`)
- Redux (`redux`)
- Zustand (`zustand`)

### Languages
- TypeScript (`tsconfig.json`, `*.ts`, `*.tsx`)
- JavaScript (`*.js`, `*.jsx`)
- Go (`*.go`)
- Python (`*.py`)

## 🔌 Browser Support

The core library is isomorphic and works in both Node.js and browser environments.

For browser usage, all Node.js-specific APIs (like `fs`) should be handled by the consuming application.

## 📖 Type Definitions

```typescript
interface ProjectAnalysisData {
  dependencies: Record<string, string>;
  configFiles: string[];
  projectFiles: string[];
}

interface Config {
  target: string;
  templateDirectory: string;
  outputDirectory: string;
  dependencyTagMap: DependencyTagMap;
  configFileTagMap: ConfigFileTagMap;
  fileGlobTagMap: FileGlobTagMap;
  tagTemplateMap: TagTemplateMap;
}

type DependencyTagMap = Record<string, string>;
type ConfigFileTagMap = Record<string, string>;
type FileGlobTagMap = Record<string, string>;
type TagTemplateMap = Record<string, Array<{ template: string; suffix: string }>>;
```

## 🧪 Testing

```bash
npm test                # Run tests
npm run test:watch      # Watch mode
npm run test:coverage   # With coverage
```

## 📦 Package Structure

```
dist/
  ├── index.mjs          # ESM bundle
  ├── index.cjs          # CommonJS bundle
  ├── index.d.ts         # TypeScript declarations
  └── default_templates/ # Built-in templates
```

## 📚 More Information

See the [monorepo root README.md](../../README.md) for full development instructions.

## 📄 License

MIT