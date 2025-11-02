/**
 * Assistant-specific instruction formatters.
 * Each AI assistant may have different requirements for instruction formatting.
 */

export type AssistantTarget = "github-copilot" | "claude" | "copilot-chat" | "generic";

export interface InstructionFormatter {
	/**
	 * Format the instruction content for a specific assistant
	 */
	format(content: string, filePath: string, projectName: string): string;

	/**
	 * Get the file extension for instructions
	 */
	getFileExtension(): string;

	/**
	 * Get any special frontmatter or metadata required
	 */
	getFrontmatter(filePath: string, projectName: string): string;
}

/**
 * GitHub Copilot formatter (default)
 * Uses .md files in .github/instructions/ directory
 */
export class GitHubCopilotFormatter implements InstructionFormatter {
	format(content: string, _filePath: string, _projectName: string): string {
		return content;
	}

	getFileExtension(): string {
		return ".md";
	}

	getFrontmatter(_filePath: string, _projectName: string): string {
		return `---
applyTo: "${_filePath}"
---\n\n`;
	}
}

/**
 * Claude/Cursor formatter
 * Uses .md files with Claude-specific formatting
 */
export class ClaudeFormatter implements InstructionFormatter {
	format(content: string, _filePath: string, _projectName: string): string {
		// Claude prefers more structured, conversational instructions
		return content.replace(
			/- \*\*([^*]+)\*\*/g,
			"- **$1** (important)"
		);
	}

	getFileExtension(): string {
		return ".md";
	}

	getFrontmatter(_filePath: string, _projectName: string): string {
		return `---
applyTo: "${_filePath}"
assistant: claude
---\n\n`;
	}
}

/**
 * GitHub Copilot Chat formatter
 * Uses .md files optimized for chat interactions
 */
export class CopilotChatFormatter implements InstructionFormatter {
	format(content: string, _filePath: string, _projectName: string): string {
		// Copilot Chat works better with more concise, actionable instructions
		return content.replace(
			/- \*\*ALWAYS\*\*/g,
			"- 🔴"
		).replace(
			/- \*\*NEVER\*\*/g,
			"- ❌"
		);
	}

	getFileExtension(): string {
		return ".md";
	}

	getFrontmatter(_filePath: string, _projectName: string): string {
		return `---
applyTo: "${_filePath}"
context: chat
---\n\n`;
	}
}

/**
 * Generic assistant formatter
 * Uses .md files with minimal formatting
 */
export class GenericFormatter implements InstructionFormatter {
	format(content: string, _filePath: string, _projectName: string): string {
		return content;
	}

	getFileExtension(): string {
		return ".md";
	}

	getFrontmatter(_filePath: string, _projectName: string): string {
		return `---
applyTo: "${_filePath}"
---\n\n`;
	}
}

/**
 * Factory function to get the appropriate formatter for an assistant
 */
export function getFormatter(target: AssistantTarget): InstructionFormatter {
	switch (target) {
		case "github-copilot":
			return new GitHubCopilotFormatter();
		case "claude":
			return new ClaudeFormatter();
		case "copilot-chat":
			return new CopilotChatFormatter();
		case "generic":
			return new GenericFormatter();
		default:
			return new GitHubCopilotFormatter();
	}
}