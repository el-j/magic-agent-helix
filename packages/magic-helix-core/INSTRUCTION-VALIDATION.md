# Instruction Validation Guide

This guide explains how instruction quality is measured in `@el-j/magic-helix-core`, what elements are checked, how scores and grades are computed, and how to improve low-scoring instructions.

## Overview

The validator analyzes an instruction document and returns:
- Overall score (0-100)
- Structure, clarity, and completeness subscores
- Missing critical elements
- Concrete recommendations to improve quality

API entry: `validateInstructions(instruction)` returns an `InstructionQuality` object.

## Quality Elements (15)

Elements are grouped by theme with importance weights and required flags. Names here match the implementation exactly.

- Role Definition (critical)
  - Expert Identity (required, 1.0): Uses patterns like "You are an expert..."
  - Capability Declarations (required, 0.8): Declares what the agent can do well
  - Scope Boundaries (optional, 0.7): States what the agent will not do

- Organization (important)
  - Clear Headings (required, 0.9): At least a few H2/H3 sections
  - Structured Sections (optional, 0.8): XML-like tags or multiple H3 sections

- Tool Guidelines (critical)
  - Tool Documentation (required, 1.0): Mentions tools/functions/commands and parameters
  - Tool Usage Policies (required, 0.9): When to use or avoid a tool
  - Concrete Examples (required, 0.8): ≥ 2 fenced code blocks

- Reasoning (important)
  - Step-by-Step Process (optional, 0.7): Ordered process or step words
  - Thinking/Planning Phase (optional, 0.6): Thinking tag or “Before X, think/plan/analyze”
  - Confirmation Gates (optional, 0.8): Ask/preview before destructive actions

- Safety (critical)
  - Refusal Guidelines (required, 1.0): Decline inappropriate content
  - Destructive Action Warnings (optional, 0.9): Warning/caution for delete/overwrite

- Tone (moderate)
  - Communication Style (optional, 0.5): Mentions concise/brief/professional
  - Forbidden Phrases (optional, 0.4): Prohibits meta phrases

Implementation reference: `INSTRUCTION_ELEMENTS` in `src/instruction-validator.ts`.

## Scoring

- Structure Score: Weighted average of Organization elements
- Clarity Score: Weighted average of Examples + Tone elements
- Completeness Score: Weighted average of all required elements
- Overall Score: 0.3×Structure + 0.2×Clarity + 0.5×Completeness (rounded)

### Grades

- A: 90-100
- B: 80-89
- C: 70-79
- D: 60-69
- F: <60

Use `getQualityGrade(score)` for grade conversion.

## CLI Usage

Validate all generated instructions:

```bash
# From your project root
npx @el-j/magic-agent-helix validate
```

Example output:

```
=== Instruction Quality Report ===
Overall Score: 86/100 (B)
  Structure:    90/100
  Clarity:      80/100
  Completeness: 85/100

❌ Missing Critical Elements:
   - Tool Documentation

💡 Recommendations:
   - Add tool documentation: Include function schemas with parameters and examples
   - Add more code examples: Currently 2, aim for at least 5 concrete examples
   - Consider adding confirmation gates for destructive operations (delete, overwrite)
```

## Programmatic Usage

```ts
import {
  validateInstructions,
  formatValidationReport,
  passesQualityThreshold,
  getQualityGrade,
} from '@el-j/magic-helix-core';

const quality = validateInstructions(instructions);
console.log(formatValidationReport(quality));

if (!passesQualityThreshold(instructions, 70)) {
  // Improve instructions here
}
console.log('Grade:', getQualityGrade(quality.overallScore));
```

## How To Improve Scores

- Missing Expert Identity
  - Start with: "You are an expert [domain] specialist..."
  - Describe core areas of excellence (React, Next.js, Tailwind, etc.)

- Weak Organization
  - Add clear headings: `## Role & Identity`, `## Instruction Structure`, `## Tool Usage Guidelines`, `## Safety`
  - Use structured sections: `<rules>`, `<thinking>`, or multiple `###` subsections

- Missing Tool Documentation
  - Include each tool’s purpose, inputs, and parameter types/constraints
  - Provide concrete examples (good and bad)

- Not Enough Examples
  - Aim for ≥5 fenced code blocks with realistic inputs/outputs
  - Use ✅/❌ comparisons to show good vs bad patterns

- Safety Gaps
  - Add refusal guidelines for harmful/inappropriate content
  - Add confirmation gates and explicit warnings for destructive actions

- Tone Adjustments
  - Declare style: "Be concise and direct by default"
  - Forbid meta phrases (e.g., "As an AI assistant...")

## Tips

- Set a realistic threshold (e.g., 70) for passing
- Iterate: generate → validate → improve → re-validate
- Keep safety patterns in all instruction sets
- Use context-aware patterns from the Pattern Templates system

## Related

- [Pattern Templates Guide](./PATTERN-TEMPLATES.md)
- Source: `src/instruction-validator.ts`
