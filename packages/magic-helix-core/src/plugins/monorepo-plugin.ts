import type { DetectionPlugin, DetectionContext, DetectionResult, InstructionTemplate } from "../plugin-system";

/**
 * Plugin for detecting monorepo structures.
 */
export class MonorepoPlugin implements DetectionPlugin {
	readonly name = "monorepo";
	readonly description = "Detects monorepo structures and provides monorepo-specific instructions";
	readonly version = "1.0.0";
	
	detect(context: DetectionContext): DetectionResult {
		// Check for common monorepo tools
		const hasTurbo = context.hasFile("turbo.json");
		const hasNx = context.hasFile("nx.json");
		const hasPnpmWorkspace = context.hasFile("pnpm-workspace.yaml");
		const hasLerna = context.hasFile("lerna.json");
		const hasYarnWorkspaces = context.hasFile("package.json") && 
		                          context.getTextFile("package.json")?.includes('"workspaces"');
		const hasNpmWorkspaces = context.hasFile("package.json") && 
		                         context.getTextFile("package.json")?.includes('"workspaces"');
		
		const detected = hasTurbo || hasNx || hasPnpmWorkspace || hasLerna || hasYarnWorkspaces;
		
		if (!detected) {
			return { detected: false };
		}
		
		const metadata: Record<string, unknown> = {
			hasTurbo,
			hasNx,
			hasPnpmWorkspace,
			hasLerna,
			hasYarnWorkspaces
		};
		
		// Determine monorepo tool
		if (hasTurbo) {
			metadata.tool = "turborepo";
			const turboContent = context.getTextFile("turbo.json");
			if (turboContent) {
				metadata.hasPipeline = turboContent.includes('"pipeline"');
			}
		} else if (hasNx) {
			metadata.tool = "nx";
		} else if (hasPnpmWorkspace) {
			metadata.tool = "pnpm";
		} else if (hasLerna) {
			metadata.tool = "lerna";
		} else {
			metadata.tool = "npm/yarn workspaces";
		}
		
		// Count workspace packages
		const packagesPattern = ["packages/*/package.json", "apps/*/package.json"];
		const packageFiles = context.files.filter(file => 
			packagesPattern.some(pattern => {
				const regex = new RegExp(pattern.replace(/\*/g, '[^/]+'));
				return regex.test(file);
			})
		);
		
		if (packageFiles.length > 0) {
			metadata.packageCount = packageFiles.length;
		}
		
		return {
			detected: true,
			tags: ["architecture-monorepo"],
			metadata
		};
	}
	
	generateInstructions(context: DetectionContext, metadata?: Record<string, unknown>): InstructionTemplate[] {
		const instructions: InstructionTemplate[] = [
			{
				template: "architecture/monorepo.md",
				suffix: "monorepo.md",
				targetFiles: ["package.json", "turbo.json", "nx.json", "pnpm-workspace.yaml", "lerna.json"]
			}
		];
		
		// Add tool-specific instructions
		if (metadata?.tool === "turborepo") {
			instructions.push({
				template: "architecture/turborepo.md",
				suffix: "turborepo.md",
				targetFiles: ["turbo.json"]
			});
		} else if (metadata?.tool === "nx") {
			instructions.push({
				template: "architecture/nx.md",
				suffix: "nx.md",
				targetFiles: ["nx.json", "workspace.json"]
			});
		}
		
		return instructions;
	}
}
