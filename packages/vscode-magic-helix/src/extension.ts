import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

let statusBarItem: vscode.StatusBarItem;
let outputChannel: vscode.OutputChannel;
let currentPanel: vscode.WebviewPanel | undefined;

interface ProgressUpdate {
	stage: string;
	message: string;
	progress?: number;
	type: "info" | "success" | "error" | "warning";
}

export function activate(context: vscode.ExtensionContext) {
	// Create output channel for logging
	outputChannel = vscode.window.createOutputChannel("MagicAgentHelix");
	
	// Create status bar item with icon
	statusBarItem = vscode.window.createStatusBarItem(
		vscode.StatusBarAlignment.Left,
		100
	);
	statusBarItem.text = "$(wand) Magic Helix";
	statusBarItem.tooltip = "Click to run MagicAgentHelix";
	statusBarItem.command = "magic-helix.run";
	statusBarItem.show();
	
	context.subscriptions.push(statusBarItem);
	context.subscriptions.push(outputChannel);

	// Register the main command with options
	const disposable = vscode.commands.registerCommand("magic-helix.run", async () => {
		await runMagicHelixWithOptions(context, "run");
	});

	// Register init command
	const initCommand = vscode.commands.registerCommand("magic-helix.init", async () => {
		await runMagicHelix(context, "init", []);
	});

	// Register additional commands
	const refreshCommand = vscode.commands.registerCommand("magic-helix.refresh", async () => {
		await runMagicHelixWithOptions(context, "refresh");
	});

	const listCommand = vscode.commands.registerCommand("magic-helix.list", async () => {
		await runMagicHelix(context, "list", []);
	});

	const validateCommand = vscode.commands.registerCommand("magic-helix.validate", async () => {
		await runMagicHelix(context, "validate", []);
	});

	const cleanCommand = vscode.commands.registerCommand("magic-helix.clean", async () => {
		await runMagicHelix(context, "clean", []);
	});

	// Register command to show output panel
	const showOutputCommand = vscode.commands.registerCommand("magic-helix.showOutput", () => {
		outputChannel.show();
	});

	// Register command to show status panel
	const showStatusCommand = vscode.commands.registerCommand("magic-helix.showStatus", () => {
		showStatusPanel(context);
	});

	context.subscriptions.push(
		disposable, 
		initCommand,
		refreshCommand, 
		listCommand, 
		validateCommand, 
		cleanCommand, 
		showOutputCommand, 
		showStatusCommand
	);
}

/**
 * Show options UI and run command with selected options
 */
async function runMagicHelixWithOptions(context: vscode.ExtensionContext, command: string) {
	const options: string[] = [];
	
	// Ask user which options to use
	const selectedOptions = await vscode.window.showQuickPick(
		[
			{ label: "$(play) Run with defaults", value: [] },
			{ label: "$(eye) Dry run (preview only)", value: ["--dry-run"] },
			{ label: "$(check-all) Force (no prompts)", value: ["--force"] },
			{ label: "$(comment) Verbose output", value: ["--verbose"] },
			{ label: "$(mute) Quiet mode", value: ["--quiet"] },
			{ label: "$(gear) Custom options...", value: null }
		].map(opt => ({
			label: opt.label,
			description: opt.value === null ? "Configure options manually" : opt.value.join(" ") || "Default behavior",
			value: opt.value
		})),
		{
			placeHolder: `Select options for ${command} command`,
			title: `MagicAgentHelix ${command.charAt(0).toUpperCase() + command.slice(1)}`
		}
	);

	if (!selectedOptions) {
		return; // User cancelled
	}

	if (selectedOptions.value === null) {
		// Custom options
		await showCustomOptionsUI(context, command, options);
	} else {
		// Use selected preset
		options.push(...selectedOptions.value);
	}

	await runMagicHelix(context, command, options);
}

/**
 * Show custom options UI
 */
