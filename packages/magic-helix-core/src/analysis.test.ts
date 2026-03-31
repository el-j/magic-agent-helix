import { describe, expect, it } from 'vitest';
import { analyzeProjectTags, type ProjectAnalysisData } from './analysis';

describe('Analysis Module', () => {
  const mockAnalysisData: ProjectAnalysisData = {
    dependencies: {
      vue: '3.0.0',
      react: '18.0.0',
      'unknown-dep': '1.0.0',
    },
    configFiles: ['tailwind.config.js', 'vite.config.ts', 'unknown.config.js'],
    projectFiles: [
      'src/main.ts',
      'src/App.vue',
      'src/index.js',
      'src/component.tsx',
    ],
  };

  const mockDependencyTagMap = {
    vue: 'framework-vue',
    react: 'framework-react',
  };

  const mockConfigFileTagMap = {
    'tailwind.config.js': 'style-tailwind',
    'vite.config.ts': 'build-vite',
  };

  const mockFileGlobTagMap = {
    'src/**/*.ts': 'lang-typescript',
    'src/**/*.vue': 'framework-vue-files',
  };

  it('should identify tags from dependencies', () => {
    const tags = analyzeProjectTags(
      mockAnalysisData,
      mockDependencyTagMap,
      {},
      {},
    );

    expect(tags.has('framework-vue')).toBe(true);
    expect(tags.has('framework-react')).toBe(true);
    expect(tags.has('unknown-tag')).toBe(false);
  });

  it('should identify tags from config files', () => {
    const tags = analyzeProjectTags(
      mockAnalysisData,
      {},
      mockConfigFileTagMap,
      {},
    );

    expect(tags.has('style-tailwind')).toBe(true);
    expect(tags.has('build-vite')).toBe(true);
    expect(tags.has('unknown-config')).toBe(false);
  });

  it('should identify tags from file globs', () => {
    const tags = analyzeProjectTags(
      mockAnalysisData,
      {},
      {},
      mockFileGlobTagMap,
    );

    expect(tags.has('lang-typescript')).toBe(true);
    expect(tags.has('framework-vue-files')).toBe(true);
  });

  it('should combine tags from all strategies', () => {
    const tags = analyzeProjectTags(
      mockAnalysisData,
      mockDependencyTagMap,
      mockConfigFileTagMap,
      mockFileGlobTagMap,
    );

    expect(tags.has('framework-vue')).toBe(true);
    expect(tags.has('framework-react')).toBe(true);
    expect(tags.has('style-tailwind')).toBe(true);
    expect(tags.has('build-vite')).toBe(true);
    expect(tags.has('lang-typescript')).toBe(true);
    expect(tags.has('framework-vue-files')).toBe(true);
  });

  it('should return empty set for empty analysis data', () => {
    const emptyData: ProjectAnalysisData = {
      dependencies: {},
      configFiles: [],
      projectFiles: [],
    };

    const tags = analyzeProjectTags(
      emptyData,
      mockDependencyTagMap,
      mockConfigFileTagMap,
      mockFileGlobTagMap,
    );

    expect(tags.size).toBe(0);
  });

  it('should detect Angular framework', () => {
    const angularData: ProjectAnalysisData = {
      dependencies: {
        '@angular/core': '15.0.0',
      },
      configFiles: [],
      projectFiles: ['src/main.ts'],
    };

    const tags = analyzeProjectTags(
      angularData,
      { '@angular/core': 'framework-angular' },
      {},
      {},
    );

    expect(tags.has('framework-angular')).toBe(true);
  });
});

describe('globToRegex (via analyzeProjectTags)', () => {
  // All tests exercise the glob pattern matching through the public API

  it('should match files in nested directories with ** pattern', () => {
    const data: ProjectAnalysisData = {
      dependencies: {},
      configFiles: [],
      projectFiles: [
        'packages/core/src/index.ts',
        'packages/cli/src/cli.ts',
        'packages/core/src/utils/helper.ts',
      ],
    };
    const tags = analyzeProjectTags(
      data,
      {},
      {},
      {
        'packages/**/*.ts': 'lang-typescript',
      },
    );
    expect(tags.has('lang-typescript')).toBe(true);
  });

  it('should match files in root directory with single * pattern', () => {
    const data: ProjectAnalysisData = {
      dependencies: {},
      configFiles: [],
      projectFiles: ['index.ts', 'README.md'],
    };
    const tags = analyzeProjectTags(
      data,
      {},
      {},
      {
        '*.ts': 'lang-typescript',
      },
    );
    expect(tags.has('lang-typescript')).toBe(true);
    // *.ts should NOT match nested paths
    const nestedData: ProjectAnalysisData = {
      dependencies: {},
      configFiles: [],
      projectFiles: ['src/index.ts'],
    };
    const nestedTags = analyzeProjectTags(
      nestedData,
      {},
      {},
      {
        '*.ts': 'lang-typescript',
      },
    );
    expect(nestedTags.has('lang-typescript')).toBe(false);
  });

  it('should match brace-expansion patterns like **/*.{ts,vue}', () => {
    const data: ProjectAnalysisData = {
      dependencies: {},
      configFiles: [],
      projectFiles: ['src/App.vue', 'src/main.ts', 'src/style.css'],
    };
    const tags = analyzeProjectTags(
      data,
      {},
      {},
      {
        'src/**/*.{ts,vue}': 'ts-or-vue',
      },
    );
    expect(tags.has('ts-or-vue')).toBe(true);
    // CSS file should not trigger the tag
    const cssOnlyData: ProjectAnalysisData = {
      dependencies: {},
      configFiles: [],
      projectFiles: ['src/style.css'],
    };
    const cssTags = analyzeProjectTags(
      cssOnlyData,
      {},
      {},
      {
        'src/**/*.{ts,vue}': 'ts-or-vue',
      },
    );
    expect(cssTags.has('ts-or-vue')).toBe(false);
  });

  it('should match src/**/*.ts for files directly under src/ (no sub-directory)', () => {
    const data: ProjectAnalysisData = {
      dependencies: {},
      configFiles: [],
      projectFiles: ['src/index.ts'],
    };
    const tags = analyzeProjectTags(
      data,
      {},
      {},
      {
        'src/**/*.ts': 'lang-typescript',
      },
    );
    expect(tags.has('lang-typescript')).toBe(true);
  });

  it('should not cross-match different extensions', () => {
    const data: ProjectAnalysisData = {
      dependencies: {},
      configFiles: [],
      projectFiles: ['src/component.tsx', 'src/style.css'],
    };
    const tags = analyzeProjectTags(
      data,
      {},
      {},
      {
        'src/**/*.ts': 'lang-typescript',
        'src/**/*.vue': 'framework-vue-files',
      },
    );
    // .tsx and .css should NOT match .ts or .vue globs
    expect(tags.has('lang-typescript')).toBe(false);
    expect(tags.has('framework-vue-files')).toBe(false);
  });

  it('should handle ** at the start matching any depth', () => {
    const data: ProjectAnalysisData = {
      dependencies: {},
      configFiles: [],
      projectFiles: ['a/b/c/d/test.spec.ts', 'test.spec.ts'],
    };
    const tags = analyzeProjectTags(
      data,
      {},
      {},
      {
        '**/*.spec.ts': 'test-files',
      },
    );
    expect(tags.has('test-files')).toBe(true);
  });
});
