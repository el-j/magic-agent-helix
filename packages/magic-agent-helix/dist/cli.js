#!/usr/bin/env node
import { Command } from "commander";
import pc from "picocolors";
import { init } from "./commands/init";
import { run } from "./commands/run";
// This is the main entry point for the CLI tool.
// It uses 'commander' to set up sub-commands: 'init' and 'run'.
async function main() {
    const program = new Command();
    program
        .name("ai-aligner")
        .description("A CLI to align AI instructions in your monorepo.")
        .version("0.1.0"); // This should match package.json
    program
        .command("init")
        .description("Initialize a custom ai-aligner.config.json to extend the built-in rules.")
        .action(init);
    program
        .command("run")
        .description("Scan the monorepo and generate AI instruction files based on built-in and custom rules.")
        .action(run);
    // Set 'run' as the default command if no other command is specified
    if (process.argv.length < 3) {
        program.action(run);
    }
    await program.parseAsync(process.argv);
}
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch((err) => {
        console.error(pc.red(`❌ An unexpected error occurred: ${err.message}`));
        process.exit(1);
    });
}
// Export main for testing
export { main };
//# sourceMappingURL=cli.js.map