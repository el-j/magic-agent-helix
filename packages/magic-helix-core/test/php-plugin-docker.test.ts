import { describe, expect, it } from 'vitest';
import { PHPPlugin } from '../src/plugins/php-plugin';
import * as fs from 'fs';
import * as path from 'path';

describe('PHPPlugin in Docker context', () => {
  const fixtureDir = path.join(__dirname, '../test-fixtures/php-docker');

  it('detects PHP project and generates instructions', () => {
    const files = [
      'composer.json',
      'hello.php',
    ];
    files.forEach(f => {
      expect(fs.existsSync(path.join(fixtureDir, f))).toBe(true);
    });

    const plugin = new PHPPlugin();
    const context = {
      files,
      hasFile: (f: string) => files.includes(f),
      getTextFile: (f: string) => fs.readFileSync(path.join(fixtureDir, f), 'utf8'),
      matchesPattern: (pattern: string) => files.filter(file => file.endsWith(pattern.replace('**/*.', ''))),
    };
    const result = plugin.detect(context);
    expect(result.detected).toBe(true);
    expect(result.tags).toContain('lang-php');
    expect(result.metadata?.framework).toBe('laravel');
    expect(result.metadata?.projectName).toBe('phpapp/test');
  });
});
