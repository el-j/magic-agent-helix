import { describe, expect, it } from 'vitest';
import { SwiftPlugin } from '../src/plugins/swift-plugin';
import * as fs from 'fs';
import * as path from 'path';

describe('SwiftPlugin', () => {
  const fixtureDir = path.join(__dirname, '../test-fixtures/swift-vapor');

  it('detects Vapor Swift project', () => {
    const files = [
      'Package.swift',
      'Sources/MyVaporApp/main.swift',
    ];
    
    const plugin = new SwiftPlugin();
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
        if (pattern === '**/*.swift') return true;
        if (pattern === '**/*.xcodeproj') return false;
        if (pattern === '**/*.xcworkspace') return false;
        return false;
      },
    };
    
    const result = plugin.detect(context);
    expect(result.detected).toBe(true);
    expect(result.tags).toContain('lang-swift');
    expect(result.metadata?.framework).toBe('vapor');
    expect(result.metadata?.swiftToolsVersion).toBe('5.9');
    expect(result.metadata?.packageName).toBe('MyVaporApp');
    
    const instructions = plugin.generateInstructions(context, result.metadata);
    expect(instructions.length).toBeGreaterThan(0);
    expect(instructions.some(i => i.template === 'swift/lang-swift.md')).toBe(true);
    expect(instructions.some(i => i.template === 'swift/framework-vapor.md')).toBe(true);
  });
});
