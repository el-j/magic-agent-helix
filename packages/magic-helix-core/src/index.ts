// Core exports for MagicAgentHelix

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export { analyzeProjectTags, type ProjectAnalysisData } from './analysis';
export { BUILT_IN_CONFIG } from './built-in-config';
export { loadUserConfig, mergeConfigs } from './config-merger';
export {
  refineInstructions,
  estimateTokens,
  DEFAULT_AI_REFINEMENT,
} from './ai-refinement';
export {
  type AssistantTarget,
  getFormatter,
  type InstructionFormatter,
} from './browser';
export {
  generateInstructions,
  loadPatternTemplates,
  selectPatterns,
  combinePatterns,
  type PatternContext,
  type PatternTemplate,
} from './pattern-combiner';
export {
  validateInstructions,
  formatValidationReport,
  passesQualityThreshold,
  getQualityGrade,
  type InstructionQuality,
  INSTRUCTION_ELEMENTS,
} from './instruction-validator';
// Plugin-based Analysis
export {
  analyzeWithPlugins,
  type PluginAnalysisResult,
  registerBuiltInPlugins,
} from './plugin-analyzer';

// Plugin System (v2.0.0)
export {
  type DetectionContext,
  type DetectionPlugin,
  type DetectionResult,
  type InstructionTemplate,
  PluginRegistry as PluginRegistryOld,
  pluginRegistry,
} from './plugin-system';

// Built-in Plugins
export {
  CodeOwnersPlugin,
  DockerPlugin,
  GitHubActionsPlugin,
  GitLabCIPlugin,
  GolangPlugin,
  MonorepoPlugin,
  PHPPlugin,
  PythonPlugin,
  RustPlugin,
} from './plugins';

// New Plugin System (v3.0.0 - Phase 1)
export {
  PluginLoader,
  type PluginLoadResult,
  type PluginLoadError,
} from './plugin-loader';
export {
  PluginRegistry,
  getRegistry,
  initializeRegistry,
} from './plugin-registry';
export { TemplateLoader } from './template-loader';

// Meta-Instruction System (Phase 4)
export {
  loadMetaConfig,
  loadOverrideInstructions,
  applyOverrides,
  applyCombiner,
  applyMetaInstructions,
  hasMetaInstructions,
  initMetaInstructions,
  type MetaInstructionOverride,
  type MetaInstructionCombiner,
  type MetaInstructionConfig,
} from './meta-instructions';

export * from './types';

// Telemetry (Phase 6)
export { createTelemetry, TelemetryClient } from './telemetry';
export type {
  TelemetryEventType,
  TelemetryEvent,
  TelemetryOptions,
  InstructionValidationEvent,
  PatternSelectionEvent,
  CliExecutionEvent,
  SummaryEvent,
} from './telemetry';

// A/B Testing (Phase 6)
export {
  generateABVariants,
  analyzeBestVariant,
  trackABTest,
} from './ab-testing';
export type { ABVariant, ABTestResult } from './ab-testing';
