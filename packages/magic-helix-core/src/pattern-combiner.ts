import fs from 'fs';
import path from 'path';

/**
 * Pattern Combiner System
 * Mixes multiple pattern templates based on project context
 * Based on insights from awesome-ai-system-prompts
 */

export interface PatternContext {
  framework?: 'react' | 'vue' | 'nestjs' | 'generic';
  language?: 'typescript' | 'javascript' | 'python';
  libraries?: string[]; // e.g., ['tailwind', 'shadcn-ui', 'prisma']
  aiModel?: 'claude' | 'gpt' | 'gemini' | 'local';
  tone?: 'professional' | 'concise' | 'friendly' | 'thoughtful';
  environment?: 'vscode' | 'cli' | 'web';
  includePatterns?: string[]; // Explicit pattern names to include
  excludePatterns?: string[]; // Patterns to skip
}

export interface PatternTemplate {
  name: string;
  category: 'role-definition' | 'organization' | 'tool-guidelines' | 'reasoning' | 'domain-expertise' | 'safety' | 'tone' | 'environment';
  content: string;
  priority: number; // Higher priority patterns override lower priority
}

/**
 * Loads all pattern templates from the default_templates/patterns directory
 */
export function loadPatternTemplates(): Map<string, PatternTemplate> {
  const templatesDir = path.join(__dirname, 'default_templates', 'patterns');
  const patterns = new Map<string, PatternTemplate>();
  
  const categories = [
    'role-definition',
    'organization',
    'tool-guidelines',
    'reasoning',
    'domain-expertise',
    'safety',
    'tone',
    'environment'
  ];
  
  for (const category of categories) {
    const categoryDir = path.join(templatesDir, category);
    if (!fs.existsSync(categoryDir)) continue;
    
    const files = fs.readdirSync(categoryDir).filter(f => f.endsWith('.md'));
    for (const file of files) {
      const name = file.replace('.md', '');
      const content = fs.readFileSync(path.join(categoryDir, file), 'utf-8');
      patterns.set(name, {
        name,
        category: category as PatternTemplate['category'],
        content,
        priority: getCategoryPriority(category as PatternTemplate['category'])
      });
    }
  }
  
  return patterns;
}

/**
 * Determines priority order for pattern categories
 * Higher numbers = higher priority (applied later, can override)
 */
function getCategoryPriority(category: PatternTemplate['category']): number {
  const priorities = {
    'role-definition': 1,
    'organization': 2,
    'tool-guidelines': 3,
    'reasoning': 4,
    'domain-expertise': 5,
    'environment': 6,
    'tone': 7,
    'safety': 8, // Safety always highest priority (never overridden)
  };
  return priorities[category];
}

/**
 * Selects relevant patterns based on project context
 */
export function selectPatterns(
  allPatterns: Map<string, PatternTemplate>,
  context: PatternContext
): PatternTemplate[] {
  const selected: PatternTemplate[] = [];
  
  // Always include role definition
  const expertIdentity = allPatterns.get('expert-identity');
  const scopeBoundaries = allPatterns.get('scope-boundaries');
  if (expertIdentity) selected.push(expertIdentity);
  if (scopeBoundaries) selected.push(scopeBoundaries);
  
  // Always include organization
  const headingHierarchy = allPatterns.get('heading-hierarchy');
  if (headingHierarchy) selected.push(headingHierarchy);
  
  // Always include tool guidelines
  const functionSchemas = allPatterns.get('function-schemas');
  const usagePolicies = allPatterns.get('usage-policies');
  if (functionSchemas) selected.push(functionSchemas);
  if (usagePolicies) selected.push(usagePolicies);
  
  // Framework-specific patterns
  if (context.framework === 'react' || context.framework === 'vue') {
    const reactPatterns = allPatterns.get('react-patterns');
    if (reactPatterns) selected.push(reactPatterns);
  }
  
  // Library-specific patterns
  if (context.libraries) {
    if (context.libraries.includes('tailwind')) {
      const tailwind = allPatterns.get('tailwind-patterns');
      if (tailwind) selected.push(tailwind);
    }
    if (context.libraries.includes('shadcn-ui')) {
      const shadcn = allPatterns.get('shadcn-ui');
      if (shadcn) selected.push(shadcn);
    }
  }
  
  // AI model-specific patterns
  if (context.aiModel === 'claude') {
    const thinking = allPatterns.get('thinking-tags');
    const concise = allPatterns.get('concise-communication');
    if (thinking) selected.push(thinking);
    if (concise) selected.push(concise);
  }
  
  // Tone patterns
  if (context.tone === 'concise') {
    const concise = allPatterns.get('concise-communication');
    const forbidden = allPatterns.get('forbidden-phrases');
    if (concise) selected.push(concise);
    if (forbidden) selected.push(forbidden);
  }
  
  // Environment patterns
  if (context.environment === 'vscode') {
    const ideFeatures = allPatterns.get('ide-features');
    if (ideFeatures) selected.push(ideFeatures);
  }
  
  // Always include safety patterns
  const refusal = allPatterns.get('refusal-messages');
  const destructive = allPatterns.get('destructive-warnings');
  if (refusal) selected.push(refusal);
  if (destructive) selected.push(destructive);
  
  // Handle explicit includes/excludes
  if (context.includePatterns) {
    for (const name of context.includePatterns) {
      const pattern = allPatterns.get(name);
      if (pattern && !selected.includes(pattern)) {
        selected.push(pattern);
      }
    }
  }
  
  if (context.excludePatterns) {
    return selected.filter(p => !context.excludePatterns?.includes(p.name));
  }
  
  return selected;
}

