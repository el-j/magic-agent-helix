// This file defines the structure of the user-facing config file.

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
 */
export type FileGlobTagMap = Record<string, string>;

/**
 * Defines the structure for mapping a tag to its templates.
 */
export type TagTemplateMap = Record<
  string,
  {
    template: string; // The filename in the user's template directory
    suffix: string; // The suffix to append to the generated filename
  }[]
>;

/**
 * The structure of the magic-helix.config.json file (legacy: ai-aligner.config.json).
 * This file is OPTIONAL and is used to *extend* the built-in conventions.
 */
export interface Config {
  /**
   * The AI agent target. Supported targets:
   * - 'github-copilot': GitHub Copilot (default)
   * - 'claude': Anthropic Claude/Cursor
   * - 'copilot-chat': GitHub Copilot Chat
   * - 'generic': Generic assistant format
   */
  target: 'github-copilot' | 'claude' | 'copilot-chat' | 'generic';

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

  /**
   * AI instruction refinement settings (Phase 3: Universal AI Platform Roadmap)
   * Controls how instruction files are optimized for the target AI agent.
   */
  aiRefinement?: {
    /**
     * Quality level for generated instructions.
     * - 'basic': Minimal instructions, fastest generation
     * - 'standard': Balanced detail and conciseness (default)
     * - 'comprehensive': Maximum detail, longer generation time
     */
    quality?: 'basic' | 'standard' | 'comprehensive';

    /**
     * Context level for instructions.
     * - 'minimal': Only essential information
     * - 'balanced': Standard context (default)
     * - 'extensive': Maximum background and examples
     */
    contextLevel?: 'minimal' | 'balanced' | 'extensive';

    /**
     * Output format optimization.
     * - 'markdown': Standard Markdown (default)
     * - 'structured': Section headers + bullet points
     * - 'conversational': Natural language prose
     * - 'code-focused': Emphasis on code examples
     */
    outputFormat?:
      | 'markdown'
      | 'structured'
      | 'conversational'
      | 'code-focused';

    /**
     * Token budget hint (approximate max tokens per instruction file).
     * Used to trim excessive content.
     * @default 4000
     */
    tokenBudget?: number;

    /**
     * Include code examples in instructions.
     * @default true
     */
    includeExamples?: boolean;

    /**
     * Include best practices sections.
     * @default true
     */
    includeBestPractices?: boolean;
  };
}

/**
 * The merged config after combining user config with built-in.
 * All optional fields are filled with defaults.
 */
export type MergedConfig = Required<Config>;

/**
 * Plugin System Types (Phase 1)
 */

/**
 * Metadata about a detected project
 */
export interface ProjectMetadata {
  language: string; // e.g., "JavaScript/TypeScript", "Go", "Python"
  name?: string; // Project name from manifest
  description?: string; // Project description
  dependencies: Record<string, string>; // dependency name -> version
  manifestFile?: string; // e.g., "package.json", "go.mod"
  projectPath: string; // Absolute path to project root
  workspaceMembers?: string[]; // For monorepo support
  tags?: string[]; // Optional semantic tags detected by plugin
  keywords?: string[]; // Optional keywords/categories from manifest
  categories?: string[]; // Optional categories for registry filtering
}

/**
 * Definition of a template provided by a plugin or user
 */
export interface TemplateDefinition {
  name: string; // e.g., "react-core", "go-core"
  tags: string[]; // Required tags: ["react"] or ["go"]
  content: string | (() => string | Promise<string>); // Template content or lazy loader
  targetPath?: string; // Optional: relative path in output dir
  language?: string; // Optional: target language for syntax highlighting
  priority?: number; // Higher = takes precedence in conflicts
}

/**
 * Core interface that all language plugins must implement
 */
export interface LanguagePlugin {
  // Metadata
  name: string; // Unique identifier: "nodejs", "go", "python"
  displayName: string; // Human-readable: "Node.js", "Go"
  version: string; // Semantic version
  priority: number; // Higher = checked first (0-1000)

  // Project Detection
  detect(projectPath: string): Promise<ProjectMetadata | null>;

  // Template Provision
  getTemplates(): TemplateDefinition[] | Promise<TemplateDefinition[]>;

  // Optional: Custom tag mappings for this language
  getDependencyTagMap?(): DependencyTagMap;
  getConfigFileTagMap?(): ConfigFileTagMap;
  getFileGlobTagMap?(): FileGlobTagMap;
}

/**
 * Source configuration for loading plugins
 */
export interface PluginSource {
  type: 'builtin' | 'npm' | 'local' | 'workspace';
  identifier: string; // Plugin name or path
  path?: string; // For local/workspace plugins
  packageName?: string; // For npm plugins
  enabled?: boolean; // Allow disabling specific plugins
}

/**
 * Configuration for the plugin system
 */
export interface PluginConfig {
  builtin?: string[]; // Built-in plugin names to load
  npm?: string[]; // NPM package names
  local?: string[]; // Local file paths
  workspace?: string[]; // Workspace-relative paths or globs
  priority?: Record<string, number>; // Override plugin priorities
  disabled?: string[]; // Plugins to disable
}

/**
 * Configuration for template resolution
 */
export interface TemplateConfig {
  searchPaths?: string[]; // Directories to search for templates
  overrides?: Record<string, string>; // Template name -> file path
  extensions?: string[]; // File extensions to search: ['.md', '.txt']
}

/**
 * Registry configuration
 */
export interface RegistryConfig {
  plugins?: PluginConfig;
  templates?: TemplateConfig;
  workspacePath?: string; // Current workspace root
  globalConfigPath?: string; // Global config directory (~/.magic-helix)
  verbose?: boolean; // Enable debug logging
}

/**
 * Context provided to plugins during detection
 */
export interface DetectionContext {
  projectPath: string;
  workspacePath?: string;
  dependencies?: Record<string, string>;
  configFiles?: string[];
  filePatterns?: string[];
}

/**
 * Result of template resolution
 */
export interface TemplateResolutionResult {
  content: string;
  source: 'override' | 'workspace' | 'global' | 'plugin' | 'builtin';
  path: string;
  plugin?: string; // Plugin name if from plugin
}
