// Core exports for MagicAgentHelix
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export * from "./types";
export { BUILT_IN_CONFIG } from "./built-in-config";
export { mergeConfigs, loadUserConfig } from "./config-merger";
export { analyzeProjectTags, type ProjectAnalysisData } from "./analysis";
export { getFormatter, type InstructionFormatter, type AssistantTarget } from "./formatters";

// Plugin System (v2.0.0)
export { 
	pluginRegistry, 
	PluginRegistry,
	type DetectionPlugin,
	type DetectionContext,
	type DetectionResult,
	type InstructionTemplate
} from "./plugin-system";

// Built-in Plugins
export { 
	GolangPlugin, 
	PythonPlugin, 
	RustPlugin, 
	PHPPlugin,
	DockerPlugin, 
	GitHubActionsPlugin, 
	GitLabCIPlugin,
	MonorepoPlugin,
	CodeOwnersPlugin
} from "./plugins";

// Export the path to the built-in templates directory
export const BUILT_IN_TEMPLATE_DIR = resolve(__dirname, "default_templates");
