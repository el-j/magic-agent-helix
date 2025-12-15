import { Command } from 'commander';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { main } from './cli';

vi.mock('./commands/run');
vi.mock('./commands/init');
vi.mock('./commands/clean');
vi.mock('./commands/list');
vi.mock('./commands/refresh');
vi.mock('./commands/validate');
vi.mock('./commands/plugins');
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

  it('should create a Command program', async () => {
    // Simply verify that main() runs without throwing
    process.argv = ['node', 'cli.js', '--help'];

    // Mock parseAsync to prevent actual command execution
    const parseAsyncSpy = vi
      .spyOn(Command.prototype, 'parseAsync')
      .mockResolvedValue(new Command());

    await main();

    expect(parseAsyncSpy).toHaveBeenCalled();
  });

  it('should handle errors gracefully', async () => {
    process.argv = ['node', 'cli.js', 'run'];

    // Mock parseAsync to throw an error
    vi.spyOn(Command.prototype, 'parseAsync').mockRejectedValue(
      new Error('Test error'),
    );

    await main();

    // Error should be caught and not crash
    expect(console.error).toHaveBeenCalled();
  });
});
