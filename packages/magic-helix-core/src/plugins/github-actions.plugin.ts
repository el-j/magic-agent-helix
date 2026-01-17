import * as yaml from 'js-yaml'; // <-- Add this dependency
import type {
  DetectionContext,
  DetectionPlugin,
  Instruction,
} from './plugin.interface';

// A simple interface for the parts of the YAML we care about
interface Workflow {
  name?: string;
  on:
    | string
    | string[]
    | {
        push?: { branches?: string[] };
        pull_request?: { branches?: string[] };
        workflow_dispatch?: unknown;
      };
  jobs: {
    [jobId: string]: {
      name?: string;
      strategy?: {
        matrix?: unknown;
      };
    };
  };
}

export class GitHubActionsPlugin implements DetectionPlugin {
  name = 'GitHub Actions';
  private workflowFiles: string[] = [];

  async detect(context: DetectionContext): Promise<boolean> {
    this.workflowFiles = context.files.filter(
      (file) =>
        file.startsWith('.github/workflows/') &&
        (file.endsWith('.yml') || file.endsWith('.yaml')),
    );
    return this.workflowFiles.length > 0;
  }

  async generateInstructions(
    context: DetectionContext,
  ): Promise<Instruction[]> {
    let content = '**Project Context: GitHub Actions CI/CD**\n\n';
    content +=
      'This project uses GitHub Actions for CI/CD. Here is a summary of the detected workflows:\n';

    for (const file of this.workflowFiles) {
      const fileContent = await context.getTextFile(file);
      if (!fileContent) continue;

      try {
        const workflow = yaml.load(fileContent) as Workflow;
        const workflowName = workflow.name || file.split('/').pop();

        content += `\n---\n\n### Workflow: \`${workflowName}\` (\`${file}\`)\n\n`;

        // 1. Analyze Triggers
        content += '* **Triggers on:**\n';
        if (typeof workflow.on === 'string') {
          content += `    * \`${workflow.on}\`\n`;
        } else if (Array.isArray(workflow.on)) {
          content += `${workflow.on.map((on) => `    * \`${on}\``).join('\n')}\n`;
        } else if (typeof workflow.on === 'object') {
          if (workflow.on.push) {
            const branches = workflow.on.push.branches
              ? `(branches: \`${workflow.on.push.branches.join('`, `')}\`)`
              : '(all branches)';
            content += `    * **Push** ${branches}\n`;
          }
          if (workflow.on.pull_request) {
            const branches = workflow.on.pull_request.branches
              ? `(branches: \`${workflow.on.pull_request.branches.join('`, `')}\`)`
              : '(all branches)';
            content += `    * **Pull Request** ${branches}\n`;
          }
          if (workflow.on.workflow_dispatch) {
            content +=
              '    * **Manual Dispatch** (can be run from the Actions tab)\n';
          }
        }

        // 2. Analyze Jobs
        content += '* **Jobs:**\n';
        if (workflow.jobs) {
          for (const jobId in workflow.jobs) {
            const job = workflow.jobs[jobId];
            content += `    * \`${jobId}\`${job.name ? ` (Display: "${job.name}")` : ''}\n`;
            if (job.strategy?.matrix) {
              content +=
                '        * This job uses a **build matrix** (e.g., multiple Node/OS versions).\n';
            }
          }
        }
      } catch (e) {
        console.error(`[MagicHelix] Error parsing YAML file ${file}:`, e);
        content += `\n---\n\n### Workflow: \`${file}\`\n\n* Could not parse this workflow file. It may contain invalid YAML.\n`;
      }
    }

    // biome-ignore lint/suspicious/noTemplateCurlyInString: GitHub Actions syntax requires literal ${{ }}
    content +=
      "\n---\n\n**When editing workflows:**\n* Be mindful of secrets (e.g., `${{ secrets.MY_SECRET }}`). Never log them.\n* Ensure changes are tested, as they affect the project's integration and deployment.\n";

    return [
      {
        filename: 'github-actions.md',
        content: content.trim(),
      },
    ];
  }
}
