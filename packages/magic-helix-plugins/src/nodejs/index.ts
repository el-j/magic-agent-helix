/**
 * Node.js Language Plugin
 * 
 * Detects Node.js/JavaScript/TypeScript projects via package.json
 * Supports npm workspaces for monorepo detection
 */

import * as path from 'node:path';
import type { ProjectMetadata, TemplateDefinition } from '@el-j/magic-helix-core';
import { BasePlugin } from '../base/BasePlugin';

interface PackageJson {
  name?: string;
  description?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  workspaces?: string[] | { packages: string[] };
}

export class NodeJSPlugin extends BasePlugin {
  name = 'nodejs';
  displayName = 'Node.js';
  version = '3.0.0';
  priority = 100; // High priority - very common

  async detect(projectPath: string): Promise<ProjectMetadata | null> {
    if (!this.fileExists(projectPath, 'package.json')) {
      return null;
    }

    const pkg = this.readJSON<PackageJson>(projectPath, 'package.json');
    if (!pkg) {
      // package.json exists but couldn't parse - still consider it a Node.js project
      return {
        language: 'JavaScript/TypeScript',
        name: this.getProjectName(projectPath),
        dependencies: {},
        manifestFile: 'package.json',
        projectPath,
        tags: ['typescript'], // Default to TypeScript for unparseable package.json
      };
    }

    const deps = this.parseDependencies(
      pkg as Record<string, unknown>,
      'dependencies',
      'devDependencies',
    );

    // Enrich tags from dependencies and config files
    const tags = await this.enrichTags(projectPath, deps);

    const metadata: ProjectMetadata = {
      language: 'JavaScript/TypeScript',
      name: pkg.name || this.getProjectName(projectPath),
      description: pkg.description,
      dependencies: deps,
      manifestFile: 'package.json',
      projectPath,
      tags: Array.from(tags),
    };

    // Check for workspaces (monorepo support) with proper glob expansion
    const workspaces = await this.extractWorkspaces(projectPath, pkg);
    if (workspaces.length > 0) {
      metadata.workspaceMembers = workspaces;
    }

    return metadata;
  }

  getTemplates(): TemplateDefinition[] {
    const dirname = this.getDirname(import.meta.url);
    return [
      {
        name: 'lang-typescript',
        tags: ['typescript'],
        content: () => this.loadTemplateFromFile(
          path.join(dirname, 'templates/lang-typescript.md')
        ).then(c => c || this.getTypescriptTemplate()),
      },
      {
        name: 'react-core',
        tags: ['react'],
        content: () => this.loadTemplateFromFile(
          path.join(dirname, 'templates/react-core.md')
        ).then(c => c || this.getReactTemplate()),
      },
      {
        name: 'react-zustand',
        tags: ['zustand'],
        content: () => this.loadTemplateFromFile(
          path.join(dirname, 'templates/react-zustand.md')
        ).then(c => c || this.getReactZustandTemplate()),
      },
      {
        name: 'vue-core',
        tags: ['vue'],
        content: () => this.loadTemplateFromFile(
          path.join(dirname, 'templates/vue-core.md')
        ).then(c => c || this.getVueTemplate()),
      },
      {
        name: 'vue-pinia',
        tags: ['pinia'],
        content: () => this.loadTemplateFromFile(
          path.join(dirname, 'templates/vue-pinia.md')
        ).then(c => c || this.getVuePiniaTemplate()),
      },
      {
        name: 'nestjs-core',
        tags: ['nestjs'],
        content: () => this.loadTemplateFromFile(
          path.join(dirname, 'templates/nestjs-core.md')
        ).then(c => c || this.getNestJSTemplate()),
      },
      {
        name: 'style-tailwind',
        tags: ['tailwind'],
        content: () => this.loadTemplateFromFile(
          path.join(dirname, 'templates/style-tailwind.md')
        ).then(c => c || this.getTailwindTemplate()),
      },
      {
        name: 'test-vitest',
        tags: ['vitest'],
        content: () => this.loadTemplateFromFile(
          path.join(dirname, 'templates/test-vitest.md')
        ).then(c => c || this.getVitestTemplate()),
      },
    ];
  }

