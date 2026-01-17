import * as fs from 'node:fs';
import * as path from 'node:path';
import type {
  ConfigFileTagMap,
  DependencyTagMap,
  FileGlobTagMap,
  LanguagePlugin,
  TagTemplateMap,
} from '@el-j/magic-helix-core';
import {
  type AssistantTarget,
  PluginRegistry,
  type TemplateDefinition,
  getFormatter,
  loadUserConfig,
  mergeConfigs,
} from '@el-j/magic-helix-core';
import { glob } from 'glob';
import gradient from 'gradient-string';
import inquirer from 'inquirer';
import ora from 'ora';
import pc from 'picocolors';
import type { CliOptions } from '../utils/cli-options';
import { getLogLevel, shouldLog } from '../utils/cli-options';
import { buildPreciseGlobPattern } from '../utils/file-extensions';

// --- TYPES ---
interface Project {
  name: string; // Sanitized package name, e.g., 'scope-my-app'
  path: string; // Relative path from root, e.g., 'packages/my-app'
  tags: Set<string>;
}

type TemplateSource = {
  template: string;
  suffix: string;
  inlineContent?: string;
};

/**
 * Interactive wizard to guide users through configuration options
 */
async function runWizard(): Promise<Partial<CliOptions>> {
  console.log(
    gradient.pastel.multiline('🤖 MagicAgentHelix Interactive Setup Wizard'),
  );
  console.log("Let's configure your AI instruction generation...\n");

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'target',
      message: 'Which AI assistant are you using?',
      choices: [
        { name: 'GitHub Copilot', value: 'github-copilot' },
        { name: 'Claude/Cursor', value: 'claude' },
        { name: 'GitHub Copilot Chat', value: 'copilot-chat' },
        { name: 'Generic Assistant', value: 'generic' },
      ],
      default: 'github-copilot',
    },
    {
      type: 'confirm',
      name: 'dryRun',
      message:
        'Would you like to preview what would be generated first (dry run)?',
      default: true,
    },
    {
      type: 'input',
      name: 'outputDir',
      message: 'Where should the instruction files be generated?',
      default: '.ai',
      when: (answers) => !answers.dryRun,
    },
    {
      type: 'confirm',
      name: 'force',
      message: 'Overwrite existing files without prompting?',
      default: false,
      when: (answers) => !answers.dryRun,
    },
    {
      type: 'list',
      name: 'verbosity',
      message: 'How much output would you like to see?',
      choices: [
        { name: 'Verbose (detailed information)', value: 'verbose' },
        { name: 'Normal (standard output)', value: 'normal' },
        { name: 'Quiet (minimal output)', value: 'quiet' },
      ],
      default: 'normal',
    },
  ]);

  // Convert verbosity to CLI options
  const options: Partial<CliOptions> = {
    target: answers.target,
    dryRun: answers.dryRun,
  };

  if (answers.outputDir) {
    options.outputDir = answers.outputDir;
  }

  if (answers.force) {
    options.force = answers.force;
  }

  if (answers.verbosity === 'verbose') {
    options.verbose = true;
  } else if (answers.verbosity === 'quiet') {
    options.quiet = true;
  }

  console.log(pc.green('\n✅ Configuration complete! Starting analysis...\n'));

  return options;
}

/**
 * The 'run' command.
 * Scans the monorepo and generates instruction files.
 */
