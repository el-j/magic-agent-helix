/**
 * Perl Language Plugin
 * 
 * Detects Perl projects via Makefile.PL, Build.PL, or cpanfile
 */

import * as path from 'node:path';
import type { ProjectMetadata, TemplateDefinition } from '@el-j/magic-helix-core';
import { BasePlugin } from '../base/BasePlugin';

export class PerlPlugin extends BasePlugin {
  name = 'perl';
  displayName = 'Perl';
  version = '1.0.0';
  priority = 70;

  async detect(projectPath: string): Promise<ProjectMetadata | null> {
    if (this.fileExists(projectPath, 'Makefile.PL') ||
        this.fileExists(projectPath, 'Build.PL') ||
        this.fileExists(projectPath, 'cpanfile')) {
      
      const manifestFile = 
        this.fileExists(projectPath, 'Makefile.PL') ? 'Makefile.PL' :
        this.fileExists(projectPath, 'Build.PL') ? 'Build.PL' : 'cpanfile';
      
      return {
        language: 'Perl',
        name: this.getProjectName(projectPath),
        dependencies: {},
        manifestFile,
        projectPath,
        tags: ['perl'],
      };
    }

    return null;
  }

  getTemplates(): TemplateDefinition[] {
    return [
      {
        name: 'perl-core',
        tags: ['perl'],
        content: () => this.loadTemplateFromFile(
          path.join(__dirname, 'templates/lang-perl.md')
        ).then(c => c || this.getPerlFallbackTemplate()),
      },
    ];
  }

  getDependencyTagMap() {
    return {
      'Mojolicious': 'mojolicious',
      'Dancer2': 'dancer',
      'Catalyst': 'catalyst',
    };
  }

  private getPerlFallbackTemplate(): string {
    return `# Perl Development Guidelines

## Modern Perl
- Use strict and warnings
- Leverage Moose/Moo for OOP
- Use Try::Tiny for exception handling

## CPAN Modules
- Use cpanm for installation
- Declare dependencies in cpanfile
- Test with prove

## Best Practices
- Follow PBP (Perl Best Practices)
- Use perlcritic for linting
- Write tests with Test::More
`;
  }
}
