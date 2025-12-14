import * as fs from 'node:fs';
import type * as path from 'node:path';
import {
  BUILT_IN_CONFIG,
  loadUserConfig,
  mergeConfigs,
} from '@magic-helix/core';
import ora from 'ora';
import { type Mock, beforeEach, describe, expect, it, vi } from 'vitest';
import { validate } from './validate';

// Mock all external dependencies
vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  readdirSync: vi.fn(),
}));
vi.mock('node:path', async () => {
  const actualPath = await vi.importActual<typeof path>('path');
  return {
    ...actualPath,
    resolve: vi.fn((...args) => args.join('/')),
    dirname: vi.fn(actualPath.dirname),
  };
});
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

describe('Validate Command (/src/commands/validate.ts)', () => {
  const mockMergedConfig = JSON.parse(JSON.stringify(BUILT_IN_CONFIG));

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(loadUserConfig).mockReturnValue({});
    vi.mocked(mergeConfigs).mockReturnValue(mockMergedConfig);

    (fs.existsSync as Mock).mockReturnValue(true);
    (fs.readdirSync as Mock).mockReturnValue(['file1.md', 'file2.md']);
    (fs.readFileSync as Mock).mockReturnValue(
      '# Valid instruction file\n\nSome content.',
    );
  });

  it('should run successfully and validate files', async () => {
    await expect(validate()).resolves.not.toThrow();

    expect(vi.mocked(loadUserConfig)).toHaveBeenCalled();
    expect(vi.mocked(mergeConfigs)).toHaveBeenCalled();
    expect(ora).toHaveBeenCalledWith('Loading configuration...');
  });

  it('should fail if output directory does not exist', async () => {
    (fs.existsSync as Mock).mockReturnValue(false);

    await expect(validate()).resolves.not.toThrow();

    expect(mockSpinner.fail).toHaveBeenCalledWith(
      expect.stringContaining(
        'Output directory .github/instructions does not exist',
      ),
    );
  });

  it('should warn if no instruction files are found', async () => {
    (fs.readdirSync as Mock).mockReturnValue([]);

    await expect(validate()).resolves.not.toThrow();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('No instruction files found'),
    );
  });

  it('should validate files and report issues', async () => {
    (fs.readFileSync as Mock).mockImplementation((p) => {
      if (p.toString().includes('file1.md')) {
        return ''; // Empty file
      }
      if (p.toString().includes('file2.md')) {
        return '# Valid\n\nContent'; // Valid
      }
      return '';
    });

    await expect(validate()).resolves.not.toThrow();
  });

  it('should handle files with various validation issues', async () => {
    (fs.readFileSync as Mock).mockImplementation((p) => {
      if (p.toString().includes('file1.md')) {
        return 'No header\n\nSome content'; // Missing header
      }
      if (p.toString().includes('file2.md')) {
        return '# Header\n\n'; // Empty content
      }
      return '';
    });

    await expect(validate()).resolves.not.toThrow();
  });
});
