import { describe, expect, it } from 'vitest';
import { JavaKotlinPlugin } from '../src/plugins/java-kotlin-plugin';
import * as fs from 'fs';
import * as path from 'path';

describe('JavaKotlinPlugin', () => {
  const fixtureDir = path.join(__dirname, '../test-fixtures/java-maven');

  it('detects Maven Java project with Spring Boot', () => {
    const files = [
      'pom.xml',
      'src/main/java/com/example/demo/Application.java',
    ];
    
    const plugin = new JavaKotlinPlugin();
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
        if (pattern === '**/*.java') return true;
        if (pattern === '**/*.kt') return false;
        return false;
      },
    };
    
    const result = plugin.detect(context);
    expect(result.detected).toBe(true);
    expect(result.tags).toContain('lang-java');
    expect(result.metadata?.buildTool).toBe('maven');
    expect(result.metadata?.framework).toBe('spring-boot');
    expect(result.metadata?.artifact).toBe('com.example:spring-demo');
    
    const instructions = plugin.generateInstructions(context, result.metadata);
    expect(instructions.length).toBeGreaterThan(0);
    expect(instructions.some(i => i.template === 'java/lang-java.md')).toBe(true);
    expect(instructions.some(i => i.template === 'java/build-maven.md')).toBe(true);
    expect(instructions.some(i => i.template === 'java/framework-spring-boot.md')).toBe(true);
  });
});
