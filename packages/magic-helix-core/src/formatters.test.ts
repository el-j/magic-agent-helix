import { describe, expect, it } from 'vitest';
import {
  type AssistantTarget,
  CursorFormatter,
  GitHubCopilotFormatter,
  WindsurfFormatter,
  getFormatter,
} from './formatters';

describe('Formatters', () => {
  const testContent = '- **ALWAYS** use TypeScript.\n- **NEVER** use any.';
  const testFilePath = 'src/**/*.ts';
  const testProjectName = 'test-project';

  it('should format for GitHub Copilot', () => {
    const formatter = getFormatter('github-copilot');
    const result = formatter.format(testContent, testFilePath, testProjectName);
    expect(result).toBe(testContent);
    expect(formatter.getFileExtension()).toBe('.md');
    expect(formatter.getFrontmatter(testFilePath, testProjectName)).toContain(
      'applyTo: "src/**/*.ts"',
    );
  });

  it('should format for Claude — only ALWAYS/NEVER get emphasis', () => {
    const formatter = getFormatter('claude');
    // ALWAYS and NEVER directives should receive emoji emphasis
    const result = formatter.format(testContent, testFilePath, testProjectName);
    expect(result).toContain('**ALWAYS** ⚠️');
    expect(result).toContain('**NEVER** 🚫');
    // Non-ALWAYS/NEVER bold text must NOT be mutated
    const neutralContent = '- **PREFER** this approach.\n- **AVOID** that.';
    const neutralResult = formatter.format(
      neutralContent,
      testFilePath,
      testProjectName,
    );
    expect(neutralResult).toBe(neutralContent);
    expect(formatter.getFileExtension()).toBe('.md');
    expect(formatter.getFrontmatter(testFilePath, testProjectName)).toContain(
      'assistant: claude',
    );
  });

  it('should format for Copilot Chat', () => {
    const formatter = getFormatter('copilot-chat');
    const result = formatter.format(testContent, testFilePath, testProjectName);
    expect(result).toContain('🔴');
    expect(result).toContain('❌');
    expect(formatter.getFileExtension()).toBe('.md');
    expect(formatter.getFrontmatter(testFilePath, testProjectName)).toContain(
      'context: chat',
    );
  });

  it('should format for Cursor IDE', () => {
    const formatter = getFormatter('cursor');
    const result = formatter.format(testContent, testFilePath, testProjectName);
    expect(result).toBe(testContent); // content unchanged
    expect(formatter.getFileExtension()).toBe('.mdc');
    const fm = formatter.getFrontmatter(testFilePath, testProjectName);
    expect(fm).toContain('globs: src/**/*.ts');
    expect(fm).toContain('alwaysApply: false');
  });

  it('should format for Windsurf IDE', () => {
    const formatter = getFormatter('windsurf');
    const result = formatter.format(testContent, testFilePath, testProjectName);
    expect(result).toBe(testContent); // content unchanged
    expect(formatter.getFileExtension()).toBe('.md');
    const fm = formatter.getFrontmatter(testFilePath, testProjectName);
    expect(fm).toContain('trigger: glob_match');
    expect(fm).toContain('globs: src/**/*.ts');
  });

  it('should format for Generic assistant', () => {
    const formatter = getFormatter('generic');
    const result = formatter.format(testContent, testFilePath, testProjectName);
    expect(result).toBe(testContent);
    expect(formatter.getFileExtension()).toBe('.md');
    expect(formatter.getFrontmatter(testFilePath, testProjectName)).toContain(
      'applyTo: "src/**/*.ts"',
    );
  });

  it('should default to GitHub Copilot for unknown target', () => {
    const formatter = getFormatter('unknown' as AssistantTarget);
    expect(formatter).toBeInstanceOf(GitHubCopilotFormatter);
  });

  it('should export CursorFormatter and WindsurfFormatter as named exports', () => {
    expect(new CursorFormatter()).toBeInstanceOf(CursorFormatter);
    expect(new WindsurfFormatter()).toBeInstanceOf(WindsurfFormatter);
  });
});
