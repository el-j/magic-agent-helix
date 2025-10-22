import * as fs from "node:fs";
import * as path from "node:path";
import gradient from "gradient-string";
import inquirer from "inquirer";
import ora from "ora";
import pc from "picocolors";
// --- CONFIGURATION ---
const CONFIG_FILENAME = "ai-aligner.config.json";
const DEFAULT_TEMPLATE_DIR = "ai_templates";
// This is the *minimal* config file 'init' will create.
// It's designed for users who want to *extend* the built-in rules.
const MINIMAL_USER_CONFIG = {
    target: "github-copilot",
    templateDirectory: DEFAULT_TEMPLATE_DIR,
    outputDirectory: ".github/instructions",
    dependencyTagMap: {
    // "my-internal-package": "domain-my-rules"
    },
    configFileTagMap: {
    // "my-custom-config.json": "domain-my-rules"
    },
    fileGlobTagMap: {
    // "src/specific-folder/**/*.ts": "domain-my-rules"
    },
    tagTemplateMap: {
    // "domain-my-rules": [
    //   { "template": "my-custom-rule.md", "suffix": "my-rule.md" }
    // ]
    },
};
/**
 * The 'init' command.
 * Creates a minimal config file and template directory
 * for users who want to *extend* the built-in conventions.
 */
export async function init() {
    const spinner = ora(pc.bold("Initializing AI Aligner for custom rules...")).start();
    const configPath = path.resolve(process.cwd(), CONFIG_FILENAME);
    const templatePath = path.resolve(process.cwd(), DEFAULT_TEMPLATE_DIR);
    // Check if config file already exists
    if (fs.existsSync(configPath)) {
        spinner.stop();
        const { overwrite } = await inquirer.prompt([
            {
                type: "confirm",
                name: "overwrite",
                message: `A ${CONFIG_FILENAME} file already exists. Do you want to overwrite it with a minimal example?`,
                default: false,
            },
        ]);
        if (!overwrite) {
            spinner.warn(pc.yellow("Operation cancelled."));
            return;
        }
        spinner.start("Overwriting existing config...");
    }
    // 1. Write the minimal config file
    try {
        fs.writeFileSync(configPath, JSON.stringify(MINIMAL_USER_CONFIG, null, 2), "utf-8");
        spinner.succeed(pc.green(`Created minimal config file: ${pc.bold(CONFIG_FILENAME)}`));
    }
    catch (e) {
        spinner.fail(pc.red(`Error writing config file: ${e.message}`));
        return;
    }
    spinner.start("Creating templates directory...");
    // 2. Create the templates directory
    if (!fs.existsSync(templatePath)) {
        fs.mkdirSync(templatePath, { recursive: true });
    }
    // 3. Copy *one* example file to show them how it works
    const exampleTemplatePath = path.resolve(templatePath, "my-custom-rule.md");
    if (!fs.existsSync(exampleTemplatePath)) {
        fs.writeFileSync(exampleTemplatePath, '# My Team\'s Custom Rule\n- This rule is specific to our "domain-my-rules" tag.\n- ALWAYS follow this important pattern.\n', "utf-8");
        spinner.succeed(pc.green(`Created templates directory and example file: ${pc.bold(DEFAULT_TEMPLATE_DIR)}`));
    }
    else {
        spinner.succeed(pc.green(`Templates directory ${pc.bold(DEFAULT_TEMPLATE_DIR)} already exists.`));
    }
    console.log(gradient.pastel.multiline("\n✨ Success! Your project is ready for custom rules. ✨"));
    console.log(pc.cyan(`\nNext steps:`));
    console.log(`  1. Edit ${pc.bold(CONFIG_FILENAME)} to define your team's "tags".`);
    console.log(`  2. Add your custom .md instruction files to ${pc.bold(DEFAULT_TEMPLATE_DIR)}.`);
    console.log(`  3. Run ${pc.bold("npx ai-aligner run")} to generate your files.`);
}
//# sourceMappingURL=init.js.map