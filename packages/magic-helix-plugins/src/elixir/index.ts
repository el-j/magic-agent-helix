/**
 * Elixir Language Plugin
 * 
 * Detects Elixir projects via mix.exs
 * Supports Phoenix framework and other Mix-based projects
 */

import * as path from 'node:path';
import type { ProjectMetadata, TemplateDefinition } from '@el-j/magic-helix-core';
import { BasePlugin } from '../base/BasePlugin';

export class ElixirPlugin extends BasePlugin {
  name = 'elixir';
  displayName = 'Elixir';
  version = '1.0.0';
  priority = 80;

  async detect(projectPath: string): Promise<ProjectMetadata | null> {
    if (!this.fileExists(projectPath, 'mix.exs')) {
      return null;
    }

    const content = this.readFile(projectPath, 'mix.exs');
    const tags: string[] = ['elixir'];
    const dependencies: Record<string, string> = {};

    if (content) {
      const appMatch = content.match(/app:\s*:(\w+)/);
      const versionMatch = content.match(/version:\s*"([^"]+)"/);
      
      // Detect Phoenix
      if (content.includes(':phoenix')) {
        tags.push('phoenix');
        dependencies['phoenix'] = '*';
      }
      
      // Detect Ecto
      if (content.includes(':ecto')) {
        tags.push('ecto');
        dependencies['ecto'] = '*';
      }
      
      return {
        language: 'Elixir',
        name: appMatch?.[1] || this.getProjectName(projectPath),
        version: versionMatch?.[1] || '0.1.0',
        dependencies,
        manifestFile: 'mix.exs',
        projectPath,
        tags,
      };
    }

    return {
      language: 'Elixir',
      name: this.getProjectName(projectPath),
      dependencies: {},
      manifestFile: 'mix.exs',
      projectPath,
      tags,
    };
  }

  getTemplates(): TemplateDefinition[] {
    return [
      {
        name: 'elixir-core',
        tags: ['elixir'],
        content: () => this.loadTemplateFromFile(
          path.join(__dirname, 'templates/lang-elixir.md')
        ).then(c => c || this.getElixirFallbackTemplate()),
      },
    ];
  }

  getDependencyTagMap() {
    return {
      'phoenix': 'phoenix',
      'ecto': 'ecto',
      'absinthe': 'graphql',
      'plug': 'plug',
    };
  }

  private getElixirFallbackTemplate(): string {
    return `# Elixir Development Guidelines

## Language-Specific Rules
- Use pattern matching and guards extensively
- Prefer immutable data structures
- Use pipe operator |> for data transformations
- Follow OTP principles for concurrent systems
- Use GenServer for stateful processes

## Code Style
- Follow Elixir formatter conventions
- Use snake_case for functions and variables
- Use PascalCase for module names
- Keep functions small and focused
- Use \`with\` for complex case matching

## Common Patterns
- Supervision trees for fault tolerance
- GenServer for state management
- Phoenix contexts for domain logic
- Ecto changesets for data validation
`;
  }
}
