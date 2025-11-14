/**
 * Template Loader
 * 
 * Handles template resolution with priority-based loading:
 * 1. User workspace overrides (.magic-helix/templates/)
 * 2. User global overrides (~/.magic-helix/templates/)
 * 3. Config-specified overrides
 * 4. Plugin-provided templates
 * 5. Built-in defaults
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import type {
  TemplateDefinition,
  TemplateConfig,
  TemplateResolutionResult,
  LanguagePlugin,
} from './types';

export interface TemplateSearchContext {
  templateName: string;
  tags?: string[];
  projectLanguage?: string;
}

export class TemplateLoader {
  private config: TemplateConfig;
  private verbose: boolean;
  private templateCache: Map<string, string> = new Map();
  private cacheEnabled: boolean;

  constructor(options: {
    config?: TemplateConfig;
    verbose?: boolean;
    cacheEnabled?: boolean;
  } = {}) {
    this.config = options.config || {};
    this.verbose = options.verbose ?? false;
    this.cacheEnabled = options.cacheEnabled ?? true;
  }

  /**
   * Load a template by name with priority resolution
   */
  async loadTemplate(
    templateName: string,
    plugins: LanguagePlugin[] = [],
  ): Promise<TemplateResolutionResult | null> {
    const cacheKey = `${templateName}:${plugins.map(p => p.name).join(',')}`;
    
    // Check cache first
    if (this.cacheEnabled && this.templateCache.has(cacheKey)) {
      const content = this.templateCache.get(cacheKey);
      if (content) {
        return {
          content,
          source: 'plugin',
          path: '(cached)',
        };
      }
    }

    // 1. Check config overrides first
    if (this.config.overrides?.[templateName]) {
      const overridePath = this.config.overrides[templateName];
      const result = await this.loadFromPath(overridePath, 'override');
      if (result) {
        this.cacheTemplate(cacheKey, result.content);
        return result;
      }
    }

    // 2. Check workspace templates
    if (this.config.searchPaths) {
      for (const searchPath of this.config.searchPaths) {
        const result = await this.searchInDirectory(
          searchPath,
          templateName,
          searchPath.includes('.magic-helix') ? 'workspace' : 'global',
        );
        if (result) {
          this.cacheTemplate(cacheKey, result.content);
          return result;
        }
      }
    }

    // 3. Check plugin templates
    for (const plugin of plugins) {
      const result = await this.loadFromPlugin(plugin, templateName);
      if (result) {
        this.cacheTemplate(cacheKey, result.content);
        return result;
      }
    }

    this.log(`Template "${templateName}" not found`);
    return null;
  }

  /**
   * Load all templates from a plugin
   */
  async loadPluginTemplates(plugin: LanguagePlugin): Promise<TemplateDefinition[]> {
    try {
      const templates = await Promise.resolve(plugin.getTemplates());
      this.log(`Loaded ${templates.length} templates from ${plugin.displayName}`);
      return templates;
    } catch (error) {
      this.logWarning(`Failed to load templates from ${plugin.name}: ${(error as Error).message}`);
      return [];
    }
  }

  /**
   * Load multiple templates by names
   */
  async loadTemplates(
    templateNames: string[],
    plugins: LanguagePlugin[] = [],
  ): Promise<Map<string, TemplateResolutionResult>> {
    const results = new Map<string, TemplateResolutionResult>();

    for (const name of templateNames) {
      const result = await this.loadTemplate(name, plugins);
      if (result) {
        results.set(name, result);
      }
    }

    return results;
  }

  /**
   * Find templates matching specific tags
   */
  async findTemplatesByTags(
    tags: string[],
    plugins: LanguagePlugin[] = [],
  ): Promise<TemplateDefinition[]> {
    const allTemplates: TemplateDefinition[] = [];

    // Collect templates from all plugins
    for (const plugin of plugins) {
      const templates = await this.loadPluginTemplates(plugin);
      allTemplates.push(...templates);
    }

    // Filter by tags
    return allTemplates.filter(template => {
      return template.tags.some(tag => tags.includes(tag));
    });
  }

  /**
   * Resolve template content (handle lazy loading)
   */
  async resolveTemplateContent(template: TemplateDefinition): Promise<string> {
    if (typeof template.content === 'string') {
      return template.content;
    }
    
    // Execute lazy loader
    const content = await Promise.resolve(template.content());
    return content;
  }

  /**
   * Clear the template cache
   */
  clearCache(): void {
    this.templateCache.clear();
    this.log('Template cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    keys: string[];
  } {
    return {
      size: this.templateCache.size,
      keys: Array.from(this.templateCache.keys()),
    };
  }

  // Private helper methods

  /**
   * Load template from a specific file path
   */
  private async loadFromPath(
    filePath: string,
    source: TemplateResolutionResult['source'],
  ): Promise<TemplateResolutionResult | null> {
    try {
      const resolvedPath = this.resolvePath(filePath);
      
      if (!fs.existsSync(resolvedPath)) {
        this.log(`Template not found at: ${resolvedPath}`);
        return null;
      }

      const content = fs.readFileSync(resolvedPath, 'utf-8');
      this.log(`✓ Loaded template from ${source}: ${resolvedPath}`);

      return {
        content,
        source,
        path: resolvedPath,
      };
    } catch (error) {
      this.logWarning(`Failed to load template from ${filePath}: ${(error as Error).message}`);
      return null;
    }
  }

  /**
   * Search for template in a directory
   */
  private async searchInDirectory(
    dirPath: string,
    templateName: string,
    source: TemplateResolutionResult['source'],
  ): Promise<TemplateResolutionResult | null> {
    const resolvedDir = this.resolvePath(dirPath);
    
    if (!fs.existsSync(resolvedDir)) {
      return null;
    }

    const extensions = this.config.extensions || ['.md', '.txt', ''];
    
    // Try with each extension
    for (const ext of extensions) {
      const fileName = templateName.endsWith(ext) ? templateName : `${templateName}${ext}`;
      const filePath = path.join(resolvedDir, fileName);
      
      if (fs.existsSync(filePath)) {
        return this.loadFromPath(filePath, source);
      }
    }

    return null;
  }

  /**
   * Load template from plugin
   */
  private async loadFromPlugin(
    plugin: LanguagePlugin,
    templateName: string,
  ): Promise<TemplateResolutionResult | null> {
    try {
      const templates = await this.loadPluginTemplates(plugin);
      const template = templates.find(t => t.name === templateName);
      
      if (!template) {
        return null;
      }

      const content = await this.resolveTemplateContent(template);
      this.log(`✓ Loaded template "${templateName}" from plugin: ${plugin.displayName}`);

      return {
        content,
        source: 'plugin',
        path: `plugin:${plugin.name}/${templateName}`,
        plugin: plugin.name,
      };
    } catch (error) {
      this.logWarning(
        `Failed to load template "${templateName}" from plugin ${plugin.name}: ${(error as Error).message}`,
      );
      return null;
    }
  }

  /**
   * Resolve path (handle ~/ and relative paths)
   */
  private resolvePath(templatePath: string): string {
    if (templatePath.startsWith('~/')) {
      const homeDir = process.env.HOME || process.env.USERPROFILE || '';
      return path.join(homeDir, templatePath.slice(2));
    }
    
    if (path.isAbsolute(templatePath)) {
      return templatePath;
    }

    return path.resolve(process.cwd(), templatePath);
  }

  /**
   * Cache a template
   */
  private cacheTemplate(key: string, content: string): void {
    if (this.cacheEnabled) {
      this.templateCache.set(key, content);
    }
  }

  private log(message: string): void {
    if (this.verbose) {
      console.log(`[TemplateLoader] ${message}`);
    }
  }

  private logWarning(message: string): void {
    if (this.verbose) {
      console.warn(`[TemplateLoader] ⚠️  ${message}`);
    }
  }
}
