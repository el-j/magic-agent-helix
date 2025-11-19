/**
 * Ruby Language Plugin
 *
 * Detects Ruby projects via Gemfile
 */

import type { ProjectMetadata, TemplateDefinition } from '../../types';
import { BasePlugin } from '../base/BasePlugin';

export class RubyPlugin extends BasePlugin {
  name = 'ruby';
  displayName = 'Ruby';
  version = '3.0.0';
  priority = 70;

  async detect(projectPath: string): Promise<ProjectMetadata | null> {
    if (!this.fileExists(projectPath, 'Gemfile')) {
      return null;
    }

    const content = this.readFile(projectPath, 'Gemfile');
    const deps: Record<string, string> = {};

    if (content) {
      const gemMatches = content.matchAll(
        /gem\s+['"]([^'"]+)['"](?:,\s*['"]([^'"]+)['"])?/g,
      );
      for (const match of gemMatches) {
        deps[match[1]] = match[2] || '*';
      }
    }

    return {
      language: 'Ruby',
      name: this.getProjectName(projectPath),
      dependencies: deps,
      manifestFile: 'Gemfile',
      projectPath,
    };
  }

  getTemplates(): TemplateDefinition[] {
    return [
      {
        name: 'ruby-core',
        tags: ['ruby'],
        content: `# Ruby Development Guidelines

This project uses Ruby.

## Code Style
- Follow Ruby style guide
- Use Rubocop for linting
- Keep code idiomatic

## Dependencies
- Manage with Bundler
- Keep Gemfile.lock committed
- Review gem security

## Testing
- Write tests with RSpec/Minitest
- Use fixtures and factories
- Aim for good coverage`,
      },
    ];
  }

  getDependencyTagMap() {
    return {
      rails: 'rails',
      rspec: 'rspec',
      sinatra: 'sinatra',
    };
  }
}
