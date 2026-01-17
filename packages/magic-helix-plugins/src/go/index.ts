/**
 * Go Language Plugin
 * 
 * Detects Go projects via go.mod file
 * Parses module dependencies from go.mod
 */

import * as path from 'node:path';
import type { ProjectMetadata, TemplateDefinition } from '@el-j/magic-helix-core';
import { BasePlugin } from '../base/BasePlugin';

export class GoPlugin extends BasePlugin {
  name = 'go';
  displayName = 'Go';
  version = '3.0.0';
  priority = 90;

  async detect(projectPath: string): Promise<ProjectMetadata | null> {
    if (!this.fileExists(projectPath, 'go.mod')) {
      return null;
    }

    const content = this.readFile(projectPath, 'go.mod');
    if (!content) {
      const tags = await this.enrichTags(projectPath, {});
      return {
        language: 'Go',
        name: this.getProjectName(projectPath),
        dependencies: {},
        manifestFile: 'go.mod',
        projectPath,
        tags: Array.from(tags),
      };
    }

    const moduleMatch = content.match(/module\s+([^\s\n]+)/);
    const deps: Record<string, string> = {};

    // Parse dependencies
    const lines = content.split('\n');
    let inRequire = false;
    for (const line of lines) {
      if (line.trim().startsWith('require (')) {
        inRequire = true;
        continue;
      }
      if (inRequire) {
        if (line.trim() === ')') break;
        const depMatch = line.match(/^\s*([^\s]+)\s+v([^\s]+)/);
        if (depMatch) {
          deps[depMatch[1]] = depMatch[2];
        }
      } else if (line.trim().startsWith('require ')) {
        const depMatch = line.match(/require\s+([^\s]+)\s+v([^\s]+)/);
        if (depMatch) {
          deps[depMatch[1]] = depMatch[2];
        }
      }
    }

    const tags = await this.enrichTags(projectPath, deps);

    return {
      language: 'Go',
      name: moduleMatch?.[1] || this.getProjectName(projectPath),
      dependencies: deps,
      manifestFile: 'go.mod',
      projectPath,
      tags: Array.from(tags),
    };
  }

  /**
   * Enrich tags from dependencies
   */
  private async enrichTags(
    _projectPath: string,
    dependencies: Record<string, string>,
  ): Promise<Set<string>> {
    const tags = new Set<string>(['go']); // Always include go tag

    // Add tags from dependency map
    const depTagMap = this.getDependencyTagMap();
    for (const dep in dependencies) {
      if (depTagMap[dep]) {
        tags.add(depTagMap[dep]);
      }
    }

    return tags;
  }

  getTemplates(): TemplateDefinition[] {
    const dirname = this.getDirname(import.meta.url);
    return [
      {
        name: 'go-core',
        tags: ['go'],
        content: () => this.loadTemplateFromFile(
          path.join(dirname, 'templates/lang-go.md')
        ).then(c => c || this.getGoFallbackTemplate()),
      },
    ];
  }

  getDependencyTagMap() {
    return {
      'github.com/gin-gonic/gin': 'gin',
      'github.com/gofiber/fiber': 'fiber',
      'github.com/labstack/echo': 'echo',
      'gorm.io/gorm': 'gorm',
    };
  }

  private getGoFallbackTemplate(): string {
    return `# Go Development Guidelines

This project uses Go.

## Project Structure
- Follow standard Go project layout
- Organize code in packages
- Use proper module management

## Code Style
- Follow Go conventions and idioms
- Use \`gofmt\` for formatting
- Run \`golint\` and \`go vet\`

## Error Handling
- Handle errors explicitly
- Don't ignore errors
- Provide meaningful error messages

## Testing
- Write table-driven tests
- Use \`testing\` package
- Aim for good test coverage

## Dependencies
- Use Go modules (\`go.mod\`)
- Keep dependencies minimal
- Review dependency licenses`;
  }
}
