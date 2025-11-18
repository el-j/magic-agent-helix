/**
 * C# / .NET Language Plugin
 * 
 * Detects C# projects via .csproj files
 */

import type { ProjectMetadata, TemplateDefinition } from '@magic-helix/core';
import { BasePlugin } from '../base/BasePlugin';

export class CSharpPlugin extends BasePlugin {
  name = 'csharp';
  displayName = 'C#';
  version = '3.0.0';
  priority = 60;

  async detect(projectPath: string): Promise<ProjectMetadata | null> {
    const csprojFiles = await this.findFiles(projectPath, '*.csproj');
    
    if (csprojFiles.length === 0) {
      return null;
    }

    const csprojFile = csprojFiles[0];
    const content = this.readFile(projectPath, csprojFile);
    const deps: Record<string, string> = {};

    if (content) {
      const depMatches = content.matchAll(
        /<PackageReference\s+Include="([^"]+)"(?:\s+Version="([^"]+)")?/g,
      );
      for (const match of depMatches) {
        deps[match[1]] = match[2] || '*';
      }
    }

    return {
      language: 'C#',
      name: csprojFile.replace('.csproj', ''),
      dependencies: deps,
      manifestFile: csprojFile,
      projectPath,
    };
  }

  getTemplates(): TemplateDefinition[] {
    return [
      {
        name: 'csharp-core',
        tags: ['csharp', 'dotnet'],
        content: `# C# / .NET Development Guidelines

This project uses C# and .NET.

## Code Style
- Follow C# naming conventions
- Use proper async/await patterns
- Leverage LINQ where appropriate

## Dependencies
- Manage with NuGet
- Review package security
- Keep packages updated

## Testing
- Write xUnit/NUnit tests
- Use proper assertions
- Aim for good coverage`,
      },
    ];
  }

  getDependencyTagMap() {
    return {
      'Microsoft.AspNetCore': 'aspnetcore',
      'xunit': 'xunit',
      'NUnit': 'nunit',
    };
  }
}
