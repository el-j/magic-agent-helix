import * as fs from 'node:fs';
import * as path from 'node:path';
import { glob } from 'glob';

/**
 * Meta-instruction system (Phase 4)
 * Allows per-project customization via .magic-helix/ directory
 */

export interface MetaInstructionOverride {
  tag: string; // The tag being overridden (e.g., "react-core")
  content: string; // Full replacement content
  mode: 'replace' | 'prepend' | 'append'; // How to apply override
}

export interface MetaInstructionCombiner {
  tags: string[]; // Tags to combine
  outputTag: string; // New combined tag name
  template: string; // Template with {{tag}} placeholders
}

export interface MetaInstructionConfig {
  overrides?: MetaInstructionOverride[];
  combiners?: MetaInstructionCombiner[];
  ignoreTags?: string[]; // Built-in tags to completely ignore
}

const META_DIR = '.magic-helix';
const META_CONFIG_FILE = 'meta-instructions.json';

/**
 * Load meta-instruction configuration from project root
 */
export function loadMetaConfig(
  projectPath: string,
): MetaInstructionConfig | null {
  const configPath = path.join(projectPath, META_DIR, META_CONFIG_FILE);

  if (!fs.existsSync(configPath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(content) as MetaInstructionConfig;
  } catch (error) {
    console.warn(
      `Failed to load meta-instruction config: ${(error as Error).message}`,
    );
    return null;
  }
}

/**
 * Load custom instruction overrides from .magic-helix/overrides/
 */
export function loadOverrideInstructions(
  projectPath: string,
): Map<string, string> {
  const overridesDir = path.join(projectPath, META_DIR, 'overrides');
  const overrides = new Map<string, string>();

  if (!fs.existsSync(overridesDir)) {
    return overrides;
  }

  const files = glob.sync('**/*.md', { cwd: overridesDir, absolute: true });

  for (const file of files) {
    // Use filename (without .md) as tag
    const tag = path.basename(file, '.md');
    const content = fs.readFileSync(file, 'utf-8');
    overrides.set(tag, content);
  }

  return overrides;
}

/**
 * Apply meta-instruction overrides to instruction set
 */
export function applyOverrides(
  instructions: Map<string, string>,
  config: MetaInstructionConfig,
  projectPath: string,
): Map<string, string> {
  const result = new Map(instructions);

  // Remove ignored tags
  if (config.ignoreTags) {
    for (const tag of config.ignoreTags) {
      result.delete(tag);
    }
  }

  // Apply file-based overrides
  const fileOverrides = loadOverrideInstructions(projectPath);
  for (const [tag, content] of fileOverrides) {
    result.set(tag, content);
  }

  // Apply config-based overrides
  if (config.overrides) {
    for (const override of config.overrides) {
      const existing = result.get(override.tag);

      switch (override.mode) {
        case 'replace':
          result.set(override.tag, override.content);
          break;
        case 'prepend':
          if (existing) {
            result.set(override.tag, `${override.content}\n\n${existing}`);
          } else {
            result.set(override.tag, override.content);
          }
          break;
        case 'append':
          if (existing) {
            result.set(override.tag, `${existing}\n\n${override.content}`);
          } else {
            result.set(override.tag, override.content);
          }
          break;
      }
    }
  }

  return result;
}

/**
 * Apply meta-instruction combiners
 */
export function applyCombiner(
  instructions: Map<string, string>,
  combiner: MetaInstructionCombiner,
): Map<string, string> {
  const result = new Map(instructions);

  let combined = combiner.template;

  // Replace {{tag}} placeholders with actual content
  for (const tag of combiner.tags) {
    const content = instructions.get(tag);
    if (content) {
      combined = combined.replace(`{{${tag}}}`, content);
    }
  }

  result.set(combiner.outputTag, combined);

  return result;
}

/**
 * Apply all meta-instruction transformations
 */
export function applyMetaInstructions(
  instructions: Map<string, string>,
  projectPath: string,
): Map<string, string> {
  const config = loadMetaConfig(projectPath);

  if (!config) {
    return instructions;
  }

  let result = applyOverrides(instructions, config, projectPath);

  if (config.combiners) {
    for (const combiner of config.combiners) {
      result = applyCombiner(result, combiner);
    }
  }

  return result;
}

/**
 * Check if project has meta-instruction customization
 */
export function hasMetaInstructions(projectPath: string): boolean {
  const metaDir = path.join(projectPath, META_DIR);
  return fs.existsSync(metaDir);
}

/**
 * Initialize .magic-helix directory structure for a project
 */
export function initMetaInstructions(projectPath: string): void {
  const metaDir = path.join(projectPath, META_DIR);
  const overridesDir = path.join(metaDir, 'overrides');

  fs.mkdirSync(metaDir, { recursive: true });
  fs.mkdirSync(overridesDir, { recursive: true });

  // Create example config
  const exampleConfig: MetaInstructionConfig = {
    overrides: [
      {
        tag: 'example-tag',
        content: '# Custom Instruction\n\nYour content here...',
        mode: 'replace',
      },
    ],
    combiners: [
      {
        tags: ['tag1', 'tag2'],
        outputTag: 'combined-tag',
        template: '# Combined Instructions\n\n{{tag1}}\n\n---\n\n{{tag2}}',
      },
    ],
    ignoreTags: ['unwanted-tag'],
  };

  const configPath = path.join(metaDir, META_CONFIG_FILE);
  fs.writeFileSync(configPath, JSON.stringify(exampleConfig, null, 2));

  // Create example override file
  const exampleOverride = `# Example Override

This file overrides the default instructions for this tag.
Create files like:
- react-core.md → overrides "react-core" tag
- style-tailwind.md → overrides "style-tailwind" tag
`;

  fs.writeFileSync(path.join(overridesDir, 'example.md'), exampleOverride);

  console.log(
    `✅ Initialized .magic-helix/ directory structure at: ${metaDir}`,
  );
}
