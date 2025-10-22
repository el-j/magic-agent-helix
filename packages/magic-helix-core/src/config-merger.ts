import * as fs from "node:fs";
import * as path from "node:path";
import pc from "picocolors";
import { BUILT_IN_CONFIG } from "./built-in-config";
import type { Config, MergedConfig } from "./types";

export const CONFIG_FILENAME = "ai-aligner.config.json";

/**
 * Loads the user's optional config file.
 * @returns A partial Config object or an empty object.
 */
export function loadUserConfig(): Partial<Config> {
	const configPath = path.resolve(process.cwd(), CONFIG_FILENAME);

	if (!fs.existsSync(configPath)) {
		console.log(
			pc.gray("  No user config file found. Using built-in conventions only."),
		);
		return {};
	}

	try {
		console.log(
			pc.blue("  User config file found. Merging with built-in conventions."),
		);
		return JSON.parse(fs.readFileSync(configPath, "utf-8"));
	} catch (e) {
		console.error(
			pc.red(`❌ Error parsing ${CONFIG_FILENAME}: ${(e as Error).message}`),
		);
		console.warn(
			pc.yellow(
				"  Please fix the JSON or remove the file. Using built-in conventions only.",
			),
		);
		return {};
	}
}

/**
 * Merges the base config with the user's partial config.
 * User's config values take precedence.
 * @param userConfig The partial config loaded from the user's file.
 * @returns A complete, merged Config object.
 */
export function mergeConfigs(userConfig: Partial<Config>): MergedConfig {
	const base = BUILT_IN_CONFIG;

	return {
		target: userConfig.target || base.target,
		templateDirectory: userConfig.templateDirectory ?? base.templateDirectory,
		outputDirectory: userConfig.outputDirectory ?? base.outputDirectory,
		dependencyTagMap: {
			...base.dependencyTagMap,
			...(userConfig.dependencyTagMap || {}),
		},
		configFileTagMap: {
			...base.configFileTagMap,
			...(userConfig.configFileTagMap || {}),
		},
		fileGlobTagMap: {
			...base.fileGlobTagMap,
			...(userConfig.fileGlobTagMap || {}),
		},
		tagTemplateMap: {
			...base.tagTemplateMap,
			...(userConfig.tagTemplateMap || {}),
		},
	};
}
