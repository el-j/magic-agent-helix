import { describe, expect, it } from 'vitest';
import { DotNetPlugin } from '../src/plugins/dotnet-plugin';
import * as fs from 'fs';
import * as path from 'path';

describe('DotNetPlugin', () => {
  const fixtureDir = path.join(__dirname, '../test-fixtures/dotnet-aspnetcore');

  it('detects ASP.NET Core project', () => {
    const files = [
      'MyApp.csproj',
      'Program.cs',
    ];
    
    const plugin = new DotNetPlugin();
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
        if (pattern === '**/*.csproj') return true;
        if (pattern === '**/*.sln') return false;
        if (pattern === '**/*.cs') return true;
        return false;
      },
    };
    
    const result = plugin.detect(context);
    expect(result.detected).toBe(true);
    expect(result.tags).toContain('lang-csharp');
    expect(result.metadata?.targetFramework).toBe('net8.0');
    
    const instructions = plugin.generateInstructions(context, result.metadata);
    expect(instructions.length).toBeGreaterThan(0);
    expect(instructions.some(i => i.template === 'dotnet/lang-csharp.md')).toBe(true);
  });
});
