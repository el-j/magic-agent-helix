import {
  DetectionPlugin,
  DetectionContext,
  Instruction,
} from './plugin.interface';

type MonorepoTool = 'Turborepo' | 'Nx' | 'Lerna' | 'pnpm workspaces';

export class MonorepoPlugin implements DetectionPlugin {
  name = 'Monorepo Structure';
  private tool: MonorepoTool | null = null;
  private packageManager = 'npm'; // default, will try to update

  async detect(context: DetectionContext): Promise<boolean> {
    if (context.files.includes('turbo.json')) {
      this.tool = 'Turborepo';
    } else if (context.files.includes('nx.json')) {
      this.tool = 'Nx';
    } else if (context.files.includes('lerna.json')) {
      this.tool = 'Lerna';
    } else if (context.files.includes('pnpm-workspace.yaml')) {
      this.tool = 'pnpm workspaces';
      this.packageManager = 'pnpm'; // pnpm is explicit
      return true;
    } else {
      return false; // Not a recognized monorepo
    }

    // Try to guess package manager for other tools
    if (context.files.includes('pnpm-lock.yaml')) {
      this.packageManager = 'pnpm';
    } else if (context.files.includes('yarn.lock')) {
      this.packageManager = 'yarn';
    }

    return true;
  }

  async generateInstructions(context: DetectionContext): Promise<Instruction[]> {
    let content = `**Project Context: ${this.tool} Monorepo**\n\n`;
    content +=
      '* This is a monorepo. All packages/apps are likely in `packages/` or `apps/`.\n' +
      `* **CRITICAL:** Always run commands from the project root. Do NOT run \`${this.packageManager} install\` in a sub-package.\n` +
      `* Install all dependencies from the root: \`${this.packageManager} install\`\n`;

    switch (this.tool) {
      case 'Turborepo':
        content +=
          '\n**Turborepo Commands:**\n' +
          '* `turbo run build`: Run the `build` script in all packages (fast, cached).\n' +
          '* `turbo run test`: Run all tests.\n' +
          '* `turbo run lint --filter=my-app`: Run the `lint` script in the "my-app" package only.\n';
        break;

      case 'Nx':
        content +=
          '\n**Nx Commands:**\n' +
          '* `nx build my-app`: Build the "my-app" project.\n' +
          '* `nx test my-lib`: Test the "my-lib" library.\n' +
          '* `nx graph`: Show a visual graph of project dependencies.\n';
        break;

      case 'Lerna':
        content +=
          '\n**Lerna Commands:**\n' +
          '* `lerna run build`: Run the `build` script in all packages.\n' +
          '* `lerna bootstrap`: Install dependencies and link local packages (if not using workspaces).\n';
        break;

      case 'pnpm workspaces':
        content +=
          '\n**pnpm Workspace Commands:**\n' +
          '* `pnpm -r run build`: Run the `build` script in all packages.\n' +
          '* `pnpm -r test`: Run all tests.\n' +
          '* `pnpm --filter my-app... build`: Build "my-app" and all of its local dependencies.\n';
        break;
    }

    return [
      {
        filename: 'monorepo.md',
        content: content.trim(),
      },
    ];
  }
}