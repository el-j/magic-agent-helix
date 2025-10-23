// Core exports for MagicAgentHelix
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export * from "./types";
export { BUILT_IN_CONFIG } from "./built-in-config";
export { mergeConfigs, loadUserConfig } from "./config-merger";
export { analyzeProjectTags, type ProjectAnalysisData } from "./analysis";

// Export the path to the built-in templates directory
export const BUILT_IN_TEMPLATE_DIR = resolve(__dirname, "default_templates");
