/**
 * Example: Using the new Plugin System (v3.0.0)
 * 
 * This example demonstrates how to use the PluginRegistry
 * and TemplateLoader to detect projects and load templates.
 */

import {
  initializeRegistry,
  type LanguagePlugin,
  type ProjectMetadata,
  type TemplateDefinition,
} from '@magic-helix/core';

/**
 * Example 1: Basic plugin usage
 */
async function example1_BasicUsage() {
  console.log('\n=== Example 1: Basic Plugin Usage ===\n');

  // Initialize the registry with default configuration
  const registry = await initializeRegistry({
    verbose: true,
    workspacePath: process.cwd(),
  });

  // Detect the current project
  const result = await registry.detectProject(process.cwd());
  
  if (result) {
    console.log(`Detected project:`);
    console.log(`  Language: ${result.metadata.language}`);
    console.log(`  Name: ${result.metadata.name}`);
    console.log(`  Manifest: ${result.metadata.manifestFile}`);
    console.log(`  Dependencies: ${Object.keys(result.metadata.dependencies).length}`);
    console.log(`  Plugin: ${result.plugin.displayName} v${result.plugin.version}`);
  } else {
    console.log('No project detected in current directory');
  }
}

/**
 * Example 2: Custom plugin configuration
 */
async function example2_CustomConfig() {
  console.log('\n=== Example 2: Custom Plugin Configuration ===\n');

  const registry = await initializeRegistry({
    plugins: {
      builtin: ['nodejs', 'go', 'python'],  // Only load specific plugins
      npm: ['magic-helix-plugin-kotlin'],    // Load from npm
      local: ['./my-custom-plugin.js'],      // Load local plugin
      priority: {
        'nodejs': 100,                       // Override priorities
        'go': 90,
      },
      disabled: ['rust'],                    // Disable specific plugins
    },
    verbose: true,
  });

  const stats = await registry.getStats();
  console.log('Registry Statistics:');
  console.log(`  Total Plugins: ${stats.totalPlugins}`);
  console.log(`  Load Errors: ${stats.loadErrors}`);
  console.log(`  Avg Load Time: ${stats.averageLoadTime.toFixed(2)}ms`);
  console.log(`  By Type:`, stats.pluginsByType);
}

/**
 * Example 3: Creating a custom plugin
 */
class CustomLanguagePlugin implements LanguagePlugin {
  name = 'custom-lang';
  displayName = 'Custom Language';
  version = '1.0.0';
  priority = 50;

  async detect(projectPath: string): Promise<ProjectMetadata | null> {
    // Custom detection logic
    const fs = await import('node:fs');
    const path = await import('node:path');
    
    const manifestPath = path.join(projectPath, 'custom.config');
    if (fs.existsSync(manifestPath)) {
      return {
        language: 'Custom',
        name: path.basename(projectPath),
        dependencies: {},
        manifestFile: 'custom.config',
        projectPath,
      };
    }
    
    return null;
  }

  getTemplates(): TemplateDefinition[] {
    return [
      {
        name: 'custom-core',
        tags: ['custom'],
        content: `# Custom Language Instructions

This project uses Custom Language.

## Project Structure
- Follow the custom language conventions
- Use custom-specific patterns

## Best Practices
- Write idiomatic custom code
- Follow the style guide`,
      },
    ];
  }
}

async function example3_CustomPlugin() {
  console.log('\n=== Example 3: Custom Plugin ===\n');

  const registry = await initializeRegistry({ verbose: true });
  
  // Register the custom plugin at runtime
  await registry.loadPlugin({
    type: 'local',
    path: './my-plugin.js',  // Would contain CustomLanguagePlugin export
  });

  const customPlugin = await registry.getPlugin('custom-lang');
  if (customPlugin) {
    console.log(`Custom plugin loaded: ${customPlugin.displayName}`);
    const templates = await customPlugin.getTemplates();
    console.log(`  Templates provided: ${templates.map(t => t.name).join(', ')}`);
  }
}

/**
 * Example 4: Monorepo detection
 */
async function example4_MonorepoDetection() {
  console.log('\n=== Example 4: Monorepo Detection ===\n');

  const registry = await initializeRegistry({ verbose: true });
  
  // Detect all projects in a monorepo
  const projects = await registry.detectAllProjects(process.cwd());
  
  console.log(`Found ${projects.length} projects:`);
  for (const { metadata, plugin } of projects) {
    console.log(`  - ${metadata.name} (${metadata.language}) [${plugin.name}]`);
    console.log(`    Path: ${metadata.projectPath}`);
    console.log(`    Dependencies: ${Object.keys(metadata.dependencies).length}`);
  }
}

/**
 * Example 5: Loading configuration from files
 */
async function example5_ConfigFromFile() {
  console.log('\n=== Example 5: Configuration from File ===\n');

  // Load configuration from workspace and global locations
  const { PluginRegistry } = await import('@magic-helix/core');
  const config = await PluginRegistry.loadConfig(process.cwd());
  
  console.log('Loaded configuration:');
  console.log(`  Workspace: ${config.workspacePath}`);
  console.log(`  Plugins:`, config.plugins);
  console.log(`  Templates:`, config.templates);

  // Initialize with loaded config
  const registry = await initializeRegistry(config);
  const stats = await registry.getStats();
  console.log(`  Loaded ${stats.totalPlugins} plugins`);
}

/**
 * Run all examples
 */
async function main() {
  try {
    await example1_BasicUsage();
    // await example2_CustomConfig();
    // await example3_CustomPlugin();
    // await example4_MonorepoDetection();
    // await example5_ConfigFromFile();
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Uncomment to run examples
// main();

export {
  example1_BasicUsage,
  example2_CustomConfig,
  example3_CustomPlugin,
  example4_MonorepoDetection,
  example5_ConfigFromFile,
  CustomLanguagePlugin,
};
