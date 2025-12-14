/**
 * Go Language Plugin
 *
 * Detects Go projects via go.mod file
 * Parses module dependencies from go.mod
 */

import type { ProjectMetadata, TemplateDefinition } from '../../types';
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
      return {
        language: 'Go',
        name: this.getProjectName(projectPath),
        dependencies: {},
        manifestFile: 'go.mod',
        projectPath,
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

    return {
      language: 'Go',
      name: moduleMatch?.[1] || this.getProjectName(projectPath),
      dependencies: deps,
      manifestFile: 'go.mod',
      projectPath,
    };
  }

  getTemplates(): TemplateDefinition[] {
    return [
      {
        name: 'go-core',
        tags: ['go'],
        content: this.getGoTemplate(),
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

  private getGoTemplate(): string {
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
