/**
 * Kotlin Language Plugin (Standalone)
 * 
 * Detects Kotlin projects via build.gradle.kts or settings.gradle.kts
 * Note: Java plugin also detects Kotlin in multi-language JVM projects
 */

import * as path from 'node:path';
import type { ProjectMetadata, TemplateDefinition } from '@el-j/magic-helix-core';
import { BasePlugin } from '../base/BasePlugin';

export class KotlinPlugin extends BasePlugin {
  name = 'kotlin';
  displayName = 'Kotlin';
  version = '1.0.0';
  priority = 85;

  async detect(projectPath: string): Promise<ProjectMetadata | null> {
    const hasKotlinGradle = 
      this.fileExists(projectPath, 'build.gradle.kts') ||
      this.fileExists(projectPath, 'settings.gradle.kts');

    if (!hasKotlinGradle) {
      return null;
    }

    const content = this.readFile(projectPath, 'build.gradle.kts');
    const tags: string[] = ['kotlin'];
    const dependencies: Record<string, string> = {};

    if (content) {
      // Detect Ktor
      if (content.includes('ktor')) {
        tags.push('ktor');
        dependencies['ktor'] = '*';
      }

      // Detect Spring Boot
      if (content.includes('spring-boot')) {
        tags.push('spring-boot');
        dependencies['spring-boot'] = '*';
      }

      // Detect Exposed (SQL framework)
      if (content.includes('exposed')) {
        tags.push('exposed');
      }

      // Detect Coroutines
      if (content.includes('kotlinx-coroutines')) {
        tags.push('coroutines');
      }
    }

    return {
      language: 'Kotlin',
      name: this.getProjectName(projectPath),
      dependencies,
      manifestFile: 'build.gradle.kts',
      projectPath,
      tags,
    };
  }

  getTemplates(): TemplateDefinition[] {
    return [
      {
        name: 'kotlin-core',
        tags: ['kotlin'],
        content: () => this.loadTemplateFromFile(
          path.join(__dirname, 'templates/lang-kotlin.md')
        ).then(c => c || this.getKotlinFallbackTemplate()),
      },
    ];
  }

  getDependencyTagMap() {
    return {
      'ktor': 'ktor',
      'spring-boot': 'spring-boot',
      'exposed': 'exposed',
      'kotlinx-coroutines': 'coroutines',
    };
  }

  private getKotlinFallbackTemplate(): string {
    return `# Kotlin Development Guidelines

## Language Features
- Use data classes for simple data holders
- Leverage null safety with ?
- Use scope functions (let, apply, run, with, also)
- Prefer extension functions over utility classes

## Coroutines
- Use suspend functions for async operations
- Leverage Flow for reactive streams
- Understand structured concurrency

## Collections
- Use collection builders and operations
- Leverage sequences for large datasets
- Understand the difference between List/MutableList
`;
  }
}
