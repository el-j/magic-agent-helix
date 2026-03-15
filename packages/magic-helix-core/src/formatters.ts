/**
 * Assistant-specific instruction formatters.
 * Each AI assistant may have different requirements for instruction formatting.
 */

export type AssistantTarget =
  | 'github-copilot'
  | 'claude'
  | 'copilot-chat'
  | 'cursor'
  | 'windsurf'
  | 'generic';

export interface InstructionFormatter {
  /**
   * Format the instruction content for a specific assistant
   */
  format(content: string, filePath: string, projectName: string): string;

  /**
   * Get the file extension for instructions
   */
  getFileExtension(): string;

  /**
   * Get any special frontmatter or metadata required
   */
  getFrontmatter(filePath: string, projectName: string): string;
}

/**
 * GitHub Copilot formatter (default)
 * Uses .md files in .github/instructions/ directory
 */
export class GitHubCopilotFormatter implements InstructionFormatter {
  format(content: string, _filePath: string, _projectName: string): string {
    return content;
  }

  getFileExtension(): string {
    return '.md';
  }

  getFrontmatter(_filePath: string, _projectName: string): string {
    return `---
applyTo: "${_filePath}"
---\n\n`;
  }
}

/**
 * Claude/Cursor formatter
 * Uses .md files with Claude-specific formatting
 */
export class ClaudeFormatter implements InstructionFormatter {
  format(content: string, _filePath: string, _projectName: string): string {
    // Mark only ALWAYS and NEVER directives with visual emphasis.
    // Previously this appended "(important)" to ALL bold spans — a bug
    // that mutated semantically neutral markers like **PREFER** or **AVOID**.
    return content
      .replace(/- \*\*ALWAYS\*\*/g, '- **ALWAYS** ⚠️')
      .replace(/- \*\*NEVER\*\*/g, '- **NEVER** 🚫');
  }

  getFileExtension(): string {
    return '.md';
  }

  getFrontmatter(_filePath: string, _projectName: string): string {
    return `---
applyTo: "${_filePath}"
assistant: claude
---\n\n`;
  }
}

/**
 * GitHub Copilot Chat formatter
 * Uses .md files optimized for chat interactions
 */
export class CopilotChatFormatter implements InstructionFormatter {
  format(content: string, _filePath: string, _projectName: string): string {
    // Copilot Chat works better with more concise, actionable instructions
    return content
      .replace(/- \*\*ALWAYS\*\*/g, '- 🔴')
      .replace(/- \*\*NEVER\*\*/g, '- ❌');
  }

  getFileExtension(): string {
    return '.md';
  }

  getFrontmatter(_filePath: string, _projectName: string): string {
    return `---
applyTo: "${_filePath}"
context: chat
---\n\n`;
  }
}

/**
 * Generic assistant formatter
 * Uses .md files with minimal formatting
 */
export class GenericFormatter implements InstructionFormatter {
  format(content: string, _filePath: string, _projectName: string): string {
    return content;
  }

  getFileExtension(): string {
    return '.md';
  }

  getFrontmatter(_filePath: string, _projectName: string): string {
    return `---
applyTo: "${_filePath}"
---\n\n`;
  }
}

/**
 * Cursor formatter
 * Generates rules in Cursor's .cursor/rules/ directory format.
 * Files use the .mdc extension with Cursor-specific frontmatter.
 */
export class CursorFormatter implements InstructionFormatter {
  format(content: string, _filePath: string, _projectName: string): string {
    return content;
  }

  getFileExtension(): string {
    return '.mdc';
  }

  getFrontmatter(filePath: string, _projectName: string): string {
    return `---
description: Instructions for files matching ${filePath}
globs: ${filePath}
alwaysApply: false
---\n\n`;
  }
}

/**
 * Windsurf formatter
 * Generates rules in Windsurf's .windsurf/rules/ directory format.
 */
export class WindsurfFormatter implements InstructionFormatter {
  format(content: string, _filePath: string, _projectName: string): string {
    return content;
  }

  getFileExtension(): string {
    return '.md';
  }

  getFrontmatter(filePath: string, _projectName: string): string {
    return `---
trigger: glob_match
globs: ${filePath}
---\n\n`;
  }
}

/**
 * Factory function to get the appropriate formatter for an assistant
 */
export function getFormatter(target: AssistantTarget): InstructionFormatter {
  switch (target) {
    case 'github-copilot':
      return new GitHubCopilotFormatter();
    case 'claude':
      return new ClaudeFormatter();
    case 'copilot-chat':
      return new CopilotChatFormatter();
    case 'cursor':
      return new CursorFormatter();
    case 'windsurf':
      return new WindsurfFormatter();
    case 'generic':
      return new GenericFormatter();
    default:
      return new GitHubCopilotFormatter();
  }
}
