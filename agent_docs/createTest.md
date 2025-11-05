import { Command } from 'commander';
import { run } from './commands/run';
import { init } from './commands/init';
import pc from 'picocolors';

// This is the main entry point for the CLI tool.
// It uses 'commander' to set up sub-commands: 'init' and 'run'.

async function main() {
  const program = new Command();
  
  program
    .name('ai-aligner')
    .description('A CLI to align AI instructions in your monorepo.')
    .version('0.1.0'); // This should match package.json

  program
    .command('init')
    .description('Initialize a custom ai-aligner.config.json to extend the built-in rules.')
    .action(init);

  program
    .command('run')
    .description('Scan the monorepo and generate AI instruction files based on built-in and custom rules.')
    .action(run);

  // Set 'run' as the default command if no other command is specified
  if (process.argv.length < 3) {
    program.action(run);
  }

  await program.parseAsync(process.argv);
}

main().catch((err) => {
  console.error(pc.red(`❌ An unexpected error occurred: ${err.message}`));
  process.exit(1);
});
File 2: /src/cli.test.ts (Test Skeleton)import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Command } from 'commander';
import { run } from './commands/run';
import { init } from './commands/init';

// Mock all imported modules
vi.mock('commander');
vi.mock('./commands/run');
vi.mock('./commands/init');
vi.mock('picocolors', () => ({
  red: vi.fn((str) => str),
}));

