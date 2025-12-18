/**
 * Dart Language Plugin
 * 
 * Detects Dart projects via pubspec.yaml
 * Supports Flutter and pure Dart projects
 */

import * as path from 'node:path';
import type { ProjectMetadata, TemplateDefinition } from '@el-j/magic-helix-core';
import { BasePlugin } from '../base/BasePlugin';

export class DartPlugin extends BasePlugin {
  name = 'dart';
  displayName = 'Dart';
  version = '1.0.0';
  priority = 80;

  async detect(projectPath: string): Promise<ProjectMetadata | null> {
    if (!this.fileExists(projectPath, 'pubspec.yaml')) {
      return null;
    }

    const content = this.readFile(projectPath, 'pubspec.yaml');
    const tags: string[] = ['dart'];
    const dependencies: Record<string, string> = {};

    if (content) {
      const nameMatch = content.match(/name:\s*(.+)/);
      const versionMatch = content.match(/version:\s*(.+)/);
      
      // Detect Flutter
      if (content.includes('flutter:') || content.includes('flutter_test:')) {
        tags.push('flutter');
        dependencies['flutter'] = '*';
      }
      
      // Detect Riverpod
      if (content.includes('flutter_riverpod:') || content.includes('riverpod:')) {
        tags.push('riverpod');
      }
      
      // Detect Bloc
      if (content.includes('flutter_bloc:') || content.includes('bloc:')) {
        tags.push('bloc');
      }
      
      return {
        language: 'Dart',
        name: nameMatch?.[1]?.trim() || this.getProjectName(projectPath),
        version: versionMatch?.[1]?.trim() || '1.0.0',
        dependencies,
        manifestFile: 'pubspec.yaml',
        projectPath,
        tags,
      };
    }

    return {
      language: 'Dart',
      name: this.getProjectName(projectPath),
      dependencies: {},
      manifestFile: 'pubspec.yaml',
      projectPath,
      tags,
    };
  }

  getTemplates(): TemplateDefinition[] {
    return [
      {
        name: 'dart-core',
        tags: ['dart'],
        content: () => this.loadTemplateFromFile(
          path.join(__dirname, 'templates/lang-dart.md')
        ).then(c => c || this.getDartFallbackTemplate()),
      },
      {
        name: 'flutter-core',
        tags: ['flutter'],
        content: () => this.loadTemplateFromFile(
          path.join(__dirname, 'templates/flutter.md')
        ).then(c => c || this.getFlutterFallbackTemplate()),
      },
    ];
  }

  getDependencyTagMap() {
    return {
      'flutter': 'flutter',
      'flutter_riverpod': 'riverpod',
      'riverpod': 'riverpod',
      'flutter_bloc': 'bloc',
      'bloc': 'bloc',
      'provider': 'provider',
    };
  }

  private getDartFallbackTemplate(): string {
    return `# Dart Development Guidelines

## Language-Specific Rules
- Use strong typing throughout
- Leverage null safety features
- Prefer const constructors where possible
- Use named parameters for clarity
- Follow effective Dart guidelines

## Code Style
- Use dartfmt for formatting
- Follow Dart style guide
- Use camelCase for variables/functions
- Use PascalCase for classes
`;
  }

  private getFlutterFallbackTemplate(): string {
    return `# Flutter Development Guidelines

## Widget Best Practices
- Keep widgets small and focused
- Use StatelessWidget when possible
- Implement proper dispose() methods
- Use const constructors for performance

## State Management
- Choose appropriate state solution (Riverpod, Bloc, Provider)
- Keep business logic separate from UI
- Use ValueNotifier for simple state
`;
  }
}
