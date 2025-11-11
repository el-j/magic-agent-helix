import type {
  DetectionContext,
  DetectionPlugin,
  Instruction,
} from './plugin.interface';

interface CodeOwnerRule {
  pattern: string;
  owners: string[];
}

export class CodeownersPlugin implements DetectionPlugin {
  name = 'GitHub Code Owners';
  private readonly filepath = '.github/CODEOWNERS';

  async detect(context: DetectionContext): Promise<boolean> {
    return context.files.includes(this.filepath);
  }

  private parseCodeowners(content: string): CodeOwnerRule[] {
    const rules: CodeOwnerRule[] = [];
    const lines = content.split('\n');

    for (const line of lines) {
      // Trim and ignore empty lines or comments
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('#')) {
        continue;
      }

      // Split line into pattern and owners.
      // This is a simple parser; a real one would handle spaces in paths.
      // For this tool's purpose, this is 99% effective.
      const parts = trimmedLine.split(/\s+/);
      if (parts.length < 2) continue; // Invalid line

      const pattern = parts[0];
      const owners = parts.slice(1).filter((p) => p.startsWith('@')); // Only keep owners

      if (owners.length > 0) {
        rules.push({ pattern, owners });
      }
    }
    return rules;
  }

  async generateInstructions(
    context: DetectionContext,
  ): Promise<Instruction[]> {
    const fileContent = await context.getTextFile(this.filepath);
    if (!fileContent) {
      return []; // File existed but couldn't be read
    }

    const rules = this.parseCodeowners(fileContent);
    if (rules.length === 0) {
      return []; // File exists but has no valid rules
    }

    let content =
      '**Project Context: Code Ownership**\n\n' +
      'This project uses a `.github/CODEOWNERS` file to automatically request reviews. When modifying files, be aware of these ownership rules. Here are the most important ones:\n\n';

    // We don't want to dump a 1000-line file.
    // We'll show the *most specific* (longest path) rules first,
    // as they are often more important than the "catch-all" rules.
    rules.sort((a, b) => b.pattern.length - a.pattern.length);

    // Limit to the top 10 most specific rules for brevity
    const topRules = rules.slice(0, 10);

    for (const rule of topRules) {
      content += `* **${rule.pattern}** is owned by: ${rule.owners.join(' ')}\n`;
    }

    if (rules.length > 10) {
      content += `\n* ...and ${rules.length - 10} other rules (e.g., \`*\` catch-alls).\n`;
    }

    content +=
      '\nWhen you create a Pull Request, the relevant owners will be tagged for review automatically.';

    return [
      {
        filename: 'codeowners.md',
        content: content.trim(),
      },
    ];
  }
}