async function showCustomOptionsUI(_context: vscode.ExtensionContext, command: string, options: string[]) {
	// Multi-select options
	const multiOptions = await vscode.window.showQuickPick(
		[
			{ label: "$(eye) Dry run", flag: "--dry-run", picked: false },
			{ label: "$(check-all) Force (no prompts)", flag: "--force", picked: false },
			{ label: "$(x) Skip pruning", flag: "--skip-pruning", picked: false },
			{ label: "$(comment) Verbose output", flag: "--verbose", picked: false },
			{ label: "$(mute) Quiet mode", flag: "--quiet", picked: false }
		],
		{
			canPickMany: true,
			placeHolder: "Select options (multiple allowed)",
			title: `${command} Options`
		}
	);

	if (multiOptions) {
		options.push(...multiOptions.map(opt => opt.flag));
	}

	// Ask for project name
	if (command === "run" || command === "refresh") {
		const projectName = await vscode.window.showInputBox({
			prompt: "Target specific project (leave empty for all)",
			placeHolder: "e.g., my-package-name",
			title: "Project Name (Optional)"
		});

		if (projectName) {
			options.push("--project", projectName);
		}
	}

	// Ask for custom config path
	const useCustomConfig = await vscode.window.showQuickPick(
		["No", "Yes"],
		{
			placeHolder: "Use custom config file?",
			title: "Custom Configuration"
		}
	);

	if (useCustomConfig === "Yes") {
		const configPath = await vscode.window.showInputBox({
			prompt: "Path to custom config file",
			placeHolder: "e.g., ./my-config.json",
			title: "Config File Path"
		});

		if (configPath) {
			options.push("--config", configPath);
		}
	}

	// Ask for custom output directory
	if (command === "run") {
		const useCustomOutput = await vscode.window.showQuickPick(
			["No", "Yes"],
			{
				placeHolder: "Use custom output directory?",
				title: "Output Directory"
			}
		);

		if (useCustomOutput === "Yes") {
			const outputDir = await vscode.window.showInputBox({
				prompt: "Custom output directory",
				placeHolder: "e.g., ./.ai-instructions",
				title: "Output Directory Path"
			});

			if (outputDir) {
				options.push("--output-dir", outputDir);
			}
		}
	}
}

async function runMagicHelix(context: vscode.ExtensionContext, command: string = "run", cliOptions: string[] = []) {
	// Check for open workspace
	if (!vscode.workspace.workspaceFolders) {
		vscode.window.showErrorMessage(
			"MagicAgentHelix: You must have a project or folder open."
		);
		return;
	}

	const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;

	// Show status panel
	const panel = showStatusPanel(context);
	
	// Update status bar
	statusBarItem.text = "$(loading~spin) Magic Helix Running...";
	statusBarItem.tooltip = `MagicAgentHelix is running ${command}`;

	try {
		// Determine which CLI to use
		const extensionPath = context.extensionPath;
		outputChannel.appendLine(`Extension Path: ${extensionPath}`);
		
		// Try multiple possible paths for the CLI
		const possibleCliPaths = [
			// When running in development from monorepo
			path.resolve(extensionPath, "../../magic-agent-helix/dist/cli.mjs"),
			// When running from packages/vscode-magic-helix
			path.resolve(extensionPath, "../magic-agent-helix/dist/cli.mjs"),
			// When workspace is the monorepo root
			path.resolve(workspaceRoot, "packages/magic-agent-helix/dist/cli.mjs"),
		];

		let commandStr: string = "";
		const cwd = workspaceRoot;
		let foundCliPath: string | null = null;

		// Check each possible path
		for (const cliPath of possibleCliPaths) {
			outputChannel.appendLine(`Checking: ${cliPath}`);
			if (fs.existsSync(cliPath)) {
				foundCliPath = cliPath;
				outputChannel.appendLine(`✓ Found CLI at: ${cliPath}`);
				break;
			} else {
				outputChannel.appendLine(`✗ Not found`);
			}
		}

		if (foundCliPath) {
			// Development mode: use local CLI
			commandStr = `node "${foundCliPath}" ${command} ${cliOptions.join(" ")}`;
			outputChannel.appendLine("Mode: Development (using local CLI)");
			outputChannel.appendLine(`CLI Path: ${foundCliPath}`);
			sendProgressUpdate(panel, {
				stage: "Configuration",
				message: "Using local CLI (development mode)",
				progress: 10,
				type: "info"
			});
		} else {
			// Production mode: use npx
			commandStr = `npx magic-agent-helix ${command} ${cliOptions.join(" ")}`;
			outputChannel.appendLine("Mode: Production (using npx)");
			outputChannel.appendLine("⚠️ Local CLI not found. Using npx instead.");
			outputChannel.appendLine("Note: Package must be published to npm for this to work.");
			sendProgressUpdate(panel, {
				stage: "Configuration",
				message: "Using npx to run magic-agent-helix",
				progress: 10,
				type: "warning"
			});
		}

		// Send initial progress
		sendProgressUpdate(panel, {
			stage: "Starting",
			message: `Initializing MagicAgentHelix ${command}...`,
			progress: 0,
			type: "info"
		});

		outputChannel.clear();
		outputChannel.show(true);
		outputChannel.appendLine("=".repeat(60));
		outputChannel.appendLine(`MagicAgentHelix - ${command.charAt(0).toUpperCase() + command.slice(1)}`);
		outputChannel.appendLine("=".repeat(60));
		outputChannel.appendLine(`Workspace: ${workspaceRoot}`);
		outputChannel.appendLine(`Time: ${new Date().toLocaleString()}`);
		outputChannel.appendLine("");

		outputChannel.appendLine(`Command: ${commandStr}`);
		outputChannel.appendLine("");
		outputChannel.appendLine("Output:");
		outputChannel.appendLine("-".repeat(60));

		sendProgressUpdate(panel, {
			stage: "Scanning",
			message: "Scanning projects and analyzing dependencies...",
			progress: 30,
			type: "info"
		});

		// Execute command and capture output
		const { stdout, stderr } = await execAsync(commandStr, {
			cwd,
			maxBuffer: 10 * 1024 * 1024, // 10MB buffer
			env: { ...process.env, FORCE_COLOR: "0" } // Disable colors for cleaner logs
		});

		if (stdout) {
			outputChannel.appendLine(stdout);
		}
		if (stderr) {
			outputChannel.appendLine("STDERR:");
			outputChannel.appendLine(stderr);
		}

		outputChannel.appendLine("-".repeat(60));
		outputChannel.appendLine("✅ Completed successfully!");
		outputChannel.appendLine(`Time: ${new Date().toLocaleString()}`);

		sendProgressUpdate(panel, {
			stage: "Complete",
			message: `✅ MagicAgentHelix ${command} completed successfully!`,
			progress: 100,
			type: "success"
		});

		statusBarItem.text = "$(check) Magic Helix Done";
		statusBarItem.tooltip = "MagicAgentHelix completed successfully";

		vscode.window.showInformationMessage(
			`MagicAgentHelix ${command} completed successfully! Check the output for details.`,
			"Show Output"
		).then(selection => {
			if (selection === "Show Output") {
				outputChannel.show();
			}
		});

		// Reset status bar after 5 seconds
		setTimeout(() => {
			statusBarItem.text = "$(wand) Magic Helix";
			statusBarItem.tooltip = "Click to run MagicAgentHelix";
		}, 5000);

	} catch (error: unknown) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		
		outputChannel.appendLine("");
		outputChannel.appendLine("❌ ERROR:");
		outputChannel.appendLine(errorMessage);
		
		if (error && typeof error === 'object' && 'stdout' in error && error.stdout) {
			outputChannel.appendLine("");
			outputChannel.appendLine("Output before error:");
			outputChannel.appendLine(String(error.stdout));
		}
		
		if (error && typeof error === 'object' && 'stderr' in error && error.stderr) {
			outputChannel.appendLine("");
			outputChannel.appendLine("Error output:");
			outputChannel.appendLine(String(error.stderr));
		}

		sendProgressUpdate(panel, {
			stage: "Error",
			message: `❌ Error: ${errorMessage}`,
			progress: 100,
			type: "error"
		});

		statusBarItem.text = "$(error) Magic Helix Failed";
		statusBarItem.tooltip = `Error: ${errorMessage}`;

		vscode.window.showErrorMessage(
			`MagicAgentHelix failed: ${errorMessage}`,
			"Show Output"
		).then(selection => {
			if (selection === "Show Output") {
				outputChannel.show();
			}
		});

		// Reset status bar after 10 seconds
		setTimeout(() => {
			statusBarItem.text = "$(wand) Magic Helix";
			statusBarItem.tooltip = "Click to run MagicAgentHelix";
		}, 10000);
	}
}

