// Browser-safe exports for MagicAgentHelix (no Node.js filesystem APIs)

export { analyzeProjectTags, type ProjectAnalysisData } from "./analysis";
export { BUILT_IN_CONFIG } from "./built-in-config";
export * from "./types";

import { BUILT_IN_CONFIG } from "./built-in-config";
// Browser-compatible version of mergeConfigs that doesn't load from filesystem
import type { Config, MergedConfig } from "./types";

/**
 * Merge user config with built-in config (browser version - no filesystem access)
 */
export function mergeConfigs(userConfig: Partial<Config>): MergedConfig {
	return {
		...BUILT_IN_CONFIG,
		...userConfig,
		dependencyTagMap: {
			...BUILT_IN_CONFIG.dependencyTagMap,
			...userConfig.dependencyTagMap,
		},
		configFileTagMap: {
			...BUILT_IN_CONFIG.configFileTagMap,
			...userConfig.configFileTagMap,
		},
		fileGlobTagMap: {
			...BUILT_IN_CONFIG.fileGlobTagMap,
			...userConfig.fileGlobTagMap,
		},
		tagTemplateMap: {
			...BUILT_IN_CONFIG.tagTemplateMap,
			...userConfig.tagTemplateMap,
		},
	};
}
