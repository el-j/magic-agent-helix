import {
  DetectionPlugin,
  DetectionContext,
  Instruction,
} from './plugin.interface';

export class DockerPlugin implements DetectionPlugin {
  name = 'Docker';

  private hasDockerfile = false;
  private hasCompose = false;

  async detect(context: DetectionContext): Promise<boolean> {
    // Check for either file.
    this.hasDockerfile = context.files.includes('Dockerfile');
    this.hasCompose = context.files.includes('docker-compose.yml');
    return this.hasDockerfile || this.hasCompose;
  }

  async generateInstructions(context: DetectionContext): Promise<Instruction[]> {
    let content = '**Project Context: Docker**\n\n';

    if (this.hasDockerfile) {
      content +=
        '* This project is containerized using a `Dockerfile`.\n';
      
      const dockerfileContent = await context.getTextFile('Dockerfile');
      if (dockerfileContent) {
        // Simple heuristics to make the instructions smarter
        if (dockerfileContent.includes('FROM') && dockerfileContent.includes('AS builder')) {
          content +=
            '* It uses a **multi-stage build** (e.g., `AS builder`) to keep the final image small. Be sure to only copy necessary artifacts from the builder stage.\n';
        }

        const baseImageMatch = dockerfileContent.match(
          /^FROM\s+([^\s]+)\s*$/m,
        );
        if (baseImageMatch && !baseImageMatch[1].includes('builder')) {
          content += `* The final base image appears to be \`${baseImageMatch[1]}\`.\n`;
        }
        
        content +=
          '* **When editing `Dockerfile`:** Optimize layer caching. Place commands that change infrequently (like `npm ci`) *before* commands that change often (like `COPY . .`).\n';
      }
    }

    if (this.hasCompose) {
      content +=
        '\n* A `docker-compose.yml` is present for local development.\n';
      content +=
        '* Run `docker compose up` to start all services (e.g., database, web server, cache).\n';
      content +=
        '* Run `docker compose down` to stop and remove the containers.\n';
    }

    return [
      {
        filename: 'docker.md',
        content: content.trim(),
      },
    ];
  }
}