import * as fs from 'node:fs';
import * as path from 'node:path';
import type {
  ConfigFileTagMap,
  DependencyTagMap,
  FileGlobTagMap,
  TagTemplateMap,
} from '@el-j/magic-helix-core';
import {
  type AssistantTarget,
  BUILT_IN_TEMPLATE_DIR,
  getFormatter,
  loadUserConfig,
  mergeConfigs,
} from '@el-j/magic-helix-core';
import { PluginRegistry } from '@el-j/magic-helix-core';
import ora from 'ora';
import pc from 'picocolors';
import { buildPreciseGlobPattern } from '../utils/file-extensions';

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

  console.log('\n✨ Refresh complete!');
  console.log(pc.green(`   Updated: ${updatedCount} files`));
  console.log(pc.gray(`   Skipped: ${skippedCount} projects`));
}

// --- HELPER FUNCTIONS ---

async function findProjects(): Promise<Project[]> {
  const projects: Project[] = [];
  const rootPath = process.cwd();

  // Use the new polyglot detection
  const registry = PluginRegistry.getInstance();
  await registry.initialize();
  const detectedResults = await registry.detectAllProjects(rootPath);
  const detectedProjects = detectedResults.map((r) => r.metadata);

  if (detectedProjects.length === 0) {
    return [];
  }

  for (const proj of detectedProjects) {
    const relativePath = path.relative(rootPath, proj.projectPath);
    projects.push({
      name: proj.name || path.basename(proj.projectPath),
      path: relativePath || '.',
      tags: new Set<string>(),
    });
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

  // Strategy 1: Analyze dependencies from any manifest file
  try {
    const registry = PluginRegistry.getInstance();
    const detectedResults = await registry.detectAllProjects(projectRoot);
    const detectedProjects = detectedResults.map((r) => r.metadata);
    if (detectedProjects.length > 0) {
      const projectMetadata = detectedProjects[0]; // Use first match

      if (projectMetadata.tags?.length) {
        for (const tag of projectMetadata.tags) {
          project.tags.add(tag);
        }
      }

      for (const dep in projectMetadata.dependencies) {
        // Check both the full dependency name and the package/module name
        if (depMap[dep]) {
          project.tags.add(depMap[dep]);
        }

        // For scoped packages like @scope/pkg or group:artifact, try the base name too
        const baseName = dep.split(/[@/:]/g).pop();
        if (baseName && depMap[baseName]) {
          project.tags.add(depMap[baseName]);
        }
      }
    }
  } catch (e) {
    console.warn(
      pc.yellow(
        `⚠️  Could not analyze dependencies for ${project.name}: ${(e as Error).message}`,
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
