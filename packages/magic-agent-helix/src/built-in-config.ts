import type { MergedConfig } from "./types";

/**
 * This is the "brain" of the tool.
 * It contains all the pre-configured rules for common frameworks and tools.
 * This configuration is used automatically, so the user doesn't have to
 * create a config file for basic projects.
 */
export const BUILT_IN_CONFIG: MergedConfig = {
	target: "github-copilot",
	templateDirectory: "ai_templates", // User's custom template dir
	outputDirectory: ".github/instructions", // Default output dir

	dependencyTagMap: {
		// Frameworks
		vue: "framework-vue",
		react: "framework-react",
		"@angular/core": "framework-angular",
		"@nestjs/core": "framework-nestjs",

		// Styling
		tailwindcss: "style-tailwind",
		primevue: "style-primevue",
		"@mui/material": "style-mui",
		quasar: "style-quasar",

		// Testing
		vitest: "test-vitest",
		jest: "test-jest",
		cypress: "test-cypress",
		playwright: "test-playwright",

		// State
		rxjs: "state-rxjs",
		pinia: "state-pinia",
		redux: "state-redux",
		zustand: "state-zustand",
	},

	configFileTagMap: {
		// Detect key configs
		"tailwind.config.js": "style-tailwind",
		"tailwind.config.ts": "style-tailwind",
		"vite.config.ts": "build-vite",
		"vite.config.js": "build-vite",
		"tsconfig.json": "lang-typescript",
	},

	fileGlobTagMap: {
		// Detect file types
		"src/**/*.vue": "framework-vue",
		"src/**/*.tsx": "framework-react",
		"src/**/*.go": "lang-go",
		"src/**/*.py": "lang-python",
	},

	tagTemplateMap: {
		// Vue Projects
		"framework-vue": [{ template: "vue/vue-core.md", suffix: "vue-core.md" }],
		"state-pinia": [{ template: "vue/vue-pinia.md", suffix: "vue-pinia.md" }],
		"style-primevue": [
			{ template: "vue/style-primevue.md", suffix: "vue-style-primevue.md" },
		],

		// React Projects
		"framework-react": [
			{ template: "react/react-core.md", suffix: "react-core.md" },
		],
		"state-zustand": [
			{ template: "react/react-zustand.md", suffix: "react-zustand.md" },
		],

		// NestJS Projects
		"framework-nestjs": [
			{ template: "nestjs/nestjs-core.md", suffix: "nestjs-core.md" },
		],

		// Generic
		"style-tailwind": [
			{ template: "generic/style-tailwind.md", suffix: "style-tailwind.md" },
		],
		"test-vitest": [
			{ template: "generic/test-vitest.md", suffix: "test-vitest.md" },
		],
		"lang-typescript": [
			{ template: "generic/lang-typescript.md", suffix: "lang-typescript.md" },
		],
		"state-rxjs": [
			{ template: "generic/state-rxjs.md", suffix: "state-rxjs.md" },
		],
	},
};
