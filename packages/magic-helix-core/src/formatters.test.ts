import { describe, expect, it } from "vitest";
import {
	type AssistantTarget,
	GitHubCopilotFormatter,
	getFormatter,
} from "./formatters";

describe("Formatters", () => {
	const testContent = "- **ALWAYS** use TypeScript.\n- **NEVER** use any.";
	const testFilePath = "src/**/*.ts";
	const testProjectName = "test-project";

	it("should format for GitHub Copilot", () => {
		const formatter = getFormatter("github-copilot");
		const result = formatter.format(testContent, testFilePath, testProjectName);
		expect(result).toBe(testContent);
		expect(formatter.getFileExtension()).toBe(".md");
		expect(formatter.getFrontmatter(testFilePath, testProjectName)).toContain(
			'applyTo: "src/**/*.ts"',
		);
	});

	it("should format for Claude", () => {
		const formatter = getFormatter("claude");
		const result = formatter.format(testContent, testFilePath, testProjectName);
		expect(result).toContain("(important)");
		expect(formatter.getFileExtension()).toBe(".md");
		expect(formatter.getFrontmatter(testFilePath, testProjectName)).toContain(
			"assistant: claude",
		);
	});

	it("should format for Copilot Chat", () => {
		const formatter = getFormatter("copilot-chat");
		const result = formatter.format(testContent, testFilePath, testProjectName);
		expect(result).toContain("🔴");
		expect(result).toContain("❌");
		expect(formatter.getFileExtension()).toBe(".md");
		expect(formatter.getFrontmatter(testFilePath, testProjectName)).toContain(
			"context: chat",
		);
	});

	it("should format for Generic assistant", () => {
		const formatter = getFormatter("generic");
		const result = formatter.format(testContent, testFilePath, testProjectName);
		expect(result).toBe(testContent);
		expect(formatter.getFileExtension()).toBe(".md");
		expect(formatter.getFrontmatter(testFilePath, testProjectName)).toContain(
			'applyTo: "src/**/*.ts"',
		);
	});

	it("should default to GitHub Copilot for unknown target", () => {
		const formatter = getFormatter("unknown" as AssistantTarget);
		expect(formatter).toBeInstanceOf(GitHubCopilotFormatter);
	});
});
