/**
 * PHP Language Plugin
 * 
 * Detects PHP projects via composer.json
 */

import type { ProjectMetadata, TemplateDefinition } from '../../types';
import { BasePlugin } from '../base/BasePlugin';

export class PHPPlugin extends BasePlugin {
  name = 'php';
  displayName = 'PHP';
  version = '3.0.0';
  priority = 65;

  async detect(projectPath: string): Promise<ProjectMetadata | null> {
    if (!this.fileExists(projectPath, 'composer.json')) {
      return null;
    }

    const composer = this.readJSON<{
      name?: string;
      description?: string;
      require?: Record<string, string>;
      'require-dev'?: Record<string, string>;
    }>(projectPath, 'composer.json');

    if (!composer) {
      return {
        language: 'PHP',
        name: this.getProjectName(projectPath),
        dependencies: {},
        manifestFile: 'composer.json',
        projectPath,
      };
    }

    const deps = {
      ...composer.require,
      ...composer['require-dev'],
    };

    return {
      language: 'PHP',
      name: composer.name || this.getProjectName(projectPath),
      description: composer.description,
      dependencies: deps,
      manifestFile: 'composer.json',
      projectPath,
    };
  }

  getTemplates(): TemplateDefinition[] {
    return [
      {
        name: 'php-core',
        tags: ['php'],
        content: `# PHP Development Guidelines

This project uses PHP.

## Code Style
- Follow PSR-12 coding standard
- Use PHP-CS-Fixer
- Type hint where possible

## Dependencies
- Manage with Composer
- Keep composer.lock committed
- Review package security

## Testing
- Write PHPUnit tests
- Use proper assertions
- Aim for good coverage`,
      },
    ];
  }

  getDependencyTagMap() {
    return {
      'laravel/framework': 'laravel',
      'symfony/symfony': 'symfony',
      'phpunit/phpunit': 'phpunit',
    };
  }
}