  getDependencyTagMap() {
    return {
      'react': 'react',
      'react-dom': 'react',
      'vue': 'vue',
      '@vue/runtime-core': 'vue',
      'pinia': 'pinia',
      '@nestjs/core': 'nestjs',
      'tailwindcss': 'tailwind',
      'vitest': 'vitest',
      'zustand': 'zustand',
      'typescript': 'typescript',
    };
  }

  getConfigFileTagMap() {
    return {
      'tailwind.config.js': 'tailwind',
      'tailwind.config.ts': 'tailwind',
      'vitest.config.js': 'vitest',
      'vitest.config.ts': 'vitest',
      'tsconfig.json': 'typescript',
    };
  }

  // Private helper methods

  private async extractWorkspaces(projectPath: string, pkg: PackageJson): Promise<string[]> {
    if (!pkg.workspaces) return [];

    const workspacePatterns = Array.isArray(pkg.workspaces)
      ? pkg.workspaces
      : pkg.workspaces.packages || [];

    // Properly expand glob patterns to actual directories
    const workspaces: string[] = [];
    for (const pattern of workspacePatterns) {
      try {
        const { glob } = await import('glob');
        const matches = await glob(pattern, {
          cwd: projectPath,
          absolute: false,
          onlyDirectories: true,
        });
        workspaces.push(...matches);
      } catch {
        // Fallback: simplified pattern expansion
        workspaces.push(pattern.replace(/\/\*+$/, ''));
      }
    }

    return workspaces;
  }

  /**
   * Enrich tags from dependencies and config files
   */
  private async enrichTags(
    projectPath: string,
    dependencies: Record<string, string>,
  ): Promise<Set<string>> {
    const tags = new Set<string>();

    // Always add TypeScript if tsconfig.json exists
    if (this.fileExists(projectPath, 'tsconfig.json')) {
      tags.add('typescript');
    }

    // Add tags from dependency map
    const depTagMap = this.getDependencyTagMap();
    for (const dep in dependencies) {
      if (depTagMap[dep]) {
        tags.add(depTagMap[dep]);
      }
    }

    // Add tags from config file map
    const configTagMap = this.getConfigFileTagMap();
    for (const file in configTagMap) {
      if (this.fileExists(projectPath, file)) {
        tags.add(configTagMap[file]);
      }
    }

    return tags;
  }

  // Fallback template content (if files don't exist)

  private getTypescriptTemplate(): string {
    return `# TypeScript Guidelines

This project uses TypeScript for type safety.

## Type Safety
- Use strict type checking
- Avoid \`any\` types
- Prefer interfaces over types for objects

## Best Practices
- Enable all strict compiler options
- Use proper type inference
- Leverage utility types`;
  }

  private getReactTemplate(): string {
    return `# React Development Guidelines

This project uses React.

## Component Structure
- Use functional components with hooks
- Keep components focused and reusable
- Follow React best practices

## State Management
- Use appropriate state management for complexity
- Consider component composition
- Leverage React context when needed`;
  }

  private getReactZustandTemplate(): string {
    return `# Zustand State Management

This project uses Zustand for state management.

## Store Structure
- Create focused, modular stores
- Use selectors to prevent unnecessary re-renders
- Follow Zustand best practices`;
  }

  private getVueTemplate(): string {
    return `# Vue.js Development Guidelines

This project uses Vue.js.

## Component Structure
- Use Composition API
- Follow Vue.js style guide
- Keep components composable and reusable`;
  }

  private getVuePiniaTemplate(): string {
    return `# Pinia State Management

This project uses Pinia for state management.

## Store Structure
- Create modular stores
- Use composition stores pattern
- Follow Pinia best practices`;
  }

  private getNestJSTemplate(): string {
    return `# NestJS Development Guidelines

This project uses NestJS framework.

## Architecture
- Follow modular architecture
- Use dependency injection
- Implement proper error handling`;
  }

  private getTailwindTemplate(): string {
    return `# Tailwind CSS Guidelines

This project uses Tailwind CSS.

## Styling Approach
- Use utility-first classes
- Create reusable components
- Follow Tailwind best practices`;
  }

  private getVitestTemplate(): string {
    return `# Vitest Testing Guidelines

This project uses Vitest for testing.

## Testing Strategy
- Write unit tests for utilities
- Use component testing
- Follow testing best practices`;
  }
}
