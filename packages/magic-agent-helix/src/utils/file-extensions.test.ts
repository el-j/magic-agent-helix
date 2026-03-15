import { describe, expect, it } from 'vitest';
import {
  buildPreciseGlobPattern,
  getApplyToDescription,
  getFileExtensionsForTag,
  TAG_FILE_EXTENSIONS,
} from './file-extensions';

describe('File Extensions Utils', () => {
  describe('TAG_FILE_EXTENSIONS', () => {
    it('should contain mappings for common frameworks', () => {
      expect(TAG_FILE_EXTENSIONS['framework-vue']).toEqual({
        extensions: ['vue'],
        description: 'Vue components',
      });
      expect(TAG_FILE_EXTENSIONS['framework-react']).toEqual({
        extensions: ['tsx', 'jsx', 'ts', 'js'],
        description: 'React components',
      });
    });

    it('should contain mappings for languages', () => {
      expect(TAG_FILE_EXTENSIONS['lang-typescript']).toEqual({
        extensions: ['ts', 'tsx'],
        description: 'TypeScript files',
      });
      expect(TAG_FILE_EXTENSIONS['lang-python']).toEqual({
        extensions: ['py'],
        description: 'Python files',
      });
    });
  });

  describe('getFileExtensionsForTag', () => {
    it('should return extensions for known tags', () => {
      expect(getFileExtensionsForTag('framework-vue')).toEqual(['vue']);
      expect(getFileExtensionsForTag('lang-typescript')).toEqual(['ts', 'tsx']);
    });

    it('should return empty array for unknown tags', () => {
      expect(getFileExtensionsForTag('unknown-tag')).toEqual([]);
      expect(getFileExtensionsForTag('')).toEqual([]);
    });
  });

  describe('buildPreciseGlobPattern', () => {
    it('should build pattern for single tag', () => {
      const tags = new Set(['framework-vue']);
      const pattern = buildPreciseGlobPattern('packages/my-app', tags);
      expect(pattern).toBe('packages/my-app/src/**/*.{vue}');
    });

    it('should build pattern for multiple tags', () => {
      const tags = new Set(['framework-vue', 'lang-typescript']);
      const pattern = buildPreciseGlobPattern('packages/my-app', tags);
      expect(pattern).toBe('packages/my-app/src/**/*.{vue,ts,tsx}');
    });

    it('should deduplicate extensions', () => {
      const tags = new Set(['framework-react', 'lang-typescript']);
      const pattern = buildPreciseGlobPattern('packages/my-app', tags);
      // React includes ts, tsx, js, jsx; TypeScript includes ts, tsx
      expect(pattern).toBe('packages/my-app/src/**/*.{tsx,jsx,ts,js}');
    });

    it('should use fallback pattern for unknown tags', () => {
      const tags = new Set<string>(['unknown-tag']);
      const pattern = buildPreciseGlobPattern('packages/my-app', tags);
      expect(pattern).toBe('packages/my-app/src/**/*.{ts,js,vue,tsx,jsx}');
    });

    it('should use fallback pattern for empty tags', () => {
      const tags = new Set<string>();
      const pattern = buildPreciseGlobPattern('packages/my-app', tags);
      expect(pattern).toBe('packages/my-app/src/**/*.{ts,js,vue,tsx,jsx}');
    });
  });

  describe('getApplyToDescription', () => {
    it('should return description for single tag', () => {
      const tags = new Set(['framework-vue']);
      expect(getApplyToDescription(tags)).toBe('Vue components');
    });

    it('should return combined descriptions for multiple tags', () => {
      const tags = new Set(['framework-vue', 'lang-typescript']);
      expect(getApplyToDescription(tags)).toBe(
        'Vue components, TypeScript files',
      );
    });

    it('should return default description for unknown tags', () => {
      const tags = new Set<string>(['unknown-tag']);
      expect(getApplyToDescription(tags)).toBe('Source files');
    });

    it('should return default description for empty tags', () => {
      const tags = new Set<string>();
      expect(getApplyToDescription(tags)).toBe('Source files');
    });
  });
});
