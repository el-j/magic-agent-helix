/**
 * Shared CLI options and types
 */

export interface CliOptions {
  dryRun?: boolean;
  force?: boolean;
  skipPruning?: boolean;
  outputDir?: string;
  config?: string;
  target?: 'github-copilot' | 'claude' | 'copilot-chat' | 'generic';
  verbose?: boolean;
  quiet?: boolean;
  project?: string;
  wizard?: boolean;
  template?: string;
  exclude?: string;
}

/**
 * Log level based on options
 */
export function getLogLevel(
  options: CliOptions,
): 'verbose' | 'normal' | 'quiet' {
  if (options.quiet) return 'quiet';
  if (options.verbose) return 'verbose';
  return 'normal';
}

/**
 * Should we log this message at this level?
 */
export function shouldLog(
  messageLevel: 'verbose' | 'normal' | 'error',
  logLevel: 'verbose' | 'normal' | 'quiet',
): boolean {
  if (logLevel === 'quiet' && messageLevel !== 'error') return false;
  if (logLevel === 'normal' && messageLevel === 'verbose') return false;
  return true;
}
