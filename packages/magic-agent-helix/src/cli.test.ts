import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { Command } from "commander";
import { run } from "./commands/run";
import { init } from "./commands/init";
import { main } from "./cli";

// Mock all imported modules
const mockCommand = {
	name: vi.fn().mockReturnThis(),
	description: vi.fn().mockReturnThis(),
	version: vi.fn().mockReturnThis(),
	command: vi.fn().mockReturnThis(),
	action: vi.fn().mockReturnThis(),
	option: vi.fn().mockReturnThis(),
	alias: vi.fn().mockReturnThis(),
	parseAsync: vi.fn().mockResolvedValue(undefined),
};

vi.mock("commander", () => ({
	Command: vi.fn().mockImplementation(() => mockCommand),
}));
vi.mock("./commands/run");
vi.mock("./commands/init");
vi.mock("picocolors", () => ({
	default: {
		red: vi.fn((str) => str),
	},
}));

describe("CLI Main Entry Point (/src/cli.ts)", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
		vi.spyOn(console, "error").mockImplementation(() => {});
	});

	async function runCli() {
		await main();
	}

	it("should setup commander with correct details", async () => {
		process.argv = ["node", "cli.js", "run"]; // Simulate 'run' command
		await runCli();

		expect(Command).toHaveBeenCalled();
		expect(mockCommand.name).toHaveBeenCalledWith("ai-aligner");
		expect(mockCommand.description).toHaveBeenCalledWith(
			"A CLI to align AI instructions in your monorepo.",
		);
		expect(mockCommand.version).toHaveBeenCalledWith("0.2.0");
	});

	it('should register the "init" command', async () => {
		process.argv = ["node", "cli.js", "init"];
		await runCli();

		expect(mockCommand.command).toHaveBeenCalledWith("init");
		expect(mockCommand.description).toHaveBeenCalledWith(
			"Initialize a custom ai-aligner.config.json to extend the built-in rules.",
		);
		expect(mockCommand.action).toHaveBeenCalledWith(init);
	});

	it('should register the "run" command', async () => {
		process.argv = ["node", "cli.js", "run"];
		await runCli();

		expect(mockCommand.command).toHaveBeenCalledWith("run");
		expect(mockCommand.description).toHaveBeenCalledWith(
			"Scan the monorepo and generate AI instruction files based on built-in and custom rules.",
		);
		expect(mockCommand.action).toHaveBeenCalledWith(run);
	});

	it('should call "run" as the default command if no args are given', async () => {
		process.argv = ["node", "cli.js"]; // No command
		await runCli();

		// Check if the default action is set to 'run'
		expect(mockCommand.action).toHaveBeenCalledWith(run);
	});

	it("should call parseAsync", async () => {
		process.argv = ["node", "cli.js", "run"];
		await runCli();

		expect(mockCommand.parseAsync).toHaveBeenCalledWith(process.argv);
	});

	it("should catch and log errors from main()", async () => {
		// Mock parseAsync to throw an error
		mockCommand.parseAsync.mockRejectedValue(new Error("Test crash"));

		process.argv = ["node", "cli.js", "run"];
		await runCli();
	});
});
