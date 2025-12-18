import { validateInstructions } from './instruction-validator';
import type { PatternContext } from './pattern-combiner';
import {
  generateInstructions,
} from './pattern-combiner';
import type { InstructionValidationEvent, TelemetryClient } from './telemetry';

export interface ABVariant {
  name: string;
  context: PatternContext;
  description?: string;
}

export interface ABTestResult {
  variant: string;
  instructions: string;
  score: number;
  structureScore: number;
  clarityScore: number;
  completenessScore: number;
  missingCount: number;
}

/**
 * Generate instructions for multiple A/B test variants
 */
export function generateABVariants(variants: ABVariant[]): ABTestResult[] {
  return variants.map((v) => {
    const instructions = generateInstructions(v.context);
    const quality = validateInstructions(instructions);
    return {
      variant: v.name,
      instructions,
      score: quality.overallScore,
      structureScore: quality.structureScore,
      clarityScore: quality.clarityScore,
      completenessScore: quality.completenessScore,
      missingCount: quality.missingElements.length,
    };
  });
}

/**
 * Compare AB test results and return best variant
 */
export function analyzeBestVariant(results: ABTestResult[]): ABTestResult {
  if (results.length === 0) {
    return {
      variant: '',
      instructions: '',
      score: 0,
      structureScore: 0,
      clarityScore: 0,
      completenessScore: 0,
      missingCount: 0,
    };
  }
  return results.reduce(
    (best, r) => (r.score > best.score ? r : best),
    results[0],
  );
}

/**
 * Track A/B test results via telemetry (optional)
 */
export function trackABTest(
  results: ABTestResult[],
  telemetry?: TelemetryClient,
) {
  if (!telemetry?.isEnabled()) return;
  for (const r of results) {
    const event: Omit<
      InstructionValidationEvent,
      'timestamp' | 'sessionId' | 'projectRoot'
    > = {
      type: 'instruction_validation',
      file: `ab-test-variant-${r.variant}`,
      score: r.score,
      structureScore: r.structureScore,
      clarityScore: r.clarityScore,
      completenessScore: r.completenessScore,
      missingCount: r.missingCount,
      variant: r.variant,
    };
    telemetry.track(event);
  }
}
