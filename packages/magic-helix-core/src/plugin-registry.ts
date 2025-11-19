/**
 * Plugin Registry
 *
 * Central singleton for managing loaded plugins and providing
 * high-level APIs for project detection and template access.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { PluginLoader } from './plugin-loader';
import type {
  LanguagePlugin,
  PluginConfig,
  ProjectMetadata,
  RegistryConfig,
} from './types';

export class PluginRegistry {
  private static instance: PluginRegistry | null = null;
  private loader: PluginLoader;
  private config: RegistryConfig;
  private initialized = false;

  private constructor() {
    this.loader = new PluginLoader({ verbose: false });
    this.config = {};
  }

  /**
   * Get the singleton instance
   */
  static getInstance(): PluginRegistry {
    if (!PluginRegistry.instance) {
      PluginRegistry.instance = new PluginRegistry();
    }
    return PluginRegistry.instance;
  }

  /**
   * Initialize the registry with configuration
   */
  async initialize(config: RegistryConfig = {}): Promise<void> {
    if (this.initialized) {
      // Already initialized, skip
      return;
    }

    this.config = config;
    this.loader = new PluginLoader({ verbose: config.verbose });

    // Load plugins in order of priority
    await this.loadConfiguredPlugins(config.plugins);

    this.initialized = true;

    if (config.verbose) {
      const stats = this.loader.getStats();
      console.log(
        `[PluginRegistry] Initialized with ${stats.totalLoaded} plugins`,
      );
      console.log(
        `[PluginRegistry] Load time: ${stats.averageLoadTime.toFixed(2)}ms avg`,
      );
    }
  }

  /**
   * Reset the registry (useful for testing)
   */
  reset(): void {
    this.loader.clear();
    this.initialized = false;
    this.config = {};
  }

  /**
   * Ensure the registry is initialized before use
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * Get a plugin by name
   */
  async getPlugin(name: string): Promise<LanguagePlugin | undefined> {
    await this.ensureInitialized();
    return this.loader.getPlugin(name);
  }

  /**
   * Get all loaded plugins
   */
  async getAllPlugins(): Promise<LanguagePlugin[]> {
    await this.ensureInitialized();
    return this.loader.getAllPlugins();
  }

  /**
   * Detect the project type at the given path
   */
  async detectProject(projectPath: string): Promise<{
    metadata: ProjectMetadata;
    plugin: LanguagePlugin;
  } | null> {
    await this.ensureInitialized();
    return this.loader.detectProject(projectPath);
  }

  /**
   * Detect all projects in a directory (monorepo support)
   */
  async detectAllProjects(rootPath: string): Promise<
    Array<{
      metadata: ProjectMetadata;
      plugin: LanguagePlugin;
    }>
  > {
    await this.ensureInitialized();
    return this.loader.detectAllProjects(rootPath);
  }

  /**
   * Get the best plugin for a detected project language
   */
  async getPluginForLanguage(
    language: string,
  ): Promise<LanguagePlugin | undefined> {
    await this.ensureInitialized();
    const plugins = this.loader.getAllPlugins();

    // Try exact match first
    let plugin = plugins.find((p) => p.name === language.toLowerCase());
    if (plugin) return plugin;

    // Try display name match
    plugin = plugins.find(
      (p) => p.displayName.toLowerCase() === language.toLowerCase(),
    );
    if (plugin) return plugin;

    // Try partial match
    plugin = plugins.find(
      (p) =>
        p.displayName.toLowerCase().includes(language.toLowerCase()) ||
        language.toLowerCase().includes(p.name),
    );

    return plugin;
  }

  /**
   * Load a custom plugin at runtime
   */
  async loadPlugin(source: {
    type: 'npm' | 'local';
    path: string;
  }): Promise<LanguagePlugin | null> {
    await this.ensureInitialized();

    const result =
      source.type === 'npm'
        ? await this.loader.loadNpmPlugin(source.path)
        : await this.loader.loadLocalPlugin(source.path);

    return result?.plugin ?? null;
  }

  /**
   * Get registry statistics
   */
  async getStats(): Promise<{
    totalPlugins: number;
    loadErrors: number;
    averageLoadTime: number;
    pluginsByType: Record<string, number>;
  }> {
    await this.ensureInitialized();
    const stats = this.loader.getStats();

    return {
      totalPlugins: stats.totalLoaded,
      loadErrors: stats.totalErrors,
      averageLoadTime: stats.averageLoadTime,
      pluginsByType: stats.byType,
    };
  }

  /**
   * Get load errors
   */
  async getLoadErrors(): Promise<
    Array<{
      source: string;
      error: string;
      timestamp: Date;
    }>
  > {
    await this.ensureInitialized();
    return this.loader.getLoadErrors().map((err) => ({
      source: err.source.identifier,
      error: err.error.message,
      timestamp: err.timestamp,
    }));
  }

  /**
   * Get plugin system statistics
   */
  getStatistics() {
    return this.loader.getStats();
  }

  // Private helper methods

  /**
   * Load plugins based on configuration
   */
  private async loadConfiguredPlugins(
    pluginConfig: PluginConfig = {},
  ): Promise<void> {
    const {
      builtin = [],
      npm = [],
      local = [],
      workspace = [],
      disabled = [],
    } = pluginConfig;

    // Load built-in plugins first
    if (builtin.length > 0) {
      const filteredBuiltin = builtin.filter(
        (name) => !disabled.includes(name),
      );
      await this.loader.loadBuiltinPlugins(filteredBuiltin);
    } else {
      // If no built-in plugins specified, try to load all
      await this.loader.loadBuiltinPlugins();
    }

    // Load npm plugins
    for (const packageName of npm) {
      if (!disabled.includes(packageName)) {
        await this.loader.loadNpmPlugin(packageName);
      }
    }

    // Load local plugins
    for (const pluginPath of local) {
      if (!disabled.includes(pluginPath)) {
        const resolvedPath = this.resolvePath(pluginPath);
        await this.loader.loadLocalPlugin(resolvedPath);
      }
    }

    // Load workspace plugins
    if (this.config.workspacePath && workspace.length > 0) {
      await this.loader.loadWorkspacePlugins(
        this.config.workspacePath,
        workspace,
      );
    }

    // Apply priority overrides
    if (pluginConfig.priority) {
      this.applyPriorityOverrides(pluginConfig.priority);
    }
  }

  /**
   * Resolve plugin path (handle ~/ and relative paths)
   */
  private resolvePath(pluginPath: string): string {
    if (pluginPath.startsWith('~/')) {
      const homeDir = process.env.HOME || process.env.USERPROFILE || '';
      return path.join(homeDir, pluginPath.slice(2));
    }

    if (path.isAbsolute(pluginPath)) {
      return pluginPath;
    }

    // Relative to workspace or cwd
    const base = this.config.workspacePath || process.cwd();
    return path.resolve(base, pluginPath);
  }

  /**
   * Apply priority overrides from configuration
   */
  private applyPriorityOverrides(overrides: Record<string, number>): void {
    for (const [pluginName, priority] of Object.entries(overrides)) {
      const plugin = this.loader.getPlugin(pluginName);
      if (plugin) {
        plugin.priority = priority;
      }
    }
  }

  /**
   * Load configuration from file
   */
  static async loadConfigFromFile(
    configPath: string,
  ): Promise<RegistryConfig | null> {
    try {
      if (!fs.existsSync(configPath)) {
        return null;
      }

      const content = fs.readFileSync(configPath, 'utf-8');
      const config = JSON.parse(content);

      return config;
    } catch (error) {
      console.warn(
        `Failed to load config from ${configPath}: ${(error as Error).message}`,
      );
      return null;
    }
  }

  /**
   * Load configuration from workspace and global locations
   */
  static async loadConfig(workspacePath?: string): Promise<RegistryConfig> {
    const configs: RegistryConfig[] = [];

    // Load global config (~/.magic-helix/config.json)
    const homeDir = process.env.HOME || process.env.USERPROFILE;
    if (homeDir) {
      const globalConfigPath = path.join(
        homeDir,
        '.magic-helix',
        'config.json',
      );
      const globalConfig =
        await PluginRegistry.loadConfigFromFile(globalConfigPath);
      if (globalConfig) {
        configs.push(globalConfig);
      }
    }

    // Load workspace config (.magic-helix.json)
    if (workspacePath) {
      const workspaceConfigPath = path.join(workspacePath, '.magic-helix.json');
      const workspaceConfig =
        await PluginRegistry.loadConfigFromFile(workspaceConfigPath);
      if (workspaceConfig) {
        workspaceConfig.workspacePath = workspacePath;
        configs.push(workspaceConfig);
      }
    }

    // Merge configs (workspace overrides global)
    if (configs.length === 0) {
      return { workspacePath };
    }

    return configs.reduce(
      (merged, config) => {
        const mergedPlugins = {
          ...(merged.plugins || {}),
          ...(config.plugins || {}),
        };
        const mergedTemplates = {
          ...(merged.templates || {}),
          ...(config.templates || {}),
        };

        return Object.assign({}, merged, config, {
          plugins: mergedPlugins,
          templates: mergedTemplates,
        });
      },
      { workspacePath } as RegistryConfig,
    );
  }
}

/**
 * Convenience function to get or create the registry instance
 */
export function getRegistry(): PluginRegistry {
  return PluginRegistry.getInstance();
}

/**
 * Convenience function to initialize the registry
 */
export async function initializeRegistry(
  config?: RegistryConfig,
): Promise<PluginRegistry> {
  const registry = PluginRegistry.getInstance();
  await registry.initialize(config);
  return registry;
}
