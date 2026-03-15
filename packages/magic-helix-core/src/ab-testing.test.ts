import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { ABVariant } from './ab-testing';
import {
  analyzeBestVariant,
  generateABVariants,
  trackABTest,
} from './ab-testing';
import { createTelemetry } from './telemetry';

describe('ab-testing', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'ab-test-'));
  });

  afterEach(() => {
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('should generate variants with different pattern contexts', () => {
    const variants: ABVariant[] = [
      {
        name: 'react-tailwind',
        context: { framework: 'react', libraries: ['tailwind'] },
        description: 'React with Tailwind CSS',
      },
      {
        name: 'vue-sass',
        context: { framework: 'vue', libraries: ['sass'] },
        description: 'Vue with Sass',
      },
    ];

    const results = generateABVariants(variants);

    expect(results).toHaveLength(2);
    expect(results[0].variant).toBe('react-tailwind');
    expect(results[1].variant).toBe('vue-sass');
    expect(results[0].instructions).toBeTruthy();
    expect(results[1].instructions).toBeTruthy();
    expect(typeof results[0].score).toBe('number');
    expect(typeof results[1].score).toBe('number');
    expect(typeof results[0].structureScore).toBe('number');
    expect(typeof results[0].clarityScore).toBe('number');
    expect(typeof results[0].completenessScore).toBe('number');
    expect(typeof results[0].missingCount).toBe('number');
  });

  it('should analyze and return the best variant', () => {
    const variants: ABVariant[] = [
      { name: 'A', context: { framework: 'react' } },
      { name: 'B', context: { framework: 'vue' } },
      {
        name: 'C',
        context: { framework: 'react', libraries: ['tailwind', 'vitest'] },
      },
    ];

    const results = generateABVariants(variants);
    const best = analyzeBestVariant(results);

    expect(best).toBeDefined();
    expect(best.variant).toBeTruthy();
    expect(best.score).toBeGreaterThanOrEqual(0);
    // Verify best has highest score
    const maxScore = Math.max(...results.map((r) => r.score));
    expect(best.score).toBe(maxScore);
  });

  it('should track AB test results to telemetry when enabled', () => {
    const telemetry = createTelemetry({
      enabled: true,
      dir: tempDir,
      sessionId: 'test-ab',
      variant: 'control',
    });

    const variants: ABVariant[] = [
      { name: 'A', context: { framework: 'react' } },
      { name: 'B', context: { framework: 'vue' } },
    ];

    const results = generateABVariants(variants);
    trackABTest(results, telemetry);

    const eventsFile = join(tempDir, 'events.jsonl');
    expect(existsSync(eventsFile)).toBe(true);

    const events = readFileSync(eventsFile, 'utf-8')
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line));

    expect(events.length).toBe(2);
    expect(events[0].type).toBe('instruction_validation');
    expect(events[0].variant).toBe('A');
    expect(events[1].variant).toBe('B');
    expect(events[0].sessionId).toBe('test-ab');
    expect(events[1].sessionId).toBe('test-ab');
  });

  it('should not track AB test results when telemetry disabled', () => {
    const telemetry = createTelemetry({
      enabled: false,
      dir: tempDir,
    });

    const variants: ABVariant[] = [
      { name: 'A', context: { framework: 'react' } },
    ];

    const results = generateABVariants(variants);
    trackABTest(results, telemetry);

    const eventsFile = join(tempDir, 'events.jsonl');
    expect(existsSync(eventsFile)).toBe(false);
  });

  it('should handle empty variants array', () => {
    const results = generateABVariants([]);
    expect(results).toEqual([]);

    const best = analyzeBestVariant([]);
    expect(best.variant).toBe('');
    expect(best.score).toBe(0);
  });
});