describe('CLI Main Entry Point (/src/cli.ts)', () => {
  const mockCommand = {
    name: vi.fn().mockReturnThis(),
    description: vi.fn().mockReturnThis(),
    version: vi.fn().mockReturnThis(),
    command: vi.fn().mockReturnThis(),
    action: vi.fn().mockReturnThis(),
    parseAsync: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (Command as vi.Mock).mockReturnValue(mockCommand);
    vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  async function runCli() {
    // Dynamically import to run the script after mocks are set
    await import('./cli');
  }

  it('should setup commander with correct details', async () => {
    process.argv = ['node', 'cli.js', 'run']; // Simulate 'run' command
    await runCli();
    
    expect(Command).toHaveBeenCalled();
    expect(mockCommand.name).toHaveBeenCalledWith('ai-aligner');
    expect(mockCommand.description).toHaveBeenCalledWith('A CLI to align AI instructions in your monorepo.');
    expect(mockCommand.version).toHaveBeenCalledWith('0.1.0');
  });

  it('should register the "init" command', async () => {
    process.argv = ['node', 'cli.js', 'init'];
    await runCli();
    
    expect(mockCommand.command).toHaveBeenCalledWith('init');
    expect(mockCommand.description).toHaveBeenCalledWith('Initialize a custom ai-aligner.config.json to extend the built-in rules.');
    expect(mockCommand.action).toHaveBeenCalledWith(init);
  });

  it('should register the "run" command', async () => {
    process.argv = ['node', 'cli.js', 'run'];
    await runCli();
    
    expect(mockCommand.command).toHaveBeenCalledWith('run');
    expect(mockCommand.description).toHaveBeenCalledWith('Scan the monorepo and generate AI instruction files based on built-in and custom rules.');
    expect(mockCommand.action).toHaveBeenCalledWith(run);
  });

  it('should call "run" as the default command if no args are given', async () => {
    process.argv = ['node', 'cli.js']; // No command
    await runCli();
    
    // Check if the default action is set to 'run'
    expect(mockCommand.action).toHaveBeenCalledWith(run);
  });

  it('should call parseAsync', async () => {
    process.argv = ['node', 'cli.js', 'run'];
    await runCli();
    
    expect(mockCommand.parseAsync).toHaveBeenCalledWith(process.argv);
  });

  it('should catch and log errors from main()', async () => {
    const testError = new Error('Test crash');
    (mockCommand.parseAsync as vi.Mock).mockRejectedValue(testError);
    
    process.argv = ['node', 'cli.js', 'run'];
    await runCli();

    expect(console.error).toHaveBeenCalledWith('❌ An unexpected error occurred: Test crash');
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
File 3: /src/commands/init.ts (Source)import * as fs from 'fs';
import * as path from 'path';
import inquirer from 'inquirer';
import ora from 'ora';
import pc from 'picocolors';
import gradient from 'gradient-string';
import { Config } from '../types';

// --- CONFIGURATION ---
const CONFIG_FILENAME = 'ai-aligner.config.json';
const DEFAULT_TEMPLATE_DIR = 'ai_templates';

// This is the *minimal* config file 'init' will create.
// It's designed for users who want to *extend* the built-in rules.
const MINIMAL_USER_CONFIG: Config = {
  target: 'github-copilot',
  templateDirectory: DEFAULT_TEMPLATE_DIR,
  outputDirectory: '.github/instructions',
  dependencyTagMap: {
    // "my-internal-package": "domain-my-rules"
  },
  configFileTagMap: {
    // "my-custom-config.json": "domain-my-rules"
  },
  fileGlobTagMap: {
    // "src/specific-folder/**/*.ts": "domain-my-rules"
  },
  tagTemplateMap: {
    // "domain-my-rules": [
    //   { "template": "my-custom-rule.md", "suffix": "my-rule.md" }
    // ]
  },
};

/**
 * The 'init' command.
 * Creates a minimal config file and template directory
 * for users who want to *extend* the built-in conventions.
 */
export async function init() {
  const spinner = ora(pc.bold('Initializing AI Aligner for custom rules...')).start();
  
  const configPath = path.resolve(process.cwd(), CONFIG_FILENAME);
  const templatePath = path.resolve(process.cwd(), DEFAULT_TEMPLATE_DIR);

  // Check if config file already exists
  if (fs.existsSync(configPath)) {
    spinner.stop();
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: `A ${CONFIG_FILENAME} file already exists. Do you want to overwrite it with a minimal example?`,
        default: false,
      },
    ]);
    if (!overwrite) {
      spinner.warn(pc.yellow('Operation cancelled.'));
      return;
    }
    spinner.start('Overwriting existing config...');
  }

  // 1. Write the minimal config file
  try {
    fs.writeFileSync(
      configPath,
      JSON.stringify(MINIMAL_USER_CONFIG, null, 2),
      'utf-8'
    );
    spinner.succeed(pc.green(`Created minimal config file: ${pc.bold(CONFIG_FILENAME)}`));
  } catch (e) {
    spinner.fail(pc.red(`Error writing config file: ${e.message}`));
    return;
  }
  
  spinner.start('Creating templates directory...');

  // 2. Create the templates directory
  if (!fs.existsSync(templatePath)) {
    fs.mkdirSync(templatePath, { recursive: true });
  }

  // 3. Copy *one* example file to show them how it works
  const exampleTemplatePath = path.resolve(templatePath, 'my-custom-rule.md');
  if (!fs.existsSync(exampleTemplatePath)) {
    fs.writeFileSync(
      exampleTemplatePath,
      '# My Team\'s Custom Rule\n- This rule is specific to our "domain-my-rules" tag.\n- ALWAYS follow this important pattern.\n',
      'utf-8'
    );
    spinner.succeed(pc.green(`Created templates directory and example file: ${pc.bold(DEFAULT_TEMPLATE_DIR)}`));
  } else {
    spinner.succeed(pc.green(`Templates directory ${pc.bold(DEFAULT_TEMPLATE_DIR)} already exists.`));
  }

  console.log(
    gradient.pastel.multiline(
      '\n✨ Success! Your project is ready for custom rules. ✨'
    )
  );
  console.log(pc.cyan(`\nNext steps:`));
  console.log(`  1. Edit ${pc.bold(CONFIG_FILENAME)} to define your team's "tags".`);
  console.log(`  2. Add your custom .md instruction files to ${pc.bold(DEFAULT_TEMPLATE_DIR)}.`);
  console.log(`  3. Run ${pc.bold('npx ai-aligner run')} to generate your files.`);
}
File 4: /src/commands/init.test.ts (Test Skeleton)import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import inquirer from 'inquirer';
import ora from 'ora';
import gradient from 'gradient-string';
import { init } from './init'; // Import the function to test

// Mock all external dependencies
vi.mock('fs');
vi.mock('path', async () => {
  const actualPath = await vi.importActual<typeof path>('path');
  return {
    ...actualPath,
    resolve: vi.fn((...args) => actualPath.join(...args)), // Use join for simple path construction in tests
  };
});
vi.mock('inquirer');
vi.mock('ora');
vi.mock('picocolors', () => ({
  bold: vi.fn((str) => str),
  green: vi.fn((str) => str),
  red: vi.fn((str) => str),
  yellow: vi.fn((str) => str),
  cyan: vi.fn((str) => str),
}));
vi.mock('gradient-string', () => ({
  pastel: {
    multiline: vi.fn((str) => str),
  },
}));

// Mock ora instance
const mockSpinner = {
  start: vi.fn().mockReturnThis(),
  stop: vi.fn().mockReturnThis(),
  succeed: vi.fn().mockReturnThis(),
  warn: vi.fn().mockReturnThis(),
  fail: vi.fn().mockReturnThis(),
};
(ora as vi.Mock).mockReturnValue(mockSpinner);

// Mock console.log
vi.spyOn(console, 'log').mockImplementation(() => {});

describe('Init Command (/src/commands/init.ts)', () => {

  beforeEach(() => {
    vi.clearAllMocks();
    (path.resolve as vi.Mock).mockImplementation((...args) => args.join('/'));
  });

  it('should create config and template files if they do not exist', async () => {
    (fs.existsSync as vi.Mock).mockReturnValue(false);

    await init();

    expect(mockSpinner.start).toHaveBeenCalledWith('Initializing AI Aligner for custom rules...');
    expect(fs.writeFileSync).toHaveBeenCalledTimes(2);
    // 1. Config file
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      './ai-aligner.config.json',
      expect.stringContaining('"target": "github-copilot"'),
      'utf-8'
    );
    // 2. Example template file
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      './ai_templates/my-custom-rule.md',
      expect.stringContaining('# My Team\'s Custom Rule'),
      'utf-8'
    );
    expect(fs.mkdirSync).toHaveBeenCalledWith('./ai_templates', { recursive: true });
    expect(mockSpinner.succeed).toHaveBeenCalledWith('Created minimal config file: ai-aligner.config.json');
    expect(mockSpinner.succeed).toHaveBeenCalledWith('Created templates directory and example file: ai_templates');
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('✨ Success!'));
  });

  it('should not overwrite existing config if user declines', async () => {
    (fs.existsSync as vi.Mock).mockReturnValue(true); // Config file exists
    (inquirer.prompt as vi.Mock).mockResolvedValue({ overwrite: false });

    await init();

    expect(mockSpinner.stop).toHaveBeenCalled();
    expect(inquirer.prompt).toHaveBeenCalled();
    expect(fs.writeFileSync).not.toHaveBeenCalled();
    expect(mockSpinner.warn).toHaveBeenCalledWith('Operation cancelled.');
  });

  it('should overwrite existing config if user confirms', async () => {
    (fs.existsSync as vi.Mock).mockImplementation((p) => p.toString().endsWith('.json')); // Config exists, template dir/file doesn't
    (inquirer.prompt as vi.Mock).mockResolvedValue({ overwrite: true });

    await init();

    expect(mockSpinner.stop).toHaveBeenCalled();
    expect(inquirer.prompt).toHaveBeenCalled();
    expect(mockSpinner.start).toHaveBeenCalledWith('Overwriting existing config...');
    expect(fs.writeFileSync).toHaveBeenCalledTimes(2); // Config + example template
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      './ai-aligner.config.json',
      expect.stringContaining('"target": "github-copilot"'),
      'utf-8'
    );
    expect(mockSpinner.succeed).toHaveBeenCalledWith('Created minimal config file: ai-aligner.config.json');
  });

  it('should handle config write error', async () => {
    (fs.existsSync as vi.Mock).mockReturnValue(false);
    const writeError = new Error('Permission denied');
    (fs.writeFileSync as vi.Mock).mockImplementation(() => {
      throw writeError;
    });

    await init();
    
    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(mockSpinner.fail).toHaveBeenCalledWith('Error writing config file: Permission denied');
  });

  it('should skip creating example template if it already exists', async () => {
    (fs.existsSync as vi.Mock).mockImplementation(() => true); // All files exist
    (inquirer.prompt as vi.Mock).mockResolvedValue({ overwrite: true }); // Overwrite config

    await init();

    expect(fs.writeFileSync).toHaveBeenCalledTimes(1); // Only config file
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      './ai-aligner.config.json',
      expect.anything(),
      'utf-8'
    );
    expect(fs.mkdirSync).not.toHaveBeenCalled();
    expect(mockSpinner.succeed).toHaveBeenCalledWith('Templates directory ai_templates already exists.');
  });
});
File 5: /src/commands/run.ts (Source)(Content is identical to the file in the Canvas, not repeated here for brevity)File 6: /src/commands/run.test.ts (Test Skeleton)import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import inquirer from 'inquirer';
import { glob } from 'glob';
import ora from 'ora';
import * as configMerger from '../core/config-merger';
import { run } from './run';
import { BUILT_IN_CONFIG } from '../built-in-config';

