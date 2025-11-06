import type {
	DetectionContext,
	DetectionPlugin,
	Instruction,
} from "./plugin.interface";

export class RustPlugin implements DetectionPlugin {
	name = "Rust (Cargo)";

	async detect(context: DetectionContext): Promise<boolean> {
		// Rust projects are defined by the presence of Cargo.toml
		return context.files.includes("Cargo.toml");
	}

	async generateInstructions(
		context: DetectionContext,
	): Promise<Instruction[]> {
		const content = `
**Project Context: Rust (Cargo)**

* This is a Rust project managed by **Cargo**. The \`Cargo.toml\` file defines project metadata and dependencies.
* **Pay close attention to ownership and the borrow checker.** This is the core concept of Rust.

**Essential Commands:**
* \`cargo build\`: Compile the project in debug mode (fast, unoptimized).
* \`cargo build --release\`: Compile in release mode (slow, optimized for production).
* \`cargo run\`: Build and run the project in debug mode.
* \`cargo check\`: Quickly check the code for errors *without* compiling. This is very fast and you should run it often.
* \`cargo test\`: Run all unit and integration tests.

**Code Quality (Highly Recommended):**
* \`cargo fmt\`: Automatically format all code to the standard Rust style.
* \`cargo clippy\`: Run Rust's linter. This is **invaluable** for finding common mistakes and learning idiomatic Rust. Treat Clippy warnings as errors.

**Dependencies:**
* \`cargo add <crate-name>\`: Add a new dependency to \`Cargo.toml\`.
* \`cargo update\`: Update all dependencies to their latest compatible versions.
    `
			.trim()
			.replace(/^\s+/gm, ""); // Cleans up leading whitespace

		return [
			{
				filename: "rust-cargo.md",
				content: content,
			},
		];
	}
}