/**
 * Combines selected patterns into a single instruction document
 */
export function combinePatterns(patterns: PatternTemplate[]): string {
  // Sort by priority (lower priority first, higher priority can override)
  const sorted = patterns.sort((a, b) => a.priority - b.priority);
  
  const sections: string[] = [];
  
  // Group patterns by category
  const byCategory = new Map<string, PatternTemplate[]>();
  for (const pattern of sorted) {
    if (!byCategory.has(pattern.category)) {
      byCategory.set(pattern.category, []);
    }
    const categoryPatterns = byCategory.get(pattern.category);
    if (categoryPatterns) {
      categoryPatterns.push(pattern);
    }
  }
  
  // Build combined document
  sections.push('# AI Agent Instructions\n');
  
  // Role Definition
  const roleDefPatterns = byCategory.get('role-definition');
  if (roleDefPatterns) {
    sections.push('## Role & Identity\n');
    for (const p of roleDefPatterns) {
      sections.push(extractContent(p.content));
    }
  }
  
  // Organization
  const orgPatterns = byCategory.get('organization');
  if (orgPatterns) {
    sections.push('## Instruction Structure\n');
    for (const p of orgPatterns) {
      sections.push(extractContent(p.content));
    }
  }
  
  // Tool Guidelines
  const toolPatterns = byCategory.get('tool-guidelines');
  if (toolPatterns) {
    sections.push('## Tool Usage Guidelines\n');
    for (const p of toolPatterns) {
      sections.push(extractContent(p.content));
    }
  }
  
  // Reasoning
  const reasoningPatterns = byCategory.get('reasoning');
  if (reasoningPatterns) {
    sections.push('## Reasoning & Execution Patterns\n');
    for (const p of reasoningPatterns) {
      sections.push(extractContent(p.content));
    }
  }
  
  // Domain Expertise
  const domainPatterns = byCategory.get('domain-expertise');
  if (domainPatterns) {
    sections.push('## Domain-Specific Guidelines\n');
    for (const p of domainPatterns) {
      sections.push(extractContent(p.content));
    }
  }
  
  // Environment
  const envPatterns = byCategory.get('environment');
  if (envPatterns) {
    sections.push('## Environment Context\n');
    for (const p of envPatterns) {
      sections.push(extractContent(p.content));
    }
  }
  
  // Tone
  const tonePatterns = byCategory.get('tone');
  if (tonePatterns) {
    sections.push('## Communication Style\n');
    for (const p of tonePatterns) {
      sections.push(extractContent(p.content));
    }
  }
  
  // Safety (always last - highest priority)
  const safetyPatterns = byCategory.get('safety');
  if (safetyPatterns) {
    sections.push('## Safety & Refusal Protocols\n');
    for (const p of safetyPatterns) {
      sections.push(extractContent(p.content));
    }
  }
  
  return sections.join('\n\n');
}

/**
 * Extracts the main content from a pattern template
 * Removes the "Purpose", "Template", and "Best Practices" sections
 * Keeps the "Examples" section which is most valuable
 */
function extractContent(markdown: string): string {
  // Remove title (# Pattern Name Pattern)
  let content = markdown.replace(/^# .+ Pattern\n+/, '');
  
  // Extract examples section (most valuable)
  const examplesMatch = content.match(/## Examples\n([\s\S]+?)(?=\n## |\n---|\Z)/);
  if (examplesMatch) {
    return examplesMatch[1].trim();
  }
  
  // If no examples section, return the first major section after purpose
  content = content.replace(/## Purpose\n.+?\n\n/, '');
  content = content.replace(/## Template\n[\s\S]+?(?=\n## |$)/, '');
  content = content.replace(/## Best Practices\n[\s\S]+$/, '');
  
  return content.trim();
}

/**
 * Main API: Generate combined instructions from context
 */
export function generateInstructions(context: PatternContext): string {
  const allPatterns = loadPatternTemplates();
  const selectedPatterns = selectPatterns(allPatterns, context);
  return combinePatterns(selectedPatterns);
}
