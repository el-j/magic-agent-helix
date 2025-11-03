import type { DetectionPlugin, DetectionContext, DetectionResult, InstructionTemplate } from "../plugin-system";

/**
 * Plugin for detecting code ownership configuration.
 */
export class CodeOwnersPlugin implements DetectionPlugin {
	readonly name = "codeowners";
	readonly description = "Detects CODEOWNERS file and provides code ownership instructions";
	readonly version = "1.0.0";
	
	detect(context: DetectionContext): DetectionResult {
		// Check for CODEOWNERS file in common locations
		const hasCodeOwners = context.hasFile(".github/CODEOWNERS") || 
		                      context.hasFile("CODEOWNERS") ||
		                      context.hasFile("docs/CODEOWNERS");
		
		if (!hasCodeOwners) {
			return { detected: false };
		}
		
		const metadata: Record<string, unknown> = {
			hasCodeOwners: true
		};
		
		// Determine location
		let codeownersPath = "";
		if (context.hasFile(".github/CODEOWNERS")) {
			codeownersPath = ".github/CODEOWNERS";
		} else if (context.hasFile("CODEOWNERS")) {
			codeownersPath = "CODEOWNERS";
		} else {
			codeownersPath = "docs/CODEOWNERS";
		}
		
		metadata.location = codeownersPath;
		
		// Parse CODEOWNERS for statistics
		const codeownersContent = context.getTextFile(codeownersPath);
		if (codeownersContent) {
			// Count non-empty, non-comment lines
			const lines = codeownersContent.split('\n');
			const rules = lines.filter(line => 
				line.trim() && !line.trim().startsWith('#')
			);
			
			metadata.ruleCount = rules.length;
			
			// Extract unique owners
			const owners = new Set<string>();
			rules.forEach(rule => {
				// CODEOWNERS format: pattern owner1 @owner2 @team
				const parts = rule.trim().split(/\s+/);
				if (parts.length > 1) {
					parts.slice(1).forEach(owner => {
						if (owner.startsWith('@')) {
							owners.add(owner);
						}
					});
				}
			});
			
			metadata.ownerCount = owners.size;
			metadata.owners = Array.from(owners).slice(0, 10); // First 10 for metadata
		}
		
		return {
			detected: true,
			tags: ["architecture-codeowners"],
			metadata
		};
	}
	
	generateInstructions(context: DetectionContext, metadata?: Record<string, unknown>): InstructionTemplate[] {
		return [
			{
				template: "architecture/codeowners.md",
				suffix: "codeowners.md",
				targetFiles: [".github/CODEOWNERS", "CODEOWNERS", "docs/CODEOWNERS"]
			}
		];
	}
}
