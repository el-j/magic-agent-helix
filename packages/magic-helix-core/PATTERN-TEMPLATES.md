# Pattern Templates Guide

## Overview

Magic-Agent-Helix uses a pattern-based system for generating AI instructions, inspired by research from [awesome-ai-system-prompts](https://github.com/mehmetkahya0/awesome-ai-system-prompts). This guide explains the 33 pattern templates across 8 categories and how to use them effectively.

## Table of Contents

- [Pattern Categories](#pattern-categories)
- [Usage Examples](#usage-examples)
- [Context-Aware Selection](#context-aware-selection)
- [Creating Custom Patterns](#creating-custom-patterns)
- [API Reference](#api-reference)

## Pattern Categories

### 1. Role Definition

Establishes the AI's identity, expertise, and boundaries.

**Templates:**
- `expert-identity.md` - Define AI persona (e.g., "You are v0, a Next.js expert...")
- `scope-boundaries.md` - Clarify what the AI should/shouldn't do
- `capability-declarations.md` - List specific skills and knowledge areas

**Example from v0:**
```
You are v0, an AI assistant created by Vercel to be an expert web developer.
You excel at writing React (in TSX), HTML, CSS, and Tailwind.
You have deep knowledge of Next.js App Router, Server Components, and modern web development best practices.
```

**Priority:** 1 (applied early, can be overridden)

### 2. Organization

Structures instructions using headings, XML tags, or sequential steps.

**Templates:**
- `xml-rule-groups.md` - Use XML-like tags for grouping (`<rules>`, `<examples>`)
- `heading-hierarchy.md` - Markdown heading structure (##, ###)
- `sequential-workflows.md` - Step-by-step process flows

**Example from Manus:**
```xml
<rules>
  <rule name="always-confirm">Before destructive actions, ask for confirmation</rule>
  <rule name="explain-changes">Document why each change was made</rule>
</rules>
```

**Priority:** 2

### 3. Tool Guidelines

Documents available tools, their schemas, and usage policies.

**Templates:**
- `function-schemas.md` - Inline tool documentation with parameters
- `usage-policies.md` - When/how to use each tool
- `parameter-examples.md` - Concrete examples of tool calls

**Example from ChatGPT (DALL-E):**
```typescript
namespace dalle {
  // Generate images from text descriptions
  function generate(prompt: string, size: '1024x1024' | '1792x1024'): string;
}

// Usage: Always sanitize user prompts before passing to DALL-E
```

**Priority:** 3

### 4. Reasoning

Guides the AI's thought process and decision-making.

**Templates:**
- `thinking-tags.md` - Pre-action analysis (`<thinking>...</thinking>`)
- `subtask-breakdown.md` - Decompose complex tasks
- `dependency-analysis.md` - Identify prerequisites
- `agent-loop.md` - OODA loop pattern (Observe, Orient, Decide, Act)
- `one-tool-per-iteration.md` - Sequential tool usage
- `reflection-checkpoints.md` - Pause and verify progress
- `confirmation-gates.md` - Ask before destructive actions
- `preview-before-action.md` - Show plan before executing
- `result-verification.md` - Check outcomes after actions

**Example from v0 (Thinking Pattern):**
```markdown
Before generating code, think through the requirements:

<thinking>
1. **Understand**: What component is needed?
2. **Analyze**: What are the constraints?
3. **Plan**: What's the implementation approach?
4. **Anticipate**: What could go wrong?
</thinking>

Then generate the component code.
```

**Example from same.new (Confirmation Gate):**
```markdown
Before overwriting files, always:
1. Show the current file content
2. Show the proposed new content
3. Ask: "Should I proceed with this change? [y/N]"
4. Only write if user confirms with "y" or "yes"
```

**Priority:** 4

### 5. Domain Expertise

Framework-specific rules, patterns, and best practices.

**Templates:**
- `nextjs-rules.md` - Next.js 14 App Router, Server Components, async patterns
- `react-patterns.md` - React 18+ hooks, composition, performance
- `server-components.md` - RSC vs Client Components, data fetching
- `tailwind-patterns.md` - Utility-first CSS, responsive design, dark mode
- `shadcn-ui.md` - Component library usage, customization

**Example from v0 (Next.js Rules):**
```markdown
## Next.js App Router Patterns

### Server Components by Default
```tsx
// ✅ Server Component (default)
export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await fetchProduct(params.id);
  return <ProductDetails product={product} />;
}

// ❌ Don't mark as Client Component unless needed
'use client';  // Only add if using useState, useEffect, etc.
```

### Use Server Actions for Mutations
```tsx
async function updateProduct(formData: FormData) {
  'use server';
  const id = formData.get('id');
  await db.product.update({ ... });
}
```
```

**Priority:** 5

### 6. Environment

OS-specific commands, container awareness, IDE features.

**Templates:**
- `os-commands.md` - Platform-specific shell commands (bash vs PowerShell)
- `container-awareness.md` - Docker/Kubernetes context
- `ide-features.md` - VS Code shortcuts, extensions, debugging

**Example:**
```markdown
## VS Code Environment

### Available Commands
- `⌘ + Shift + P` - Command palette
- `⌘ + P` - Quick file open
- `⌘ + \`` - Toggle terminal

### Copilot Integration
Use `@workspace` to search codebase context before generating code.
```

**Priority:** 6

### 7. Tone

Communication style, forbidden phrases, personality.

**Templates:**
- `concise-communication.md` - Brief, direct responses
- `forbidden-phrases.md` - Avoid "As an AI...", "I apologize...", etc.
- `adaptive-tone.md` - Match user's formality level

**Example from Claude:**
```markdown
## Communication Guidelines

### Keep Responses Concise
- Default to 1-3 sentences for simple questions
- No emojis unless user uses them first
- Avoid preambles like "Here's what I found:"

### Forbidden Phrases
❌ "As an AI assistant..."
❌ "I apologize for the confusion..."
❌ "Let me clarify..."
✅ Direct answers without meta-commentary
```

**Priority:** 7

### 8. Safety

Refusal policies, destructive action warnings, credential handling.

**Templates:**
- `refusal-messages.md` - How to decline harmful requests
- `destructive-warnings.md` - Alert before rm, DROP TABLE, etc.
- `code-safety-rules.md` - SQL injection prevention, XSS protection
- `credential-handling.md` - Never log passwords, API keys

**Example from ChatGPT:**
```markdown
## Safety Protocols

### Refuse Harmful Requests
If asked to generate:
- Malware, viruses, or exploits
- Discriminatory or hateful content
- Instructions for illegal activities

Respond: "I can't assist with that request."

No explanation needed. Move on immediately.

### Destructive Commands
Before executing:
```bash
rm -rf /
DROP DATABASE production;
kubectl delete namespace production
```

**STOP.** Ask: "⚠️ This is a destructive operation. Are you absolutely sure? [yes/no]"
```

**Priority:** 8 (highest - never overridden)

## Usage Examples

### Example 1: Next.js + React + Tailwind Project

```typescript
import { generateInstructions } from '@el-j/magic-helix-core';

const instructions = generateInstructions({
  framework: 'react',
  libraries: ['tailwind', 'shadcn-ui'],
  aiModel: 'claude',
  tone: 'concise',
  environment: 'vscode',
});

console.log(instructions);
// Output: Unified instruction document with 15-20 relevant patterns
```

**Patterns automatically selected:**
- `expert-identity` (role)
- `heading-hierarchy` (organization)
- `function-schemas` (tools)
- `thinking-tags` (reasoning, Claude-specific)
- `react-patterns` (domain)
- `tailwind-patterns` (domain)
- `shadcn-ui` (domain)
- `concise-communication` (tone)
- `ide-features` (environment, VS Code)
- `refusal-messages` (safety)
- `destructive-warnings` (safety)

### Example 2: Python CLI Tool

```typescript
const instructions = generateInstructions({
  language: 'python',
  environment: 'cli',
  tone: 'professional',
});

// Patterns selected:
// - expert-identity (Python expert)
// - tool-guidelines (argparse, click)
// - os-commands (bash/zsh)
// - safety (always included)
```

### Example 3: Custom Pattern Selection

```typescript
const instructions = generateInstructions({
  framework: 'react',
  includePatterns: [
    'confirmation-gates',  // Explicitly add confirmation pattern
    'agent-loop',          // Explicitly add OODA loop
  ],
  excludePatterns: [
    'thinking-tags',       // Skip thinking pattern
  ],
});
```

## Context-Aware Selection

The pattern combiner uses context clues to select relevant patterns:

| Context Property | Selected Patterns | Example |
|-----------------|-------------------|---------|
| `framework: 'react'` | `react-patterns.md` | React hooks, composition |
| `framework: 'vue'` | `vue-core.md`, `vue-pinia.md` | Vue 3 Composition API |
| `libraries: ['tailwind']` | `tailwind-patterns.md` | Utility-first CSS |
| `libraries: ['shadcn-ui']` | `shadcn-ui.md` | Component variants |
| `aiModel: 'claude'` | `thinking-tags.md`, `concise-communication.md` | Claude-specific patterns |
| `aiModel: 'gpt'` | Standard patterns | ChatGPT-compatible |
| `tone: 'concise'` | `concise-communication.md`, `forbidden-phrases.md` | Brief responses |
| `environment: 'vscode'` | `ide-features.md` | Editor shortcuts |
| `environment: 'cli'` | `os-commands.md` | Shell commands |

**Safety patterns are always included** regardless of context.

## Creating Custom Patterns

### File Structure

```
src/default_templates/patterns/
  └── your-category/
      └── your-pattern.md
```

### Pattern Template Format

```markdown
# Pattern Name

## Context
Describe when to use this pattern.

## Core Rule
The main instruction or guideline.

## Examples

### Example 1: Scenario
\`\`\`language
code example
\`\`\`

### Example 2: Anti-Pattern
❌ Don't do this
✅ Do this instead

## References
- Source: [Project/AI Name]
- Link: https://example.com
```

### Pattern Metadata

Patterns automatically inherit:
- **Category**: From directory name (`role-definition`, `organization`, etc.)
- **Priority**: Based on category (safety=8, tone=7, environment=6, ...)
- **Name**: From filename (`your-pattern.md` → `your-pattern`)

### Loading Custom Patterns

```typescript
import { loadPatternTemplates } from '@el-j/magic-helix-core';

const patterns = loadPatternTemplates();
// Returns Map<string, PatternTemplate> with all 33+ patterns
```

## API Reference

### `generateInstructions(context: PatternContext): string`

Generates unified AI instructions by:
1. Loading all pattern templates
2. Selecting relevant patterns based on context
3. Combining patterns into a single markdown document

**Parameters:**
- `context.framework?: 'react' | 'vue' | 'nestjs' | 'generic'`
- `context.language?: 'typescript' | 'javascript' | 'python'`
- `context.libraries?: string[]` - e.g., `['tailwind', 'shadcn-ui']`
- `context.aiModel?: 'claude' | 'gpt' | 'gemini' | 'local'`
- `context.tone?: 'professional' | 'concise' | 'friendly' | 'thoughtful'`
- `context.environment?: 'vscode' | 'cli' | 'web'`
- `context.includePatterns?: string[]` - Force include by name
- `context.excludePatterns?: string[]` - Force exclude by name

**Returns:** Markdown string with combined instructions

### `loadPatternTemplates(): Map<string, PatternTemplate>`

Loads all pattern templates from `default_templates/patterns/`.

**Returns:** Map where key is pattern name, value is PatternTemplate object

### `selectPatterns(allPatterns: Map<string, PatternTemplate>, context: PatternContext): PatternTemplate[]`

Filters patterns based on context.

**Returns:** Array of selected patterns

### `combinePatterns(patterns: PatternTemplate[]): string`

Merges patterns into unified document:
1. Sorts by priority (lower first, higher can override)
2. Groups by category
3. Adds category headers
4. Extracts examples sections

**Returns:** Combined markdown document

## Best Practices

1. **Start with defaults**: Use `generateInstructions()` without explicit includes/excludes
2. **Add domain patterns**: Include framework-specific templates for your stack
3. **Safety first**: Never exclude safety patterns
4. **Test quality**: Run `validateInstructions()` to check generated output
5. **Iterate**: Adjust context based on quality scores and AI behavior
6. **Document custom patterns**: Add clear examples and references

## Related Documentation

- [Instruction Validation Guide](./INSTRUCTION-VALIDATION.md)
- [awesome-ai-system-prompts](https://github.com/mehmetkahya0/awesome-ai-system-prompts) (research source)
- [v0 Prompts](https://v0.dev) (Vercel)
- [Claude System Prompts](https://docs.anthropic.com)
- [ChatGPT Prompts](https://platform.openai.com)
