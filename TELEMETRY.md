# Telemetry & A/B Testing

Magic Helix includes an **opt-in telemetry system** for tracking instruction quality metrics and an **A/B testing framework** for optimizing pattern template configurations.

## Table of Contents
- [Telemetry System](#telemetry-system)
  - [Environment Variables](#environment-variables)
  - [Event Types](#event-types)
  - [Storage Format](#storage-format)
  - [Programmatic Usage](#programmatic-usage)
- [A/B Testing Framework](#ab-testing-framework)
  - [Variant Generation](#variant-generation)
  - [Best Variant Analysis](#best-variant-analysis)
  - [Integration with Telemetry](#integration-with-telemetry)
  - [Example Workflow](#example-workflow)

---

## Telemetry System

The telemetry system collects anonymous usage data and instruction quality metrics to help improve the platform. **It is disabled by default** and requires explicit opt-in via environment variables.

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MAGIC_HELIX_TELEMETRY` | Set to `1` to enable telemetry | `0` (disabled) |
| `MAGIC_HELIX_TELEMETRY_DIR` | Directory for event log storage | `.magic-helix/telemetry` |
| `MAGIC_HELIX_SESSION_ID` | Unique session identifier | `{timestamp}` |
| `MAGIC_HELIX_VARIANT` | A/B test variant label | `default` |

**Example:**
```bash
export MAGIC_HELIX_TELEMETRY=1
export MAGIC_HELIX_SESSION_ID="user-123-session-456"
export MAGIC_HELIX_VARIANT="experiment-tailwind"
magic-helix validate --project /path/to/project
```

### Event Types

#### `instruction_validation`
Tracks instruction quality validation results.

**Fields:**
- `file: string` - File path or identifier
- `score: number` - Overall quality score (0-100)
- `structureScore: number` - Structure element score
- `clarityScore: number` - Clarity element score
- `completenessScore: number` - Completeness element score
- `missingCount: number` - Number of missing required elements

**Example:**
```json
{
  "type": "instruction_validation",
  "file": "INSTRUCTIONS.md",
  "score": 87.5,
  "structureScore": 90,
  "clarityScore": 85,
  "completenessScore": 88,
  "missingCount": 2,
  "timestamp": "2025-01-15T12:34:56.789Z",
  "sessionId": "user-123-session-456",
  "variant": "experiment-tailwind",
  "projectRoot": "/path/to/project"
}
```

#### `pattern_selection`
Tracks which pattern templates were selected for a project.

**Fields:**
- `selected: string[]` - Array of selected pattern template names
- `excluded?: string[]` - Array of excluded template names
- `context?: Record<string, unknown>` - Pattern context metadata

**Example:**
```json
{
  "type": "pattern_selection",
  "selected": ["react-core", "react-zustand", "lang-typescript", "test-vitest"],
  "excluded": ["vue-core"],
  "context": { "framework": "react", "libraries": ["zustand", "vitest"] },
  "timestamp": "2025-01-15T12:34:56.789Z",
  "sessionId": "user-123-session-456",
  "variant": "default"
}
```

#### `cli_execution`
Tracks CLI command execution.

**Fields:**
- `command: string` - CLI command name
- `args?: string[]` - Command arguments
- `success?: boolean` - Execution success status

**Example:**
```json
{
  "type": "cli_execution",
  "command": "validate",
  "args": ["--project", "/path/to/project", "--quiet"],
  "success": true,
  "timestamp": "2025-01-15T12:34:56.789Z",
  "sessionId": "user-123-session-456"
}
```

#### `summary`
Tracks aggregate validation results.

**Fields:**
- `files: number` - Total files validated
- `pass: number` - Files passing quality threshold
- `fail: number` - Files failing quality threshold
- `averageScore: number` - Average quality score

**Example:**
```json
{
  "type": "summary",
  "files": 10,
  "pass": 8,
  "fail": 2,
  "averageScore": 85.3,
  "timestamp": "2025-01-15T12:34:56.789Z",
  "sessionId": "user-123-session-456"
}
```

### Storage Format

Events are stored in **JSONL (JSON Lines)** format - one JSON object per line - in the configured telemetry directory:

```
.magic-helix/telemetry/events.jsonl
```

**Example file contents:**
```jsonl
{"type":"instruction_validation","file":"INSTRUCTIONS.md","score":87.5,"structureScore":90,"clarityScore":85,"completenessScore":88,"missingCount":2,"timestamp":"2025-01-15T12:34:56.789Z","sessionId":"user-123","variant":"A"}
{"type":"instruction_validation","file":"README.md","score":92.1,"structureScore":95,"clarityScore":90,"completenessScore":91,"missingCount":1,"timestamp":"2025-01-15T12:34:57.123Z","sessionId":"user-123","variant":"A"}
{"type":"summary","files":2,"pass":2,"fail":0,"averageScore":89.8,"timestamp":"2025-01-15T12:34:57.456Z","sessionId":"user-123","variant":"A"}
```

### Programmatic Usage

```typescript
import { createTelemetry } from '@magic-helix/core';

// Create telemetry client (respects environment variables)
const telemetry = createTelemetry({
  enabled: true,
  dir: '.custom-telemetry',
  sessionId: 'my-session',
  variant: 'experiment-A',
  projectRoot: process.cwd(),
});

// Track instruction validation
telemetry.track({
  type: 'instruction_validation',
  file: 'INSTRUCTIONS.md',
  score: 87.5,
  structureScore: 90,
  clarityScore: 85,
  completenessScore: 88,
  missingCount: 2,
});

// Track pattern selection
telemetry.track({
  type: 'pattern_selection',
  selected: ['react-core', 'lang-typescript'],
  context: { framework: 'react' },
});

// Track CLI execution
telemetry.track({
  type: 'cli_execution',
  command: 'validate',
  args: ['--quiet'],
  success: true,
});

// Track summary
telemetry.track({
  type: 'summary',
  files: 5,
  pass: 4,
  fail: 1,
  averageScore: 82.3,
});

// Check if telemetry is enabled
if (telemetry.isEnabled()) {
  console.log('Telemetry is active');
}
```

---

## A/B Testing Framework

The A/B testing framework allows you to **compare multiple pattern template configurations** and identify the highest-quality instruction generation approach.

### Variant Generation

Generate instructions for multiple pattern contexts and evaluate their quality scores:

```typescript
import { generateABVariants, type ABVariant } from '@magic-helix/core';

const variants: ABVariant[] = [
  {
    name: 'react-tailwind',
    context: { framework: 'react', libraries: ['tailwind', 'vitest'] },
    description: 'React with Tailwind CSS and Vitest',
  },
  {
    name: 'react-sass',
    context: { framework: 'react', libraries: ['sass', 'jest'] },
    description: 'React with Sass and Jest',
  },
  {
    name: 'vue-pinia',
    context: { framework: 'vue', libraries: ['pinia', 'vitest'] },
    description: 'Vue with Pinia state management',
  },
];

const results = generateABVariants(variants);

// Each result contains:
// - variant: string (name)
// - instructions: string (generated content)
// - score: number (0-100)
// - structureScore: number
// - clarityScore: number
// - completenessScore: number
// - missingCount: number

console.log(results);
// [
//   { variant: 'react-tailwind', instructions: '...', score: 92.5, ... },
//   { variant: 'react-sass', instructions: '...', score: 88.3, ... },
//   { variant: 'vue-pinia', instructions: '...', score: 95.1, ... },
// ]
```

### Best Variant Analysis

Identify the highest-scoring variant:

```typescript
import { analyzeBestVariant } from '@magic-helix/core';

const best = analyzeBestVariant(results);

console.log(`Best variant: ${best.variant}`);
console.log(`Score: ${best.score}`);
console.log(`Instructions:\n${best.instructions}`);

// Output:
// Best variant: vue-pinia
// Score: 95.1
// Instructions:
// # Vue Application Instructions
// ...
```

### Integration with Telemetry

Track A/B test results to telemetry for long-term analysis:

```typescript
import { generateABVariants, trackABTest, createTelemetry } from '@magic-helix/core';

const telemetry = createTelemetry({
  enabled: true,
  sessionId: 'ab-test-001',
  variant: 'control', // Default variant label
});

const variants = [
  { name: 'A', context: { framework: 'react', libraries: ['tailwind'] } },
  { name: 'B', context: { framework: 'react', libraries: ['sass'] } },
];

const results = generateABVariants(variants);

// Track all variant results (each as an instruction_validation event)
trackABTest(results, telemetry);

// Telemetry will log events with variant-specific labels:
// { type: 'instruction_validation', variant: 'A', score: 87.5, ... }
// { type: 'instruction_validation', variant: 'B', score: 92.1, ... }
```

**Event override:** Each variant result gets its own `variant` label in the telemetry event, overriding the client's default variant setting. This allows you to track multiple experiments in the same session.

### Example Workflow

Complete A/B testing pipeline with analysis and tracking:

```typescript
import {
  generateABVariants,
  analyzeBestVariant,
  trackABTest,
  createTelemetry,
  type ABVariant,
} from '@magic-helix/core';

// 1. Define test variants
const variants: ABVariant[] = [
  {
    name: 'minimal',
    context: { framework: 'react' },
    description: 'Minimal React setup',
  },
  {
    name: 'standard',
    context: { framework: 'react', libraries: ['tailwind', 'vitest'] },
    description: 'Standard React with Tailwind + Vitest',
  },
  {
    name: 'full-stack',
    context: {
      framework: 'react',
      libraries: ['tailwind', 'vitest', 'zustand', 'react-query'],
    },
    description: 'Full-stack React with state management and data fetching',
  },
];

// 2. Generate instructions for all variants
console.log('Generating instructions for', variants.length, 'variants...');
const results = generateABVariants(variants);

// 3. Display results
console.log('\n=== Variant Results ===');
results.forEach((r) => {
  console.log(`${r.variant}: ${r.score.toFixed(1)} (structure: ${r.structureScore}, clarity: ${r.clarityScore}, completeness: ${r.completenessScore}, missing: ${r.missingCount})`);
});

// 4. Find best variant
const best = analyzeBestVariant(results);
console.log(`\n🏆 Best variant: ${best.variant} (score: ${best.score.toFixed(1)})`);

// 5. Track results to telemetry
const telemetry = createTelemetry({
  enabled: process.env.MAGIC_HELIX_TELEMETRY === '1',
  sessionId: `ab-test-${Date.now()}`,
});

if (telemetry.isEnabled()) {
  trackABTest(results, telemetry);
  console.log('✅ Results tracked to telemetry');
}

// 6. Output best instructions
console.log('\n=== Best Instructions ===');
console.log(best.instructions);
```

**Example output:**
```
Generating instructions for 3 variants...

=== Variant Results ===
minimal: 78.5 (structure: 80, clarity: 75, completeness: 80, missing: 3)
standard: 92.3 (structure: 95, clarity: 90, completeness: 92, missing: 1)
full-stack: 88.7 (structure: 90, clarity: 85, completeness: 90, missing: 2)

🏆 Best variant: standard (score: 92.3)
✅ Results tracked to telemetry

=== Best Instructions ===
# React Application Instructions
...
```

---

## Privacy & Data Retention

- **Opt-in only:** Telemetry is disabled by default and requires `MAGIC_HELIX_TELEMETRY=1`.
- **Anonymous:** Session IDs and variant labels are user-controlled identifiers.
- **Local storage:** Events are stored locally in `.magic-helix/telemetry/` by default.
- **No external transmission:** The telemetry system does **not** send data to external servers.
- **User control:** You can delete event logs at any time by removing the telemetry directory.

## Analysis Tools

Parse JSONL event logs for analysis:

```typescript
import { readFileSync } from 'node:fs';

const eventsFile = '.magic-helix/telemetry/events.jsonl';
const events = readFileSync(eventsFile, 'utf-8')
  .trim()
  .split('\n')
  .map(line => JSON.parse(line));

// Filter by event type
const validations = events.filter(e => e.type === 'instruction_validation');

// Calculate average score by variant
const scoresByVariant = validations.reduce((acc, e) => {
  if (!acc[e.variant]) acc[e.variant] = [];
  acc[e.variant].push(e.score);
  return acc;
}, {} as Record<string, number[]>);

Object.entries(scoresByVariant).forEach(([variant, scores]) => {
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  console.log(`${variant}: ${avg.toFixed(1)} (n=${scores.length})`);
});
```

---

## CLI Integration

The `validate` command automatically tracks telemetry events when enabled:

```bash
# Enable telemetry and run validation
export MAGIC_HELIX_TELEMETRY=1
export MAGIC_HELIX_SESSION_ID="experiment-001"
export MAGIC_HELIX_VARIANT="tailwind-setup"

magic-helix validate --project /path/to/project

# Events logged:
# - instruction_validation (per file)
# - summary (aggregate results)
```

**No output change:** Telemetry runs silently in the background. CLI output remains unchanged.

---

## Configuration Best Practices

1. **Use meaningful session IDs:** Include user ID, experiment name, or timestamp for easier analysis.
2. **Label variants descriptively:** Use names like `react-tailwind`, `vue-pinia`, `minimal-setup` instead of `A`, `B`, `C`.
3. **Track A/B tests separately:** Use unique session IDs for each A/B test run.
4. **Clean up old data:** Regularly review and archive telemetry logs to prevent disk usage growth.
5. **Respect user privacy:** If distributing applications using Magic Helix, ensure users are informed about telemetry and can opt out.

---

## Troubleshooting

**Telemetry not writing events:**
- Verify `MAGIC_HELIX_TELEMETRY=1` is set.
- Check directory permissions for `.magic-helix/telemetry/`.
- Ensure `createTelemetry({ enabled: true })` is called.

**A/B test variants all score the same:**
- Verify pattern template differences are significant.
- Check that the `context` objects contain distinct framework/library combinations.
- Review pattern combiner rules to ensure they select different templates.

**JSONL file grows too large:**
- Rotate logs by moving old files to archive directories.
- Use analysis scripts to extract insights, then delete raw events.
- Consider setting up log rotation with system tools (e.g., `logrotate`).

---

For more information:
- [Pattern Templates Documentation](./PATTERN-TEMPLATES.md)
- [Instruction Validation Guide](./INSTRUCTION-VALIDATION.md)
- [CLI Reference](./README.md#cli)
