import { describe, expect, it } from 'vitest';
import { PythonPlugin } from '../src/plugins/python-plugin';
import * as fs from 'fs';
import * as path from 'path';

describe('PythonPlugin in Docker context', () => {
  const fixtureDir = path.join(__dirname, '../test-fixtures/python-docker/poetryproj');

  it('detects Poetry Python project and generates instructions', () => {
    const files = [
      'pyproject.toml',
      'hello.py',
    ];
    files.forEach(f => {
      expect(fs.existsSync(path.join(fixtureDir, f))).toBe(true);
    });

    const plugin = new PythonPlugin();
    const context = {
      files,
      hasFile: (f: string) => files.includes(f),
      getTextFile: (f: string) => fs.readFileSync(path.join(fixtureDir, f), 'utf8'),
      matchesPattern: (pattern: string) => files.filter(file => file.endsWith(pattern.replace('**/*.', ''))),
    };
    const result = plugin.detect(context);
    expect(result.detected).toBe(true);
    expect(result.tags).toContain('lang-python');
    expect(result.metadata?.packageManager).toBe('poetry');
  });
});
