import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, "src/cli.ts"),
			formats: ["es"],
			fileName: () => "cli.mjs",
		},
		rollupOptions: {
			external: [
				"node:fs",
				"node:path",
				"commander",
				"glob",
				"gradient-string",
				"inquirer",
				"ora",
				"picocolors",
				"magic-helix-core",
			],
		},
		outDir: "dist",
		sourcemap: true,
	},
});
