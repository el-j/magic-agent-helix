import type {
	DetectionContext,
	DetectionPlugin,
	DetectionResult,
	InstructionTemplate,
} from "../plugin-system";

/**
 * Plugin for detecting Rust projects.
 */
export class RustPlugin implements DetectionPlugin {
	readonly name = "rust";
	readonly description =
		"Detects Rust projects and provides Rust-specific instructions";
	readonly version = "1.0.0";

	detect(context: DetectionContext): DetectionResult {
		// Check for Cargo.toml file (standard Rust manifest)
		const hasCargoToml = context.hasFile("Cargo.toml");
		const hasCargoLock = context.hasFile("Cargo.lock");

		// Check for .rs files
		const hasRustFiles = context.matchesPattern("**/*.rs");

		const detected = hasCargoToml || hasRustFiles;

		if (!detected) {
			return { detected: false };
		}

		// Parse Cargo.toml for additional metadata if available
		const cargoTomlContent = context.getTextFile("Cargo.toml");
		const metadata: Record<string, unknown> = {
			hasCargoToml,
			hasCargoLock,
			hasRustFiles,
		};

		if (cargoTomlContent) {
			// Extract package name
			const nameMatch = cargoTomlContent.match(
				/^\[package\][\s\S]*?^name\s*=\s*"(.+?)"/m,
			);
			if (nameMatch) {
				metadata.packageName = nameMatch[1];
			}

			// Extract Rust edition
			const editionMatch = cargoTomlContent.match(/^edition\s*=\s*"(\d+)"/m);
			if (editionMatch) {
				metadata.edition = editionMatch[1];
			}

			// Check for workspace
			if (cargoTomlContent.includes("[workspace]")) {
				metadata.isWorkspace = true;
			}
		}

		return {
			detected: true,
			tags: ["lang-rust"],
			metadata,
		};
	}

	generateInstructions(
		_context: DetectionContext,
		_metadata?: Record<string, unknown>,
	): InstructionTemplate[] {
		return [
			{
				template: "rust/lang-rust.md",
				suffix: "lang-rust.md",
				targetFiles: ["**/*.rs"],
			},
		];
	}
}
