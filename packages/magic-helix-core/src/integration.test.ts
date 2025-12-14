import { describe, expect, it } from 'vitest';
import {
  passesQualityThreshold,
  validateInstructions,
} from './instruction-validator';
import {
  type PatternContext,
  combinePatterns,
  generateInstructions,
  loadPatternTemplates,
  selectPatterns,
} from './pattern-combiner';

describe('integration tests', () => {
  describe('full pattern system workflow', () => {
    it('should generate high-quality instructions for Next.js + React + Tailwind', () => {
      // Context for a modern web development project
      const context: PatternContext = {
        framework: 'react',
        libraries: ['tailwind', 'shadcn-ui'],
        aiModel: 'claude',
        tone: 'concise',
        environment: 'vscode',
      };

      // Generate instructions
      const instructions = generateInstructions(context);

      // Validate quality
      const quality = validateInstructions(instructions);

      // Should be high quality (>70 score)
      expect(quality.overallScore).toBeGreaterThan(70);
      expect(passesQualityThreshold(instructions, 70)).toBe(true);

      // Should have minimal missing elements
      expect(quality.missingElements.length).toBeLessThanOrEqual(2);

      // Should contain framework-specific content
      expect(instructions.toLowerCase()).toContain('react');
      expect(instructions.toLowerCase()).toContain('tailwind');
    });

    it('should always include safety patterns regardless of context', () => {
      const contexts: PatternContext[] = [
        { framework: 'react' },
        { language: 'python' },
        { environment: 'cli' },
        {},
      ];

      for (const context of contexts) {
        const patterns = loadPatternTemplates();
        const selected = selectPatterns(patterns, context);
        const hasSafety = selected.some((p) => p.category === 'safety');

        expect(hasSafety).toBe(true);
      }
    });

    it('should respect explicit pattern inclusion and exclusion', () => {
      const context: PatternContext = {
        includePatterns: ['expert-identity', 'thinking-tags'],
        excludePatterns: ['concise-communication'],
      };

      const patterns = loadPatternTemplates();
      const selected = selectPatterns(patterns, context);

      // Should include explicitly requested patterns
      expect(selected.some((p) => p.name === 'expert-identity')).toBe(true);
      expect(selected.some((p) => p.name === 'thinking-tags')).toBe(true);

      // Should exclude explicitly excluded patterns
      expect(selected.some((p) => p.name === 'concise-communication')).toBe(
        false,
      );
    });

    it('should combine patterns correctly with category grouping', () => {
      const patterns = loadPatternTemplates();
      const context: PatternContext = {
        framework: 'react',
        libraries: ['tailwind'],
      };

      const selected = selectPatterns(patterns, context);
      const combined = combinePatterns(selected);

      // Should have main title
      expect(combined).toContain('# AI Agent Instructions');

      // Should group by categories
      expect(combined).toContain('## Role & Identity');
      expect(combined).toContain('## Safety');

      // Should include framework-specific content
      expect(combined.toLowerCase()).toContain('react');
    });

    it('should generate different instructions based on context', () => {
      const reactContext: PatternContext = {
        framework: 'react',
        libraries: ['tailwind'],
      };

      const pythonContext: PatternContext = {
        language: 'python',
        environment: 'cli',
      };

      const reactInstructions = generateInstructions(reactContext);
      const pythonInstructions = generateInstructions(pythonContext);

      // React instructions should mention React
      expect(reactInstructions.toLowerCase()).toContain('react');

      // Instructions should differ based on context
      expect(reactInstructions).not.toEqual(pythonInstructions);

      // Both should be reasonable quality
      const reactQuality = validateInstructions(reactInstructions);
      const pythonQuality = validateInstructions(pythonInstructions);

      expect(reactQuality.overallScore).toBeGreaterThan(55);
      expect(pythonQuality.overallScore).toBeGreaterThan(55);
    });

    it('should validate that generated instructions meet quality thresholds', () => {
      const contexts: PatternContext[] = [
        { framework: 'react', libraries: ['tailwind', 'shadcn-ui'] },
        { framework: 'vue' },
        { language: 'python' },
      ];

      for (const context of contexts) {
        const instructions = generateInstructions(context);
        const quality = validateInstructions(instructions);

        // All generated instructions should pass basic quality (>50)
        expect(quality.overallScore).toBeGreaterThan(50);

        // Should have reasonable structure
        expect(quality.structureScore).toBeGreaterThan(40);

        // Should have some clarity
        expect(quality.clarityScore).toBeGreaterThan(40);
      }
    });

    it('should load all 33 pattern templates correctly', () => {
      const patterns = loadPatternTemplates();

      expect(patterns.size).toBeGreaterThanOrEqual(33);

      // Check all 8 categories are represented
      const categories = new Set(
        Array.from(patterns.values()).map((p) => p.category),
      );

      expect(categories.has('role-definition')).toBe(true);
      expect(categories.has('organization')).toBe(true);
      expect(categories.has('tool-guidelines')).toBe(true);
      expect(categories.has('reasoning')).toBe(true);
      expect(categories.has('domain-expertise')).toBe(true);
      expect(categories.has('environment')).toBe(true);
      expect(categories.has('tone')).toBe(true);
      expect(categories.has('safety')).toBe(true);
    });

    it('should maintain pattern priority order (safety last)', () => {
      const patterns = loadPatternTemplates();
      const context: PatternContext = {
        framework: 'react',
      };

      const selected = selectPatterns(patterns, context);
      const combined = combinePatterns(selected);

      // Find positions of safety and role content
      const roleIndex = combined.indexOf('## Role & Identity');
      const safetyIndex = combined.indexOf('## Safety');

      // Safety should come after role definition (higher priority)
      expect(safetyIndex).toBeGreaterThan(roleIndex);
    });
  });
});
