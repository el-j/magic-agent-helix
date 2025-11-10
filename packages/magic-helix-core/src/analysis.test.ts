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
