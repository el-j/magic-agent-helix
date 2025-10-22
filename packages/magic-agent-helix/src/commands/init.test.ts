import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import inquirer from "inquirer";
import gradient from "gradient-string";
import { init } from "./init"; // Import the function to test

// Mock ora instance
const mockSpinner = {
	start: vi.fn().mockReturnThis(),
	stop: vi.fn().mockReturnThis(),
	succeed: vi.fn().mockReturnThis(),
	warn: vi.fn().mockReturnThis(),
	fail: vi.fn().mockReturnThis(),
};

// Mock all external dependencies
vi.mock("node:fs");
vi.mock("node:path", async () => {
	const actualPath = await vi.importActual<typeof path>("path");
	return {
		...actualPath,
		resolve: vi.fn((...args) => actualPath.join(...args)), // Use join for simple path construction in tests
	};
});
vi.mock("inquirer");
vi.mock("ora", () => ({
	default: vi.fn((message) => {
		mockSpinner.start(message);
		return mockSpinner;
	}),
}));
vi.mock("picocolors", () => {
	const mockPc = {
		bold: vi.fn((str) => str),
		green: vi.fn((str) => str),
		red: vi.fn((str) => str),
		yellow: vi.fn((str) => str),
		cyan: vi.fn((str) => str),
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
vi.mock("../types");

// Mock console.log
vi.spyOn(console, "log").mockImplementation(() => {});

describe("Init Command (/src/commands/init.ts)", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		(path.resolve as Mock).mockImplementation((...args) => args.join("/"));
	});

	it("should create config and template files if they do not exist", async () => {
		(fs.existsSync as Mock).mockReturnValue(false);

		await init();

		expect(mockSpinner.start).toHaveBeenCalledWith(
			"Initializing AI Aligner for custom rules...",
		);
		expect(mockSpinner.start).toHaveBeenCalledWith(
			"Creating templates directory...",
		);
		expect(fs.writeFileSync).toHaveBeenCalledTimes(2);
		// 1. Config file
		expect(fs.writeFileSync).toHaveBeenCalledWith(
			expect.stringContaining("ai-aligner.config.json"),
			expect.stringContaining('"target": "github-copilot"'),
			"utf-8",
		);
		// 2. Example template file
		expect(fs.writeFileSync).toHaveBeenCalledWith(
			expect.stringContaining("my-custom-rule.md"),
			expect.stringContaining("# My Team's Custom Rule"),
			"utf-8",
		);
		expect(fs.mkdirSync).toHaveBeenCalledWith(
			expect.stringContaining("ai_templates"),
			{ recursive: true },
		);
		expect(mockSpinner.succeed).toHaveBeenCalledWith(
			"Created minimal config file: ai-aligner.config.json",
		);
		expect(mockSpinner.succeed).toHaveBeenCalledWith(
			"Created templates directory and example file: ai_templates",
		);
		expect(console.log).toHaveBeenCalledWith(
			expect.stringContaining("✨ Success!"),
		);
	});

	it("should not overwrite existing config if user declines", async () => {
		(fs.existsSync as Mock).mockReturnValue(true); // Config file exists
		(inquirer.prompt as unknown as Mock).mockResolvedValue({
			overwrite: false,
		});

		await init();

		expect(mockSpinner.stop).toHaveBeenCalled();
		expect(inquirer.prompt).toHaveBeenCalled();
		expect(fs.writeFileSync).not.toHaveBeenCalled();
		expect(mockSpinner.warn).toHaveBeenCalledWith("Operation cancelled.");
	});

	it("should overwrite existing config if user confirms", async () => {
		(fs.existsSync as Mock).mockImplementation((p) =>
			p.toString().endsWith(".json"),
		); // Config exists, template dir/file doesn't
		(inquirer.prompt as unknown as Mock).mockResolvedValue({ overwrite: true });

		await init();

		expect(mockSpinner.stop).toHaveBeenCalled();
		expect(inquirer.prompt).toHaveBeenCalled();
		expect(mockSpinner.start).toHaveBeenCalledWith(
			"Overwriting existing config...",
		);
		expect(mockSpinner.start).toHaveBeenCalledWith(
			"Creating templates directory...",
		);
		expect(fs.writeFileSync).toHaveBeenCalledTimes(2); // Config + example template
		expect(fs.writeFileSync).toHaveBeenCalledWith(
			expect.stringContaining("ai-aligner.config.json"),
			expect.stringContaining('"target": "github-copilot"'),
			"utf-8",
		);
		expect(mockSpinner.succeed).toHaveBeenCalledWith(
			"Created minimal config file: ai-aligner.config.json",
		);
	});

	it("should handle config write error", async () => {
		(fs.existsSync as Mock).mockReturnValue(false);
		const writeError = new Error("Permission denied");
		(fs.writeFileSync as Mock).mockImplementation(() => {
			throw writeError;
		});

		await init();

		expect(fs.writeFileSync).toHaveBeenCalled();
		expect(mockSpinner.fail).toHaveBeenCalledWith(
			"Error writing config file: Permission denied",
		);
	});

	it("should skip creating example template if it already exists", async () => {
		(fs.existsSync as Mock).mockImplementation(() => true); // All files exist
		(inquirer.prompt as unknown as Mock).mockResolvedValue({ overwrite: true }); // Overwrite config

		await init();

		expect(fs.writeFileSync).toHaveBeenCalledTimes(1); // Only config file
		expect(fs.writeFileSync).toHaveBeenCalledWith(
			expect.stringContaining("ai-aligner.config.json"),
			expect.anything(),
			"utf-8",
		);
		expect(fs.mkdirSync).not.toHaveBeenCalled();
		// No succeed message when example file already exists
	});
});
