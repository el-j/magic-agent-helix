/**
 * Base Plugin Class
 * 
 * Abstract base class providing common functionality for all language plugins.
 * Plugins should extend this class and implement the abstract methods.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import type {
  LanguagePlugin,
  ProjectMetadata,
  TemplateDefinition,
  DependencyTagMap,
  ConfigFileTagMap,
  FileGlobTagMap,
} from 'magic-helix-core';

export abstract class BasePlugin implements LanguagePlugin {
  abstract name: string;
  abstract displayName: string;
  abstract version: string;
  abstract priority: number;

  /**
   * Abstract method: Detect if this plugin applies to the project
   */
  abstract detect(projectPath: string): Promise<ProjectMetadata | null>;

  /**
   * Abstract method: Get templates provided by this plugin
   */
  abstract getTemplates(): TemplateDefinition[] | Promise<TemplateDefinition[]>;

  /**
   * Optional: Get dependency-to-tag mapping
   */
  getDependencyTagMap?(): DependencyTagMap;

  /**
   * Optional: Get config file-to-tag mapping
   */
  getConfigFileTagMap?(): ConfigFileTagMap;

  /**
   * Optional: Get file glob-to-tag mapping
   */
  getFileGlobTagMap?(): FileGlobTagMap;

  // Helper methods for common operations

  /**
   * Check if a file exists in the project
   */
  protected fileExists(projectPath: string, filename: string): boolean {
    return fs.existsSync(path.join(projectPath, filename));
  }

  /**
   * Read a file from the project
   */
  protected readFile(projectPath: string, filename: string): string | null {
    try {
      const filePath = path.join(projectPath, filename);
      if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf-8');
      }
    } catch {
      // Ignore errors
    }
    return null;
  }

  /**
   * Parse JSON file from the project
   */
  protected readJSON<T = Record<string, unknown>>(
    projectPath: string,
    filename: string,
  ): T | null {
    try {
      const content = this.readFile(projectPath, filename);
      if (content) {
        return JSON.parse(content) as T;
      }
    } catch {
      // Ignore parse errors
    }
    return null;
  }

  /**
   * Get project name from path
   */
  protected getProjectName(projectPath: string): string {
    return path.basename(projectPath);
  }

  /**
   * Load template from file
   */
  protected async loadTemplateFromFile(
    templatePath: string,
  ): Promise<string | null> {
    try {
      if (fs.existsSync(templatePath)) {
        return fs.readFileSync(templatePath, 'utf-8');
      }
    } catch {
      // Ignore errors
    }
    return null;
  }

  /**
   * Create a template definition with lazy loading
   */
  protected createTemplate(
    name: string,
    tags: string[],
    contentOrPath: string | (() => string | Promise<string>),
    options: Partial<TemplateDefinition> = {},
  ): TemplateDefinition {
    return {
      name,
      tags,
      content: typeof contentOrPath === 'string'
        ? contentOrPath
        : contentOrPath,
      ...options,
    };
  }

  /**
   * Parse dependencies from package-like files
   */
  protected parseDependencies(
    obj: Record<string, unknown>,
    ...keys: string[]
  ): Record<string, string> {
    const deps: Record<string, string> = {};

    for (const key of keys) {
      const value = obj[key];
      if (value && typeof value === 'object') {
        Object.assign(deps, value);
      }
    }

    return deps;
  }

  /**
   * Find files matching a pattern
   */
  protected async findFiles(
    projectPath: string,
    pattern: string,
  ): Promise<string[]> {
    try {
      const { glob } = await import('glob');
      return await glob(pattern, {
        cwd: projectPath,
        absolute: false,
      });
    } catch {
      return [];
    }
  }

  /**
   * Check if any files exist matching a pattern
   */
  protected async hasFiles(
    projectPath: string,
    pattern: string,
  ): Promise<boolean> {
    const files = await this.findFiles(projectPath, pattern);
    return files.length > 0;
  }
}
