import type {
	DetectionContext,
	DetectionPlugin,
	DetectionResult,
	InstructionTemplate,
} from "../plugin-system";

/**
 * Plugin for detecting GitHub Actions workflows.
 */
export class GitHubActionsPlugin implements DetectionPlugin {
	readonly name = "github-actions";
	readonly description =
		"Detects GitHub Actions workflows and provides CI/CD-specific instructions";
	readonly version = "1.0.0";

	detect(context: DetectionContext): DetectionResult {
		// Check for GitHub Actions workflow files
		const hasWorkflows =
			context.matchesPattern(".github/workflows/*.yml") ||
			context.matchesPattern(".github/workflows/*.yaml");

		if (!hasWorkflows) {
			return { detected: false };
		}

		const metadata: Record<string, unknown> = {
			hasWorkflows: true,
		};

		// Get list of workflow files
		const workflowFiles = context.files.filter(
			(file) =>
				file.startsWith(".github/workflows/") &&
				(file.endsWith(".yml") || file.endsWith(".yaml")),
		);

		if (workflowFiles.length > 0) {
			metadata.workflowCount = workflowFiles.length;
			metadata.workflowFiles = workflowFiles;

			// Parse first workflow for additional info
			const firstWorkflow = context.getTextFile(workflowFiles[0]);
			if (firstWorkflow) {
				// Check for common patterns
				metadata.hasMatrixStrategy =
					firstWorkflow.includes("strategy:") &&
					firstWorkflow.includes("matrix:");
				metadata.hasCaching =
					firstWorkflow.includes("actions/cache") ||
					firstWorkflow.includes("cache:");
				metadata.hasArtifacts =
					firstWorkflow.includes("actions/upload-artifact") ||
					firstWorkflow.includes("actions/download-artifact");
			}
		}

		return {
			detected: true,
			tags: ["devops-github-actions", "ci-cd"],
			metadata,
		};
	}

	generateInstructions(
		_context: DetectionContext,
		_metadata?: Record<string, unknown>,
	): InstructionTemplate[] {
		return [
			{
				template: "devops/github-actions.md",
				suffix: "github-actions.md",
				targetFiles: [".github/workflows/*.yml", ".github/workflows/*.yaml"],
			},
		];
	}
}
