import { CodeownersPlugin } from './plugins/codeowners.plugin';
import { DockerPlugin } from './plugins/docker.plugin';
import { GitHubActionsPlugin } from './plugins/github-actions.plugin';
import { GoPlugin } from './plugins/go.plugin';
import { MonorepoPlugin } from './plugins/monorepo.plugin';
import type {
  DetectionContext,
  DetectionPlugin,
  Instruction,
} from './plugins/plugin.interface';
import { PythonPlugin } from './plugins/python.plugin';
import { RustPlugin } from './plugins/rust.plugin';

/**
 * @deprecated AnalysisService wraps the v2 DetectionPlugin interface which is
 * no longer the main execution path. The canonical way to analyze a project is
 * via the v3 PluginRegistry:
 *
 * ```typescript
 * import { initializeRegistry, PluginRegistry } from '@el-j/magic-helix-core';
 *
 * await initializeRegistry();
 * const registry = PluginRegistry.getInstance();
 * const projects = await registry.findProjects(projectRoot);
 * ```
 *
 * AnalysisService is kept for backward compatibility only and will be removed
 * in a future major version.
 */
export class AnalysisService {
  private plugins: DetectionPlugin[];

  constructor() {
    // Register all known plugins.
    // This is where you will add all your new plugins.
    this.plugins = [
      new GoPlugin(),
      new DockerPlugin(),
      new GitHubActionsPlugin(),
      new PythonPlugin(), // <-- Add this
      new RustPlugin(),
      new MonorepoPlugin(), // <-- Add this
      new CodeownersPlugin(),
    ];
    // TypeScript, Vue, React and other primary language plugins are handled by
    // the v3 PluginRegistry + magic-helix-plugins package. See class JSDoc above.
  }

  /**
   * Analyzes a project and generates all AI instructions.
   * @param context - The project file context.
   * @returns An array of all instructions from all detected plugins.
   */
  async analyzeProject(context: DetectionContext): Promise<Instruction[]> {
    let allInstructions: Instruction[] = [];

    console.log('Starting project analysis...');

    for (const plugin of this.plugins) {
      try {
        if (await plugin.detect(context)) {
          console.log(`[MagicHelix] Detected: ${plugin.name}`);
          const instructions = await plugin.generateInstructions(context);
          allInstructions = [...allInstructions, ...instructions];
        }
      } catch (error) {
        console.error(`[MagicHelix] Error in plugin: ${plugin.name}`, error);
      }
    }

    console.log(
      `Analysis complete. Found ${allInstructions.length} instruction files.`,
    );
    return allInstructions;
  }
}
