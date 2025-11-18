import * as fs from 'node:fs';
import * as path from 'node:path';
import pc from 'picocolors';
import { BUILT_IN_CONFIG } from './built-in-config';
import { DEFAULT_AI_REFINEMENT } from './ai-refinement';
import type { Config, MergedConfig } from './types';

export const CONFIG_FILENAME = 'magic-helix.config.json';
const LEGACY_CONFIG_FILENAMES = ['ai-aligner.config.json'];

/**
 * Loads the user's optional config file.
 * @param configPath Optional path to config file. Defaults to magic-helix.config.json in cwd (legacy ai-aligner config is still supported).
 * @returns A partial Config object or an empty object.
 */
export function loadUserConfig(configPath?: string): Partial<Config> {
  const searchPaths = configPath
    ? [path.resolve(process.cwd(), configPath)]
    : [
        path.resolve(process.cwd(), CONFIG_FILENAME),
        ...LEGACY_CONFIG_FILENAMES.map((filename) =>
          path.resolve(process.cwd(), filename),
        ),
      ];

  const resolvedPath = searchPaths.find((candidate, index) => {
    const exists = fs.existsSync(candidate);
    if (!configPath && exists && index > 0) {
      console.warn(
        pc.yellow(
          `  Detected legacy config file ${path.basename(candidate)}. Please rename it to ${CONFIG_FILENAME}.`,
        ),
      );
    }
    return exists;
  });

  if (!resolvedPath) {
    console.log(
      pc.gray('  No user config file found. Using built-in conventions only.'),
    );
    return {};
  }

  try {
    console.log(
      pc.blue('  User config file found. Merging with built-in conventions.'),
    );
    return JSON.parse(fs.readFileSync(resolvedPath, 'utf-8'));
  } catch (e) {
    console.error(
      pc.red(`❌ Error parsing config file: ${(e as Error).message}`),
    );
    console.warn(
      pc.yellow(
        '  Please fix the JSON or remove the file. Using built-in conventions only.',
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
    aiRefinement: {
      ...DEFAULT_AI_REFINEMENT,
      ...(userConfig.aiRefinement || {}),
    },
  };
}
