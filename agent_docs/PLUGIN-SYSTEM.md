# Plugin System Documentation

## Overview

Magic-Agent-Helix v2.0.0 introduces a powerful plugin-based architecture that allows extending the tool to support multiple programming languages, frameworks, and DevOps tools. This makes the tool truly "polyglot" - capable of analyzing and providing instructions for any modern software project.

## Architecture

The plugin system consists of three main components:

### 1. DetectionContext

Provides plugins with access to project information:
- `files`: List of all project files
- `dependencies`: npm dependencies from package.json (if exists)
- `configFiles`: Configuration files at project root
- `getTextFile(path)`: Read file content
- `hasFile(path)`: Check if file exists
- `matchesPattern(pattern)`: Check if files match glob pattern

### 2. DetectionPlugin Interface

Every plugin must implement:
- `name`: Unique plugin identifier
- `description`: Human-readable description
- `version`: Plugin version (semver)
- `detect(context)`: Detect if technology is present
- `generateInstructions(context, metadata)`: Generate instruction templates

### 3. PluginRegistry

Central registry for managing plugins:
- `register(plugin)`: Register a new plugin
- `unregister(name)`: Remove a plugin
- `get(name)`: Get plugin by name
- `getAll()`: Get all registered plugins

## Creating a Plugin

Here's a simple example plugin for detecting Rust projects:

\`\`\`typescript
import type { 
  DetectionPlugin, 
  DetectionContext, 
  DetectionResult, 
  InstructionTemplate 
} from "magic-helix-core";

export class RustPlugin implements DetectionPlugin {
  readonly name = "rust";
  readonly description = "Detects Rust projects and provides Rust-specific instructions";
  readonly version = "1.0.0";
  
  detect(context: DetectionContext): DetectionResult {
    // Check for Cargo.toml (Rust's manifest file)
    const hasCargoToml = context.hasFile("Cargo.toml");
    
    // Check for .rs files
    const hasRustFiles = context.matchesPattern("**/*.rs");
    
    if (!hasCargoToml && !hasRustFiles) {
      return { detected: false };
    }
    
    // Parse Cargo.toml for metadata
    const metadata: Record<string, unknown> = {};
    const cargoContent = context.getTextFile("Cargo.toml");
    
    if (cargoContent) {
      // Extract package name
      const nameMatch = cargoContent.match(/^name\s*=\s*"(.+)"$/m);
      if (nameMatch) {
        metadata.packageName = nameMatch[1];
      }
      
      // Extract Rust edition
      const editionMatch = cargoContent.match(/^edition\s*=\s*"(\d+)"$/m);
      if (editionMatch) {
        metadata.edition = editionMatch[1];
      }
    }
    
    return {
      detected: true,
      tags: ["lang-rust"],
      metadata
    };
  }
  
  generateInstructions(
    context: DetectionContext,
    metadata?: Record<string, unknown>
  ): InstructionTemplate[] {
    return [
      {
        template: "rust/lang-rust.md",
        suffix: "lang-rust.md",
        targetFiles: ["**/*.rs"]
      }
    ];
  }
}
\`\`\`

## Using Plugins

### Registering a Plugin

\`\`\`typescript
import { pluginRegistry, RustPlugin } from "magic-helix-core";

// Register the plugin
const rustPlugin = new RustPlugin();
pluginRegistry.register(rustPlugin);
\`\`\`

### Using the Detection Context

\`\`\`typescript
import type { DetectionContext } from "magic-helix-core";

const context: DetectionContext = {
  files: ["src/main.rs", "Cargo.toml", "README.md"],
  dependencies: {},
  configFiles: ["Cargo.toml"],
  getTextFile: (path) => {
    // Implementation to read file content
    return fileContents[path] || null;
  },
  hasFile: (path) => {
    return files.includes(path);
  },
  matchesPattern: (pattern) => {
    // Implementation to match glob patterns
    return matchGlob(files, pattern);
  }
};

// Run detection
const result = await rustPlugin.detect(context);

if (result.detected) {
  const instructions = await rustPlugin.generateInstructions(
    context, 
    result.metadata
  );
  // Process instructions...
}
\`\`\`

## Built-in Plugins

Magic-Agent-Helix v2.0.0 ships with several built-in plugins:

### Language Plugins
- **GolangPlugin**: Detects Go projects via `go.mod` and `.go` files
- **PythonPlugin**: Detects Python projects via `pyproject.toml`, `requirements.txt`, and `.py` files

### DevOps Plugins
- **DockerPlugin**: Detects Docker usage via `Dockerfile` and `docker-compose.yml`

## Best Practices

1. **Make Detection Fast**: The `detect()` method should be quick. Avoid expensive operations.

2. **Handle Edge Cases**: Always check if files exist before reading them.

3. **Provide Useful Metadata**: Include information that might be useful for instruction generation.

4. **Version Your Plugins**: Follow semantic versioning for plugin versions.

5. **Document Your Plugin**: Add clear JSDoc comments explaining what the plugin does.

6. **Test Your Plugin**: Write unit tests to ensure detection works correctly.

## Roadmap

Future plugin types planned for v2.0.0:

### CI/CD Plugins
- GitHub Actions
- GitLab CI
- CircleCI
- Jenkins

### Framework Plugins
- Laravel (PHP)
- Ruby on Rails
- .NET Core
- Spring Boot (Java)

### Architecture Plugins
- Monorepo detection (Nx, Turborepo)
- Microservices patterns
- Code ownership (CODEOWNERS)

## Contributing

To contribute a new plugin:

1. Create your plugin class implementing `DetectionPlugin`
2. Add corresponding template files in `default_templates/`
3. Export your plugin from `packages/magic-helix-core/src/plugins/index.ts`
4. Write tests for your plugin
5. Update this documentation
6. Submit a pull request

## Example: Full Plugin with Tests

See the built-in plugins for complete examples:
- `packages/magic-helix-core/src/plugins/golang-plugin.ts`
- `packages/magic-helix-core/src/plugins/python-plugin.ts`
- `packages/magic-helix-core/src/plugins/docker-plugin.ts`

And their tests:
- `packages/magic-helix-core/src/plugin-system.test.ts`