// Mock all external dependencies
vi.mock('fs');
vi.mock('path', async () => {
  const actualPath = await vi.importActual<typeof path>('path');
  return {
    ...actualPath,
    resolve: vi.fn((...args) => args.join('/')), // Simple join for test paths
    join: vi.fn((...args) => args.join('/')),
    dirname: vi.fn(actualPath.dirname),
  };
});
vi.mock('inquirer');
vi.mock('glob');
vi.mock('ora');
vi.mock('picocolors', () => ({
  bold: vi.fn((str) => str),
  green: vi.fn((str) => str),
  red: vi.fn((str) => str),
  yellow: vi.fn((str) => str),
  cyan: vi.fn((str) => str),
  gray: vi.fn((str) => str),
  magenta: vi.fn((str) => str),
  blue: vi.fn((str) => str),
}));
vi.mock('gradient-string', () => ({
  pastel: {
    multiline: vi.fn((str) => str),
  },
}));
vi.mock('../core/config-merger');

// Mock ora instance
const mockSpinner = {
  start: vi.fn().mockReturnThis(),
  stop: vi.fn().mockReturnThis(),
  succeed: vi.fn().mockReturnThis(),
  warn: vi.fn().mockReturnThis(),
  fail: vi.fn().mockReturnThis(),
  text: '',
};
(ora as vi.Mock).mockReturnValue(mockSpinner);

