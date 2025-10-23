import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [vue(), tailwindcss()],
	// Base path for GitHub Pages deployment
	base: process.env.NODE_ENV === "production" ? "/magic-agent-helix/" : "/",
	resolve: {
		alias: {
			"magic-helix-core": path.resolve(__dirname, "../packages/magic-helix-core/src/browser.ts"),
		},
	},
	build: {
		// Relative to the root of the package
		outDir: "dist",
	},
});
