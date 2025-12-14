import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  loadMetaConfig,
  loadOverrideInstructions,
  applyOverrides,
  applyCombiner,
  applyMetaInstructions,
  hasMetaInstructions,
  initMetaInstructions,
  type MetaInstructionConfig,
} from '../src/meta-instructions';

const TEST_PROJECT_PATH = path.join(process.cwd(), 'test-fixtures', 'meta-instructions-test');

describe('Meta-Instructions', () => {
  beforeEach(() => {
    // Clean up test directory
    if (fs.existsSync(TEST_PROJECT_PATH)) {
      fs.rmSync(TEST_PROJECT_PATH, { recursive: true });
    }
    fs.mkdirSync(TEST_PROJECT_PATH, { recursive: true });
  });

  afterEach(() => {
    // Clean up
    if (fs.existsSync(TEST_PROJECT_PATH)) {
      fs.rmSync(TEST_PROJECT_PATH, { recursive: true });
    }
  });

  describe('loadMetaConfig', () => {
    it('returns null when config does not exist', () => {
      const config = loadMetaConfig(TEST_PROJECT_PATH);
      expect(config).toBeNull();
    });

    it('loads valid config', () => {
      const metaDir = path.join(TEST_PROJECT_PATH, '.magic-helix');
      fs.mkdirSync(metaDir, { recursive: true });
      
      const testConfig: MetaInstructionConfig = {
        overrides: [{ tag: 'test', content: 'test content', mode: 'replace' }],
      };
      
      fs.writeFileSync(
        path.join(metaDir, 'meta-instructions.json'),
        JSON.stringify(testConfig)
      );

      const loaded = loadMetaConfig(TEST_PROJECT_PATH);
      expect(loaded).toEqual(testConfig);
    });
  });

  describe('loadOverrideInstructions', () => {
    it('returns empty map when overrides directory does not exist', () => {
      const overrides = loadOverrideInstructions(TEST_PROJECT_PATH);
      expect(overrides.size).toBe(0);
    });

    it('loads override files', () => {
      const overridesDir = path.join(TEST_PROJECT_PATH, '.magic-helix', 'overrides');
      fs.mkdirSync(overridesDir, { recursive: true });
      
      fs.writeFileSync(path.join(overridesDir, 'custom-tag.md'), '# Custom Content');
      fs.writeFileSync(path.join(overridesDir, 'another-tag.md'), '# Another Content');

      const overrides = loadOverrideInstructions(TEST_PROJECT_PATH);
      expect(overrides.size).toBe(2);
      expect(overrides.get('custom-tag')).toBe('# Custom Content');
      expect(overrides.get('another-tag')).toBe('# Another Content');
    });
  });

  describe('applyOverrides', () => {
    it('removes ignored tags', () => {
      const instructions = new Map([
        ['tag1', 'content1'],
        ['tag2', 'content2'],
        ['tag3', 'content3'],
      ]);

      const config: MetaInstructionConfig = {
        ignoreTags: ['tag2'],
      };

      const result = applyOverrides(instructions, config, TEST_PROJECT_PATH);
      expect(result.has('tag2')).toBe(false);
      expect(result.has('tag1')).toBe(true);
      expect(result.has('tag3')).toBe(true);
    });

    it('applies replace mode override', () => {
      const instructions = new Map([['tag1', 'original content']]);
      
      const config: MetaInstructionConfig = {
        overrides: [
          { tag: 'tag1', content: 'new content', mode: 'replace' },
        ],
      };

      const result = applyOverrides(instructions, config, TEST_PROJECT_PATH);
      expect(result.get('tag1')).toBe('new content');
    });

    it('applies prepend mode override', () => {
      const instructions = new Map([['tag1', 'original']]);
      
      const config: MetaInstructionConfig = {
        overrides: [
          { tag: 'tag1', content: 'prepended', mode: 'prepend' },
        ],
      };

      const result = applyOverrides(instructions, config, TEST_PROJECT_PATH);
      expect(result.get('tag1')).toBe('prepended\n\noriginal');
    });

    it('applies append mode override', () => {
      const instructions = new Map([['tag1', 'original']]);
      
      const config: MetaInstructionConfig = {
        overrides: [
          { tag: 'tag1', content: 'appended', mode: 'append' },
        ],
      };

      const result = applyOverrides(instructions, config, TEST_PROJECT_PATH);
      expect(result.get('tag1')).toBe('original\n\nappended');
    });
  });

  describe('applyCombiner', () => {
    it('combines multiple tags', () => {
      const instructions = new Map([
        ['tag1', 'Content 1'],
        ['tag2', 'Content 2'],
      ]);

      const combiner = {
        tags: ['tag1', 'tag2'],
        outputTag: 'combined',
        template: '# Combined\n\n{{tag1}}\n\n---\n\n{{tag2}}',
      };

      const result = applyCombiner(instructions, combiner);
      expect(result.get('combined')).toBe('# Combined\n\nContent 1\n\n---\n\nContent 2');
    });
  });

  describe('applyMetaInstructions', () => {
    it('returns original instructions when no meta config exists', () => {
      const instructions = new Map([['tag1', 'content1']]);
      const result = applyMetaInstructions(instructions, TEST_PROJECT_PATH);
      expect(result).toEqual(instructions);
    });

    it('applies full meta-instruction pipeline', () => {
      const metaDir = path.join(TEST_PROJECT_PATH, '.magic-helix');
      const overridesDir = path.join(metaDir, 'overrides');
      fs.mkdirSync(overridesDir, { recursive: true });

      const config: MetaInstructionConfig = {
        ignoreTags: ['unwanted'],
        overrides: [
          { tag: 'tag2', content: 'overridden', mode: 'replace' },
        ],
        combiners: [
          {
            tags: ['tag1', 'tag2'],
            outputTag: 'combined',
            template: '{{tag1}} + {{tag2}}',
          },
        ],
      };

      fs.writeFileSync(
        path.join(metaDir, 'meta-instructions.json'),
        JSON.stringify(config)
      );

      const instructions = new Map([
        ['tag1', 'content1'],
        ['tag2', 'content2'],
        ['unwanted', 'remove this'],
      ]);

      const result = applyMetaInstructions(instructions, TEST_PROJECT_PATH);
      
      expect(result.has('unwanted')).toBe(false);
      expect(result.get('tag2')).toBe('overridden');
      expect(result.get('combined')).toBe('content1 + overridden');
    });
  });

  describe('hasMetaInstructions', () => {
    it('returns false when directory does not exist', () => {
      expect(hasMetaInstructions(TEST_PROJECT_PATH)).toBe(false);
    });

    it('returns true when directory exists', () => {
      const metaDir = path.join(TEST_PROJECT_PATH, '.magic-helix');
      fs.mkdirSync(metaDir, { recursive: true });
      expect(hasMetaInstructions(TEST_PROJECT_PATH)).toBe(true);
    });
  });

  describe('initMetaInstructions', () => {
    it('creates directory structure and example files', () => {
      initMetaInstructions(TEST_PROJECT_PATH);

      const metaDir = path.join(TEST_PROJECT_PATH, '.magic-helix');
      const overridesDir = path.join(metaDir, 'overrides');
      const configPath = path.join(metaDir, 'meta-instructions.json');
      const examplePath = path.join(overridesDir, 'example.md');

      expect(fs.existsSync(metaDir)).toBe(true);
      expect(fs.existsSync(overridesDir)).toBe(true);
      expect(fs.existsSync(configPath)).toBe(true);
      expect(fs.existsSync(examplePath)).toBe(true);

      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      expect(config).toHaveProperty('overrides');
      expect(config).toHaveProperty('combiners');
      expect(config).toHaveProperty('ignoreTags');
    });
  });
});
