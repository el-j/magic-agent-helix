import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, "src/index.ts"),
			name: "MagicHelixCore",
			formats: ["es", "cjs"],
			fileName: (format) => `index.${format === "es" ? "mjs" : "cjs"}`,
		},
		rollupOptions: {
			// Externalize dependencies
			external: [
				"node:fs",
				"node:path",
				"node:url",
				"commander",
				"glob",
				"gradient-string",
				"inquirer",
				"ora",
				"picocolors",
			],
			output: {
				preserveModules: false,
			},
		},
		outDir: "dist",
		emptyOutDir: false, // Don't delete templates folder
		sourcemap: true,
	},
});
