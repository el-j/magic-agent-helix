import * as fs from "node:fs";
import type * as path from "node:path";
import { glob } from "glob";
import inquirer from "inquirer";
import {
	BUILT_IN_CONFIG,
	getFormatter,
	loadUserConfig,
	mergeConfigs,
} from "magic-helix-core";
import ora from "ora";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { refresh } from "./refresh";

// Mock all external dependencies
vi.mock("node:fs", () => ({
	existsSync: vi.fn(),
	readFileSync: vi.fn(),
	writeFileSync: vi.fn(),
	readdirSync: vi.fn(),
	mkdirSync: vi.fn(),
	unlinkSync: vi.fn(),
}));
vi.mock("node:path", async () => {
	const actualPath = await vi.importActual<typeof path>("path");
	return {
		...actualPath,
		resolve: vi.fn((...args) => args.join("/")), // Simple join for test paths
		join: vi.fn((...args) => args.join("/")),
		dirname: vi.fn(actualPath.dirname),
	};
});
vi.mock("inquirer");
vi.mocked(inquirer.prompt).mockResolvedValue({ prune: true });
vi.mock("glob", () => ({
	glob: vi.fn(),
}));
vi.mock("ora");
vi.mock("picocolors", () => {
	const mockPc = {
		bold: vi.fn((str) => str),
		green: vi.fn((str) => str),
		red: vi.fn((str) => str),
		yellow: vi.fn((str) => str),
		cyan: vi.fn((str) => str),
		gray: vi.fn((str) => str),
		magenta: vi.fn((str) => str),
		blue: vi.fn((str) => str),
	};
	return {
		...mockPc,
		default: mockPc,
	};
});
vi.mock("gradient-string", () => {
	const mockGradient = {
		pastel: {
			multiline: vi.fn((str) => str),
		},
	};
	return {
		...mockGradient,
		default: mockGradient,
	};
});
vi.mock("magic-helix-core", () => ({
	loadUserConfig: vi.fn(),
	mergeConfigs: vi.fn(),
	getFormatter: vi.fn(),
	BUILT_IN_CONFIG: {
		dependencyTagMap: {},
		tagTemplateMap: {},
		configFileTagMap: {},
		fileGlobTagMap: {},
		target: "github-copilot",
		templateDirectory: "ai_templates",
		outputDirectory: ".github/instructions",
	},
}));

// Mock ora instance
const mockSpinner = {
	start: vi.fn().mockReturnThis(),
	stop: vi.fn().mockReturnThis(),
	succeed: vi.fn().mockReturnThis(),
	warn: vi.fn().mockReturnThis(),
	fail: vi.fn().mockReturnThis(),
	text: "",
};
(ora as Mock).mockReturnValue(mockSpinner);

// Mock console.log/warn
vi.spyOn(console, "log").mockImplementation(() => {});
vi.spyOn(console, "warn").mockImplementation(() => {});

