import { describe, expect, it } from 'vitest';
import { GolangPlugin } from '../src/plugins/golang-plugin';
import { analyzeWithPlugins } from '../src/plugin-analyzer';
import * as fs from 'fs';
import * as path from 'path';

describe('GolangPlugin in Docker context', () => {
  const fixtureDir = path.join(__dirname, '../test-fixtures/go-docker');

  it('detects Go project and generates instructions', async () => {
    const files = fs.readdirSync(fixtureDir);
    expect(files).toContain('go.mod');
    expect(files).toContain('main.go');

    const plugin = new GolangPlugin();
    const context = {
      files: ['go.mod', 'main.go'],
      hasFile: (f: string) => files.includes(f),
      getTextFile: (f: string) => fs.readFileSync(path.join(fixtureDir, f), 'utf8'),
      matchesPattern: (pattern: string) => files.filter(file => file.endsWith(pattern.replace('**/*.', ''))),
    };
    const result = plugin.detect(context);
    expect(result.detected).toBe(true);
    expect(result.tags).toContain('lang-go');
    expect(result.metadata?.moduleName).toBe('example.com/helloworld');
  });
});
