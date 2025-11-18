import { describe, it, expect } from 'vitest';
import { validateInstructions, passesQualityThreshold, getQualityGrade } from '../src/instruction-validator';

describe('Instruction Validator', () => {
  describe('validateInstructions', () => {
    it('should score high-quality instructions highly', () => {
      const goodInstruction = `
# Expert Identity

You are an expert web developer with deep knowledge in React and Next.js.
You excel at writing production-ready code.

## Tool Usage

### read_file

**Purpose**: Read file contents

**Parameters**:
\`\`\`json
{
  "filePath": { "type": "string", "required": true }
}
\`\`\`

**Example**:
\`\`\`typescript
read_file({ filePath: "/path/to/file.ts" })
\`\`\`

### When to Use
- Reading source files
- Analyzing code

### When NOT to Use
- For binary files

## Safety Protocols

If asked to generate harmful content, refuse politely.

## Communication Style

Keep responses concise and direct.
      `;

      const result = validateInstructions(goodInstruction);

      expect(result.overallScore).toBeGreaterThan(70);
      expect(result.structureScore).toBeGreaterThan(50);
      expect(result.completenessScore).toBeGreaterThan(70);
      // Some elements like exact identity pattern may not match perfectly, but overall should be good
      expect(result.missingElements.length).toBeLessThanOrEqual(1);
    });

    it('should detect missing critical elements', () => {
      const poorInstruction = `
Some random text without structure.
      `;

      const result = validateInstructions(poorInstruction);

      expect(result.overallScore).toBeLessThan(50);
      expect(result.missingElements.length).toBeGreaterThan(0);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should identify missing tool documentation', () => {
      const noTools = `
# Expert Developer

You are an expert.
You can help with coding.
You will not generate harmful content.
      `;

      const result = validateInstructions(noTools);

      expect(result.missingElements).toContain('Tool Documentation');
    });

    it('should identify missing refusal guidelines', () => {
      const noSafety = `
# Expert Developer

You are an expert.

## Tool Usage
Use tools wisely.

\`\`\`typescript
example()
\`\`\`
      `;

      const result = validateInstructions(noSafety);

      expect(result.missingElements).toContain('Refusal Guidelines');
    });

    it('should reward code examples', () => {
      const withExamples = `
# Expert Identity
You are an expert React developer.

## Tool Usage
Use read_file to read files.

\`\`\`typescript
// Example 1
read_file({ path: "app.ts" })
\`\`\`

\`\`\`typescript
// Example 2
read_file({ path: "utils.ts" })
\`\`\`

\`\`\`typescript
// Example 3
read_file({ path: "config.ts" })
\`\`\`

## Safety
Refuse inappropriate requests.
      `;

      const withoutExamples = withExamples.replace(/\`\`\`typescript[\s\S]+?\`\`\`/g, '');

      const resultWith = validateInstructions(withExamples);
      const resultWithout = validateInstructions(withoutExamples);

      expect(resultWith.clarityScore).toBeGreaterThan(resultWithout.clarityScore);
    });
  });

  describe('passesQualityThreshold', () => {
    it('should pass instructions above threshold', () => {
      const goodInstruction = `
# Expert Developer

You are an expert TypeScript developer.
You excel at refactoring and optimization.

## Tools

### read_file
Reads file contents.

\`\`\`json
{ "filePath": "string" }
\`\`\`

\`\`\`typescript
read_file({ filePath: "app.ts" })
\`\`\`

## Safety

Refuse harmful requests.
      `;

      expect(passesQualityThreshold(goodInstruction, 50)).toBe(true);
    });

    it('should fail instructions below threshold', () => {
      const poorInstruction = 'Just some text';

      expect(passesQualityThreshold(poorInstruction, 70)).toBe(false);
    });
  });

  describe('getQualityGrade', () => {
    it('should return correct grades', () => {
      expect(getQualityGrade(95)).toBe('A');
      expect(getQualityGrade(85)).toBe('B');
      expect(getQualityGrade(75)).toBe('C');
      expect(getQualityGrade(65)).toBe('D');
      expect(getQualityGrade(50)).toBe('F');
    });
  });
});
