/**
 * Plugin Loader
 *
 * Responsible for discovering and loading language plugins from various sources:
 * - Built-in plugins (from magic-helix-plugins package)
 * - NPM packages
 * - Local filesystem paths
 * - Workspace plugins
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import type { LanguagePlugin, PluginSource, ProjectMetadata } from './types';

export interface PluginLoadResult {
  plugin: LanguagePlugin;
  source: PluginSource;
  loadTime: number;
}

export interface PluginLoadError {
  source: PluginSource;
  error: Error;
  timestamp: Date;
}

export class PluginLoader {
  private loadedPlugins: Map<string, PluginLoadResult> = new Map();
  private loadErrors: PluginLoadError[] = [];
  private verbose: boolean;

  constructor(options: { verbose?: boolean } = {}) {
    this.verbose = options.verbose ?? false;
  }

  /**
   * Load built-in plugins from the @el-j/magic-helix-plugins package
   * Loads all exported plugin classes from the package
   */
  async loadBuiltinPlugins(
    pluginNames?: string[],
  ): Promise<PluginLoadResult[]> {
    const results: PluginLoadResult[] = [];

    try {
      // Dynamically import the plugins package
      // This avoids the circular dependency at build time
      const pluginModule = await this.tryImport('@el-j/magic-helix-plugins');

      if (!pluginModule) {
        // Package not installed, silently return empty array
        return results;
      }

      // Extract all plugin classes (filter out BasePlugin which is not a language plugin)
      const pluginClasses = Object.entries(pluginModule)
        .filter(([name, value]) => {
          return (
            name !== 'BasePlugin' &&
            typeof value === 'function' &&
            name.endsWith('Plugin')
          );
        })
        .map(([_, PluginClass]) => PluginClass as new () => LanguagePlugin);

      for (const PluginClass of pluginClasses) {
        const plugin = new PluginClass();

        // Filter by requested plugin names if specified
        if (pluginNames && !pluginNames.includes(plugin.name)) {
          continue;
        }

        const result: PluginLoadResult = {
          plugin,
          source: {
            type: 'npm',
            identifier: plugin.name,
            packageName: '@el-j/magic-helix-plugins',
          },
          loadTime: 0,
        };

        this.loadedPlugins.set(plugin.name, result);
        results.push(result);
        this.log(
          `Loaded built-in plugin: ${plugin.displayName} (${plugin.name})`,
        );
      }
    } catch (error) {
      this.handleLoadError(
        {
          type: 'npm',
          identifier: '@el-j/magic-helix-plugins',
          packageName: '@el-j/magic-helix-plugins',
        },
        error as Error,
      );
    }

    return results;
  }

  /**
   * Load a plugin from an npm package
   */
  async loadNpmPlugin(packageName: string): Promise<PluginLoadResult | null> {
    try {
      const startTime = Date.now();
      const pluginModule = await this.tryImport(packageName);

      if (!pluginModule) {
        throw new Error(`Package "${packageName}" not found`);
      }

      // Support both default export and named exports
      const PluginClass = (pluginModule.default ||
        pluginModule.Plugin ||
        pluginModule) as new () => LanguagePlugin;

      if (typeof PluginClass !== 'function') {
        throw new Error(
          `Package "${packageName}" does not export a valid plugin class`,
        );
      }

      const plugin = new PluginClass();
      const loadTime = Date.now() - startTime;

      this.validatePlugin(plugin);

      const result: PluginLoadResult = {
        plugin,
        source: {
          type: 'npm',
          identifier: packageName,
          packageName,
        },
        loadTime,
      };

      this.loadedPlugins.set(plugin.name, result);
      this.log(
        `✓ Loaded npm plugin: ${plugin.displayName} from ${packageName} (${loadTime}ms)`,
      );

      return result;
    } catch (error) {
      this.handleLoadError(
        {
          type: 'npm',
          identifier: packageName,
          packageName,
        },
        error as Error,
      );
      return null;
    }
  }

  /**
   * Load a plugin from a local file path
   */
  async loadLocalPlugin(pluginPath: string): Promise<PluginLoadResult | null> {
    try {
      const absolutePath = path.resolve(pluginPath);

      if (!fs.existsSync(absolutePath)) {
        throw new Error(`Plugin file not found: ${absolutePath}`);
      }

      const startTime = Date.now();
      const pluginModule = await import(absolutePath);
      const loadTime = Date.now() - startTime;

      // Support both default export and named exports
      const PluginClass = (pluginModule.default ||
        pluginModule.Plugin ||
        pluginModule) as new () => LanguagePlugin;

      if (typeof PluginClass !== 'function') {
        throw new Error(
          `File "${pluginPath}" does not export a valid plugin class`,
        );
      }

      const plugin = new PluginClass();
      this.validatePlugin(plugin);

      const result: PluginLoadResult = {
        plugin,
        source: {
          type: 'local',
          identifier: pluginPath,
          path: absolutePath,
        },
        loadTime,
      };

      this.loadedPlugins.set(plugin.name, result);
      this.log(
        `✓ Loaded local plugin: ${plugin.displayName} from ${pluginPath} (${loadTime}ms)`,
      );

      return result;
    } catch (error) {
      this.handleLoadError(
        {
          type: 'local',
          identifier: pluginPath,
          path: pluginPath,
        },
        error as Error,
      );
      return null;
    }
  }

  /**
   * Load plugins from workspace directory
   */
  async loadWorkspacePlugins(
    workspacePath: string,
    patterns?: string[],
  ): Promise<PluginLoadResult[]> {
    const results: PluginLoadResult[] = [];
    const searchPatterns = patterns || [
      '.magic-helix/plugins/**/*.js',
      '.magic-helix/plugins/**/*.mjs',
    ];

    try {
      const { glob } = await import('glob');

      for (const pattern of searchPatterns) {
        const pluginFiles = await glob(pattern, {
          cwd: workspacePath,
          absolute: true,
        });

        for (const pluginFile of pluginFiles) {
          const result = await this.loadLocalPlugin(pluginFile);
          if (result) {
            // Mark as workspace plugin
            result.source.type = 'workspace';
            results.push(result);
          }
        }
      }
    } catch (error) {
      this.logWarning(
        `Error loading workspace plugins: ${(error as Error).message}`,
      );
    }

    return results;
  }

  /**
   * Get a loaded plugin by name
   */
  getPlugin(name: string): LanguagePlugin | undefined {
    return this.loadedPlugins.get(name)?.plugin;
  }

  /**
   * Get all loaded plugins sorted by priority (highest first)
   */
  getAllPlugins(): LanguagePlugin[] {
    return Array.from(this.loadedPlugins.values())
      .map((result) => result.plugin)
      .sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get plugins filtered by name
   */
  getPluginsByNames(names: string[]): LanguagePlugin[] {
    return names
      .map((name) => this.getPlugin(name))
      .filter((plugin): plugin is LanguagePlugin => plugin !== undefined);
  }

  /**
   * Detect project using all loaded plugins
   * Returns the first successful detection from highest priority plugin
   */
  async detectProject(projectPath: string): Promise<{
    metadata: ProjectMetadata;
    plugin: LanguagePlugin;
  } | null> {
    const plugins = this.getAllPlugins();

    for (const plugin of plugins) {
      try {
        this.log(`Trying plugin: ${plugin.displayName}`);
        const metadata = await plugin.detect(projectPath);

        if (metadata) {
          this.log(
            `✓ Detected ${metadata.language} project with ${plugin.displayName}`,
          );
          return { metadata, plugin };
        }
      } catch (error) {
        this.logWarning(
          `Plugin ${plugin.name} detection failed: ${(error as Error).message}`,
        );
      }
    }

    return null;
  }

  /**
   * Recursively scan directories for project manifests
   */
  private async scanForProjects(
    rootPath: string,
    maxDepth: number = 5,
  ): Promise<string[]> {
    const projectPaths = new Set<string>();
    const visited = new Set<string>();

    // Common manifest files that indicate a project
    const MANIFEST_FILES = [
      'package.json',
      'Cargo.toml',
      'go.mod',
      'go.sum',
      'setup.py',
      'pyproject.toml',
      'requirements.txt',
      'pom.xml',
      'build.gradle',
      'build.gradle.kts',
      'Package.swift',
      'Gemfile',
      'composer.json',
      'CMakeLists.txt',
      'Makefile',
      'platformio.ini',
    ];

    // Directories to skip
    const SKIP_DIRS = new Set([
      'node_modules',
      'target',
      'dist',
      'build',
      '.git',
      '.svn',
      '.hg',
      'vendor',
      '__pycache__',
      '.venv',
      'venv',
      'env',
      '.cargo',
      '.gradle',
    ]);

    const scanDir = async (dirPath: string, depth: number): Promise<void> => {
      if (depth > maxDepth) return;

      const normalized = path.normalize(dirPath);
      if (visited.has(normalized)) return;
      visited.add(normalized);

      try {
        const entries = await fs.promises.readdir(dirPath, {
          withFileTypes: true,
        });

        // Check if this directory has any manifest files
        let _hasManifest = false;
        for (const entry of entries) {
          if (!entry.isDirectory() && MANIFEST_FILES.includes(entry.name)) {
            projectPaths.add(dirPath);
            _hasManifest = true;
            break;
          }
        }

        // Recursively scan subdirectories
        for (const entry of entries) {
          if (entry.isDirectory() && !SKIP_DIRS.has(entry.name)) {
            const subPath = path.join(dirPath, entry.name);
            await scanDir(subPath, depth + 1);
          }
        }
      } catch (_error) {
        // Skip directories we can't read
        return;
      }
    };

    await scanDir(rootPath, 0);
    return Array.from(projectPaths).sort();
  }

  /**
   * Detect all projects in a directory (for monorepo support)
   * Enhanced version that recursively scans for ALL project types
   */
  async detectAllProjects(rootPath: string): Promise<
    Array<{
      metadata: ProjectMetadata;
      plugin: LanguagePlugin;
    }>
  > {
    const results: Array<{
      metadata: ProjectMetadata;
      plugin: LanguagePlugin;
    }> = [];
    const detected = new Set<string>(); // Track detected paths to avoid duplicates
    const plugins = this.getAllPlugins();

    // Phase 1: Try detecting at the root level with workspace support
    for (const plugin of plugins) {
      try {
        const metadata = await plugin.detect(rootPath);
        if (metadata) {
          detected.add(metadata.projectPath);
          results.push({ metadata, plugin });

          // If this plugin found workspace members, detect those too
          if (
            metadata.workspaceMembers &&
            metadata.workspaceMembers.length > 0
          ) {
            for (const memberPath of metadata.workspaceMembers) {
              const fullPath = path.resolve(rootPath, memberPath);
              if (!detected.has(fullPath)) {
                const memberResult = await this.detectProject(fullPath);
                if (memberResult) {
                  detected.add(memberResult.metadata.projectPath);
                  results.push(memberResult);
                }
              }
            }
          }
        }
      } catch (error) {
        this.logWarning(
          `Plugin ${plugin.name} failed: ${(error as Error).message}`,
        );
      }
    }

    // Phase 2: Recursively scan for additional projects not covered by workspaces
    try {
      const projectPaths = await this.scanForProjects(rootPath);

      for (const projectPath of projectPaths) {
        if (!detected.has(projectPath)) {
          const result = await this.detectProject(projectPath);
          if (result) {
            detected.add(result.metadata.projectPath);
            results.push(result);
          }
        }
      }
    } catch (error) {
      this.logWarning(`Recursive scan failed: ${(error as Error).message}`);
    }

    return results;
  }

  /**
   * Get load errors
   */
  getLoadErrors(): PluginLoadError[] {
    return [...this.loadErrors];
  }

  /**
   * Clear all loaded plugins
   */
  clear(): void {
    this.loadedPlugins.clear();
    this.loadErrors = [];
  }

  /**
   * Get statistics about loaded plugins
   */
  getStats(): {
    totalLoaded: number;
    totalErrors: number;
    averageLoadTime: number;
    byType: Record<string, number>;
  } {
    const results = Array.from(this.loadedPlugins.values());
    const byType: Record<string, number> = {};

    for (const result of results) {
      byType[result.source.type] = (byType[result.source.type] || 0) + 1;
    }

    return {
      totalLoaded: results.length,
      totalErrors: this.loadErrors.length,
      averageLoadTime:
        results.length > 0
          ? results.reduce((sum, r) => sum + r.loadTime, 0) / results.length
          : 0,
      byType,
    };
  }

  // Private helper methods

  private validatePlugin(plugin: unknown): asserts plugin is LanguagePlugin {
    if (!plugin || typeof plugin !== 'object') {
      throw new Error('Plugin must be an object');
    }
    const p = plugin as Record<string, unknown>;
    if (!p.name || typeof p.name !== 'string') {
      throw new Error('Plugin must have a "name" property');
    }
    if (!p.displayName || typeof p.displayName !== 'string') {
      throw new Error('Plugin must have a "displayName" property');
    }
    if (!p.version || typeof p.version !== 'string') {
      throw new Error('Plugin must have a "version" property');
    }
    if (typeof p.priority !== 'number') {
      throw new Error('Plugin must have a "priority" property');
    }
    if (typeof p.detect !== 'function') {
      throw new Error('Plugin must implement "detect" method');
    }
    if (typeof p.getTemplates !== 'function') {
      throw new Error('Plugin must implement "getTemplates" method');
    }
  }

  private async tryImport(
    packageName: string,
  ): Promise<Record<string, unknown> | null> {
    try {
      return await import(packageName);
    } catch {
      return null;
    }
  }

  private handleLoadError(source: PluginSource, error: Error): void {
    this.loadErrors.push({
      source,
      error,
      timestamp: new Date(),
    });
    this.logWarning(
      `Failed to load plugin "${source.identifier}": ${error.message}`,
    );
  }

  private log(message: string): void {
    if (this.verbose) {
      console.log(`[PluginLoader] ${message}`);
    }
  }

  private logWarning(message: string): void {
    if (this.verbose) {
      console.warn(`[PluginLoader] ⚠️  ${message}`);
    }
  }
}
