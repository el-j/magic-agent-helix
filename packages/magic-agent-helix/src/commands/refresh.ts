import * as fs from 'node:fs';
import * as path from 'node:path';
import type {
  ConfigFileTagMap,
  DependencyTagMap,
  FileGlobTagMap,
  TagTemplateMap,
} from 'magic-helix-core';
import {
  type AssistantTarget,
  BUILT_IN_TEMPLATE_DIR,
  getFormatter,
  loadUserConfig,
  mergeConfigs,
} from 'magic-helix-core';
import ora from 'ora';
import pc from 'picocolors';
import { buildPreciseGlobPattern } from '../utils/file-extensions';

// --- CONFIGURATION ---
const ROOT_PACKAGE_JSON = path.resolve(process.cwd(), 'package.json');

// --- TYPES ---
interface Project {
  name: string;
  path: string;
  tags: Set<string>;
}

import type { CliOptions } from '../utils/cli-options';
import { getLogLevel } from '../utils/cli-options';

/**
 * The 'refresh' command.
 * Rescans the project and updates existing instruction files with new information.
 */
export async function refresh(options: CliOptions = {}) {
  const _logLevel = getLogLevel(options);

  const mainSpinner = ora('Loading configurations...').start();

  // 1. Load Configs
  const userConfig = loadUserConfig(options.config);
  const config = mergeConfigs(userConfig);

  // Override target if specified
  if (options.target) {
    config.target = options.target;
  }

  mainSpinner.succeed('Configuration loaded.');

  const { dependencyTagMap, configFileTagMap, fileGlobTagMap, tagTemplateMap } =
    config;

  const userTemplateDir = path.resolve(
    process.cwd(),
    config.templateDirectory as string,
  );
  const targetDir = path.resolve(
    process.cwd(),
    config.outputDirectory as string,
  );

  // Get the formatter for the target assistant
  const formatter = getFormatter(config.target as AssistantTarget);

  // 2. Check if target directory exists
  if (!fs.existsSync(targetDir)) {
    console.log(
      pc.yellow(
        `⚠️  Output directory ${config.outputDirectory} does not exist.`,
      ),
    );
    console.log(
      pc.gray(`   Run 'magic-helix run' first to generate instruction files.`),
    );
    return;
  }

  // 3. Find all projects
  const projectSpinner = ora('Scanning for projects...').start();
  const projects = await findProjects();
  if (projects.length === 0) {
    projectSpinner.warn(
      pc.yellow(
        'No projects found. Make sure your root package.json has a "workspaces" field.',
      ),
    );
    return;
  }
  projectSpinner.succeed(`Found ${projects.length} projects.`);

  // 4. Analyze dependencies and tag projects
  const analyzeSpinner = ora('Analyzing project tags...').start();
  let totalTags = 0;
  for (const project of projects) {
    await analyzeProject(
      project,
      dependencyTagMap as DependencyTagMap,
      configFileTagMap as ConfigFileTagMap,
      fileGlobTagMap as FileGlobTagMap,
    );
    totalTags += project.tags.size;
  }
  analyzeSpinner.succeed(`Project analysis complete. Found ${totalTags} tags.`);

  // 5. Update existing instruction files
  console.log(
    pc.cyan(`\nRefreshing instruction files in ${config.outputDirectory}...`),
  );

  let updatedCount = 0;
  let skippedCount = 0;

  for (const project of projects) {
    if (project.tags.size === 0) {
      console.log(pc.gray(`  Skipping: ${project.name} (No matching tags)`));
      skippedCount++;
      continue;
    }

    console.log(pc.bold(`  Processing: ${project.name}`));
    console.log(pc.gray(`    Tags: ${[...project.tags].join(', ')}`));

    const globPattern = buildPreciseGlobPattern(project.path, project.tags);

    for (const tag of project.tags) {
      const templates = (tagTemplateMap as TagTemplateMap)[tag];
      if (!templates) continue;

      for (const t of templates) {
        const outputFilename = `${project.name}.${t.suffix}`;
        const outputPath = path.join(targetDir, outputFilename);

        // Check if file exists
        if (!fs.existsSync(outputPath)) {
          console.log(
            pc.yellow(`    ⚠️  File not found, skipping: ${outputFilename}`),
          );
          continue;
        }

        // Read template
        let templateContent = readTemplate(userTemplateDir, t.template);
        let source = 'Custom';

        if (!templateContent) {
          templateContent = readTemplate(BUILT_IN_TEMPLATE_DIR, t.template);
          source = 'Built-in';
        }

        if (!templateContent) {
          console.warn(pc.yellow(`    ⚠️  Template not found: ${t.template}`));
          continue;
        }

        // Update header with new information
        const header = formatter.getFrontmatter(globPattern, project.name);
        const formattedContent = formatter.format(
          templateContent,
          globPattern,
          project.name,
        );
        const fullContent = `${header}\n${formattedContent}`;

        // Write updated file
        fs.writeFileSync(outputPath, fullContent);
        updatedCount++;
        console.log(
          pc.green(
            `    ✅ Refreshed: ${pc.bold(outputFilename)} (from ${source})`,
          ),
        );
      }
    }
  }

  console.log(`\n✨ Refresh complete!`);
  console.log(pc.green(`   Updated: ${updatedCount} files`));
  console.log(pc.gray(`   Skipped: ${skippedCount} projects`));
}

