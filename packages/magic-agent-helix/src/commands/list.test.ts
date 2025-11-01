import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import * as fs from "node:fs";
import type * as path from "node:path";
import { glob } from "glob";
import ora from "ora";
import { loadUserConfig, mergeConfigs } from "magic-helix-core";
import { list } from "./list";
import { BUILT_IN_CONFIG } from "magic-helix-core";

// Mock all external dependencies
vi.mock("node:fs", () => ({
	existsSync: vi.fn(),
	readFileSync: vi.fn(),
}));
vi.mock("node:path", async () => {
	const actualPath = await vi.importActual<typeof path>("path");
	return {
		...actualPath,
		resolve: vi.fn((...args) => args.join("/")),
		join: vi.fn((...args) => args.join("/")),
		dirname: vi.fn(actualPath.dirname),
	};
});
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

// Mock console.log
vi.spyOn(console, "log").mockImplementation(() => {});

describe("List Command (/src/commands/list.ts)", () => {
	const mockMergedConfig = JSON.parse(JSON.stringify(BUILT_IN_CONFIG));

	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(loadUserConfig).mockReturnValue({});
		vi.mocked(mergeConfigs).mockReturnValue(mockMergedConfig);
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
			return [];
		});

		(fs.existsSync as Mock).mockImplementation((p) => {
			const pathStr = p.toString();
			return pathStr.endsWith("package.json");
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
					dependencies: { react: "18.0.0" },
				});
			}
			return "{}";
		});
	});

	it("should run successfully and list projects", async () => {
		await expect(list()).resolves.not.toThrow();

		expect(vi.mocked(loadUserConfig)).toHaveBeenCalled();
		expect(vi.mocked(mergeConfigs)).toHaveBeenCalled();
		expect(ora).toHaveBeenCalledWith("Loading configuration...");
		expect(ora).toHaveBeenCalledWith("Scanning for projects...");
		expect(ora).toHaveBeenCalledWith("Analyzing projects...");
	});

	it("should handle projects with various tags", async () => {
		// Mock additional file types for more tags
		vi.mocked(glob).mockImplementation(async (patterns: string | string[]) => {
			if (
				Array.isArray(patterns) &&
				patterns.some((p) => p.includes("packages/*/package.json"))
			) {
				return ["packages/app-vue/package.json"];
			}
			if (
				typeof patterns === "string" &&
				patterns.includes("src/**/*.{ts,js,vue,tsx,jsx,go,py}")
			) {
				return [
					"packages/app-vue/src/main.ts",
					"packages/app-vue/src/App.vue",
				];
			}
			return [];
		});

		await expect(list()).resolves.not.toThrow();
	});
});