describe("Refresh Command (/src/commands/refresh.ts)", () => {
	const mockMergedConfig = JSON.parse(JSON.stringify(BUILT_IN_CONFIG)); // Deep copy

	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(loadUserConfig).mockReturnValue({});
		vi.mocked(mergeConfigs).mockReturnValue(mockMergedConfig);
		vi.mocked(getFormatter).mockReturnValue({
			format: vi.fn((content) => content),
			getFileExtension: vi.fn(() => ".md"),
			getFrontmatter: vi.fn(() => '---\napplyTo: "test"\n---\n\n'),
		});
		vi.mocked(glob).mockImplementation(async (patterns: string | string[]) => {
			if (
				Array.isArray(patterns) &&
				patterns.some((p) => p.includes("packages/*/package.json"))
			) {
				return [
					"packages/app-vue/package.json",
					"packages/app-react/package.json",
				];
			}
			if (
				typeof patterns === "string" &&
				patterns.includes("src/**/*.{ts,js,vue,tsx,jsx,go,py}")
			) {
				return [
					"packages/app-vue/src/main.ts",
					"packages/app-react/src/index.js",
				];
			}
			return [];
		});

		// Mock file system for a simple monorepo
		(fs.existsSync as Mock).mockImplementation((p) => {
			const pathStr = p.toString();
			return (
				pathStr.endsWith("package.json") ||
				pathStr.includes(".github/instructions") ||
				pathStr.includes("ai_templates")
			);
		});

		(fs.readFileSync as Mock).mockImplementation((p) => {
			if (p === "./package.json") {
				return JSON.stringify({
					name: "root-project",
					workspaces: ["packages/*"],
				});
			}
			if (p === "packages/app-vue/package.json") {
				return JSON.stringify({
					name: "@scope/app-vue",
					dependencies: { vue: "3.0.0" },
				});
			}
			if (p === "packages/app-react/package.json") {
				return JSON.stringify({
					name: "@scope/app-react",
					dependencies: { react: "18.0.0", "my-custom-lib": "1.0.0" },
				});
			}
			if (p.toString().includes("default_templates/vue/vue-core.md")) {
				return "# Vue Core Rules";
			}
			if (p.toString().includes("default_templates/react/react-core.md")) {
				return "# React Core Rules";
			}
			return "{}";
		});

		(fs.readdirSync as Mock).mockImplementation((p) => {
			if (p === "./.github/instructions") {
				return ["scope-app-vue.vue-core.md", "scope-app-react.react-core.md"];
			}
			return [];
		});

		(fs.writeFileSync as Mock).mockImplementation(() => {});
		(fs.mkdirSync as Mock).mockImplementation(() => {});
		(fs.unlinkSync as Mock).mockImplementation(() => {});
	});

	it("should run successfully and update existing files", async () => {
		await expect(refresh()).resolves.not.toThrow();

		// 1. Config
		expect(vi.mocked(loadUserConfig)).toHaveBeenCalled();
		expect(vi.mocked(mergeConfigs)).toHaveBeenCalled();

		// 2. Find Projects
		expect(ora).toHaveBeenCalledWith("Loading configurations...");
	});

	it("should handle no existing instruction files", async () => {
		(fs.readdirSync as Mock).mockImplementation((p) => {
			if (p.toString().includes(".github/instructions")) {
				return []; // No existing files
			}
			return [];
		});

		await expect(refresh()).resolves.not.toThrow();

		// Should complete with 0 updated
		expect(console.log).toHaveBeenCalledWith(
			expect.stringContaining("Updated: 0 files"),
		);
	});

	it("should use custom templates if they exist", async () => {
		// Mock a custom config
		vi.mocked(loadUserConfig).mockReturnValue({
			dependencyTagMap: { "my-custom-lib": "domain-custom" },
			tagTemplateMap: {
				"domain-custom": [{ template: "my-rule.md", suffix: "my-rule.md" }],
			},
		});
		vi.mocked(mergeConfigs).mockImplementation((_userConfig) => {
			// A simple merge for this test
			const newConfig = JSON.parse(JSON.stringify(BUILT_IN_CONFIG));
			newConfig.dependencyTagMap["my-custom-lib"] = "domain-custom";
			newConfig.tagTemplateMap["domain-custom"] = [
				{ template: "my-rule.md", suffix: "my-rule.md" },
			];
			return newConfig;
		});

		// Mock reading the custom template
		(fs.readFileSync as Mock).mockImplementation((p) => {
			if (p === "./ai_templates/my-rule.md") {
				return "# My Custom Rule";
			}
			// Fallback to other mocks
			if (p === "./package.json") {
				return JSON.stringify({
					name: "root-project",
					workspaces: ["packages/*"],
				});
			}
			if (p === "packages/app-react/package.json") {
				return JSON.stringify({
					name: "@scope/app-react",
					dependencies: { react: "18.0.0", "my-custom-lib": "1.0.0" },
				});
			}
			if (p.toString().includes("default_templates/react/react-core.md")) {
				return "# React Core Rules";
			}
			return "{}";
		});

		await expect(refresh()).resolves.not.toThrow();
	});

	it("should handle projects with no matching templates", async () => {
		// Mock a project with no dependencies that match templates
		(fs.readFileSync as Mock).mockImplementation((p) => {
			if (p === "./package.json") {
				return JSON.stringify({
					name: "root-project",
					workspaces: ["packages/*"],
				});
			}
			if (p === "packages/app-unknown/package.json") {
				return JSON.stringify({
					name: "@scope/app-unknown",
					dependencies: { "unknown-lib": "1.0.0" },
				});
			}
			return "{}";
		});
		vi.mocked(glob).mockImplementation(async (patterns: string | string[]) => {
			if (
				Array.isArray(patterns) &&
				patterns.some((p) => p.includes("packages/*/package.json"))
			) {
				return ["packages/app-unknown/package.json"];
			}
			return [];
		});

		await expect(refresh()).resolves.not.toThrow();
	});
});
