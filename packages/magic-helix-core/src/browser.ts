// Browser-safe exports for MagicAgentHelix (no Node.js filesystem APIs)
export * from "./types";
export { BUILT_IN_CONFIG } from "./built-in-config";
export { analyzeProjectTags, type ProjectAnalysisData } from "./analysis";

// Browser-compatible version of mergeConfigs that doesn't load from filesystem
import type { Config, MergedConfig } from "./types";
import { BUILT_IN_CONFIG } from "./built-in-config";

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
