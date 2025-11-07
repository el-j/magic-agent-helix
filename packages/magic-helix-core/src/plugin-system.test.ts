import { beforeEach, describe, expect, it } from 'vitest';
import {
  type DetectionContext,
  type DetectionPlugin,
  PluginRegistry,
} from './plugin-system';

describe('PluginRegistry', () => {
  let registry: PluginRegistry;

  beforeEach(() => {
    registry = new PluginRegistry();
  });

  it('should register and retrieve plugins', () => {
    const mockPlugin: DetectionPlugin = {
      name: 'test-plugin',
      description: 'Test plugin',
      version: '1.0.0',
      detect: () => ({ detected: false }),
      generateInstructions: () => [],
    };

    registry.register(mockPlugin);

    expect(registry.size).toBe(1);
    expect(registry.get('test-plugin')).toBe(mockPlugin);
  });

  it('should unregister plugins', () => {
    const mockPlugin: DetectionPlugin = {
      name: 'test-plugin',
      description: 'Test plugin',
      version: '1.0.0',
      detect: () => ({ detected: false }),
      generateInstructions: () => [],
    };

    registry.register(mockPlugin);
    expect(registry.size).toBe(1);

    const result = registry.unregister('test-plugin');
    expect(result).toBe(true);
    expect(registry.size).toBe(0);
  });

  it('should get all registered plugins', () => {
    const plugin1: DetectionPlugin = {
      name: 'plugin1',
      description: 'Plugin 1',
      version: '1.0.0',
      detect: () => ({ detected: false }),
      generateInstructions: () => [],
    };

    const plugin2: DetectionPlugin = {
      name: 'plugin2',
      description: 'Plugin 2',
      version: '1.0.0',
      detect: () => ({ detected: false }),
      generateInstructions: () => [],
    };

    registry.register(plugin1);
    registry.register(plugin2);

    const all = registry.getAll();
    expect(all).toHaveLength(2);
    expect(all).toContain(plugin1);
    expect(all).toContain(plugin2);
  });

  it('should clear all plugins', () => {
    const mockPlugin: DetectionPlugin = {
      name: 'test-plugin',
      description: 'Test plugin',
      version: '1.0.0',
      detect: () => ({ detected: false }),
      generateInstructions: () => [],
    };

    registry.register(mockPlugin);
    expect(registry.size).toBe(1);

    registry.clear();
    expect(registry.size).toBe(0);
  });

  it('should warn when overwriting existing plugin', () => {
    const plugin1: DetectionPlugin = {
      name: 'same-name',
      description: 'Plugin 1',
      version: '1.0.0',
      detect: () => ({ detected: false }),
      generateInstructions: () => [],
    };

    const plugin2: DetectionPlugin = {
      name: 'same-name',
      description: 'Plugin 2',
      version: '2.0.0',
      detect: () => ({ detected: false }),
      generateInstructions: () => [],
    };

    registry.register(plugin1);
    registry.register(plugin2);

    expect(registry.size).toBe(1);
    expect(registry.get('same-name')).toBe(plugin2);
  });
});

describe('DetectionContext', () => {
  it('should provide access to project files', () => {
    const context: DetectionContext = {
      files: ['src/main.go', 'go.mod', 'README.md'],
      dependencies: {},
      configFiles: ['go.mod'],
      getTextFile: (path: string) => {
        if (path === 'go.mod') {
          return 'module example.com/myapp\n\ngo 1.21';
        }
        return null;
      },
      hasFile: (path: string) => {
        return ['src/main.go', 'go.mod', 'README.md'].includes(path);
      },
      matchesPattern: (pattern: string) => {
        if (pattern === '**/*.go') {
          return true;
        }
        return false;
      },
    };

    expect(context.files).toHaveLength(3);
    expect(context.hasFile('go.mod')).toBe(true);
    expect(context.hasFile('nonexistent.txt')).toBe(false);
    expect(context.matchesPattern('**/*.go')).toBe(true);

    const goModContent = context.getTextFile('go.mod');
    expect(goModContent).toContain('module example.com/myapp');
  });
});