// Mock console.log/warn
vi.spyOn(console, 'log').mockImplementation(() => {});
vi.spyOn(console, 'warn').mockImplementation(() => {});

describe('Run Command (/src/commands/run.ts)', () => {

  const mockMergedConfig = JSON.parse(JSON.stringify(BUILT_IN_CONFIG)); // Deep copy

  beforeEach(() => {
    vi.clearAllMocks();
    (configMerger.loadUserConfig as vi.Mock).mockReturnValue({});
    (configMerger.mergeConfigs as vi.Mock).mockReturnValue(mockMergedConfig);

    // Mock file system for a simple monorepo
    (fs.existsSync as vi.Mock).mockImplementation((p) => {
      return p.toString().endsWith('package.json') || p === './.github/instructions';
    });

    (fs.readFileSync as vi.Mock).mockImplementation((p) => {
      if (p === './package.json') {
        return JSON.stringify({ name: 'root-project', workspaces: ['packages/*'] });
      }
      if (p === 'packages/app-vue/package.json') {
        return JSON.stringify({ name: '@scope/app-vue', dependencies: { vue: '3.0.0' } });
      }
      if (p === 'packages/app-react/package.json') {
        return JSON.stringify({ name: '@scope/app-react', dependencies: { react: '18.0.0', 'my-custom-lib': '1.0.0' } });
      }
      if (p.toString().includes('default_templates/vue/vue-core.md')) {
        return '# Vue Core Rules';
      }
      if (p.toString().includes('default_templates/react/react-core.md')) {
        return '# React Core Rules';
      }
      return '{}';
    });

    // Mock glob to find projects
    (glob as unknown as vi.Mock).mockImplementation((patterns) => {
      if (patterns.includes('packages/*/package.json')) {
        return Promise.resolve(['packages/app-vue/package.json', 'packages/app-react/package.json']);
      }
      return Promise.resolve([]); // Default no files
    });

    (inquirer.prompt as vi.Mock).mockResolvedValue({ prune: false });
  });

  it('should run successfully, find projects, and generate files', async () => {
    await run();

    // 1. Config
    expect(configMerger.loadUserConfig).toHaveBeenCalled();
    expect(configMerger.mergeConfigs).toHaveBeenCalled();
    
    // 2. Find Projects
    expect(glob).toHaveBeenCalledWith(['packages/*/package.json']);
    expect(ora).toHaveBeenCalledWith('Scanning for projects...');
    
    // 3. Analyze
    expect(ora).toHaveBeenCalledWith('Analyzing project tags...');
    
    // 4. Ensure Dir
    expect(fs.existsSync).toHaveBeenCalledWith('./.github/instructions');
    
    // 5. Generate Files
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Processing: root-project'));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Processing: scope-app-vue'));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Processing: scope-app-react'));

    // Check Vue file
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      './.github/instructions/scope-app-vue.vue-core.md',
      expect.stringContaining('applyTo: "packages/app-vue/src')
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      './.github/instructions/scope-app-vue.vue-core.md',
      expect.stringContaining('# Vue Core Rules')
    );
    
    // Check React file
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      './.github/instructions/scope-app-react.react-core.md',
      expect.stringContaining('applyTo: "packages/app-react/src')
    );

    // 6. Prune (should find no old files)
    (fs.readdirSync as vi.Mock).mockReturnValue([]);
    expect(inquirer.prompt).not.toHaveBeenCalled();
  });

  it('should warn if no projects are found', async () => {
    (fs.readFileSync as vi.Mock).mockImplementation((p) => {
      if (p === './package.json') {
        return JSON.stringify({ name: 'root-project', workspaces: [] }); // No workspaces
      }
      return '{}';
    });
    (glob as unknown as vi.Mock).mockImplementation(() => Promise.resolve([]));
    
    await run();
    
    expect(mockSpinner.warn).toHaveBeenCalledWith(
      expect.stringContaining('No projects found')
    );
  });

  it('should use custom templates if they exist', async () => {
    // Mock a custom config
    (configMerger.loadUserConfig as vi.Mock).mockReturnValue({
      dependencyTagMap: { 'my-custom-lib': 'domain-custom' },
      tagTemplateMap: {
        'domain-custom': [{ template: 'my-rule.md', suffix: 'my-rule.md' }],
      },
    });
    (configMerger.mergeConfigs as vi.Mock).mockImplementation((userConfig) => {
      // A simple merge for this test
      const newConfig = JSON.parse(JSON.stringify(BUILT_IN_CONFIG));
      newConfig.dependencyTagMap['my-custom-lib'] = 'domain-custom';
      newConfig.tagTemplateMap['domain-custom'] = [{ template: 'my-rule.md', suffix: 'my-rule.md' }];
      return newConfig;
    });

    // Mock reading the custom template
    (fs.readFileSync as vi.Mock).mockImplementation((p) => {
      if (p === './ai_templates/my-rule.md') {
        return '# My Custom Rule';
      }
      // Fallback to other mocks
      if (p === './package.json') {
        return JSON.stringify({ name: 'root-project', workspaces: ['packages/*'] });
      }
      if (p === 'packages/app-react/package.json') {
        return JSON.stringify({ name: '@scope/app-react', dependencies: { react: '18.0.0', 'my-custom-lib': '1.0.0' } });
      }
      if (p.toString().includes('default_templates/react/react-core.md')) {
        return '# React Core Rules';
      }
      return '{}';
    });

    await run();

    // Check that the custom file was written for the React app
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      './.github/instructions/scope-app-react.my-rule.md',
      expect.stringContaining('# My Custom Rule')
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Generated: scope-app-react.my-rule.md (from Custom)')
    );
  });

  it('should prune old files if user confirms', async () => {
    (fs.readdirSync as vi.Mock).mockReturnValue(['scope-app-vue.vue-core.md', 'old-file.md']); // 'old-file.md' is extra
    (inquirer.prompt as vi.Mock).mockResolvedValue({ prune: true });

    await run();
    
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Found 1 instruction files'));
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('- old-file.md'));
    expect(inquirer.prompt).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'prune' })
    );
    expect(fs.unlinkSync).toHaveBeenCalledWith('./.github/instructions/old-file.md');
  });
});
File 7: /scripts/copy-templates.js (Source)// This script recursively copies the package's default templates
// from 'src/default_templates' into the build ('dist/default_templates')
// folder so the 'run' command can find them.

