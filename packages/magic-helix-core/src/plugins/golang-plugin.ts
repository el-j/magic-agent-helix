import type {
	DetectionContext,
	DetectionPlugin,
	DetectionResult,
	InstructionTemplate,
} from "../plugin-system";

/**
 * Plugin for detecting Go (Golang) projects.
 */
export class GolangPlugin implements DetectionPlugin {
	readonly name = "golang";
	readonly description =
		"Detects Go (Golang) projects and provides Go-specific instructions";
	readonly version = "1.0.0";

	detect(context: DetectionContext): DetectionResult {
		// Check for go.mod file (standard Go modules)
		const hasGoMod = context.hasFile("go.mod");

		// Check for .go files
		const hasGoFiles = context.matchesPattern("**/*.go");

		const detected = hasGoMod || hasGoFiles;

		if (!detected) {
			return { detected: false };
		}

		// Parse go.mod for additional metadata if available
		const goModContent = context.getTextFile("go.mod");
		const metadata: Record<string, unknown> = {
			hasGoMod,
			hasGoFiles,
		};

		if (goModContent) {
			// Extract module name
			const moduleMatch = goModContent.match(/^module\s+(.+)$/m);
			if (moduleMatch) {
				metadata.moduleName = moduleMatch[1].trim();
			}

			// Extract Go version
			const goVersionMatch = goModContent.match(/^go\s+([\d.]+)$/m);
			if (goVersionMatch) {
				metadata.goVersion = goVersionMatch[1];
			}
		}

		return {
			detected: true,
			tags: ["lang-go"],
			metadata,
		};
	}

	generateInstructions(
		context: DetectionContext,
		metadata?: Record<string, unknown>,
	): InstructionTemplate[] {
		return [
			{
				template: "go/lang-go.md",
				suffix: "lang-go.md",
				targetFiles: ["**/*.go"],
			},
		];
	}
}
