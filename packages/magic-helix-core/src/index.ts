// Core exports for MagicAgentHelix

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export { analyzeProjectTags, type ProjectAnalysisData } from './analysis';
export { BUILT_IN_CONFIG } from './built-in-config';
export { loadUserConfig, mergeConfigs } from './config-merger';
export {
  type AssistantTarget,
  getFormatter,
  type InstructionFormatter,
} from './formatters';
// Plugin-based Analysis
export {
  analyzeWithPlugins,
  type PluginAnalysisResult,
  registerBuiltInPlugins,
} from './plugin-analyzer';

// Plugin System (v2.0.0)
export {
  type DetectionContext,
  type DetectionPlugin,
  type DetectionResult,
  type InstructionTemplate,
  PluginRegistry,
  pluginRegistry,
} from './plugin-system';

// Built-in Plugins
export {
  CodeOwnersPlugin,
  DockerPlugin,
  GitHubActionsPlugin,
  GitLabCIPlugin,
  GolangPlugin,
  MonorepoPlugin,
  PHPPlugin,
  PythonPlugin,
  RustPlugin,
} from './plugins';
export * from './types';

// Export the path to the built-in templates directory
export const BUILT_IN_TEMPLATE_DIR = resolve(__dirname, 'default_templates');
