/**
 * Provides the context for a plugin's detection logic.
 * This is passed by the core engine to each plugin.
 */
export interface DetectionContext {
  /**
   * A list of all file paths in the project root.
   * Example: ['package.json', 'src/index.ts', 'go.mod']
   */
  files: string[];

  /**
   * Asynchronously reads and parses a JSON file.
   * Returns null if the file doesn't exist or is invalid JSON.
   */
  getJsonFile: (filename: string) => Promise<any | null>;

  /**
   * Asynchronously reads a file as raw text.
   * Returns null if the file doesn't exist.
   */
  getTextFile: (filename: string) => Promise<string | null>;
}

/**
 * Represents a single generated AI instruction file.
 */
export interface Instruction {
  /**
   * The name of the file to be generated.
   * Example: 'go.md' or 'docker.md'
   */
  filename: string;

  /**
   * The Markdown content of the instruction file.
   */
  content: string;
}

/**
 * The core interface for all detection plugins.
 * Each plugin (e.g., GoPlugin, DockerPlugin) must implement this.
 */
export interface DetectionPlugin {
  /**
   * A unique, human-readable name for the plugin.
   * Example: 'Go (Golang)'
   */
  name: string;

  /**
   * Detects if the technology is present in the project.
   * @param context - The project file context.
   * @returns True if the technology is detected, false otherwise.
   */
  detect: (context: DetectionContext) => Promise<boolean>;

  /**
   * Generates the AI instruction files for this technology.
   * This is only called if detect() returns true.
   * @param context - The project file context.
   * @returns An array of instruction files.
   */
  generateInstructions: (context: DetectionContext) => Promise<Instruction[]>;
}