export async function run(options: CliOptions = {}) {
  // Run interactive wizard if requested
  let effectiveOptions = options;
  if (options.wizard) {
    const wizardOptions = await runWizard();
    // Merge wizard options with command line options (CLI options take precedence)
    effectiveOptions = { ...wizardOptions, ...options };
  }

  const logLevel = getLogLevel(effectiveOptions);

  if (shouldLog('normal', logLevel)) {
    console.log(
      gradient.pastel.multiline('🤖 Running AI Convention Aligner...'),
    );
  }

  if (effectiveOptions.dryRun && shouldLog('normal', logLevel)) {
    console.log(pc.yellow('🔍 DRY RUN MODE - No files will be written\n'));
  }

  const mainSpinner = ora('Loading configurations...').start();

  // 1. Load Configs (Built-in + Optional User)
  const userConfig = loadUserConfig(effectiveOptions.config);
  const config = mergeConfigs(userConfig);

  // Override output directory if specified
  if (effectiveOptions.outputDir) {
    config.outputDirectory = effectiveOptions.outputDir;
  }

  // Override target if specified
  if (effectiveOptions.target) {
    config.target = effectiveOptions.target;
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

  // 2. Find all projects
  const projectSpinner = ora('Scanning for projects...').start();
  const projects = await findProjects();
  if (projects.length === 0) {
    projectSpinner.warn(
      pc.yellow(
        'No projects detected. The tool could not find any supported project types in the current directory.',
      ),
    );
    console.log(
      pc.gray(
        '\nSupported project types: Node.js, Python, Go, Rust, Java, Ruby, PHP, C#, Swift, C/C++, PlatformIO',
      ),
    );
    console.log(
      pc.gray(
        'For monorepos, ensure your root package.json has a "workspaces" field.',
      ),
    );
    console.log(
      pc.gray(
        'For standalone projects, ensure you have the appropriate manifest file (package.json, go.mod, Cargo.toml, platformio.ini, etc.)',
      ),
    );
    return;
  }
  projectSpinner.succeed(`Found ${projects.length} projects.`);

  // 3. Analyze dependencies and tag projects
  const analyzeSpinner = ora('Analyzing project tags...').start();
  let totalTags = 0;
  for (const project of projects) {
    // Skip if specific project requested and this isn't it
    if (effectiveOptions.project && project.name !== effectiveOptions.project) {
      if (shouldLog('verbose', logLevel)) {
        console.log(pc.gray(`Skipping ${project.name} (not target project)`));
      }
      continue;
    }

    await analyzeProject(
      project,
      dependencyTagMap as DependencyTagMap,
      configFileTagMap as ConfigFileTagMap,
      fileGlobTagMap as FileGlobTagMap,
    );
    totalTags += project.tags.size;
  }
  analyzeSpinner.succeed(`Project analysis complete. Found ${totalTags} tags.`);

  // 4. Ensure target directory exists
  if (!effectiveOptions.dryRun) {
    ensureTargetDir(targetDir);
  } else if (shouldLog('verbose', logLevel)) {
    console.log(pc.gray(`Would ensure directory: ${targetDir}`));
  }

  // Apply template filtering if specified
  let filteredTagTemplateMap = tagTemplateMap as TagTemplateMap;
  if (effectiveOptions.template) {
    const templatePatterns = effectiveOptions.template
      .split(',')
      .map((p) => p.trim());
    filteredTagTemplateMap = {} as TagTemplateMap;

    for (const [tag, templates] of Object.entries(tagTemplateMap)) {
      const filteredTemplates = templates.filter((template) => {
        return templatePatterns.some((pattern) => {
          // Support wildcard matching
          if (pattern.includes('*')) {
            const regex = new RegExp(pattern.replace(/\*/g, '.*'));
            return regex.test(template.template) || regex.test(tag);
          }
          return template.template.includes(pattern) || tag.includes(pattern);
        });
      });

      if (filteredTemplates.length > 0) {
        filteredTagTemplateMap[tag] = filteredTemplates;
      }
    }

    if (shouldLog('verbose', logLevel)) {
      console.log(
        pc.gray(`Template filter applied: ${effectiveOptions.template}`),
      );
    }
  }

  // Merge plugin-provided templates (inline content) with config templates
  const pluginTemplateMap = await getPluginTemplates();
  const combinedTemplateMap: Record<string, TemplateSource[]> = {};

  for (const [tag, templates] of Object.entries(filteredTagTemplateMap)) {
    combinedTemplateMap[tag] = templates.map((t) => ({
      template: t.template,
      suffix: t.suffix,
    }));
  }

  for (const [tag, templates] of Object.entries(pluginTemplateMap)) {
    if (!combinedTemplateMap[tag]) {
      combinedTemplateMap[tag] = [];
    }
    combinedTemplateMap[tag].push(...templates);
  }

  // Debug logging for template maps
  if (shouldLog('verbose', logLevel)) {
    console.log(pc.gray('\n--- Template Map Debug ---'));
    console.log(
      pc.gray(
        `Plugin templates: ${Object.keys(pluginTemplateMap).length} tags`,
      ),
    );
    console.log(
      pc.gray(`  Tags: ${Object.keys(pluginTemplateMap).join(', ')}`),
    );
    console.log(
      pc.gray(
        `Config templates: ${Object.keys(filteredTagTemplateMap).length} tags`,
      ),
    );
    console.log(
      pc.gray(`  Tags: ${Object.keys(filteredTagTemplateMap).join(', ')}`),
    );
    console.log(
      pc.gray(
        `Combined templates: ${Object.keys(combinedTemplateMap).length} tags`,
      ),
    );
    console.log(
      pc.gray(`  Tags: ${Object.keys(combinedTemplateMap).join(', ')}`),
    );
  }

  // 5. Generate files
  if (shouldLog('normal', logLevel)) {
    console.log(
      pc.cyan(`\nGenerating instruction files in ${config.outputDirectory}...`),
    );
  }
  const generateSpinner = ora('Generating instruction files...').start();
  const generatedFiles: string[] = [];
  let processedProjects = 0;
  let totalTemplates = 0;
  for (const project of projects) {
    // Skip if specific project requested and this isn't it
    if (effectiveOptions.project && project.name !== effectiveOptions.project) {
      continue;
    }

    if (project.tags.size === 0) {
      if (shouldLog('normal', logLevel)) {
        console.log(pc.gray(`  Skipping: ${project.name} (No matching tags)`));
      }
      continue;
    }

    processedProjects++;
    if (shouldLog('normal', logLevel)) {
      console.log(pc.bold(`  Processing: ${project.name}`));
    }
    if (shouldLog('verbose', logLevel)) {
      console.log(pc.gray(`    Tags: ${[...project.tags].join(', ')}`));
    }

    const globPattern = buildPreciseGlobPattern(
      project.path,
      project.tags,
      effectiveOptions.exclude,
    );

    for (const tag of project.tags) {
      const templates = combinedTemplateMap[tag];
      if (!templates) continue;

      for (const t of templates) {
        totalTemplates++;
        // Use plugin inline content or user custom templates
        const templateContent =
          t.inlineContent ?? readTemplate(userTemplateDir, t.template);
        const source = t.inlineContent ? 'Plugin' : 'Custom';

        if (!templateContent) {
          console.warn(pc.yellow(`    ⚠️  Template not found: ${t.template}`));
          continue;
        }

        const header = formatter.getFrontmatter(globPattern, project.name);
        const formattedContent = formatter.format(
          templateContent,
          globPattern,
          project.name,
        );
        const fullContent = `${header}\n${formattedContent}`;

        // For monorepos: prefix filename with project name to avoid overwrites
        // Format: <project-name>.<tag>.instructions.md (e.g., "love-my-car-admin-dashboard.vue.instructions.md")
        // Single repos get just the tag name (e.g., "vue.instructions.md")
        const projectPrefix =
          projects.length > 1 ? `${project.name.replace(/[@/]/g, '-')}.` : '';
        const outputFilename = `${projectPrefix}${t.suffix}`;
        const outputPath = path.join(targetDir, outputFilename);

        generatedFiles.push(outputFilename);

        if (effectiveOptions.dryRun) {
          if (shouldLog('normal', logLevel)) {
            console.log(
              pc.cyan(
                `    📝 Would generate: ${pc.bold(outputFilename)} (from ${source})`,
              ),
            );
          }
        } else {
          fs.writeFileSync(outputPath, fullContent);
          if (shouldLog('normal', logLevel)) {
            console.log(
              pc.green(
                `    ✅ Generated: ${pc.bold(outputFilename)} (from ${source})`,
              ),
            );
          }
        }
      }
    }
  }

  generateSpinner.succeed(
    `Generated ${generatedFiles.length} files from ${totalTemplates} templates across ${processedProjects} projects`,
  );

  // 6. Pruning: Ask to remove old files
  if (!effectiveOptions.dryRun && !effectiveOptions.skipPruning) {
    await pruneOldFiles(targetDir, generatedFiles, effectiveOptions.force);
  } else if (effectiveOptions.dryRun && shouldLog('verbose', logLevel)) {
    console.log(pc.gray('\nWould check for old files to prune...'));
  }

  if (shouldLog('normal', logLevel)) {
    console.log(`\n${'═'.repeat(60)}`);
    if (effectiveOptions.dryRun) {
      console.log(pc.cyan('✨ Dry run complete! No files were modified.'));
      console.log(
        pc.gray(
          `📋 Would have generated ${generatedFiles.length} instruction file(s)`,
        ),
      );
      console.log(
        pc.gray(
          `📊 From ${totalTemplates} template(s) across ${processedProjects} project(s)`,
        ),
      );
    } else {
      console.log(pc.green('✨ AI instruction alignment complete!'));
      console.log(
        pc.bold(`📁 Generated ${generatedFiles.length} instruction file(s)`),
      );
      console.log(
        pc.gray(
          `📊 From ${totalTemplates} template(s) across ${processedProjects} project(s)`,
        ),
      );
      console.log(
        pc.gray(`📂 Files are located in: ${pc.bold(config.outputDirectory)}`),
      );
    }
    console.log('═'.repeat(60));
  }

  if (config.target === 'github-copilot' && shouldLog('normal', logLevel)) {
    console.log('\n--- VS Code + GitHub Copilot Tip ---');
    console.log(
      "To maximize Copilot's awareness, add this to your workspace .vscode/settings.json:",
    );
    console.log(`
  "github.copilot.advanced": {
    "instructions": ".github/instructions"
  }
    `);
    console.log(
      'This tells Copilot to *always* read these files. Restart VS Code after adding.',
    );
  }
}

// --- HELPER FUNCTIONS ---

function ensureTargetDir(targetDir: string) {
  const spinner = ora(`Checking target directory: ${targetDir}`).start();
  if (!fs.existsSync(targetDir)) {
    spinner.text = 'Target directory not found. Creating...';
    try {
      fs.mkdirSync(targetDir, { recursive: true });
      spinner.succeed(`Created ${targetDir}`);
    } catch (error) {
      spinner.fail(
        pc.red(
          `Error creating directory: ${(error as Error).message}. Please check permissions.`,
        ),
      );
      process.exit(1);
    }
  } else {
    spinner.succeed('Target directory OK.');
  }
}

async function ensureRegistryInitialized() {
  const registry = PluginRegistry.getInstance();
  // initialize will short-circuit if already initialized
  await registry.initialize();
}

async function getPluginTemplates(): Promise<Record<string, TemplateSource[]>> {
  await ensureRegistryInitialized();
  const registry = PluginRegistry.getInstance();
  let plugins: LanguagePlugin[] = [];

  try {
    // Direct method call instead of type casting
    plugins = await registry.getAllPlugins();
  } catch (e) {
    console.warn(
      pc.yellow(`⚠️  Failed to get plugins: ${(e as Error).message}`),
    );
    console.warn(
      pc.yellow(
        `⚠️  Registry type: ${typeof registry}, has getAllPlugins: ${typeof registry?.getAllPlugins}`,
      ),
    );
  }

  if (plugins.length === 0) {
    console.warn(pc.yellow('⚠️  No plugins loaded from registry!'));
  }

  const map: Record<string, TemplateSource[]> = {};

  for (const plugin of plugins) {
    let templates: TemplateDefinition[] = [];
    try {
      const maybeTemplates = await plugin.getTemplates();
      templates = Array.isArray(maybeTemplates) ? maybeTemplates : [];
    } catch (e) {
      console.warn(
        pc.yellow(
          `⚠️  Plugin ${plugin.name} getTemplates failed: ${(e as Error).message}`,
        ),
      );
      continue;
    }

    for (const tmpl of templates) {
      // Convert template name to suffix: 'lang-typescript' → 'typescript.instructions.md'
      // 'react-core' → 'react.instructions.md', etc.
      const baseName = tmpl.name.replace(/^lang-/, '').replace(/-core$/, '');
      const suffix = `${baseName}.instructions.md`;
      let content: string | null = null;
      try {
        content =
          typeof tmpl.content === 'function'
            ? await tmpl.content()
            : tmpl.content;
      } catch (e) {
        console.warn(
          pc.yellow(
            `⚠️  Plugin ${plugin.name} template ${tmpl.name} failed to load: ${(e as Error).message}`,
          ),
        );
      }

      for (const tag of tmpl.tags) {
        if (!map[tag]) map[tag] = [];
        map[tag].push({
          template: `plugin:${plugin.name}/${tmpl.name}`,
          suffix,
          inlineContent: content ?? undefined,
        });
      }
    }
  }

  return map;
}

async function findProjects(): Promise<Project[]> {
  await ensureRegistryInitialized();
  const rootPath = process.cwd();

  // Initialize plugin registry and detect projects
  const registry = PluginRegistry.getInstance();
  const detectedProjects = await registry.detectAllProjects(rootPath);

  if (detectedProjects.length === 0) {
    return [];
  }

  // Group detections by project path to aggregate multi-language/multi-plugin results
  const projectMap = new Map<
    string,
    {
      name: string;
      path: string;
      tags: Set<string>;
      allMetadata: ProjectMetadata[];
    }
  >();

  for (const result of detectedProjects) {
    const relativePath = path.relative(rootPath, result.metadata.projectPath);
    const projectKey = relativePath || '.';

    if (!projectMap.has(projectKey)) {
      projectMap.set(projectKey, {
        name: sanitizeProjectName(
          result.metadata.name || path.basename(result.metadata.projectPath),
        ),
        path: projectKey,
        tags: new Set<string>(),
        allMetadata: [],
      });
    }

    const project = projectMap.get(projectKey)!;
    project.allMetadata.push(result.metadata);

    // Aggregate tags from this plugin's detection
    if (result.metadata.tags?.length) {
      for (const tag of result.metadata.tags) {
        project.tags.add(tag);
      }
    }
  }

  // Convert map to array
  return Array.from(projectMap.values()).map(
    ({ name, path: projectPath, tags }) => ({
      name,
      path: projectPath,
      tags,
    }),
  );
}

/**
 * Sanitize project names for filesystem-safe output filenames.
 * - Convert scoped names like "@scope/app" to "scope-app"
 * - Replace path separators and whitespace with '-'
 * - Remove leading '@'
 */
function sanitizeProjectName(name: string): string {
  const trimmed = name.trim();
  // Replace slashes with dashes, remove leading '@'
  let sanitized = trimmed.replace(/^@/, '').replace(/[\\/\s]+/g, '-');
  // Collapse multiple dashes
  sanitized = sanitized.replace(/-+/g, '-');
  return sanitized;
}

async function analyzeProject(
  project: Project,
  depMap: DependencyTagMap,
  configMap: ConfigFileTagMap,
  globMap: FileGlobTagMap,
) {
  await ensureRegistryInitialized();
  const projectRoot = path.resolve(process.cwd(), project.path);

  // Strategy 1: Analyze via plugins (tags already populated in findProjects, but let's enrich further)
  try {
    const registry = PluginRegistry.getInstance();
    const detectedProjects = await registry.detectAllProjects(projectRoot);

    // Aggregate tags from ALL detected plugins at this path
    for (const detected of detectedProjects) {
      const projectMetadata = detected.metadata;

      // Add plugin-provided tags
      if (projectMetadata.tags?.length) {
        for (const tag of projectMetadata.tags) {
          project.tags.add(tag);
        }
      }

      // Add tags from dependency mapping (from built-in config)
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
    for (const pattern in globMap) {
      const tag = globMap[pattern];
      // Use 'glob' package for async globbing
      const results = await glob(pattern, {
        cwd: projectRoot,
        nodir: true,
        dot: true, // Include dotfiles if needed, though 'src' patterns usually don't
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
    return null; // Will be handled in the main function
  }
}

async function pruneOldFiles(
  targetDir: string,
  generatedFiles: string[],
  force = false,
) {
  const existingFiles = fs
    .readdirSync(targetDir)
    .filter((f) => f.endsWith('.md'));

  const oldFiles = existingFiles.filter((f) => !generatedFiles.includes(f));

  if (oldFiles.length > 0) {
    console.warn(
      pc.yellow(
        `\n⚠️  Found ${oldFiles.length} instruction files that are no longer generated:`,
      ),
    );
    for (const f of oldFiles) {
      console.warn(pc.yellow(`  - ${f}`));
    }

    let prune = force;

    if (!force) {
      const answer = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'prune',
          message: `Do you want to delete these ${oldFiles.length} old files?`,
          default: false,
        },
      ]);
      prune = answer.prune;
    }

    if (prune) {
      let deleteCount = 0;
      for (const file of oldFiles) {
        try {
          fs.unlinkSync(path.join(targetDir, file));
          deleteCount++;
        } catch (e) {
          console.error(
            pc.red(`  ❌ Error deleting ${file}: ${(e as Error).message}`),
          );
        }
      }
      console.log(`✅ Pruned ${deleteCount} old files.`);
    }
  }
}
