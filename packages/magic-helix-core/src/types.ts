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
 * The structure of the ai-aligner.config.json file.
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
}

/**
 * The merged config after combining user config with built-in.
 * All optional fields are filled with defaults.
 */
export type MergedConfig = Required<Config>;
