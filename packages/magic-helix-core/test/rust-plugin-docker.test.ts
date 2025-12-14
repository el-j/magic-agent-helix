import { describe, expect, it } from 'vitest';
import { RustPlugin } from '../src/plugins/rust-plugin';
import * as fs from 'fs';
import * as path from 'path';

describe('RustPlugin in Docker context', () => {
  const fixtureDir = path.join(__dirname, '../test-fixtures/rust-docker');

  it('detects Rust project and generates instructions', () => {
    const files = [
      'Cargo.toml',
      'src/main.rs',
    ];
    files.forEach(f => {
      expect(fs.existsSync(path.join(fixtureDir, f))).toBe(true);
    });

    const plugin = new RustPlugin();
    const context = {
      files,
      hasFile: (f: string) => files.includes(f),
      getTextFile: (f: string) => fs.readFileSync(path.join(fixtureDir, f), 'utf8'),
      matchesPattern: (pattern: string) => files.filter(file => file.endsWith(pattern.replace('**/*.', ''))),
    };
    const result = plugin.detect(context);
    expect(result.detected).toBe(true);
    expect(result.tags).toContain('lang-rust');
    expect(result.metadata?.packageName).toBe('app');
  });
});
