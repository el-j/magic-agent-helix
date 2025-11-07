import type {
	DetectionContext,
	DetectionPlugin,
	DetectionResult,
	InstructionTemplate,
} from "../plugin-system";

/**
 * Plugin for detecting PHP projects.
 */
export class PHPPlugin implements DetectionPlugin {
	readonly name = "php";
	readonly description =
		"Detects PHP projects and provides PHP-specific instructions";
	readonly version = "1.0.0";

	detect(context: DetectionContext): DetectionResult {
		// Check for composer.json (PHP dependency manager)
		const hasComposerJson = context.hasFile("composer.json");
		const hasComposerLock = context.hasFile("composer.lock");

		// Check for .php files
		const hasPhpFiles = context.matchesPattern("**/*.php");

		const detected = hasComposerJson || hasPhpFiles;

		if (!detected) {
			return { detected: false };
		}

		const metadata: Record<string, unknown> = {
			hasComposerJson,
			hasComposerLock,
			hasPhpFiles,
		};

		// Detect Laravel framework
		const composerContent = context.getTextFile("composer.json");
		if (composerContent) {
			if (composerContent.includes('"laravel/framework"')) {
				metadata.framework = "laravel";
				metadata.hasArtisan = context.hasFile("artisan");
			} else if (composerContent.includes('"symfony/')) {
				metadata.framework = "symfony";
			}

			// Extract project name
			const nameMatch = composerContent.match(/"name"\s*:\s*"([^"]+)"/);
			if (nameMatch) {
				metadata.projectName = nameMatch[1];
			}
		}

		return {
			detected: true,
			tags: ["lang-php"],
			metadata,
		};
	}

	generateInstructions(
		_context: DetectionContext,
		metadata?: Record<string, unknown>,
	): InstructionTemplate[] {
		const instructions: InstructionTemplate[] = [
			{
				template: "php/lang-php.md",
				suffix: "lang-php.md",
				targetFiles: ["**/*.php"],
			},
		];

		// Add Laravel-specific instructions if detected
		if (metadata?.framework === "laravel") {
			instructions.push({
				template: "php/framework-laravel.md",
				suffix: "framework-laravel.md",
				targetFiles: ["**/*.php"],
			});
		}

		return instructions;
	}
}
