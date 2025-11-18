#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { realpathSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import pc from 'picocolors';
import { clean } from './commands/clean';
import { init } from './commands/init';
import { list } from './commands/list';
import { pluginsCommand } from './commands/plugins';
import { refresh } from './commands/refresh';
import { run } from './commands/run';
import { validate } from './commands/validate';

// This is the main entry point for the CLI tool.
// It uses 'commander' to set up sub-commands: 'init' and 'run'.

// Read version from package.json
function getVersion(): string {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const packageJsonPath = join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    return packageJson.version;
  } catch (error) {
    return '2.0.0-beta.1'; // Fallback version
  }
}

async function main() {
  try {
    const program = new Command();

    program
      .name('magic-helix')
      .description('Magic Helix CLI for aligning AI instructions in your monorepo.')
      .version(getVersion());

    program
      .command('init')
      .description(
        'Initialize a custom magic-helix.config.json to extend the built-in rules.',
      )
      .action(init);

    program
      .command('run')
      .description(
        'Scan the monorepo and generate AI instruction files based on built-in and custom rules.',
      )
      .option(
        '--dry-run',
        'Preview what would be generated without writing files',
      )
      .option('--force', 'Overwrite files and prune without prompting')
      .option('--skip-pruning', "Don't ask to remove old files")
      .option('--output-dir <path>', 'Custom output directory')
      .option('--config <path>', 'Path to custom config file')
      .option(
        '--target <assistant>',
        'AI assistant target (github-copilot, claude, copilot-chat, generic)',
      )
      .option('--verbose', 'Show detailed output')
      .option('--quiet', 'Show minimal output')
      .option('--project <name>', 'Target a specific project only')
      .option('--wizard', 'Run in interactive wizard mode')
      .option(
        '--template <pattern>',
        "Filter templates by pattern (e.g., 'react,vue')",
      )
      .option(
        '--exclude <pattern>',
        "Exclude files matching pattern (e.g., 'test/**,*.spec.ts')",
      )
      .action(run);

    program
      .command('refresh')
      .description(
        'Rescan the project and update existing instruction files with changed project information.',
      )
      .alias('resync')
      .option('--config <path>', 'Path to custom config file')
      .option(
        '--target <assistant>',
        'AI assistant target (github-copilot, claude, copilot-chat, generic)',
      )
      .option('--verbose', 'Show detailed output')
      .option('--quiet', 'Show minimal output')
      .option('--project <name>', 'Target a specific project only')
      .action(refresh);

    program
      .command('list')
      .description(
        'Show detected projects, tags, and templates without generating files.',
      )
      .action(list);

    program
      .command('validate')
      .description('Check instruction files for common issues and integrity.')
      .action(validate);

    program
      .command('clean')
      .description('Remove all generated instruction files.')
      .action(clean);

    program
      .command('plugins')
      .description('List available language detection plugins and their status.')
      .option('--verbose', 'Show detailed plugin information')
      .action((options) => pluginsCommand(options));

    // Set 'run' as the default command if no other command is specified
    if (process.argv.length < 3) {
      program.action(run);
    }

    await program.parseAsync(process.argv);
  } catch (err) {
    console.error(
      pc.red(`❌ An unexpected error occurred: ${(err as Error).message}`),
    );
    process.exit(1);
  }
}

// Check if this module is being run directly
// Works correctly even when executed via npm bin symlinks
const modulePath = fileURLToPath(import.meta.url);
const scriptPath = process.argv[1]
  ? realpathSync(resolve(process.argv[1]))
  : null;

if (scriptPath && modulePath === scriptPath) {
  main();
}

// Export main for testing
export { main };
