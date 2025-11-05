import {
  DetectionPlugin,
  DetectionContext,
  Instruction,
} from './plugins/plugin.interface';
import { GoPlugin } from './plugins/go.plugin.ts';
import { PythonPlugin } from './plugins/python.plugin.ts';
import { RustPlugin } from './plugins/rust.plugin.ts';
import { MonorepoPlugin } from './plugins/monorepo.plugin.ts'; 
import { CodeownersPlugin } from './plugins/codeowners.plugin.ts';
import { DockerPlugin } from './plugins/docker.plugin.ts';
import { GitHubActionsPlugin } from './plugins/github-actions.plugin.ts';


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
     ]
    // TODO: add existing TypeScript/Vue/etc.
    // logic by wrapping it in a plugin!
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

    console.log(`Analysis complete. Found ${allInstructions.length} instruction files.`);
    return allInstructions;
  }
}
