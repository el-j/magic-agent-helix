import type { Config } from './types';

/**
 * Default AI refinement configuration
 */
export const DEFAULT_AI_REFINEMENT = {
  quality: 'standard' as const,
  contextLevel: 'balanced' as const,
  outputFormat: 'markdown' as const,
  tokenBudget: 4000,
  includeExamples: true,
  includeBestPractices: true,
};

/**
 * Token budget thresholds by quality level
 */
export const TOKEN_BUDGETS: Record<string, number> = {
  basic: 2000,
  standard: 4000,
  comprehensive: 8000,
};

/**
 * Apply AI refinement transformations to instruction content
 */
export function refineInstructions(
  content: string,
  config: Config['aiRefinement'],
): string {
  const refinement = { ...DEFAULT_AI_REFINEMENT, ...config };

  let refined = content;

  // Apply output format transformations FIRST (for structured)
  refined = applyOutputFormat(refined, refinement.outputFormat);

  // Apply quality transformations
  refined = applyQualityFilter(refined, refinement.quality);

  // Apply context level adjustments
  refined = applyContextLevel(refined, refinement.contextLevel);

  // Remove examples if disabled
  if (!refinement.includeExamples) {
    refined = removeCodeExamples(refined);
  }

  // Remove best practices if disabled
  if (!refinement.includeBestPractices) {
    refined = removeBestPractices(refined);
  }

  // Enforce token budget
  refined = enforceTokenBudget(refined, refinement.tokenBudget);

  return refined;
}

/**
 * Apply quality-based filtering
 */
function applyQualityFilter(content: string, quality: string): string {
  switch (quality) {
    case 'basic': {
      // Keep only essential sections (headers + sections with "overview", "basic", "essential")
      const sections = content.split(/\n(?=##? )/); // Split on headers
      return sections
        .filter((section) => {
          const _lower = section.toLowerCase();
          const firstLine = section.split('\n')[0].toLowerCase();
          return (
            firstLine.includes('# ') || // Keep top-level headers
            firstLine.includes('overview') ||
            firstLine.includes('basic') ||
            firstLine.includes('essential')
          );
        })
        .join('\n');
    }

    case 'comprehensive':
      // Keep all content
      return content;

    default: {
      // 'standard': Remove "advanced" and "deep dive" sections
      const sections = content.split(/\n(?=##? )/);
      return sections
        .filter((section) => {
          const firstLine = section.split('\n')[0].toLowerCase();
          return (
            !firstLine.includes('advanced') && !firstLine.includes('deep dive')
          );
        })
        .join('\n');
    }
  }
}

/**
 * Apply context level adjustments
 */
function applyContextLevel(content: string, level: string): string {
  switch (level) {
    case 'minimal': {
      // Remove background/explanation sections, keep structure intact
      const sections = content.split(/\n(?=##? )/);
      return sections
        .filter((section) => {
          const firstLine = section.split('\n')[0].toLowerCase();
          return (
            !firstLine.includes('background') &&
            !firstLine.includes('why ') &&
            !firstLine.includes('explanation') &&
            !firstLine.includes('deep dive')
          );
        })
        .join('\n');
    }

    case 'extensive':
      // Keep all context
      return content;

    default:
      // 'balanced': Keep standard content, remove verbose paragraphs
      return content
        .split('\n')
        .filter((line) => {
          // Keep headers, lists, code blocks, short lines
          return (
            line.startsWith('#') ||
            line.startsWith('-') ||
            line.startsWith('*') ||
            line.match(/^\d+\./) || // numbered lists
            line.startsWith('```') ||
            line.startsWith('  ') ||
            line.trim().length === 0 ||
            line.trim().length < 200 // Keep short paragraphs
          );
        })
        .join('\n');
  }
}

/**
 * Apply output format transformations
 */
function applyOutputFormat(content: string, format: string): string {
  switch (format) {
    case 'structured':
      // Ensure consistent section structure
      return content
        .replace(/^### /gm, '#### ') // Demote h3 to h4
        .replace(/^## /gm, '### ') // Demote h2 to h3
        .replace(/^# /gm, '## '); // Demote h1 to h2

    case 'conversational':
      // Convert lists to prose
      return content
        .replace(/^- (.+)$/gm, (_, item) => `${item}.`)
        .replace(/\n{3,}/g, '\n\n');

    case 'code-focused': {
      // Maximize code block visibility, minimize prose
      const lines = content.split('\n');
      let inCodeBlock = false;
      return lines
        .filter((line) => {
          if (line.startsWith('```')) {
            inCodeBlock = !inCodeBlock;
            return true;
          }
          if (inCodeBlock) return true;
          if (line.startsWith('#')) return true;
          if (line.trim().length === 0) return true;
          // Keep only first sentence of each paragraph
          return line.match(/^[^.]+\./);
        })
        .join('\n');
    }

    default:
      // 'markdown'
      return content;
  }
}

/**
 * Remove code example sections
 */
function removeCodeExamples(content: string): string {
  let result = '';
  let inCodeBlock = false;
  let skipSection = false;

  for (const line of content.split('\n')) {
    if (line.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }

    if (!inCodeBlock) {
      if (line.match(/^##+ .*example/i)) {
        skipSection = true;
        continue;
      }
      if (line.startsWith('##')) {
        skipSection = false;
      }
    }

    if (!inCodeBlock && !skipSection) {
      result += `${line}\n`;
    }
  }

  return result;
}

/**
 * Remove best practices sections
 */
function removeBestPractices(content: string): string {
  return content
    .split('\n')
    .filter((line) => {
      const lower = line.toLowerCase();
      if (lower.match(/^##+ .*best practice/i)) return false;
      if (lower.match(/^##+ .*recommendation/i)) return false;
      if (lower.match(/^##+ .*tip/i)) return false;
      return true;
    })
    .join('\n');
}

/**
 * Enforce token budget by truncating content
 * Rough estimate: 1 token ≈ 4 characters
 */
function enforceTokenBudget(content: string, budget: number): string {
  const maxChars = budget * 4;
  if (content.length <= maxChars) return content;

  // Truncate at last complete section
  const truncated = content.substring(0, maxChars);
  const lastSectionIdx = truncated.lastIndexOf('\n## ');

  if (lastSectionIdx > maxChars * 0.7) {
    return `${truncated.substring(0, lastSectionIdx)}\n\n<!-- Content truncated to fit token budget -->`;
  }

  return `${truncated}\n\n<!-- Content truncated to fit token budget -->`;
}

/**
 * Estimate token count for content
 */
export function estimateTokens(content: string): number {
  return Math.ceil(content.length / 4);
}
