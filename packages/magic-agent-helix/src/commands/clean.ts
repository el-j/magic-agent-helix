import * as fs from "node:fs";
import * as path from "node:path";
import inquirer from "inquirer";
import { loadUserConfig, mergeConfigs } from "magic-helix-core";
import ora from "ora";
import pc from "picocolors";

/**
 * The 'clean' command.
 * Removes all generated instruction files.
 */
export async function clean() {
	console.log(pc.cyan("🧹 Cleaning generated instruction files...\n"));

	const spinner = ora("Loading configuration...").start();

	// Load config to find output directory
	const userConfig = loadUserConfig();
	const config = mergeConfigs(userConfig);
	spinner.succeed("Configuration loaded.");

	const targetDir = path.resolve(
		process.cwd(),
		config.outputDirectory as string,
	);

	// Check if directory exists
	if (!fs.existsSync(targetDir)) {
		console.log(
			pc.yellow(
				`⚠️  Output directory ${config.outputDirectory} does not exist. Nothing to clean.`,
			),
		);
		return;
	}

	// Find all .md files
	const files = fs.readdirSync(targetDir).filter((f) => f.endsWith(".md"));

	if (files.length === 0) {
		console.log(pc.gray("No instruction files found. Nothing to clean."));
		return;
	}

	// Show files and ask for confirmation
	console.log(
		pc.yellow(`Found ${files.length} instruction file(s) to delete:\n`),
	);
	for (const file of files) {
		console.log(pc.gray(`  - ${file}`));
	}
	console.log();

	const { confirm } = await inquirer.prompt([
		{
			type: "confirm",
			name: "confirm",
			message: pc.red(
				`Are you sure you want to delete all ${files.length} file(s)?`,
			),
			default: false,
		},
	]);

	if (!confirm) {
		console.log(pc.yellow("Clean cancelled."));
		return;
	}

	// Delete files
	const deleteSpinner = ora("Deleting files...").start();
	let deleteCount = 0;
	let errorCount = 0;

	for (const file of files) {
		try {
			fs.unlinkSync(path.join(targetDir, file));
			deleteCount++;
		} catch (e) {
			console.error(
				pc.red(`  ❌ Error deleting ${file}: ${(e as Error).message}`),
			);
			errorCount++;
		}
	}

	if (errorCount === 0) {
		deleteSpinner.succeed(
			pc.green(`✅ Successfully deleted ${deleteCount} file(s).`),
		);
	} else {
		deleteSpinner.warn(
			pc.yellow(
				`⚠️  Deleted ${deleteCount} file(s), ${errorCount} error(s) occurred.`,
			),
		);
	}
}
