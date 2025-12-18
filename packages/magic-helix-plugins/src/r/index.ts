/**
 * R Language Plugin
 * 
 * Detects R projects via DESCRIPTION file or .Rproj
 * Supports R packages and statistical computing projects
 */

import * as path from 'node:path';
import type { ProjectMetadata, TemplateDefinition } from '@el-j/magic-helix-core';
import { BasePlugin } from '../base/BasePlugin';

export class RPlugin extends BasePlugin {
  name = 'r';
  displayName = 'R';
  version = '1.0.0';
  priority = 75;

  async detect(projectPath: string): Promise<ProjectMetadata | null> {
    const files = this.listFiles(projectPath);
    const hasRproj = files?.some(f => f.endsWith('.Rproj'));
    
    if (this.fileExists(projectPath, 'DESCRIPTION') || hasRproj) {
      const tags: string[] = ['r'];
      const dependencies: Record<string, string> = {};
      
      const content = this.readFile(projectPath, 'DESCRIPTION');
      if (content) {
        const nameMatch = content.match(/Package:\s*(.+)/);
        const versionMatch = content.match(/Version:\s*(.+)/);
        
        // Check for common packages
        if (content.includes('tidyverse') || content.includes('dplyr')) {
          tags.push('tidyverse');
        }
        if (content.includes('shiny')) {
          tags.push('shiny');
          dependencies['shiny'] = '*';
        }
        
        return {
          language: 'R',
          name: nameMatch?.[1]?.trim() || this.getProjectName(projectPath),
          version: versionMatch?.[1]?.trim() || '0.1.0',
          dependencies,
          manifestFile: 'DESCRIPTION',
          projectPath,
          tags,
        };
      }
      
      return {
        language: 'R',
        name: this.getProjectName(projectPath),
        dependencies: {},
        manifestFile: hasRproj ? '.Rproj' : 'DESCRIPTION',
        projectPath,
        tags,
      };
    }

    return null;
  }

  getTemplates(): TemplateDefinition[] {
    return [
      {
        name: 'r-core',
        tags: ['r'],
        content: () => this.loadTemplateFromFile(
          path.join(__dirname, 'templates/lang-r.md')
        ).then(c => c || this.getRFallbackTemplate()),
      },
    ];
  }

  getDependencyTagMap() {
    return {
      'tidyverse': 'tidyverse',
      'shiny': 'shiny',
      'ggplot2': 'ggplot2',
      'data.table': 'data-table',
    };
  }

  private getRFallbackTemplate(): string {
    return `# R Development Guidelines

## Tidyverse Principles
- Use pipes (%>% or |>) for data transformations
- Prefer dplyr verbs (select, filter, mutate, summarize)
- Use ggplot2 for visualization

## Vectorization
- Operate on entire vectors, not loops
- Use apply family functions
- Leverage data.table for performance

## Best Practices
- Document functions with roxygen2
- Write unit tests with testthat
- Use consistent naming (snake_case)
`;
  }
}
