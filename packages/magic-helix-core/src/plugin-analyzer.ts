import type { ProjectAnalysisData } from './analysis';
import type { DetectionContext, InstructionTemplate } from './plugin-system';
import { pluginRegistry } from './plugin-system';

/**
 * Implementation of DetectionContext that wraps ProjectAnalysisData
 */
class ProjectDetectionContext implements DetectionContext {
  constructor(
    private readonly analysisData: ProjectAnalysisData,
    private readonly fileContentCache: Map<string, string> = new Map(),
  ) {}

  get files(): string[] {
    return this.analysisData.projectFiles;
  }

  get dependencies(): Record<string, string> {
    return this.analysisData.dependencies;
  }

  get configFiles(): string[] {
    return this.analysisData.configFiles;
  }

  getTextFile(path: string): string | null {
    // Check cache first
    if (this.fileContentCache.has(path)) {
      return this.fileContentCache.get(path) || null;
    }
    // In the real implementation, this would read from filesystem
    // For now, return null to indicate file reading needs to be implemented
    return null;
  }

  hasFile(path: string): boolean {
    return (
      this.analysisData.projectFiles.includes(path) ||
      this.analysisData.configFiles.includes(path)
    );
  }

  matchesPattern(pattern: string): boolean {
    // Convert glob pattern to regex and test against files
    const regex = this.globToRegex(pattern);
    return this.analysisData.projectFiles.some((file) => regex.test(file));
  }

  private globToRegex(pattern: string): RegExp {
    // Simple glob to regex conversion
    // ** matches any number of directories
    // * matches anything except /
    const regexStr = pattern
      .replace(/\\/g, '\\\\') // Escape backslashes first
      .replace(/\*\*/g, '§DOUBLESTAR§')
      .replace(/\*/g, '[^/]*')
      .replace(/§DOUBLESTAR§/g, '.*')
      .replace(/\./g, '\\.');
    return new RegExp(`^${regexStr}$`);
  }
}

/**
 * Result of plugin-based analysis
 */
export interface PluginAnalysisResult {
  /** Tags detected by plugins */
  tags: Set<string>;
  /** Instruction templates to generate */
  instructions: InstructionTemplate[];
  /** Metadata from plugin detection */
  metadata: Map<string, Record<string, unknown>>;
}

/**
 * Analyzes a project using the plugin system
 */
export async function analyzeWithPlugins(
  analysisData: ProjectAnalysisData,
  fileReader?: (path: string) => string | null,
): Promise<PluginAnalysisResult> {
  const tags = new Set<string>();
  const instructions: InstructionTemplate[] = [];
  const metadata = new Map<string, Record<string, unknown>>();

  // Create detection context
  const fileContentCache = new Map<string, string>();
  if (fileReader) {
    // Pre-populate cache for common files if file reader is provided
    for (const file of analysisData.configFiles) {
      const content = fileReader(file);
      if (content) {
        fileContentCache.set(file, content);
      }
    }
  }

  const context = new ProjectDetectionContext(analysisData, fileContentCache);

  // Override getTextFile if fileReader is provided
  if (fileReader) {
    const originalGetTextFile = context.getTextFile.bind(context);
    context.getTextFile = (path: string): string | null => {
      const cached = originalGetTextFile(path);
      if (cached !== null) return cached;
      return fileReader(path);
    };
  }

  // Run all registered plugins
  const plugins = pluginRegistry.getAll();

  for (const plugin of plugins) {
    try {
      // Run detection
      const result = await Promise.resolve(plugin.detect(context));

      if (result.detected) {
        // Add tags
        if (result.tags) {
          for (const tag of result.tags) {
            tags.add(tag);
          }
        }

        // Store metadata
        if (result.metadata) {
          metadata.set(plugin.name, result.metadata);
        }

        // Generate instructions
        const pluginInstructions = await Promise.resolve(
          plugin.generateInstructions(context, result.metadata),
        );

        instructions.push(...pluginInstructions);
      }
    } catch (error) {
      console.error(`Error running plugin ${plugin.name}:`, error);
      // Continue with other plugins even if one fails
    }
  }

  return {
    tags,
    instructions,
    metadata,
  };
}

/**
 * Registers all built-in plugins
 */
export function registerBuiltInPlugins(): void {
  // Import and register all built-in plugins
  // This is done lazily to avoid circular dependencies
  import('./plugins').then((plugins) => {
    pluginRegistry.register(new plugins.GolangPlugin());
    pluginRegistry.register(new plugins.PythonPlugin());
    pluginRegistry.register(new plugins.RustPlugin());
    pluginRegistry.register(new plugins.PHPPlugin());
    pluginRegistry.register(new plugins.DockerPlugin());
    pluginRegistry.register(new plugins.GitHubActionsPlugin());
    pluginRegistry.register(new plugins.GitLabCIPlugin());
    pluginRegistry.register(new plugins.MonorepoPlugin());
    pluginRegistry.register(new plugins.CodeOwnersPlugin());
  });
}
