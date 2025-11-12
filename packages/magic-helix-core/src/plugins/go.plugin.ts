import type {
  DetectionContext,
  DetectionPlugin,
  Instruction,
} from './plugin.interface';

export class GoPlugin implements DetectionPlugin {
  name = 'Go (Golang)';

  async detect(context: DetectionContext): Promise<boolean> {
    // Simple detection: just check if go.mod exists.
    return context.files.includes('go.mod');
  }

  async generateInstructions(
    context: DetectionContext,
  ): Promise<Instruction[]> {
    const instructions: Instruction[] = [];

    // We can make the instructions smarter by reading the file.
    const goModContent = await context.getTextFile('go.mod');
    const moduleNameMatch = goModContent?.match(/^module\s+(.*)/m);
    const moduleName = moduleNameMatch?.[1] || 'this project';

    // Use string literals and clean up indentation for a clean .md file
    const content = `
**Project Context: Go (Golang)**

* This is a Go project using Go Modules. The main module is \`${moduleName}\`.
* Dependencies are managed in \`go.mod\`.
* To add a new dependency, use \`go get <package-url>\`.
* After manually editing \`go.mod\` or pulling changes, run \`go mod tidy\` to clean up dependencies.
* Follow Go conventions:
    * Public functions/types must start with a capital letter.
    * Use idiomatic error handling (e.g., \`if err != nil { return err }\`).
    * The main entrypoint is typically \`main.go\`.
    `
      .trim()
      .replace(/^\s+/gm, ''); // Cleans up leading whitespace

    instructions.push({
      filename: 'go-conventions.md',
      content: content,
    });

    return instructions;
  }
}
