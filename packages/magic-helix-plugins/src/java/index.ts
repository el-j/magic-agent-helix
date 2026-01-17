/**
 * Java Language Plugin
 * 
 * Detects Java projects via pom.xml (Maven) or build.gradle (Gradle)
 */

import * as path from 'node:path';
import type { ProjectMetadata, TemplateDefinition } from '@el-j/magic-helix-core';
import { BasePlugin } from '../base/BasePlugin';

export class JavaPlugin extends BasePlugin {
  name = 'java';
  displayName = 'Java';
  version = '3.0.0';
  priority = 75;
  async detect(projectPath: string): Promise<ProjectMetadata | null> {
    // Check for Maven
    if (this.fileExists(projectPath, 'pom.xml')) {
      return this.detectMaven(projectPath);
    }

    // Check for Gradle
    if (this.fileExists(projectPath, 'build.gradle') || this.fileExists(projectPath, 'build.gradle.kts')) {
      return this.detectGradle(projectPath);
    }

    return null;
  }

  getTemplates(): TemplateDefinition[] {
    const dirname = this.getDirname(import.meta.url);
    return [
      {
        name: 'java-core',
        tags: ['java'],
        content: () => this.loadTemplateFromFile(
          path.join(dirname, 'templates/lang-java.md')
        ).then(c => c || this.getJavaFallbackTemplate()),
      },
    ];
  }

  private getJavaFallbackTemplate(): string {
    return `# Java Development Guidelines

This project uses Java.

## Project Structure
- Follow Maven/Gradle conventions
- Organize in packages
- Use proper dependency management

## Code Style
- Follow Java naming conventions
- Use Google Java Style or similar
- Leverage IDE formatting

## Best Practices
- Use appropriate design patterns
- Handle exceptions properly
- Write Javadoc for public APIs

## Testing
- Write JUnit tests
- Use Mockito for mocking
- Aim for good test coverage`;
  }

  getDependencyTagMap() {
    return {
      'org.springframework.boot:spring-boot': 'spring-boot',
      'spring-boot-starter': 'spring-boot',
      'junit': 'junit',
    };
  }

  private detectMaven(projectPath: string): ProjectMetadata {
    const content = this.readFile(projectPath, 'pom.xml');
    if (!content) {
      return {
        language: 'Java',
        name: this.getProjectName(projectPath),
        dependencies: {},
        manifestFile: 'pom.xml',
        projectPath,
      };
    }

    const artifactMatch = content.match(/<artifactId>([^<]+)<\/artifactId>/);
    const descMatch = content.match(/<description>([^<]+)<\/description>/);
    const deps: Record<string, string> = {};

    const depMatches = content.matchAll(
      /<dependency>[\s\S]*?<groupId>([^<]+)<\/groupId>[\s\S]*?<artifactId>([^<]+)<\/artifactId>[\s\S]*?(?:<version>([^<]+)<\/version>)?/g,
    );
    for (const match of depMatches) {
      deps[`${match[1]}:${match[2]}`] = match[3] || '*';
    }

    return {
      language: 'Java',
      name: artifactMatch?.[1] || this.getProjectName(projectPath),
      description: descMatch?.[1],
      dependencies: deps,
      manifestFile: 'pom.xml',
      projectPath,
    };
  }

  private detectGradle(projectPath: string): ProjectMetadata {
    const manifestFile = this.fileExists(projectPath, 'build.gradle')
      ? 'build.gradle'
      : 'build.gradle.kts';
    
    const content = this.readFile(projectPath, manifestFile);
    const deps: Record<string, string> = {};

    if (content) {
      const depMatches = content.matchAll(
        /(?:implementation|api|testImplementation)\s*['"]([^:'"]+):([^:'"]+):?([^'"]*)['"]/g,
      );
      for (const match of depMatches) {
        deps[`${match[1]}:${match[2]}`] = match[3] || '*';
      }
    }

    return {
      language: 'Java/Kotlin',
      name: this.getProjectName(projectPath),
      dependencies: deps,
      manifestFile,
      projectPath,
    };
  }
}
