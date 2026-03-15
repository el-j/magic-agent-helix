// Core exports for MagicAgentHelix

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export type { ABTestResult, ABVariant } from './ab-testing';
// A/B Testing (Phase 6)
export {
  analyzeBestVariant,
  generateABVariants,
  trackABTest,
} from './ab-testing';
export {
  DEFAULT_AI_REFINEMENT,
  estimateTokens,
  refineInstructions,
} from './ai-refinement';
export { analyzeProjectTags, type ProjectAnalysisData } from './analysis';
export {
  type AssistantTarget,
  getFormatter,
  type InstructionFormatter,
} from './browser';
export { BUILT_IN_CONFIG } from './built-in-config';
export { loadUserConfig, mergeConfigs } from './config-merger';
export {
  formatValidationReport,
  getQualityGrade,
  INSTRUCTION_ELEMENTS,
  type InstructionQuality,
  passesQualityThreshold,
  validateInstructions,
} from './instruction-validator';
// Meta-Instruction System (Phase 4)
export {
  applyCombiner,
  applyMetaInstructions,
  applyOverrides,
  hasMetaInstructions,
  initMetaInstructions,
  loadMetaConfig,
  loadOverrideInstructions,
  type MetaInstructionCombiner,
  type MetaInstructionConfig,
  type MetaInstructionOverride,
} from './meta-instructions';
export {
  combinePatterns,
  generateInstructions,
  loadPatternTemplates,
  type PatternContext,
  type PatternTemplate,
  selectPatterns,
} from './pattern-combiner';
// Plugin-based Analysis
export {
  analyzeWithPlugins,
  type PluginAnalysisResult,
  registerBuiltInPlugins,
} from './plugin-analyzer';
// New Plugin System (v3.0.0 - Phase 1)
export {
  type PluginLoadError,
  PluginLoader,
  type PluginLoadResult,
} from './plugin-loader';
export {
  getRegistry,
  initializeRegistry,
  PluginRegistry,
} from './plugin-registry';
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
export type {
  CliExecutionEvent,
  InstructionValidationEvent,
  PatternSelectionEvent,
  SummaryEvent,
  TelemetryEvent,
  TelemetryEventType,
  TelemetryOptions,
} from './telemetry';
// Telemetry (Phase 6)
export { createTelemetry, TelemetryClient } from './telemetry';
export { TemplateLoader } from './template-loader';
export * from './types';