function showStatusPanel(context: vscode.ExtensionContext): vscode.WebviewPanel {
	if (currentPanel) {
		currentPanel.reveal(vscode.ViewColumn.Beside);
		return currentPanel;
	}

	currentPanel = vscode.window.createWebviewPanel(
		"magicHelixStatus",
		"MagicAgentHelix Status",
		vscode.ViewColumn.Beside,
		{
			enableScripts: true,
			retainContextWhenHidden: true
		}
	);

	currentPanel.iconPath = vscode.Uri.parse("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNOCAyTDIgNkw4IDEwTDE0IDZMOCAyWiIgZmlsbD0iI2ZmYiIvPjxwYXRoIGQ9Ik04IDE0TDIgMTBMMi41IDlMOCAxMkwxMy41IDlMMTQgMTBMOCAxNFoiIGZpbGw9IiNmZmYiLz48L3N2Zz4=");

	currentPanel.webview.html = getWebviewContent();

	currentPanel.onDidDispose(() => {
		currentPanel = undefined;
	}, null, context.subscriptions);

	return currentPanel;
}

function sendProgressUpdate(panel: vscode.WebviewPanel, update: ProgressUpdate) {
	panel.webview.postMessage(update);
}

function getWebviewContent(): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>MagicAgentHelix Status</title>
	<style>
		body {
			font-family: var(--vscode-font-family);
			padding: 20px;
			color: var(--vscode-foreground);
			background-color: var(--vscode-editor-background);
		}
		.header {
			display: flex;
			align-items: center;
			margin-bottom: 30px;
			padding-bottom: 20px;
			border-bottom: 1px solid var(--vscode-panel-border);
		}
		.header-icon {
			font-size: 48px;
			margin-right: 20px;
		}
		.header-text h1 {
			margin: 0;
			font-size: 24px;
			font-weight: 600;
		}
		.header-text p {
			margin: 5px 0 0 0;
			color: var(--vscode-descriptionForeground);
		}
		.status-container {
			background: var(--vscode-editor-inactiveSelectionBackground);
			border-radius: 8px;
			padding: 20px;
			margin-bottom: 20px;
		}
		.stage {
			font-size: 14px;
			font-weight: 600;
			color: var(--vscode-textLink-foreground);
			margin-bottom: 10px;
		}
		.message {
			font-size: 16px;
			margin-bottom: 15px;
		}
		.progress-bar {
			width: 100%;
			height: 8px;
			background: var(--vscode-progressBar-background);
			border-radius: 4px;
			overflow: hidden;
			margin-bottom: 10px;
		}
		.progress-fill {
			height: 100%;
			background: var(--vscode-progressBar-background);
			transition: width 0.3s ease;
		}
		.progress-text {
			font-size: 12px;
			color: var(--vscode-descriptionForeground);
		}
		.log-container {
			background: var(--vscode-terminal-background);
			border: 1px solid var(--vscode-panel-border);
			border-radius: 4px;
			padding: 15px;
			max-height: 400px;
			overflow-y: auto;
			font-family: var(--vscode-editor-font-family);
			font-size: 12px;
		}
		.log-entry {
			margin-bottom: 8px;
			padding: 4px 8px;
			border-radius: 3px;
		}
		.log-entry.info {
			color: var(--vscode-terminal-ansiCyan);
		}
		.log-entry.success {
			color: var(--vscode-terminal-ansiGreen);
		}
		.log-entry.error {
			color: var(--vscode-terminal-ansiRed);
			background: rgba(255, 0, 0, 0.1);
		}
		.log-entry.warning {
			color: var(--vscode-terminal-ansiYellow);
		}
		.timestamp {
			color: var(--vscode-descriptionForeground);
			margin-right: 8px;
		}
		.empty-state {
			text-align: center;
			padding: 40px;
			color: var(--vscode-descriptionForeground);
		}
		.empty-state-icon {
			font-size: 64px;
			margin-bottom: 20px;
			opacity: 0.5;
		}
	</style>
