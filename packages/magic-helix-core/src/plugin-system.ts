/**
 * Plugin System for Magic-Agent-Helix v2.0.0
 *
 * This module defines the plugin-based architecture that allows extending
 * the tool to support multiple languages, frameworks, and DevOps tools.
 */

/**
 * Detection context provides plugins access to project information.
 */
export interface DetectionContext {
  /** All files in the project */
  readonly files: string[];

  /** Dependencies from package.json (if exists) */
  readonly dependencies: Record<string, string>;

  /** Config files found at project root */
  readonly configFiles: string[];

  /**
   * Read a text file's content from the project.
   * @param path Relative path to the file
   * @returns File content as string, or null if not found
   */
  getTextFile(path: string): string | null;

  /**
   * Check if a file exists in the project.
   * @param path Relative path to the file
   */
  hasFile(path: string): boolean;

  /**
   * Check if any file matches the given glob pattern.
   * @param pattern Glob pattern (e.g., "src/\*\*\/\*.go")
   */
  matchesPattern(pattern: string): boolean;
}

/**
 * Result of a plugin's detection.
 */
export interface DetectionResult {
  /** Whether this plugin detected its technology in the project */
  detected: boolean;

  /** Tags to add if detected (e.g., "lang-go", "framework-vue") */
  tags?: string[];

  /** Optional metadata about what was detected */
  metadata?: Record<string, unknown>;
}

/**
 * Instructions to generate for detected technology.
 */
export interface InstructionTemplate {
  /** Path to the template file (relative to template directory) */
  template: string;

  /** Suffix for the generated instruction file */
  suffix: string;

  /** Optional: file glob patterns this instruction applies to */
  targetFiles?: string[];
}

/**
 * Core interface that all detection plugins must implement.
 *
 * @deprecated This is the **v2** plugin interface. New plugins should implement
 * the `LanguagePlugin` interface from `./types` (v3) and register via
 * `PluginRegistry` from `./plugin-registry`. The v2 interface is retained for
 * the internal `AnalysisService` only and will be removed in a future major
 * version.
 */
export interface DetectionPlugin {
  /** Unique identifier for this plugin (e.g., "golang", "docker", "github-actions") */
  readonly name: string;

  /** Human-readable description of what this plugin detects */
  readonly description: string;

  /** Plugin version (semver) */
  readonly version: string;

  /**
   * Detect if this plugin's technology is present in the project.
   * @param context Detection context with project information
   * @returns Detection result with tags to apply
   */
  detect(context: DetectionContext): DetectionResult | Promise<DetectionResult>;

  /**
   * Generate instruction templates for the detected technology.
   * @param context Detection context
   * @param metadata Optional metadata from the detection phase
   * @returns List of instruction templates to generate
   */
  generateInstructions(
    context: DetectionContext,
    metadata?: Record<string, unknown>,
  ): InstructionTemplate[] | Promise<InstructionTemplate[]>;
}

/**
 * Registry for managing detection plugins.
 */
export class PluginRegistry {
  private plugins: Map<string, DetectionPlugin> = new Map();

  /**
   * Register a new detection plugin.
   * @param plugin The plugin to register
   */
  register(plugin: DetectionPlugin): void {
    if (this.plugins.has(plugin.name)) {
      console.warn(
        `Plugin "${plugin.name}" is already registered. Overwriting.`,
      );
    }
    this.plugins.set(plugin.name, plugin);
  }

  /**
   * Unregister a plugin by name.
   * @param name Plugin name to unregister
   */
  unregister(name: string): boolean {
    return this.plugins.delete(name);
  }

  /**
   * Get a plugin by name.
   * @param name Plugin name
   */
  get(name: string): DetectionPlugin | undefined {
    return this.plugins.get(name);
  }

  /**
   * Get all registered plugins.
   */
  getAll(): DetectionPlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Clear all registered plugins.
   */
  clear(): void {
    this.plugins.clear();
  }

  /**
   * Get the number of registered plugins.
   */
  get size(): number {
    return this.plugins.size;
  }
}

/**
 * Global plugin registry instance.
 */
export const pluginRegistry = new PluginRegistry();
