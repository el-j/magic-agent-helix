import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	test: {
		// Look for tests in *all* packages
		include: ["packages/**/*.test.ts", "packages/**/*.spec.ts"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			reportsDirectory: "./coverage",
			// Target only the CLI for coverage, not the VSCode plugin wrapper
			include: ["packages/magic-agent-helix/src/**/*.ts"],
			exclude: ["packages/vscode-magic-helix/**"],
		},
		globals: true,
		// Use Node.js environment for proper module resolution
		environment: "node",
		pool: "forks",
	},
	resolve: {
		alias: {
			// Explicitly resolve glob to its ESM build
			glob: path.resolve(__dirname, "node_modules/glob/dist/esm/index.js"),
		},
	},
});