</head>
<body>
	<div class="header">
		<div class="header-icon">🪄</div>
		<div class="header-text">
			<h1>MagicAgentHelix</h1>
			<p>AI Convention Aligner for Monorepos</p>
		</div>
	</div>

	<div id="content">
		<div class="empty-state">
			<div class="empty-state-icon">⏳</div>
			<p>Waiting to start...</p>
			<p style="font-size: 12px; margin-top: 10px;">Click the "Magic Helix" button in the status bar or run the command to begin.</p>
		</div>
	</div>

	<script>
		const vscode = acquireVsCodeApi();
		const logs = [];
		
		window.addEventListener('message', event => {
			const update = event.data;
			logs.push(update);
			updateUI(update);
		});

		function updateUI(update) {
			const content = document.getElementById('content');
			
			const statusHTML = \`
				<div class="status-container">
					<div class="stage">\${update.stage}</div>
					<div class="message">\${update.message}</div>
					\${update.progress !== undefined ? \`
						<div class="progress-bar">
							<div class="progress-fill" style="width: \${update.progress}%; background: \${getProgressColor(update.type)}"></div>
						</div>
						<div class="progress-text">\${update.progress}% complete</div>
					\` : ''}
				</div>
				
				<h3 style="margin-bottom: 10px;">Activity Log</h3>
				<div class="log-container">
					\${logs.map(log => \`
						<div class="log-entry \${log.type}">
							<span class="timestamp">\${new Date().toLocaleTimeString()}</span>
							<strong>[\${log.stage}]</strong> \${log.message}
						</div>
					\`).join('')}
				</div>
			\`;
			
			content.innerHTML = statusHTML;
			
			// Scroll to bottom of log
			const logContainer = document.querySelector('.log-container');
			if (logContainer) {
				logContainer.scrollTop = logContainer.scrollHeight;
			}
		}

		function getProgressColor(type) {
			switch(type) {
				case 'success': return '#4ec9b0';
				case 'error': return '#f48771';
				case 'warning': return '#dcdcaa';
				default: return '#569cd6';
			}
		}
	</script>
</body>
</html>`;
}

// This method is called when your extension is deactivated
export function deactivate() {
	if (currentPanel) {
		currentPanel.dispose();
	}
	if (statusBarItem) {
		statusBarItem.dispose();
	}
	if (outputChannel) {
		outputChannel.dispose();
	}
}
