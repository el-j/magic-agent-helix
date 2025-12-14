import * as fs from 'node:fs';
import type * as path from 'node:path';
import {
  BUILT_IN_CONFIG,
  loadUserConfig,
  mergeConfigs,
} from '@magic-helix/core';
import inquirer from 'inquirer';
import ora from 'ora';
import { type Mock, beforeEach, describe, expect, it, vi } from 'vitest';
import { clean } from './clean';

// Mock all external dependencies
vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  readdirSync: vi.fn(),
  unlinkSync: vi.fn(),
}));
vi.mock('node:path', async () => {
  const actualPath = await vi.importActual<typeof path>('path');
  return {
    ...actualPath,
    resolve: vi.fn((...args) => args.join('/')),
    dirname: vi.fn(actualPath.dirname),
  };
});
vi.mock('inquirer');
vi.mocked(inquirer.prompt).mockResolvedValue({ confirm: true });
vi.mock('ora');
vi.mock('picocolors', () => {
  const mockPc = {
    bold: vi.fn((str) => str),
    green: vi.fn((str) => str),
    red: vi.fn((str) => str),
    yellow: vi.fn((str) => str),
    cyan: vi.fn((str) => str),
    gray: vi.fn((str) => str),
    magenta: vi.fn((str) => str),
    blue: vi.fn((str) => str),
  };
  return {
    ...mockPc,
    default: mockPc,
  };
});
vi.mock('@magic-helix/core', () => ({
  loadUserConfig: vi.fn(),
  mergeConfigs: vi.fn(),
  getFormatter: vi.fn(),
  BUILT_IN_CONFIG: {
    dependencyTagMap: {},
    tagTemplateMap: {},
    configFileTagMap: {},
    fileGlobTagMap: {},
    target: 'github-copilot',
    templateDirectory: 'ai_templates',
    outputDirectory: '.github/instructions',
  },
}));

// Mock ora instance
const mockSpinner = {
  start: vi.fn().mockReturnThis(),
  stop: vi.fn().mockReturnThis(),
  succeed: vi.fn().mockReturnThis(),
  warn: vi.fn().mockReturnThis(),
  fail: vi.fn().mockReturnThis(),
  text: '',
};
(ora as Mock).mockReturnValue(mockSpinner);

// Mock console.log
vi.spyOn(console, 'log').mockImplementation(() => {});

describe('Clean Command (/src/commands/clean.ts)', () => {
  const mockMergedConfig = JSON.parse(JSON.stringify(BUILT_IN_CONFIG));

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(loadUserConfig).mockReturnValue({});
    vi.mocked(mergeConfigs).mockReturnValue(mockMergedConfig);

    (fs.existsSync as Mock).mockReturnValue(true);
    (fs.readdirSync as Mock).mockReturnValue(['file1.md', 'file2.md']);
    (fs.unlinkSync as Mock).mockImplementation(() => {});
  });

  it('should run successfully and clean files when confirmed', async () => {
    vi.mocked(inquirer.prompt).mockResolvedValue({ confirm: true });

    await expect(clean()).resolves.not.toThrow();

    expect(vi.mocked(loadUserConfig)).toHaveBeenCalled();
    expect(vi.mocked(mergeConfigs)).toHaveBeenCalled();
    expect(inquirer.prompt).toHaveBeenCalled();
    expect(fs.unlinkSync).toHaveBeenCalledTimes(2);
  });

  it('should not clean files when not confirmed', async () => {
    vi.mocked(inquirer.prompt).mockResolvedValue({ confirm: false });

    await expect(clean()).resolves.not.toThrow();

    expect(inquirer.prompt).toHaveBeenCalled();
    expect(fs.unlinkSync).not.toHaveBeenCalled();
  });

  it('should warn if output directory does not exist', async () => {
    (fs.existsSync as Mock).mockReturnValue(false);

    await expect(clean()).resolves.not.toThrow();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining(
        'Output directory .github/instructions does not exist',
      ),
    );
  });

  it('should handle no files to clean', async () => {
    (fs.readdirSync as Mock).mockReturnValue([]);

    await expect(clean()).resolves.not.toThrow();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('No instruction files found'),
    );
    expect(inquirer.prompt).not.toHaveBeenCalled();
  });
});
