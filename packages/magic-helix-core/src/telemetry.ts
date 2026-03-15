import fs from 'node:fs';
import path from 'node:path';

/**
 * Telemetry system for MagicAgentHelix.
 *
 * **Telemetry is disabled by default and requires explicit opt-in.**
 *
 * To enable, set the environment variable:
 *   `MAGIC_HELIX_TELEMETRY=1`
 *
 * When enabled, anonymized usage metrics (command names, validator scores,
 * file counts) are written as JSONL to `.magic-helix/telemetry/events.jsonl`
 * in the current working directory. No file content, source code, or personal
 * information is ever collected.
 *
 * To disable: unset `MAGIC_HELIX_TELEMETRY` or set it to any value other
 * than `1`. You can also delete `.magic-helix/telemetry/` at any time.
 */

export type TelemetryEventType =
  | 'instruction_validation'
  | 'pattern_selection'
  | 'cli_execution'
  | 'summary';

export interface TelemetryBaseEvent<
  T extends TelemetryEventType = TelemetryEventType,
> {
  type: T;
  timestamp: string; // ISO
  sessionId?: string;
  variant?: string; // A/B variant label
  projectRoot?: string;
}

export interface InstructionValidationEvent
  extends TelemetryBaseEvent<'instruction_validation'> {
  file: string;
  score: number;
  structureScore: number;
  clarityScore: number;
  completenessScore: number;
  missingCount: number;
}

export interface PatternSelectionEvent
  extends TelemetryBaseEvent<'pattern_selection'> {
  selected: string[];
  excluded?: string[];
  context?: Record<string, unknown>;
}

export interface CliExecutionEvent extends TelemetryBaseEvent<'cli_execution'> {
  command: string;
  args?: string[];
  success?: boolean;
}

export interface SummaryEvent extends TelemetryBaseEvent<'summary'> {
  files: number;
  pass: number;
  fail: number;
  averageScore: number;
}

export type TelemetryEvent =
  | InstructionValidationEvent
  | PatternSelectionEvent
  | CliExecutionEvent
  | SummaryEvent;

export interface TelemetryOptions {
  enabled?: boolean;
  dir?: string; // where to store JSONL
  sessionId?: string;
  variant?: string;
  projectRoot?: string;
}

export class TelemetryClient {
  private filePath: string;
  private enabled: boolean;
  private sessionId?: string;
  private variant?: string;
  private projectRoot?: string;

  constructor(options: TelemetryOptions = {}) {
    this.enabled = Boolean(options.enabled);
    const dir =
      options.dir || path.resolve(process.cwd(), '.magic-helix/telemetry');
    this.filePath = path.join(dir, 'events.jsonl');
    this.sessionId = options.sessionId;
    this.variant = options.variant;
    this.projectRoot = options.projectRoot;

    if (this.enabled) {
      fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    }
  }

  public isEnabled() {
    return this.enabled;
  }

  public track(
    event: Omit<
      TelemetryEvent,
      'timestamp' | 'sessionId' | 'variant' | 'projectRoot'
    >,
  ) {
    if (!this.enabled) return;
    const enriched: TelemetryEvent = {
      ...event,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      projectRoot: this.projectRoot,
    } as TelemetryEvent;
    // Override variant if provided in event
    if ('variant' in event && event.variant) {
      (enriched as { variant?: string }).variant = event.variant as string;
    } else {
      (enriched as { variant?: string }).variant = this.variant;
    }
    const line = `${JSON.stringify(enriched)}\n`;
    fs.appendFileSync(this.filePath, line, 'utf-8');
  }
}

export function createTelemetry(options: TelemetryOptions = {}) {
  // Env fallbacks
  const enabled = options.enabled ?? process.env.MAGIC_HELIX_TELEMETRY === '1';
  const dir = options.dir || process.env.MAGIC_HELIX_TELEMETRY_DIR;
  const sessionId =
    options.sessionId || process.env.MAGIC_HELIX_SESSION_ID || `${Date.now()}`;
  const variant =
    options.variant || process.env.MAGIC_HELIX_VARIANT || 'default';
  const projectRoot = options.projectRoot || process.cwd();
  return new TelemetryClient({ enabled, dir, sessionId, variant, projectRoot });
}
