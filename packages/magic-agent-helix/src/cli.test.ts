import { Command } from 'commander';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { main } from './cli';
import { init } from './commands/init';
import { run } from './commands/run';

// Mock all imported modules
const mockCommand = {
  name: vi.fn().mockReturnThis(),
  description: vi.fn().mockReturnThis(),
  version: vi.fn().mockReturnThis(),
  command: vi.fn().mockReturnThis(),
  action: vi.fn().mockReturnThis(),
  option: vi.fn().mockReturnThis(),
  alias: vi.fn().mockReturnThis(),
  parseAsync: vi.fn().mockResolvedValue(undefined),
};

vi.mock('commander', () => ({
  Command: vi.fn().mockImplementation(() => mockCommand),
}));
vi.mock('./commands/run');
vi.mock('./commands/init');
vi.mock('picocolors', () => ({
  default: {
    red: vi.fn((str) => str),
  },
}));

describe('CLI Main Entry Point (/src/cli.ts)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  async function runCli() {
    await main();
  }

  it('should setup commander with correct details', async () => {
    process.argv = ['node', 'cli.js', 'run']; // Simulate 'run' command
    await runCli();

    expect(Command).toHaveBeenCalled();
    expect(mockCommand.name).toHaveBeenCalledWith('ai-aligner');
    expect(mockCommand.description).toHaveBeenCalledWith(
      'A CLI to align AI instructions in your monorepo.',
    );
    expect(mockCommand.version).toHaveBeenCalledWith('0.2.0');
  });

  it('should register the "init" command', async () => {
    process.argv = ['node', 'cli.js', 'init'];
    await runCli();

    expect(mockCommand.command).toHaveBeenCalledWith('init');
    expect(mockCommand.description).toHaveBeenCalledWith(
      'Initialize a custom ai-aligner.config.json to extend the built-in rules.',
    );
    expect(mockCommand.action).toHaveBeenCalledWith(init);
  });

  it('should register the "run" command with all options', async () => {
    process.argv = ['node', 'cli.js', 'run'];
    await runCli();

    expect(mockCommand.command).toHaveBeenCalledWith('run');
    expect(mockCommand.description).toHaveBeenCalledWith(
      'Scan the monorepo and generate AI instruction files based on built-in and custom rules.',
    );
    expect(mockCommand.option).toHaveBeenCalledWith(
      '--dry-run',
      'Preview what would be generated without writing files',
    );
    expect(mockCommand.option).toHaveBeenCalledWith(
      '--force',
      'Overwrite files and prune without prompting',
    );
    expect(mockCommand.option).toHaveBeenCalledWith(
      '--skip-pruning',
      "Don't ask to remove old files",
    );
    expect(mockCommand.option).toHaveBeenCalledWith(
      '--output-dir <path>',
      'Custom output directory',
    );
    expect(mockCommand.option).toHaveBeenCalledWith(
      '--config <path>',
      'Path to custom config file',
    );
    expect(mockCommand.option).toHaveBeenCalledWith(
      '--target <assistant>',
      'AI assistant target (github-copilot, claude, copilot-chat, generic)',
    );
    expect(mockCommand.option).toHaveBeenCalledWith(
      '--verbose',
      'Show detailed output',
    );
    expect(mockCommand.option).toHaveBeenCalledWith(
      '--quiet',
      'Show minimal output',
    );
    expect(mockCommand.option).toHaveBeenCalledWith(
      '--project <name>',
      'Target a specific project only',
    );
    expect(mockCommand.option).toHaveBeenCalledWith(
      '--wizard',
      'Run in interactive wizard mode',
    );
    expect(mockCommand.option).toHaveBeenCalledWith(
      '--template <pattern>',
      "Filter templates by pattern (e.g., 'react,vue')",
    );
    expect(mockCommand.option).toHaveBeenCalledWith(
      '--exclude <pattern>',
      "Exclude files matching pattern (e.g., 'test/**,*.spec.ts')",
    );
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
    // Mock parseAsync to throw an error
    mockCommand.parseAsync.mockRejectedValue(new Error('Test crash'));

    process.argv = ['node', 'cli.js', 'run'];
    await runCli();
  });
});
