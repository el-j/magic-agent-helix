/**
 * Scala Language Plugin
 * 
 * Detects Scala projects via build.sbt or build.sc
 * Supports sbt, Mill, and Maven-based Scala projects
 */

import * as path from 'node:path';
import type { ProjectMetadata, TemplateDefinition } from '@el-j/magic-helix-core';
import { BasePlugin } from '../base/BasePlugin';

export class ScalaPlugin extends BasePlugin {
  name = 'scala';
  displayName = 'Scala';
  version = '1.0.0';
  priority = 80;
  async detect(projectPath: string): Promise<ProjectMetadata | null> {
    // Check for sbt
    if (this.fileExists(projectPath, 'build.sbt')) {
      return this.detectFromSbt(projectPath);
    }

    // Check for Mill
    if (this.fileExists(projectPath, 'build.sc')) {
      return this.detectFromMill(projectPath);
    }

    return null;
  }

  getTemplates(): TemplateDefinition[] {
    const dirname = this.getDirname(import.meta.url);
    return [
      {
        name: 'scala-core',
        tags: ['scala'],
        content: () => this.loadTemplateFromFile(
          path.join(dirname, 'templates/lang-scala.md')
        ).then(c => c || this.getScalaFallbackTemplate()),
      },
    ];
  }

  getDependencyTagMap() {
    return {
      'akka': 'akka',
      'akka-http': 'akka-http',
      'play': 'play',
      'cats-effect': 'cats',
      'zio': 'zio',
      'scalatest': 'scalatest',
    };
  }

  private detectFromSbt(projectPath: string): ProjectMetadata {
    const content = this.readFile(projectPath, 'build.sbt');
    const tags: string[] = ['scala'];
    const dependencies: Record<string, string> = {};

    if (content) {
      const nameMatch = content.match(/name\s*:=\s*"([^"]+)"/);
      
      // Detect Akka
      if (content.includes('akka-actor') || content.includes('com.typesafe.akka')) {
        tags.push('akka');
        dependencies['akka'] = '*';
      }
      
      // Detect Play
      if (content.includes('play') || content.includes('com.typesafe.play')) {
        tags.push('play');
        dependencies['play'] = '*';
      }

      // Detect ZIO
      if (content.includes('zio')) {
        tags.push('zio');
      }

      // Detect Cats
      if (content.includes('cats-effect') || content.includes('cats-core')) {
        tags.push('cats');
      }
      
      return {
        language: 'Scala',
        name: nameMatch?.[1] || this.getProjectName(projectPath),
        dependencies,
        manifestFile: 'build.sbt',
        projectPath,
        tags,
      };
    }

    return {
      language: 'Scala',
      name: this.getProjectName(projectPath),
      dependencies: {},
      manifestFile: 'build.sbt',
      projectPath,
      tags,
    };
  }

  private detectFromMill(projectPath: string): ProjectMetadata {
    return {
      language: 'Scala',
      name: this.getProjectName(projectPath),
      dependencies: {},
      manifestFile: 'build.sc',
      projectPath,
      tags: ['scala'],
    };
  }

  private getScalaFallbackTemplate(): string {
    return `# Scala Development Guidelines

## Functional Programming
- Prefer immutable data structures
- Use case classes for data models
- Leverage pattern matching
- Use for-comprehensions for sequential operations

## Collections
- Use immutable collections by default
- Leverage map, flatMap, filter, fold
- Understand lazy vs strict evaluation

## Type System
- Use type inference where appropriate
- Leverage sealed traits for ADTs
- Use implicit conversions sparingly
`;
  }
}
