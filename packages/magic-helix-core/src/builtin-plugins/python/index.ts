/**
 * Python Language Plugin
 *
 * Detects Python projects via pyproject.toml, requirements.txt, or setup.py
 * Supports Poetry, pip, and setuptools project formats
 */

import type { ProjectMetadata, TemplateDefinition } from '../../types';
import { BasePlugin } from '../base/BasePlugin';

export class PythonPlugin extends BasePlugin {
  name = 'python';
  displayName = 'Python';
  version = '3.0.0';
  priority = 85;

  async detect(projectPath: string): Promise<ProjectMetadata | null> {
    // Check for pyproject.toml (Poetry, modern Python)
    if (this.fileExists(projectPath, 'pyproject.toml')) {
      return this.detectFromPyproject(projectPath);
    }

    // Check for requirements.txt (pip)
    if (this.fileExists(projectPath, 'requirements.txt')) {
      return this.detectFromRequirements(projectPath);
    }

    // Check for setup.py (setuptools)
    if (this.fileExists(projectPath, 'setup.py')) {
      return {
        language: 'Python',
        name: this.getProjectName(projectPath),
        dependencies: {},
        manifestFile: 'setup.py',
        projectPath,
      };
    }

    return null;
  }

  getTemplates(): TemplateDefinition[] {
    return [
      {
        name: 'python-core',
        tags: ['python'],
        content: this.getPythonTemplate(),
      },
    ];
  }

  getDependencyTagMap() {
    return {
      django: 'django',
      flask: 'flask',
      fastapi: 'fastapi',
      pytest: 'pytest',
      numpy: 'numpy',
      pandas: 'pandas',
    };
  }

  // Private helper methods

  private detectFromPyproject(projectPath: string): ProjectMetadata {
    const content = this.readFile(projectPath, 'pyproject.toml');
    if (!content) {
      return {
        language: 'Python',
        name: this.getProjectName(projectPath),
        dependencies: {},
        manifestFile: 'pyproject.toml',
        projectPath,
      };
    }

    const nameMatch = content.match(/name\s*=\s*["']([^"']+)["']/);
    const descMatch = content.match(/description\s*=\s*["']([^"']+)["']/);
    const deps: Record<string, string> = {};

    // Parse Poetry dependencies
    const depsSection = content.match(
      /\[tool\.poetry\.dependencies\]([\s\S]*?)(?:\n\[|$)/,
    );
    if (depsSection) {
      const lines = depsSection[1].split('\n');
      for (const line of lines) {
        const depMatch = line.match(/^([a-zA-Z0-9_-]+)\s*=\s*["']([^"']+)["']/);
        if (depMatch && depMatch[1] !== 'python') {
          deps[depMatch[1]] = depMatch[2];
        }
      }
    }

    return {
      language: 'Python',
      name: nameMatch?.[1] || this.getProjectName(projectPath),
      description: descMatch?.[1],
      dependencies: deps,
      manifestFile: 'pyproject.toml',
      projectPath,
    };
  }

  private detectFromRequirements(projectPath: string): ProjectMetadata {
    const content = this.readFile(projectPath, 'requirements.txt');
    const deps: Record<string, string> = {};

    if (content) {
      for (const line of content.split('\n')) {
        if (line.trim() && !line.startsWith('#')) {
          const parts = line.split(/[=<>]/);
          const name = parts[0].trim();
          const version = parts[1]?.trim() || '*';
          if (name) deps[name] = version;
        }
      }
    }

    return {
      language: 'Python',
      name: this.getProjectName(projectPath),
      dependencies: deps,
      manifestFile: 'requirements.txt',
      projectPath,
    };
  }

  private getPythonTemplate(): string {
    return `# Python Development Guidelines

This project uses Python.

## Project Structure
- Follow PEP 8 style guide
- Organize code in packages/modules
- Use virtual environments

## Code Style
- Use type hints where appropriate
- Follow naming conventions
- Write docstrings for functions and classes

## Dependencies
- Manage with pip/Poetry/conda
- Keep requirements.txt or pyproject.toml updated
- Pin dependency versions

## Testing
- Write tests with pytest
- Use fixtures for setup/teardown
- Aim for good test coverage

## Best Practices
- Handle exceptions properly
- Use context managers for resources
- Follow Pythonic idioms`;
  }
}
