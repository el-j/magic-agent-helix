import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import * as fs from 'node:fs';
import type * as path from 'node:path';
import inquirer from 'inquirer';
import { glob } from 'glob';
import ora from 'ora';
import * as configMerger from '../core/config-merger';
import { run } from './run';
import { BUILT_IN_CONFIG } from '../built-in-config';

// Mock all external dependencies
vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  readdirSync: vi.fn(),
  mkdirSync: vi.fn(),
  unlinkSync: vi.fn(),
}));
vi.mock('node:path', async () => {
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
vi.mock('gradient-string', () => {
  const mockGradient = {
    pastel: {
      multiline: vi.fn((str) => str),
    },
  };
  return {
    ...mockGradient,
    default: mockGradient,
  };
});
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
(ora as Mock).mockReturnValue(mockSpinner);

// Mock console.log/warn
vi.spyOn(console, 'log').mockImplementation(() => {});
vi.spyOn(console, 'warn').mockImplementation(() => {});

describe('Run Command (/src/commands/run.ts)', () => {

  const mockMergedConfig = JSON.parse(JSON.stringify(BUILT_IN_CONFIG)); // Deep copy

  beforeEach(() => {
    vi.clearAllMocks();
    (configMerger.loadUserConfig as Mock).mockReturnValue({});
    (configMerger.mergeConfigs as Mock).mockReturnValue(mockMergedConfig);

    // Mock file system for a simple monorepo
    (fs.existsSync as Mock).mockImplementation((p) => {
      return p.toString().endsWith('package.json') || p === './.github/instructions';
    });

    (fs.readFileSync as Mock).mockImplementation((p) => {
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

    (fs.readdirSync as Mock).mockImplementation((p) => {
      if (p === './.github/instructions') {
        return ['old-file.md', 'scope-app-vue.vue-core.md'];
      }
      return [];
    });

    (fs.writeFileSync as Mock).mockImplementation(() => {});
    (fs.mkdirSync as Mock).mockImplementation(() => {});
    (fs.unlinkSync as Mock).mockImplementation(() => {});
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
    (fs.readdirSync as Mock).mockReturnValue([]);
    expect(inquirer.prompt).not.toHaveBeenCalled();
  });

  it('should warn if no projects are found', async () => {
    (fs.readFileSync as Mock).mockImplementation((p) => {
      if (p === './package.json') {
        return JSON.stringify({ name: 'root-project', workspaces: [] }); // No workspaces
      }
      return '{}';
    });
    (glob as unknown as Mock).mockImplementation(() => Promise.resolve([]));

    await run();

    expect(mockSpinner.warn).toHaveBeenCalledWith(
      expect.stringContaining('No projects found')
    );
  });

  it('should use custom templates if they exist', async () => {
    // Mock a custom config
    (configMerger.loadUserConfig as Mock).mockReturnValue({
      dependencyTagMap: { 'my-custom-lib': 'domain-custom' },
      tagTemplateMap: {
        'domain-custom': [{ template: 'my-rule.md', suffix: 'my-rule.md' }],
      },
    });
    (configMerger.mergeConfigs as Mock).mockImplementation((userConfig) => {
      // A simple merge for this test
      const newConfig = JSON.parse(JSON.stringify(BUILT_IN_CONFIG));
      newConfig.dependencyTagMap['my-custom-lib'] = 'domain-custom';
      newConfig.tagTemplateMap['domain-custom'] = [{ template: 'my-rule.md', suffix: 'my-rule.md' }];
      return newConfig;
    });

    // Mock reading the custom template
    (fs.readFileSync as Mock).mockImplementation((p) => {
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
    (fs.readdirSync as Mock).mockReturnValue(['scope-app-vue.vue-core.md', 'old-file.md']); // 'old-file.md' is extra
    (inquirer.prompt as unknown as Mock).mockResolvedValue({ prune: true });

    await run();

    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Found 2 instruction files'));
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('- old-file.md'));
    expect(inquirer.prompt).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'prune' })
    );
    expect(fs.unlinkSync).toHaveBeenCalledWith('./.github/instructions/old-file.md');
  });
});