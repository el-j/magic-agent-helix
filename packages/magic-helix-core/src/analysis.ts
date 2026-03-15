import type {
  ConfigFileTagMap,
  DependencyTagMap,
  FileGlobTagMap,
} from './types';

/**
 * Converts a glob pattern to a regular expression.
 *
 * Supports:
 *  - `**`      — matches zero or more path segments (including empty)
 *  - `*`       — matches any characters within a single path segment (no `/`)
 *  - `{a,b}`   — matches any of the comma-separated alternatives
 *  - All other regex-special characters are escaped literally
 *
 * Replaces the previous implementation that hardcoded two special cases
 * (`src/**\/*.ts` and `src/**\/*.vue`) and had an escaping bug in the fallback.
 */
function globToRegex(pattern: string): RegExp {
  const parts: string[] = [];
  let i = 0;
  while (i < pattern.length) {
    const c = pattern[i];
    if (c === '*' && i + 1 < pattern.length && pattern[i + 1] === '*') {
      // ** matches zero or more path segments (the empty case covers foo/bar.ts
      // where ** sits between two slashes with nothing between them)
      parts.push('(.*/)?');
      i += 2;
      // consume the trailing slash that typically follows **
      if (i < pattern.length && pattern[i] === '/') i++;
    } else if (c === '*') {
      // * matches any characters except the path separator
      parts.push('[^/]*');
      i++;
    } else if (c === '{') {
      // {a,b,c} — match any alternative; escape regex specials inside each part
      const end = pattern.indexOf('}', i + 1);
      if (end !== -1) {
        const choices = pattern
          .slice(i + 1, end)
          .split(',')
          .map((p) => p.replace(/[.+^$()|[\]\\]/g, '\\$&'));
        parts.push(`(${choices.join('|')})`);
        i = end + 1;
      } else {
        parts.push('\\{');
        i++;
      }
    } else if (/[.+^$()|[\]\\]/.test(c)) {
      // Escape all remaining regex-special characters literally
      parts.push(`\\${c}`);
      i++;
    } else {
      parts.push(c);
      i++;
    }
  }
  return new RegExp(`^${parts.join('')}$`);
}

/**
 * Checks if any of the project files match the given glob pattern.
 */
function matchesGlobPattern(projectFiles: string[], pattern: string): boolean {
  const regex = globToRegex(pattern);
  return projectFiles.some((file) => regex.test(file));
}

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
  fileGlobTagMap: FileGlobTagMap,
): Set<string> {
  const tags = new Set<string>();

  // Strategy 1: Analyze dependencies
  for (const [dep, _version] of Object.entries(analysisData.dependencies)) {
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
    if (matchesGlobPattern(analysisData.projectFiles, pattern)) {
      tags.add(tag);
    }
  }

  return tags;
}
