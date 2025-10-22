import type { DependencyTagMap, ConfigFileTagMap, FileGlobTagMap } from './types';

/**
 * The data structure representing the analysis of a project.
 * This is built by scanning the project's files and dependencies.
 */
export interface ProjectAnalysisData {
  /** Dependencies from package.json (both dependencies and devDependencies) */
  dependencies: Record<string, string>;
  /** Key config files found at the project root */
  configFiles: string[];
  /** All project files (for glob matching) */
  projectFiles: string[];
}

/**
 * Analyzes a project and returns the set of tags that apply to it.
 * This is the core logic that determines which instruction templates to apply.
 */
export function analyzeProjectTags(
  analysisData: ProjectAnalysisData,
  dependencyTagMap: DependencyTagMap,
  configFileTagMap: ConfigFileTagMap,
  fileGlobTagMap: FileGlobTagMap
): Set<string> {
  const tags = new Set<string>();

  // Strategy 1: Analyze dependencies
  for (const [dep, version] of Object.entries(analysisData.dependencies)) {
    if (dependencyTagMap[dep]) {
      tags.add(dependencyTagMap[dep]);
    }
  }

  // Strategy 2: Analyze config files
  for (const configFile of analysisData.configFiles) {
    if (configFileTagMap[configFile]) {
      tags.add(configFileTagMap[configFile]);
    }
  }

  // Strategy 3: Analyze file globs
  for (const pattern in fileGlobTagMap) {
    const tag = fileGlobTagMap[pattern];
    // Simple pattern matching (in a real implementation, use a proper glob library)
    const regex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\?/g, '.'));
    if (analysisData.projectFiles.some(file => regex.test(file))) {
      tags.add(tag);
    }
  }

  return tags;
}