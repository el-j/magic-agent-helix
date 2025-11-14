import * as fs from 'node:fs';
import * as path from 'node:path';
import type {
  ConfigFileTagMap,
  DependencyTagMap,
  FileGlobTagMap,
} from 'magic-helix-core';
import { 
  loadUserConfig, 
  mergeConfigs, 
  PluginRegistry 
} from 'magic-helix-core';
import ora from 'ora';
import pc from 'picocolors';

/**
 * The 'list' command.
 * Shows detected projects, tags, and templates without generating files.
 */
export async function list() {
  console.log(pc.cyan('📋 Listing project information...\n'));

  const spinner = ora('Loading configuration...').start();

  // 1. Load Configs
  const userConfig = loadUserConfig();
  const config = mergeConfigs(userConfig);
  spinner.succeed('Configuration loaded.');

  const { dependencyTagMap, configFileTagMap, fileGlobTagMap, tagTemplateMap } =
    config;

  // 2. Find all projects
  const projectSpinner = ora('Scanning for projects...').start();
  const projects = await findProjects();
  if (projects.length === 0) {
    projectSpinner.warn(pc.yellow('No projects found.'));
    return;
  }
  projectSpinner.succeed(`Found ${projects.length} projects.`);

  // 3. Analyze projects
  const analyzeSpinner = ora('Analyzing projects...').start();
  for (const project of projects) {
    await analyzeProject(
      project,
      dependencyTagMap,
      configFileTagMap,
      fileGlobTagMap,
    );
  }
  analyzeSpinner.succeed('Analysis complete.\n');

  // 4. Display results
  console.log(pc.cyan(pc.bold('Projects & Tags:\n')));

  for (const project of projects) {
    console.log(pc.bold(`📦 ${project.name}`));
    console.log(pc.gray(`   Path: ${project.path}`));

    if (project.tags.size === 0) {
      console.log(pc.yellow('   No tags detected'));
    } else {
      console.log(pc.green(`   Tags: ${[...project.tags].join(', ')}`));

      // Show which templates would be applied
      const templates: string[] = [];
      for (const tag of project.tags) {
        const tagTemplates = tagTemplateMap[tag];
        if (tagTemplates) {
          for (const t of tagTemplates) {
            templates.push(`${project.name}.${t.suffix}`);
          }
        }
      }

      if (templates.length > 0) {
        console.log(pc.gray(`   Would generate: ${templates.join(', ')}`));
      }
    }
    console.log(); // Empty line
  }

  // 5. Show configuration summary
  console.log(pc.cyan(pc.bold('Configuration:\n')));
  console.log(pc.gray(`   Output directory: ${config.outputDirectory}`));
  console.log(pc.gray(`   Template directory: ${config.templateDirectory}`));
  console.log(pc.gray(`   Target: ${config.target}`));
}

// --- HELPER FUNCTIONS ---

interface Project {
  name: string;
  path: string;
  tags: Set<string>;
}

async function findProjects(): Promise<Project[]> {
  const projects: Project[] = [];
  const rootPath = process.cwd();

  // Use the new polyglot detection
  const registry = PluginRegistry.getInstance();
  await registry.initialize();
  const detectedResults = await registry.detectAllProjects(rootPath);
  const detectedProjects = detectedResults.map(r => r.metadata);
  
  if (detectedProjects.length === 0) {
    throw new Error('No projects found. Ensure your project has a manifest file (package.json, go.mod, Cargo.toml, etc.).');
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

  // Analyze dependencies from any manifest file
  try {
    const registry = PluginRegistry.getInstance();
    const detectedResults = await registry.detectAllProjects(projectRoot);
    const detectedProjects = detectedResults.map(r => r.metadata);
    if (detectedProjects.length > 0) {
      const projectMetadata = detectedProjects[0]; // Use first match
      
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
  } catch (_e) {
    // Skip errors
  }

  // Analyze config files
  try {
    for (const file in configMap) {
      const tag = configMap[file];
      const configPath = path.join(projectRoot, file);
      if (fs.existsSync(configPath)) {
        project.tags.add(tag);
      }
    }
  } catch (_e) {
    // Skip errors
  }

  // Analyze file globs
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
  } catch (_e) {
    // Skip errors
  }
}
