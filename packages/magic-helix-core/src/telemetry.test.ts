import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { TelemetryClient, createTelemetry } from './telemetry';

describe('telemetry', () => {
  it('should not write when disabled', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mh-telemetry-'));
    const client = createTelemetry({ enabled: false, dir: tmp });
    client.track({
      type: 'summary',
      files: 1,
      pass: 1,
      fail: 0,
      averageScore: 100,
    });
    const file = path.join(tmp, 'events.jsonl');
    expect(fs.existsSync(file)).toBe(false);
  });

  it('should append events as JSONL when enabled', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mh-telemetry-'));
    const client = createTelemetry({
      enabled: true,
      dir: tmp,
      sessionId: 'test-session',
      variant: 'A',
    });
    client.track({
      type: 'cli_execution',
      command: 'validate',
      args: ['--quiet'],
      success: true,
    });
    client.track({
      type: 'summary',
      files: 2,
      pass: 2,
      fail: 0,
      averageScore: 90,
    });
    const file = path.join(tmp, 'events.jsonl');
    expect(fs.existsSync(file)).toBe(true);
    const lines = fs.readFileSync(file, 'utf-8').trim().split('\n');
    expect(lines.length).toBe(2);
    const first = lines[0];
    expect(first).toBeTruthy();
    const evt = JSON.parse(first || '{}');
    expect(evt.type).toBe('cli_execution');
    expect(evt.sessionId).toBe('test-session');
    expect(evt.variant).toBe('A');
  });
});
