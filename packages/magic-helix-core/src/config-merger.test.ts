import { describe, expect, it } from 'vitest';
import { BUILT_IN_CONFIG } from './built-in-config';
import { mergeConfigs } from './config-merger';
import type { Config } from './types';

describe('mergeConfigs', () => {
  it('should return the base config with aiRefinement defaults if user config is empty', () => {
    const userConfig = {};
    const merged = mergeConfigs(userConfig);
    expect(merged.target).toBe(BUILT_IN_CONFIG.target);
    expect(merged.templateDirectory).toBe(BUILT_IN_CONFIG.templateDirectory);
    expect(merged.outputDirectory).toBe(BUILT_IN_CONFIG.outputDirectory);
    expect(merged).toHaveProperty('aiRefinement');
    expect(merged.aiRefinement.quality).toBe('standard');
  });

  it('should overwrite a base dependency tag', () => {
    const userConfig: Partial<Config> = {
      dependencyTagMap: {
        vue: 'framework-vue-custom', // Overwrite
      },
    };
    const merged = mergeConfigs(userConfig);
    expect(merged.dependencyTagMap.vue).toBe('framework-vue-custom');
    expect(merged.dependencyTagMap.react).toBe('framework-react'); // Should still exist
  });

  it('should add a new dependency tag', () => {
    const userConfig: Partial<Config> = {
      dependencyTagMap: {
        'my-custom-lib': 'domain-custom',
      },
    };
    const merged = mergeConfigs(userConfig);
    expect(merged.dependencyTagMap['my-custom-lib']).toBe('domain-custom');
    expect(merged.dependencyTagMap.vue).toBe('framework-vue');
  });

  it('should merge tagTemplateMap by adding new tags', () => {
    const userConfig: Partial<Config> = {
      tagTemplateMap: {
        'domain-custom': [{ template: 'custom.md', suffix: 'custom.md' }],
      },
    };
    const merged = mergeConfigs(userConfig);
    expect(merged.tagTemplateMap['domain-custom']).toBeDefined();
    expect(merged.tagTemplateMap['framework-vue']).toBeDefined();
  });

  it('should merge tagTemplateMap by replacing existing tags', () => {
    const userConfig: Partial<Config> = {
      tagTemplateMap: {
        'framework-vue': [{ template: 'my-vue.md', suffix: 'my-vue.md' }],
      },
    };
    const merged = mergeConfigs(userConfig);
    // The user's 'framework-vue' *replaces* the built-in one
    expect(merged.tagTemplateMap['framework-vue']).toEqual([
      { template: 'my-vue.md', suffix: 'my-vue.md' },
    ]);
  });

  it('should normalize outputDirectory from singular to plural', () => {
    const userConfig: Partial<Config> = {
      outputDirectory: '.github/instruction',
    };
    const merged = mergeConfigs(userConfig);
    expect(merged.outputDirectory).toBe('.github/instructions');
  });
});
