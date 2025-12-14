import { describe, expect, it } from 'vitest';
import { RubyPlugin } from '../src/plugins/ruby-plugin';
import * as fs from 'fs';
import * as path from 'path';

describe('RubyPlugin', () => {
  const fixtureDir = path.join(__dirname, '../test-fixtures/ruby-rails');

  it('detects Rails project', () => {
    const files = [
      'Gemfile',
      'config/routes.rb',
      'config/application.rb',
      'Rakefile',
    ];
    
    const plugin = new RubyPlugin();
    const context = {
      files,
      hasFile: (f: string) => files.includes(f),
      getTextFile: (f: string) => {
        const fullPath = path.join(fixtureDir, f);
        if (fs.existsSync(fullPath)) {
          return fs.readFileSync(fullPath, 'utf8');
        }
        return undefined;
      },
      matchesPattern: (pattern: string) => {
        if (pattern === '**/*.rb') return true;
        return false;
      },
    };
    
    const result = plugin.detect(context);
    expect(result.detected).toBe(true);
    expect(result.tags).toContain('lang-ruby');
    expect(result.metadata?.framework).toBe('rails');
    expect(result.metadata?.railsVersion).toBe('7.1.0');
    
    const instructions = plugin.generateInstructions(context, result.metadata);
    expect(instructions.length).toBeGreaterThan(0);
    expect(instructions.some(i => i.template === 'ruby/lang-ruby.md')).toBe(true);
    expect(instructions.some(i => i.template === 'ruby/framework-rails.md')).toBe(true);
  });
});
