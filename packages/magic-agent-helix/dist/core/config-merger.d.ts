import type { Config, MergedConfig } from "../types";
export declare const CONFIG_FILENAME = "ai-aligner.config.json";
/**
 * Loads the user's optional config file.
 * @returns A partial Config object or an empty object.
 */
export declare function loadUserConfig(): Partial<Config>;
/**
 * Merges the base config with the user's partial config.
 * User's config values take precedence.
 * @param userConfig The partial config loaded from the user's file.
 * @returns A complete, merged Config object.
 */
export declare function mergeConfigs(userConfig: Partial<Config>): MergedConfig;
