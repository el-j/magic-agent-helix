import type {
	DetectionContext,
	DetectionPlugin,
	DetectionResult,
	InstructionTemplate,
} from "../plugin-system";

/**
 * Plugin for detecting GitLab CI/CD configuration.
 */
export class GitLabCIPlugin implements DetectionPlugin {
	readonly name = "gitlab-ci";
	readonly description =
		"Detects GitLab CI/CD configuration and provides CI/CD-specific instructions";
	readonly version = "1.0.0";

	detect(context: DetectionContext): DetectionResult {
		// Check for GitLab CI configuration file
		const hasGitLabCI = context.hasFile(".gitlab-ci.yml");

		if (!hasGitLabCI) {
			return { detected: false };
		}

		const metadata: Record<string, unknown> = {
			hasGitLabCI: true,
		};

		// Parse .gitlab-ci.yml for additional info
		const gitlabCIContent = context.getTextFile(".gitlab-ci.yml");
		if (gitlabCIContent) {
			// Check for stages
			const stagesMatch = gitlabCIContent.match(/^stages:\s*$/m);
			if (stagesMatch) {
				metadata.hasStages = true;
			}

			// Check for common features
			metadata.hasCache = gitlabCIContent.includes("cache:");
			metadata.hasArtifacts = gitlabCIContent.includes("artifacts:");
			metadata.hasServices = gitlabCIContent.includes("services:");
			metadata.hasIncludes = gitlabCIContent.includes("include:");

			// Extract stages
			const stagesSection = gitlabCIContent.match(
				/^stages:\s*\n((?: {2}- .+\n?)+)/m,
			);
			if (stagesSection) {
				const stages = stagesSection[1]
					.match(/- (.+)/g)
					?.map((s) => s.replace(/- /, "").trim());
				if (stages) {
					metadata.stages = stages;
				}
			}
		}

		return {
			detected: true,
			tags: ["devops-gitlab-ci", "ci-cd"],
			metadata,
		};
	}

	generateInstructions(
		context: DetectionContext,
		metadata?: Record<string, unknown>,
	): InstructionTemplate[] {
		return [
			{
				template: "devops/gitlab-ci.md",
				suffix: "gitlab-ci.md",
				targetFiles: [".gitlab-ci.yml"],
			},
		];
	}
}
