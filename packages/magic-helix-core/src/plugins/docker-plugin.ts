import type {
  DetectionContext,
  DetectionPlugin,
  DetectionResult,
  InstructionTemplate,
} from '../plugin-system';

/**
 * Plugin for detecting Docker in projects.
 */
export class DockerPlugin implements DetectionPlugin {
  readonly name = 'docker';
  readonly description =
    'Detects Docker usage and provides Docker-specific instructions';
  readonly version = '1.0.0';

  detect(context: DetectionContext): DetectionResult {
    // Check for Docker files
    const hasDockerfile =
      context.hasFile('Dockerfile') || context.matchesPattern('**/Dockerfile');
    const hasDockerCompose =
      context.hasFile('docker-compose.yml') ||
      context.hasFile('docker-compose.yaml') ||
      context.hasFile('compose.yml') ||
      context.hasFile('compose.yaml');
    const hasDockerignore = context.hasFile('.dockerignore');

    const detected = hasDockerfile || hasDockerCompose;

    if (!detected) {
      return { detected: false };
    }

    const metadata: Record<string, unknown> = {
      hasDockerfile,
      hasDockerCompose,
      hasDockerignore,
    };

    // Check for multi-stage builds
    if (hasDockerfile) {
      const dockerfileContent = context.getTextFile('Dockerfile');
      if (dockerfileContent) {
        const stages = (
          dockerfileContent.match(/FROM\s+\S+\s+AS\s+\S+/gi) || []
        ).length;
        if (stages > 0) {
          metadata.multiStage = true;
          metadata.stageCount = stages;
        }
      }
    }

    return {
      detected: true,
      tags: ['devops-docker'],
      metadata,
    };
  }

  generateInstructions(
    _context: DetectionContext,
    metadata?: Record<string, unknown>,
  ): InstructionTemplate[] {
    const instructions: InstructionTemplate[] = [];

    if (metadata?.hasDockerfile) {
      instructions.push({
        template: 'devops/docker-dockerfile.md',
        suffix: 'docker-dockerfile.md',
        targetFiles: ['**/Dockerfile'],
      });
    }

    if (metadata?.hasDockerCompose) {
      instructions.push({
        template: 'devops/docker-compose.md',
        suffix: 'docker-compose.md',
        targetFiles: [
          '**/docker-compose.yml',
          '**/docker-compose.yaml',
          '**/compose.yml',
          '**/compose.yaml',
        ],
      });
    }

    return instructions;
  }
}
