// Note: This is a .js test file for a .js script
const { describe, it, expect, vi, beforeEach } = require("vitest");
const fs = require("node:fs");
const path = require("node:path");

// Mock fs and path
vi.mock("node:fs");
vi.mock("node:path", async () => {
	const actualPath = await vi.importActual("path");
	return {
		...actualPath,
		resolve: vi.fn((...args) => args.join("/")),
		join: vi.fn((...args) => args.join("/")),
	};
});

// Mock console
vi.spyOn(console, "log").mockImplementation(() => {});
vi.spyOn(console, "warn").mockImplementation(() => {});

// Function to dynamically import and run the script
function runScript() {
	return require("./copy-templates.js");
}

describe("copy-templates.js", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should do nothing if src directory does not exist", () => {
		fs.existsSync.mockReturnValue(false);

		runScript();

		expect(fs.existsSync).toHaveBeenCalledWith("../src/default_templates");
		expect(console.log).toHaveBeenCalledWith(
			"No default_templates directory found in src. Skipping copy.",
		);
		expect(fs.mkdirSync).not.toHaveBeenCalled();
		expect(fs.copyFileSync).not.toHaveBeenCalled();
	});

	it("should copy files and directories recursively", () => {
		fs.existsSync.mockReturnValue(true); // All paths exist
		fs.statSync.mockImplementation((p) => ({
			isDirectory: () => !p.includes(".md"), // Treat .md files as files
		}));
		fs.readdirSync.mockImplementation((p) => {
			if (p === "../src/default_templates") return ["generic", "vue"];
			if (p === "../src/default_templates/generic")
				return ["style-tailwind.md"];
			if (p === "../src/default_templates/vue") return ["vue-core.md"];
			return [];
		});

		runScript();

		// 1. Check top-level
		expect(fs.readdirSync).toHaveBeenCalledWith("../src/default_templates");

		// 2. Check 'generic' subdir
		expect(fs.mkdirSync).toHaveBeenCalledWith(
			"../dist/default_templates/generic",
			{ recursive: true },
		);
		expect(fs.copyFileSync).toHaveBeenCalledWith(
			"../src/default_templates/generic/style-tailwind.md",
			"../dist/default_templates/generic/style-tailwind.md",
		);

		// 3. Check 'vue' subdir
		expect(fs.mkdirSync).toHaveBeenCalledWith("../dist/default_templates/vue", {
			recursive: true,
		});
		expect(fs.copyFileSync).toHaveBeenCalledWith(
			"../src/default_templates/vue/vue-core.md",
			"../dist/default_templates/vue/vue-core.md",
		);

		expect(console.log).toHaveBeenCalledWith(
			"Recursively copied default template files to dist/default_templates.",
		);
	});

	it("should warn if src directory does not exist during recursion", () => {
		// This tests the inner 'exists' check
		fs.existsSync.mockImplementation((p) => {
			// Pretend the top-level srcDir exists, but a child one doesn't
			if (p === "../src/default_templates") return true;
			if (p === "../src/default_templates/generic") return false; // This one is missing
			return true;
		});
		fs.statSync.mockReturnValue({ isDirectory: () => true });
		fs.readdirSync.mockReturnValue(["generic"]);

		runScript();

		expect(console.warn).toHaveBeenCalledWith(
			"Source directory does not exist: ../src/default_templates/generic",
		);
	});
});
