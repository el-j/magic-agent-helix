/**
 * Shell Script Plugin
 * 
 * Detects shell script projects and provides guidelines
 * Supports Bash, Zsh, and POSIX sh
 */

import * as path from 'node:path';
import type { ProjectMetadata, TemplateDefinition } from '@el-j/magic-helix-core';
import { BasePlugin } from '../base/BasePlugin';

export class ShellPlugin extends BasePlugin {
  name = 'shell';
  displayName = 'Shell';
  version = '1.0.0';
  priority = 60;

  async detect(projectPath: string): Promise<ProjectMetadata | null> {
    const files = this.listFiles(projectPath);
    const hasShellFiles = files?.some(f => 
      f.endsWith('.sh') || 
      f === 'Makefile' ||
      f.endsWith('.bash') ||
      f.endsWith('.zsh')
    );
    
    if (hasShellFiles) {
      const tags: string[] = ['shell'];
      
      // Detect if it's primarily a shell project
      const shellCount = files?.filter(f => 
        f.endsWith('.sh') || f.endsWith('.bash') || f.endsWith('.zsh')
      ).length || 0;
      
      // Only treat as shell project if significant shell presence
      if (shellCount >= 2 || files?.includes('install.sh') || files?.includes('setup.sh')) {
        return {
          language: 'Shell',
          name: this.getProjectName(projectPath),
          dependencies: {},
          manifestFile: 'scripts',
          projectPath,
          tags,
        };
      }
    }

    return null;
  }

  getTemplates(): TemplateDefinition[] {
    return [
      {
        name: 'shell-core',
        tags: ['shell'],
        content: () => this.loadTemplateFromFile(
          path.join(__dirname, 'templates/lang-shell.md')
        ).then(c => c || this.getShellFallbackTemplate()),
      },
    ];
  }

  getDependencyTagMap() {
    return {};
  }

  private getShellFallbackTemplate(): string {
    return `# Shell Script Development Guidelines

## Best Practices
- Use #!/usr/bin/env bash for portability
- Always quote variables: "$var"
- Use set -euo pipefail for safety
- Check command existence with command -v

## Error Handling
- Use trap for cleanup
- Check exit codes: if ! command; then
- Provide meaningful error messages

## Functions
- Keep functions focused
- Use local variables
- Return meaningful exit codes
`;
  }
}