// --- HELPER FUNCTIONS ---

async function findProjects(): Promise<Project[]> {
  const projects: Project[] = [];

  if (!fs.existsSync(ROOT_PACKAGE_JSON)) {
    throw new Error('No root package.json found. Cannot find projects.');
  }

  const rootPkg = JSON.parse(fs.readFileSync(ROOT_PACKAGE_JSON, 'utf-8'));
  const workspaces = rootPkg.workspaces?.packages || rootPkg.workspaces || [];

  // 1. Add root project
  projects.push({
    name: rootPkg.name
      ? rootPkg.name.replace(/@/g, '').replace(/\//g, '-')
      : 'root-project',
    path: '.',
    tags: new Set<string>(),
  });

  if (workspaces.length === 0) {
    return projects;
  }

  // 2. Add workspace projects
  const { glob } = await import('glob');
  const packageJsonPaths = await glob(
    workspaces.map((w: string) => `${w}/package.json`),
  );

  for (const pkgPath of packageJsonPaths) {
    try {
      const pkgContent = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      projects.push({
        name: pkgContent.name.replace(/@/g, '').replace(/\//g, '-'),
        path: path.dirname(pkgPath),
        tags: new Set<string>(),
      });
    } catch (_e) {
      console.warn(pc.yellow(`⚠️  Skipping invalid package.json: ${pkgPath}`));
    }
  }

  return projects;
}

async function analyzeProject(
  project: Project,
  depMap: DependencyTagMap,
  configMap: ConfigFileTagMap,
  globMap: FileGlobTagMap,
) {
  const projectRoot = path.resolve(process.cwd(), project.path);

  // Strategy 1: Analyze package.json dependencies
  try {
    const pkgPath = path.join(projectRoot, 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      const allDeps = {
        ...(pkg.dependencies || {}),
        ...(pkg.devDependencies || {}),
      };

      for (const dep in allDeps) {
        if (depMap[dep]) {
          project.tags.add(depMap[dep]);
        }
      }
    }
  } catch (e) {
    console.warn(
      pc.yellow(
        `⚠️  Could not parse package.json for ${project.name}: ${(e as Error).message}`,
      ),
    );
  }

  // Strategy 2: Analyze key config files
  try {
    for (const file in configMap) {
      const tag = configMap[file];
      const configPath = path.join(projectRoot, file);
      if (fs.existsSync(configPath)) {
        project.tags.add(tag);
      }
    }
  } catch (e) {
    console.warn(
      pc.yellow(
        `⚠️  Error scanning config files for ${project.name}: ${(e as Error).message}`,
      ),
    );
  }

  // Strategy 3: Analyze file globs
  try {
    const { glob } = await import('glob');
    for (const pattern in globMap) {
      const tag = globMap[pattern];
      const results = await glob(pattern, {
        cwd: projectRoot,
        nodir: true,
        dot: true,
      });
      if (results.length > 0) {
        project.tags.add(tag);
      }
    }
  } catch (e) {
    console.warn(
      pc.yellow(
        `⚠️  Error scanning file globs for ${project.name}: ${(e as Error).message}`,
      ),
    );
  }
}

function readTemplate(dir: string, templateFile: string): string | null {
  const p = path.join(dir, templateFile);
  try {
    return fs.readFileSync(p, 'utf-8');
  } catch (_e) {
    return null;
  }
}
