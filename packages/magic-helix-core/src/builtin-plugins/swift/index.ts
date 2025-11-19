/**
 * Swift Language Plugin
 *
 * Detects Swift projects via Package.swift, .xcodeproj, or .xcworkspace
 */

import type { ProjectMetadata, TemplateDefinition } from '../../types';
import { BasePlugin } from '../base/BasePlugin';

export class SwiftPlugin extends BasePlugin {
  name = 'swift';
  displayName = 'Swift';
  version = '3.0.0';
  priority = 75;

  async detect(projectPath: string): Promise<ProjectMetadata | null> {
    // Check for Swift Package Manager
    if (this.fileExists(projectPath, 'Package.swift')) {
      return this.detectSPM(projectPath);
    }

    // Check for Xcode project
    const hasXcodeProject = await this.hasFiles(projectPath, '**/*.xcodeproj');
    const hasXcodeWorkspace = await this.hasFiles(projectPath, '**/*.xcworkspace');

    if (hasXcodeProject || hasXcodeWorkspace) {
      return this.detectXcode(projectPath);
    }

    // Check for Swift files
    if (await this.hasFiles(projectPath, '**/*.swift')) {
      return {
        language: 'Swift',
        name: this.getProjectName(projectPath),
        dependencies: {},
        projectPath,
      };
    }

    return null;
  }

  getTemplates(): TemplateDefinition[] {
    return [
      {
        name: 'swift-core',
        tags: ['swift'],
        content: `# Swift Development Guidelines

This project uses Swift.

## Project Structure
- Follow Swift Package Manager conventions
- Use clear module organization
- Separate concerns appropriately

## Code Style
- Follow Swift API Design Guidelines
- Use Swift naming conventions (lowerCamelCase for vars/funcs, UpperCamelCase for types)
- Leverage SwiftLint for consistency
- Prefer value types (structs) over reference types when appropriate

## Best Practices
- Use optionals safely with guard/if let
- Leverage protocol-oriented programming
- Use strong type system features
- Handle errors with do/catch or Result types
- Write clear documentation comments

## Async/Concurrency
- Use async/await for asynchronous operations
- Use actors for shared mutable state
- Understand structured concurrency patterns

## Testing
- Write XCTest unit tests
- Use Quick/Nimble for BDD-style tests (if applicable)
- Mock dependencies appropriately
- Test async code with expectations`,
      },
    ];
  }

  getDependencyTagMap() {
    return {
      vapor: 'vapor',
      Vapor: 'vapor',
      swift: 'swift',
    };
  }

  private detectSPM(projectPath: string): ProjectMetadata {
    const content = this.readFile(projectPath, 'Package.swift');
    if (!content) {
      return {
        language: 'Swift',
        name: this.getProjectName(projectPath),
        dependencies: {},
        manifestFile: 'Package.swift',
        projectPath,
      };
    }

    const deps: Record<string, string> = {};
    const metadata: ProjectMetadata = {
      language: 'Swift',
      name: this.getProjectName(projectPath),
      dependencies: deps,
      manifestFile: 'Package.swift',
      projectPath,
    };

    // Extract package name
    const packageNameMatch = content.match(/name:\s*"([^"]+)"/);
    if (packageNameMatch) {
      metadata.name = packageNameMatch[1];
    }

    // Extract Swift tools version
    const swiftVersionMatch = content.match(
      /swift-tools-version:\s*([\d.]+)/,
    );
    if (swiftVersionMatch) {
      metadata.description = `Swift ${swiftVersionMatch[1]}`;
    }

    // Detect Vapor framework
    if (content.includes('vapor') || content.includes('Vapor')) {
      deps.vapor = '*';
    }

    // Extract dependencies (simplified)
    const depMatches = content.matchAll(/\.package\([^)]+url:\s*"([^"]+)"/g);
    for (const match of depMatches) {
      const url = match[1];
      const depName = url.split('/').pop()?.replace('.git', '') || url;
      deps[depName] = '*';
    }

    return metadata;
  }

  private detectXcode(projectPath: string): ProjectMetadata {
    return {
      language: 'Swift',
      name: this.getProjectName(projectPath),
      dependencies: {},
      description: 'Xcode project',
      projectPath,
    };
  }
}
