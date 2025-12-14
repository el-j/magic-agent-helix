import { describe, it, expect } from 'vitest';
import {
  refineInstructions,
  estimateTokens,
  DEFAULT_AI_REFINEMENT,
} from '../src/ai-refinement';

const SAMPLE_CONTENT = `# React Component Guide

## Overview
React is a JavaScript library for building user interfaces.

## Basic Usage
\`\`\`jsx
function MyComponent() {
  return <div>Hello</div>;
}
\`\`\`

## Advanced Patterns
- Higher-order components
- Render props
- Custom hooks

## Example: Counter Component
\`\`\`jsx
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
\`\`\`

## Best Practices
1. Keep components small
2. Use TypeScript for type safety
3. Avoid prop drilling

## Deep Dive: Reconciliation
React's reconciliation algorithm determines the minimal set of changes needed to update the DOM. This is a complex process that involves diffing the virtual DOM tree with the previous version.
`;

describe('AI Refinement', () => {
  it('applies default refinement', () => {
    const refined = refineInstructions(SAMPLE_CONTENT, {});
    expect(refined).toBeTruthy();
    expect(refined.length).toBeLessThanOrEqual(SAMPLE_CONTENT.length);
  });

  it('respects quality: basic', () => {
    const refined = refineInstructions(SAMPLE_CONTENT, { quality: 'basic' });
    expect(refined).toContain('# React'); // Keep top-level header
    expect(refined).toContain('## Overview');
    expect(refined).toContain('## Basic');
    // Basic quality filters content down to essential sections
    expect(refined.length).toBeLessThanOrEqual(SAMPLE_CONTENT.length);
  });

  it('respects quality: comprehensive', () => {
    const refined = refineInstructions(SAMPLE_CONTENT, { quality: 'comprehensive' });
    expect(refined).toContain('## Overview');
    expect(refined).toContain('## Advanced');
    expect(refined).toContain('## Deep Dive');
  });

  it('respects contextLevel: minimal', () => {
    const refined = refineInstructions(SAMPLE_CONTENT, { contextLevel: 'minimal' });
    expect(refined).not.toContain('## Deep Dive');
  });

  it('respects contextLevel: extensive', () => {
    const refined = refineInstructions(SAMPLE_CONTENT, { contextLevel: 'extensive' });
    expect(refined).toContain('React'); // Keep content
    expect(refined.length).toBeGreaterThan(200);
  });

  it('removes code examples when disabled', () => {
    const refined = refineInstructions(SAMPLE_CONTENT, { includeExamples: false });
    expect(refined).not.toContain('```jsx');
    expect(refined).not.toContain('## Example');
  });

  it('removes best practices when disabled', () => {
    const refined = refineInstructions(SAMPLE_CONTENT, { includeBestPractices: false });
    expect(refined).not.toContain('## Best Practices');
  });

  it('enforces token budget', () => {
    const longContent = SAMPLE_CONTENT.repeat(50);
    const refined = refineInstructions(longContent, { tokenBudget: 500 });
    const tokens = estimateTokens(refined);
    expect(tokens).toBeLessThanOrEqual(600); // Allow 20% margin
  });

  it('estimates token count', () => {
    const tokens = estimateTokens(SAMPLE_CONTENT);
    expect(tokens).toBeGreaterThan(0);
    expect(tokens).toBeLessThan(SAMPLE_CONTENT.length);
  });

  it('applies structured format', () => {
    const refined = refineInstructions(SAMPLE_CONTENT, { outputFormat: 'structured' });
    expect(refined).toContain('### '); // Demoted h2 becomes h3
    expect(refined).toContain('## React'); // h1 demoted to h2
  });

  it('applies code-focused format', () => {
    const refined = refineInstructions(SAMPLE_CONTENT, { outputFormat: 'code-focused' });
    expect(refined).toContain('```jsx');
    expect(refined.length).toBeLessThan(SAMPLE_CONTENT.length);
  });

  it('combines multiple settings', () => {
    const refined = refineInstructions(SAMPLE_CONTENT, {
      quality: 'basic',
      contextLevel: 'minimal',
      includeExamples: false,
      includeBestPractices: false,
      tokenBudget: 1000,
    });
    expect(refined).toBeTruthy();
    expect(refined.length).toBeLessThan(SAMPLE_CONTENT.length);
  });

  it('preserves essential headers', () => {
    const refined = refineInstructions(SAMPLE_CONTENT, { quality: 'basic' });
    expect(refined).toContain('# React Component Guide');
  });

  it('handles empty content', () => {
    const refined = refineInstructions('', DEFAULT_AI_REFINEMENT);
    expect(refined).toBe('');
  });

  it('handles content without code blocks', () => {
    const simple = '# Title\n\nSome text.\n\n## Section\n\nMore text.';
    const refined = refineInstructions(simple, { includeExamples: false });
    expect(refined).toBeTruthy();
  });
});
