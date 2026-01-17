import { resolve } from "node:path";
import { defineConfig } from "vite";

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
				"node:url",
				"commander",
				"glob",
				"gradient-string",
				"inquirer",
				"ora",
				"picocolors",
				"@el-j/magic-helix-core",
			],
		},
		outDir: "dist",
		sourcemap: true,
	},
});
