/**
 * Lua Language Plugin
 * 
 * Detects Lua projects via rockspec files or lua_modules
 * Supports LuaRocks package manager
 */

import * as path from 'node:path';
import type { ProjectMetadata, TemplateDefinition } from '@el-j/magic-helix-core';
import { BasePlugin } from '../base/BasePlugin';

export class LuaPlugin extends BasePlugin {
  name = 'lua';
  displayName = 'Lua';
  version = '1.0.0';
  priority = 75;

  async detect(projectPath: string): Promise<ProjectMetadata | null> {
    // Check for .rockspec files
    const files = this.listFiles(projectPath);
    const rockspec = files?.find(f => f.endsWith('.rockspec'));
    
    if (rockspec || this.fileExists(projectPath, 'lua_modules')) {
      const tags: string[] = ['lua'];
      
      return {
        language: 'Lua',
        name: this.getProjectName(projectPath),
        dependencies: {},
        manifestFile: rockspec || 'lua_modules',
        projectPath,
        tags,
      };
    }

    return null;
  }

  getTemplates(): TemplateDefinition[] {
    return [
      {
        name: 'lua-core',
        tags: ['lua'],
        content: () => this.loadTemplateFromFile(
          path.join(__dirname, 'templates/lang-lua.md')
        ).then(c => c || this.getLuaFallbackTemplate()),
      },
    ];
  }

  getDependencyTagMap() {
    return {
      'lapis': 'lapis',
      'openresty': 'openresty',
      'busted': 'busted',
    };
  }

  private getLuaFallbackTemplate(): string {
    return `# Lua Development Guidelines

## Tables
- Tables are the primary data structure
- Use them for arrays, dictionaries, objects
- Arrays are 1-indexed

## Metatables
- Use metatables for OOP patterns
- Implement __index for inheritance
- Leverage metamethods

## Best Practices
- Keep functions small
- Use local variables for performance
- Understand upvalues and closures
`;
  }
}