const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '../src/default_templates');
const destDir = path.resolve(__dirname, '../dist/default_templates');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  if (!exists) {
    console.warn(`Source directory does not exist: ${src}`);
    return;
  }
  
  const stats = fs.statSync(src);
  const isDirectory = stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

if (!fs.existsSync(srcDir)) {
  console.log('No default_templates directory found in src. Skipping copy.');
} else {
  copyRecursiveSync(srcDir, destDir);
  console.log('Recursively copied default template files to dist/default_templates.');
}
File 8: /scripts/copy-templates.test.js (Test Skeleton)// Note: This is a .js test file for a .js script
const { describe, it, expect, vi, beforeEach } = require('vitest');
const fs = require('fs');
const path = require('path');

// Mock fs and path
vi.mock('fs');
vi.mock('path', async () => {
  const actualPath = await vi.importActual('path');
  return {
    ...actualPath,
    resolve: vi.fn((...args) => args.join('/')),
    join: vi.fn((...args) => args.join('/')),
  };
});

// Mock console
vi.spyOn(console, 'log').mockImplementation(() => {});
vi.spyOn(console, 'warn').mockImplementation(() => {});

// Function to dynamically import and run the script
function runScript() {
  return require('./copy-templates.js');
}

describe('copy-templates.js', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should do nothing if src directory does not exist', () => {
    (fs.existsSync).mockReturnValue(false);
    
    runScript();

    expect(fs.existsSync).toHaveBeenCalledWith('../src/default_templates');
    expect(console.log).toHaveBeenCalledWith('No default_templates directory found in src. Skipping copy.');
    expect(fs.mkdirSync).not.toHaveBeenCalled();
    expect(fs.copyFileSync).not.toHaveBeenCalled();
  });

  it('should copy files and directories recursively', () => {
    (fs.existsSync).mockReturnValue(true); // All paths exist
    (fs.statSync).mockImplementation((p) => ({
      isDirectory: () => !p.includes('.md'), // Treat .md files as files
    }));
    (fs.readdirSync).mockImplementation((p) => {
      if (p === '../src/default_templates') return ['generic', 'vue'];
      if (p === '../src/default_templates/generic') return ['style-tailwind.md'];
      if (p === '../src/default_templates/vue') return ['vue-core.md'];
      return [];
    });
    
    runScript();

    // 1. Check top-level
    expect(fs.readdirSync).toHaveBeenCalledWith('../src/default_templates');
    
    // 2. Check 'generic' subdir
    expect(fs.mkdirSync).toHaveBeenCalledWith('../dist/default_templates/generic', { recursive: true });
    expect(fs.copyFileSync).toHaveBeenCalledWith(
      '../src/default_templates/generic/style-tailwind.md',
      '../dist/default_templates/generic/style-tailwind.md'
    );
    
    // 3. Check 'vue' subdir
    expect(fs.mkdirSync).toHaveBeenCalledWith('../dist/default_templates/vue', { recursive: true });
    expect(fs.copyFileSync).toHaveBeenCalledWith(
      '../src/default_templates/vue/vue-core.md',
      '../dist/default_templates/vue/vue-core.md'
    );

    expect(console.log).toHaveBeenCalledWith('Recursively copied default template files to dist/default_templates.');
  });

  it('should warn if src directory does not exist during recursion', () => {
    // This tests the inner 'exists' check
    (fs.existsSync).mockImplementation((p) => {
      // Pretend the top-level srcDir exists, but a child one doesn't
      if (p === '../src/default_templates') return true;
      if (p === '../src/default_templates/generic') return false; // This one is missing
      return true;
    });
    (fs.statSync).mockReturnValue({ isDirectory: () => true });
    (fs.readdirSync).mockReturnValue(['generic']);
    
    runScript();
    
    expect(console.warn).toHaveBeenCalledWith('Source directory does not exist: ../src/default_templates/generic');
  });
});
