import { exec } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { promisify } from 'node:util';
import * as vscode from 'vscode';

const execAsync = promisify(exec);

let statusBarItem: vscode.StatusBarItem;
let outputChannel: vscode.OutputChannel;
let currentPanel: vscode.WebviewPanel | undefined;

// Command history and favorites storage
interface CommandHistoryItem {
  command: string;
  options: string[];
  timestamp: number;
  label: string;
}

interface FavoriteConfig {
  name: string;
  command: string;
  options: string[];
  created: number;
}

interface MagicHelixSettings {
  defaultCommand: string;
  defaultOptions: string[];
  historySize: number;
  autoSaveFavorites: boolean;
  showStatusBar: boolean;
  notifications: {
    onSuccess: boolean;
    onError: boolean;
    showProgress: boolean;
  };
  cliPath: string;
}

interface WorkspaceConfig {
  defaultOptions?: string[];
  cliPath?: string;
  favorites?: FavoriteConfig[];
}

interface ProgressUpdate {
  stage: string;
  message: string;
  progress?: number;
  type: 'info' | 'success' | 'error' | 'warning';
}

export function activate(context: vscode.ExtensionContext) {
  // Create output channel for logging
  outputChannel = vscode.window.createOutputChannel('MagicAgentHelix');

  // Create status bar item with icon
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100,
  );
  statusBarItem.text = '$(wand) Magic Helix';
  statusBarItem.tooltip = 'Click to run MagicAgentHelix';
  statusBarItem.command = 'magic-helix.run';

  // Show status bar based on settings
  const settings = getSettings();
  if (settings.showStatusBar) {
    statusBarItem.show();
  }

  context.subscriptions.push(statusBarItem);
  context.subscriptions.push(outputChannel);

  // Listen for configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('magicAgentHelix.showStatusBar')) {
        const settings = getSettings();
        if (settings.showStatusBar) {
          statusBarItem.show();
        } else {
          statusBarItem.hide();
        }
      }
    }),
  );

  // Register the main command with options
  const disposable = vscode.commands.registerCommand(
    'magic-helix.run',
    async () => {
      await runMagicHelixWithOptions(context, 'run');
    },
  );

  // Register init command
  const initCommand = vscode.commands.registerCommand(
    'magic-helix.init',
    async () => {
      await runMagicHelix(context, 'init', []);
    },
  );

  // Register additional commands
  const refreshCommand = vscode.commands.registerCommand(
    'magic-helix.refresh',
    async () => {
      await runMagicHelixWithOptions(context, 'refresh');
    },
  );

  const listCommand = vscode.commands.registerCommand(
    'magic-helix.list',
    async () => {
      await runMagicHelix(context, 'list', []);
    },
  );

  const validateCommand = vscode.commands.registerCommand(
    'magic-helix.validate',
    async () => {
      await runMagicHelix(context, 'validate', []);
    },
  );

  const cleanCommand = vscode.commands.registerCommand(
    'magic-helix.clean',
    async () => {
      await runMagicHelix(context, 'clean', []);
    },
  );

  // Register command to show output panel
  const showOutputCommand = vscode.commands.registerCommand(
    'magic-helix.showOutput',
    () => {
      outputChannel.show();
    },
  );

  // Register command to show status panel
  const showStatusCommand = vscode.commands.registerCommand(
    'magic-helix.showStatus',
    () => {
      showStatusPanel(context);
    },
  );

  // Register quick access menu command
  const quickAccessCommand = vscode.commands.registerCommand(
    'magic-helix.quickAccess',
    async () => {
      await showQuickAccessMenu(context);
    },
  );

  const saveFavoriteCommand = vscode.commands.registerCommand(
    'magic-helix.saveFavorite',
    async () => {
      await saveCurrentConfigAsFavorite(context);
    },
  );

  const configureWorkspaceCommand = vscode.commands.registerCommand(
    'magic-helix.configureWorkspace',
    async () => {
      await configureWorkspaceSettings();
    },
  );

  // Register AI refine command
  const refineWithAICommand = vscode.commands.registerCommand(
    'magic-helix.refineWithAI',
    async (uri?: vscode.Uri) => {
      await refineInstructionFileWithAI(uri);
    },
  );

  context.subscriptions.push(
    disposable,
    initCommand,
    refreshCommand,
    listCommand,
    validateCommand,
    cleanCommand,
    showOutputCommand,
    showStatusCommand,
    quickAccessCommand,
    saveFavoriteCommand,
    configureWorkspaceCommand,
    refineWithAICommand,
  );
}

/**
 * Show options UI and run command with selected options
 */
async function runMagicHelixWithOptions(
  context: vscode.ExtensionContext,
  command: string,
) {
  const options: string[] = [];

  // Ask user which options to use
  const selectedOptions = await vscode.window.showQuickPick(
    [
      { label: '$(play) Run with defaults', value: [] },
      { label: '$(eye) Dry run (preview only)', value: ['--dry-run'] },
      { label: '$(check-all) Force (no prompts)', value: ['--force'] },
      { label: '$(comment) Verbose output', value: ['--verbose'] },
      { label: '$(mute) Quiet mode', value: ['--quiet'] },
      { label: '$(gear) Custom options...', value: null },
    ].map((opt) => ({
      label: opt.label,
      description:
        opt.value === null
          ? 'Configure options manually'
          : opt.value.join(' ') || 'Default behavior',
      value: opt.value,
    })),
    {
      placeHolder: `Select options for ${command} command`,
      title: `MagicAgentHelix ${command.charAt(0).toUpperCase() + command.slice(1)}`,
    },
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
async function showCustomOptionsUI(
  _context: vscode.ExtensionContext,
  command: string,
  options: string[],
) {
  // Multi-select options
  const multiOptions = await vscode.window.showQuickPick(
    [
      { label: '$(eye) Dry run', flag: '--dry-run', picked: false },
      {
        label: '$(check-all) Force (no prompts)',
        flag: '--force',
        picked: false,
      },
      { label: '$(x) Skip pruning', flag: '--skip-pruning', picked: false },
      { label: '$(comment) Verbose output', flag: '--verbose', picked: false },
      { label: '$(mute) Quiet mode', flag: '--quiet', picked: false },
    ],
    {
      canPickMany: true,
      placeHolder: 'Select options (multiple allowed)',
      title: `${command} Options`,
    },
  );

  if (multiOptions) {
    options.push(...multiOptions.map((opt) => opt.flag));
  }

  // Ask for project name
  if (command === 'run' || command === 'refresh') {
    const projectName = await vscode.window.showInputBox({
      prompt: 'Target specific project (leave empty for all)',
      placeHolder: 'e.g., my-package-name',
      title: 'Project Name (Optional)',
    });

    if (projectName) {
      options.push('--project', projectName);
    }

    // Ask for AI assistant target
    const target = await vscode.window.showQuickPick(
      [
        { label: '$(github) GitHub Copilot', value: 'github-copilot' },
        { label: '$(robot) Claude/Cursor', value: 'claude' },
        { label: '$(comment-discussion) Copilot Chat', value: 'copilot-chat' },
        { label: '$(tools) Generic Assistant', value: 'generic' },
      ],
      {
        placeHolder: 'Select AI assistant target',
        title: 'AI Assistant Target',
      },
    );

    if (target) {
      options.push('--target', target.value);
    }
  }

  // Ask for custom config path
  const useCustomConfig = await vscode.window.showQuickPick(['No', 'Yes'], {
    placeHolder: 'Use custom config file?',
    title: 'Custom Configuration',
  });

  if (useCustomConfig === 'Yes') {
    const configPath = await vscode.window.showInputBox({
      prompt: 'Path to custom config file',
      placeHolder: 'e.g., ./my-config.json',
      title: 'Config File Path',
    });

    if (configPath) {
      options.push('--config', configPath);
    }
  }

  // Ask for custom output directory
  if (command === 'run') {
    const useCustomOutput = await vscode.window.showQuickPick(['No', 'Yes'], {
      placeHolder: 'Use custom output directory?',
      title: 'Output Directory',
    });

    if (useCustomOutput === 'Yes') {
      const outputDir = await vscode.window.showInputBox({
        prompt: 'Custom output directory',
        placeHolder: 'e.g., ./.ai-instructions',
        title: 'Output Directory Path',
      });

      if (outputDir) {
        options.push('--output-dir', outputDir);
      }
    }
  }
}

async function runMagicHelix(
  context: vscode.ExtensionContext,
  command: string = 'run',
  cliOptions: string[] = [],
) {
  // Check for open workspace
  if (!vscode.workspace.workspaceFolders) {
    vscode.window.showErrorMessage(
      'MagicAgentHelix: You must have a project or folder open.',
    );
    return;
  }

  const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;

  // Get settings and merge with workspace config
  const globalSettings = getSettings();
  const workspaceConfig = getWorkspaceConfig();

  // Merge settings: workspace overrides global
  const effectiveSettings = {
    ...globalSettings,
    defaultOptions:
      workspaceConfig?.defaultOptions || globalSettings.defaultOptions,
    cliPath: workspaceConfig?.cliPath || globalSettings.cliPath,
  };

  const mergedOptions = [...effectiveSettings.defaultOptions, ...cliOptions];

  // Save command to history
  await saveCommandToHistory(
    context,
    command,
    mergedOptions,
    `${command} ${mergedOptions.join(' ')}`,
  );

  // Show status panel
  const panel = showStatusPanel(context);

  try {
    // Determine which CLI to use
    const extensionPath = context.extensionPath;
    outputChannel.appendLine(`Extension Path: ${extensionPath}`);

    // Try multiple possible paths for the CLI
    const possibleCliPaths: string[] = [];

    // If custom CLI path is set, try it first
    if (effectiveSettings.cliPath) {
      possibleCliPaths.push(effectiveSettings.cliPath);
    }

    // Add default search paths
    possibleCliPaths.push(
      // When running in development from monorepo
      path.resolve(extensionPath, '../../magic-agent-helix/dist/cli.mjs'),
      // When running from packages/vscode-magic-helix
      path.resolve(extensionPath, '../magic-agent-helix/dist/cli.mjs'),
      // When workspace is the monorepo root
      path.resolve(workspaceRoot, 'packages/magic-agent-helix/dist/cli.mjs'),
    );

    let commandStr: string = '';
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
      commandStr = `node "${foundCliPath}" ${command} ${mergedOptions.join(' ')}`;
      outputChannel.appendLine('Mode: Development (using local CLI)');
      outputChannel.appendLine(`CLI Path: ${foundCliPath}`);
      sendProgressUpdate(panel, {
        stage: 'Configuration',
        message: 'Using local CLI (development mode)',
        progress: 10,
        type: 'info',
      });
    } else {
      // Production mode: use npx
      commandStr = `npx magic-agent-helix ${command} ${mergedOptions.join(' ')}`;
      outputChannel.appendLine('Mode: Production (using npx)');
      outputChannel.appendLine('⚠️ Local CLI not found. Using npx instead.');
      outputChannel.appendLine(
        'Note: Package must be published to npm for this to work.',
      );
      sendProgressUpdate(panel, {
        stage: 'Configuration',
        message: 'Using npx to run magic-agent-helix',
        progress: 10,
        type: 'warning',
      });
    }

    // Send initial progress
    sendProgressUpdate(panel, {
      stage: 'Starting',
      message: `Initializing MagicAgentHelix ${command}...`,
      progress: 0,
      type: 'info',
    });

    outputChannel.clear();
    outputChannel.show(true);
    outputChannel.appendLine('='.repeat(60));
    outputChannel.appendLine(
      `MagicAgentHelix - ${command.charAt(0).toUpperCase() + command.slice(1)}`,
    );
    outputChannel.appendLine('='.repeat(60));
    outputChannel.appendLine(`Workspace: ${workspaceRoot}`);
    outputChannel.appendLine(`Time: ${new Date().toLocaleString()}`);
    outputChannel.appendLine('');

    outputChannel.appendLine(`Command: ${commandStr}`);
    outputChannel.appendLine('');
    outputChannel.appendLine('Output:');
    outputChannel.appendLine('-'.repeat(60));

    sendProgressUpdate(panel, {
      stage: 'Scanning',
      message: 'Scanning projects and analyzing dependencies...',
      progress: 30,
      type: 'info',
    });

    // Execute command and capture output
    const { stdout, stderr } = await execAsync(commandStr, {
      cwd,
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      env: { ...process.env, FORCE_COLOR: '0' }, // Disable colors for cleaner logs
    });

    if (stdout) {
      outputChannel.appendLine(stdout);
    }
    if (stderr) {
      outputChannel.appendLine('STDERR:');
      outputChannel.appendLine(stderr);
    }

    outputChannel.appendLine('-'.repeat(60));
    outputChannel.appendLine('✅ Completed successfully!');
    outputChannel.appendLine(`Time: ${new Date().toLocaleString()}`);

    sendProgressUpdate(panel, {
      stage: 'Complete',
      message: `✅ MagicAgentHelix ${command} completed successfully!`,
      progress: 100,
      type: 'success',
    });

    if (effectiveSettings.notifications.onSuccess) {
      vscode.window
        .showInformationMessage(
          `MagicAgentHelix ${command} completed successfully! Check the output for details.`,
          'Show Output',
        )
        .then((selection) => {
          if (selection === 'Show Output') {
            outputChannel.show();
          }
        });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    outputChannel.appendLine('');
    outputChannel.appendLine('❌ ERROR:');
    outputChannel.appendLine(errorMessage);

    if (
      error &&
      typeof error === 'object' &&
      'stdout' in error &&
      error.stdout
    ) {
      outputChannel.appendLine('');
      outputChannel.appendLine('Output before error:');
      outputChannel.appendLine(String(error.stdout));
    }

    if (
      error &&
      typeof error === 'object' &&
      'stderr' in error &&
      error.stderr
    ) {
      outputChannel.appendLine('');
      outputChannel.appendLine('Error output:');
      outputChannel.appendLine(String(error.stderr));
    }

    sendProgressUpdate(panel, {
      stage: 'Error',
      message: `❌ Error: ${errorMessage}`,
      progress: 100,
      type: 'error',
    });

    if (effectiveSettings.notifications.onError) {
      vscode.window
        .showErrorMessage(
          `MagicAgentHelix failed: ${errorMessage}`,
          'Show Output',
        )
        .then((selection) => {
          if (selection === 'Show Output') {
            outputChannel.show();
          }
        });
    }
  }
}

function showStatusPanel(
  context: vscode.ExtensionContext,
): vscode.WebviewPanel {
  if (currentPanel) {
    currentPanel.reveal(vscode.ViewColumn.Beside);
    return currentPanel;
  }

  currentPanel = vscode.window.createWebviewPanel(
    'magicHelixStatus',
    'MagicAgentHelix Status',
    vscode.ViewColumn.Beside,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
    },
  );

  currentPanel.iconPath = vscode.Uri.parse(
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNOCAyTDIgNkw4IDEwTDE0IDZMOCAyWiIgZmlsbD0iI2ZmYiIvPjxwYXRoIGQ9Ik04IDE0TDIgMTBMMi41IDlMOCAxMkwxMy41IDlMMTQgMTBMOCAxNFoiIGZpbGw9IiNmZmYiLz48L3N2Zz4=',
  );

  currentPanel.webview.html = getWebviewContent();

  currentPanel.onDidDispose(
    () => {
      currentPanel = undefined;
    },
    null,
    context.subscriptions,
  );

  return currentPanel;
}

function sendProgressUpdate(
  panel: vscode.WebviewPanel,
  update: ProgressUpdate,
) {
  // Update webview
  panel.webview.postMessage(update);

  // Update status bar based on progress
  updateStatusBar(update);
}

function updateStatusBar(update: ProgressUpdate) {
  if (!statusBarItem) return;

  let icon: string;
  let text: string;

  switch (update.type) {
    case 'info':
      icon = update.progress !== undefined ? `$(loading~spin)` : `$(info)`;
      text =
        update.progress !== undefined
          ? `Magic Helix: ${update.stage} (${update.progress}%)`
          : `Magic Helix: ${update.stage}`;
      break;
    case 'success':
      icon = `$(check)`;
      text = `Magic Helix: ${update.stage}`;
      // Reset to default after 5 seconds for success
      setTimeout(() => {
        if (statusBarItem) {
          statusBarItem.text = '$(wand) Magic Helix';
          statusBarItem.tooltip = 'Click to run MagicAgentHelix';
        }
      }, 5000);
      break;
    case 'error':
      icon = `$(error)`;
      text = `Magic Helix: ${update.stage}`;
      // Reset to default after 10 seconds for errors
      setTimeout(() => {
        if (statusBarItem) {
          statusBarItem.text = '$(wand) Magic Helix';
          statusBarItem.tooltip = 'Click to run MagicAgentHelix';
        }
      }, 10000);
      break;
    case 'warning':
      icon = `$(warning)`;
      text = `Magic Helix: ${update.stage}`;
      break;
    default:
      icon = `$(wand)`;
      text = `Magic Helix: ${update.stage}`;
  }

  statusBarItem.text = `${icon} ${text}`;
  statusBarItem.tooltip = update.message;
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

/**
 * Get extension settings
 */
function getSettings(): MagicHelixSettings {
  const config = vscode.workspace.getConfiguration('magicAgentHelix');
  return {
    defaultCommand: config.get('defaultCommand', 'run'),
    defaultOptions: config.get('defaultOptions', []),
    historySize: config.get('historySize', 10),
    autoSaveFavorites: config.get('autoSaveFavorites', false),
    showStatusBar: config.get('showStatusBar', true),
    notifications: {
      onSuccess: config.get('notifications.onSuccess', true),
      onError: config.get('notifications.onError', true),
      showProgress: config.get('notifications.showProgress', true),
    },
    cliPath: config.get('cliPath', ''),
  };
}

/**
 * Get workspace-specific configuration
 */
function getWorkspaceConfig(): WorkspaceConfig | null {
  if (!vscode.workspace.workspaceFolders) {
    return null;
  }

  const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
  const configPath = path.join(workspaceRoot, '.magic-helix.json');

  try {
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(content);
    }
  } catch (error) {
    // Silently ignore invalid config files
    console.warn('Invalid .magic-helix.json file:', error);
  }

  return null;
}

/**
 * Save workspace configuration
 */
async function saveWorkspaceConfig(config: WorkspaceConfig): Promise<void> {
  if (!vscode.workspace.workspaceFolders) {
    throw new Error('No workspace open');
  }

  const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
  const configPath = path.join(workspaceRoot, '.magic-helix.json');

  await fs.promises.writeFile(configPath, JSON.stringify(config, null, 2));
}

/**
 * Configure workspace settings interactively
 */
async function configureWorkspaceSettings(): Promise<void> {
  if (!vscode.workspace.workspaceFolders) {
    vscode.window.showErrorMessage('No workspace open');
    return;
  }

  const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
  const configPath = path.join(workspaceRoot, '.magic-helix.json');

  // Load existing config
  const currentConfig = getWorkspaceConfig() || {};

  // Ask user what to configure
  const configOptions = await vscode.window.showQuickPick(
    [
      {
        label: 'Default CLI Options',
        description: 'Set default options for all commands',
        detail: currentConfig.defaultOptions?.join(' ') || 'None',
      },
      {
        label: 'Custom CLI Path',
        description: 'Set custom path to MagicAgentHelix CLI',
        detail: currentConfig.cliPath || 'Auto-detect',
      },
      {
        label: 'View Current Config',
        description: 'Show current workspace configuration',
      },
      {
        label: 'Reset Config',
        description: 'Remove workspace configuration file',
      },
    ],
    {
      placeHolder: 'Select workspace configuration option',
    },
  );

  if (!configOptions) return;

  switch (configOptions.label) {
    case 'Default CLI Options': {
      const options = await vscode.window.showInputBox({
        prompt: 'Enter default CLI options (space-separated)',
        value: currentConfig.defaultOptions?.join(' ') || '',
        placeHolder: '--verbose --force',
      });
      if (options !== undefined) {
        currentConfig.defaultOptions = options.trim()
          ? options.trim().split(/\s+/)
          : undefined;
      }
      break;
    }

    case 'Custom CLI Path': {
      const cliPath = await vscode.window.showInputBox({
        prompt: 'Enter custom CLI path',
        value: currentConfig.cliPath || '',
        placeHolder: '/path/to/magic-agent-helix/dist/cli.mjs',
      });
      if (cliPath !== undefined) {
        currentConfig.cliPath = cliPath.trim() || undefined;
      }
      break;
    }

    case 'View Current Config': {
      const configJson = JSON.stringify(currentConfig, null, 2);
      const doc = await vscode.workspace.openTextDocument({
        content: configJson,
        language: 'json',
      });
      await vscode.window.showTextDocument(doc);
      return; // Don't save
    }

    case 'Reset Config': {
      const confirm = await vscode.window.showWarningMessage(
        'Remove workspace configuration file?',
        { modal: true },
        'Yes',
      );
      if (confirm === 'Yes') {
        try {
          await fs.promises.unlink(configPath);
          vscode.window.showInformationMessage(
            'Workspace configuration removed',
          );
        } catch (_error: unknown) {
          vscode.window.showErrorMessage('Failed to remove configuration file');
        }
      }
      return; // Don't save
    }
  }

  // Save the updated config
  try {
    await saveWorkspaceConfig(currentConfig);
    vscode.window.showInformationMessage('Workspace configuration saved');
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to save configuration: ${error}`);
  }
}

/**
 * Get command history from storage
 */
function getCommandHistory(
  context: vscode.ExtensionContext,
): CommandHistoryItem[] {
  const history = context.globalState.get<CommandHistoryItem[]>(
    'magic-helix.commandHistory',
    [],
  );
  return history.sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Save command to history
 */
function saveCommandToHistory(
  context: vscode.ExtensionContext,
  command: string,
  options: string[],
  label: string,
) {
  const settings = getSettings();
  const history = getCommandHistory(context);
  const newItem: CommandHistoryItem = {
    command,
    options: [...options],
    timestamp: Date.now(),
    label,
  };

  // Remove duplicates and keep only the configured number of items
  const filtered = history.filter(
    (item) =>
      !(
        item.command === command &&
        JSON.stringify(item.options) === JSON.stringify(options)
      ),
  );
  filtered.unshift(newItem);

  context.globalState.update(
    'magic-helix.commandHistory',
    filtered.slice(0, settings.historySize),
  );
}

/**
 * Get favorite configurations from storage
 */
function getFavoriteConfigs(
  context: vscode.ExtensionContext,
): FavoriteConfig[] {
  return context.globalState.get<FavoriteConfig[]>('magic-helix.favorites', []);
}

/**
 * Save favorite configuration
 */
async function saveFavoriteConfig(
  context: vscode.ExtensionContext,
  name: string,
  command: string,
  options: string[],
) {
  const favorites = getFavoriteConfigs(context);
  const newFav: FavoriteConfig = {
    name,
    command,
    options: [...options],
    created: Date.now(),
  };

  favorites.push(newFav);
  context.globalState.update('magic-helix.favorites', favorites);

  vscode.window.showInformationMessage(
    `Favorite configuration "${name}" saved!`,
  );
}

/**
 * Save current config as favorite (uses last command from history)
 */
async function saveCurrentConfigAsFavorite(context: vscode.ExtensionContext) {
  // Get the most recent command from history
  const history = getCommandHistory(context);
  if (history.length === 0) {
    vscode.window.showWarningMessage(
      'No recent commands found. Run a command first before saving as favorite.',
    );
    return;
  }

  const lastCommand = history[0]; // Most recent

  // Ask for a name for the favorite
  const name = await vscode.window.showInputBox({
    prompt: 'Enter a name for this favorite configuration',
    placeHolder: `Favorite for ${lastCommand.label}`,
    value: lastCommand.label,
  });

  if (!name) {
    return; // User cancelled
  }

  // Save as favorite
  await saveFavoriteConfig(
    context,
    name,
    lastCommand.command,
    lastCommand.options,
  );

  vscode.window.showInformationMessage(
    `Saved "${name}" as a favorite configuration!`,
  );
}

/**
 * Show quick access menu with all available commands
 */
async function showQuickAccessMenu(context: vscode.ExtensionContext) {
  const history = getCommandHistory(context);
  const favorites = getFavoriteConfigs(context);

  const menuItems: vscode.QuickPickItem[] = [
    {
      label: '$(wand) Run MagicAgentHelix',
      description: 'Generate AI instruction files',
      detail: 'Scan project and create instruction files for AI assistants',
    },
    {
      label: '$(file-add) Initialize Config',
      description: 'Create custom configuration',
      detail: 'Set up ai-aligner.config.json for custom rules',
    },
    {
      label: '$(sync) Refresh Instructions',
      description: 'Update existing files',
      detail: 'Rescan and update instruction files with changes',
    },
    {
      label: '$(list-tree) List Projects & Tags',
      description: 'Show detected projects',
      detail: 'Display projects, tags, and templates without generating files',
    },
    {
      label: '$(checklist) Validate Files',
      description: 'Check instruction files',
      detail: 'Validate generated instruction files for issues',
    },
    {
      label: '$(trash) Clean Files',
      description: 'Remove generated files',
      detail: 'Delete all generated instruction files',
    },
    {
      label: '$(output) Show Output',
      description: 'View command output',
      detail: 'Open the output channel for detailed logs',
    },
    {
      label: '$(graph) Show Status',
      description: 'View status panel',
      detail: 'Open the status and progress panel',
    },
    {
      label: '$(sparkle) Refine with AI',
      description: 'Improve instruction files',
      detail: 'Use Copilot to refine and improve instruction files',
    },
  ];

  // Add separator and history if available
  if (history.length > 0) {
    menuItems.push({
      label: '',
      kind: vscode.QuickPickItemKind.Separator,
    });
    menuItems.push({
      label: '$(history) Recent Commands',
      kind: vscode.QuickPickItemKind.Separator,
    });

    history.slice(0, 3).forEach((item: CommandHistoryItem) => {
      menuItems.push({
        label: `$(history) ${item.label}`,
        description: item.command,
        detail: `Options: ${item.options.join(' ')}`,
      });
    });
  }

  // Add favorites if available
  if (favorites.length > 0) {
    menuItems.push({
      label: '$(star) Favorite Configurations',
      kind: vscode.QuickPickItemKind.Separator,
    });

    favorites.forEach((fav: FavoriteConfig) => {
      menuItems.push({
        label: `$(star) ${fav.name}`,
        description: fav.command,
        detail: `Options: ${fav.options.join(' ')}`,
      });
    });
  }

  const selectedCommand = await vscode.window.showQuickPick(menuItems, {
    placeHolder: 'Select a MagicAgentHelix command',
    title: 'MagicAgentHelix Quick Access',
    matchOnDescription: true,
    matchOnDetail: true,
  });

  if (selectedCommand) {
    // Map labels back to commands
    const commandMap: { [key: string]: string } = {
      '$(wand) Run MagicAgentHelix': 'magic-helix.run',
      '$(file-add) Initialize Config': 'magic-helix.init',
      '$(sync) Refresh Instructions': 'magic-helix.refresh',
      '$(list-tree) List Projects & Tags': 'magic-helix.list',
      '$(checklist) Validate Files': 'magic-helix.validate',
      '$(trash) Clean Files': 'magic-helix.clean',
      '$(output) Show Output': 'magic-helix.showOutput',
      '$(graph) Show Status': 'magic-helix.showStatus',
      '$(sparkle) Refine with AI': 'magic-helix.refineWithAI',
    };

    const command =
      commandMap[selectedCommand.label] ||
      (selectedCommand.label.startsWith('$(history)')
        ? 'history'
        : selectedCommand.label.startsWith('$(star)')
          ? 'favorite'
          : '');

    if (command === 'history') {
      // Find the history item
      const historyItem = history.find(
        (item) => `$(history) ${item.label}` === selectedCommand.label,
      );
      if (historyItem) {
        await runMagicHelix(context, historyItem.command, historyItem.options);
      }
    } else if (command === 'favorite') {
      // Find the favorite item
      const favName = selectedCommand.label.replace('$(star) ', '');
      const favItem = favorites.find((fav) => fav.name === favName);
      if (favItem) {
        await runMagicHelix(context, favItem.command, favItem.options);
      }
    } else if (command) {
      await vscode.commands.executeCommand(command);
    }
  }
}

/**
 * Refine an instruction file using Copilot/Language Model API
 */
async function refineInstructionFileWithAI(uri?: vscode.Uri) {
  try {
    // Get the file to refine
    let fileUri = uri;
    if (!fileUri) {
      // If not called from context menu, ask user to select
      const activeEditor = vscode.window.activeTextEditor;
      if (activeEditor?.document.fileName.includes('.github/instructions')) {
        fileUri = activeEditor.document.uri;
      } else {
        // Show file picker for .github/instructions files
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
          vscode.window.showErrorMessage('No workspace folder open');
          return;
        }

        const instructionsPath = path.join(
          workspaceFolder.uri.fsPath,
          '.github',
          'instructions',
        );
        if (!fs.existsSync(instructionsPath)) {
          vscode.window.showErrorMessage(
            'No .github/instructions folder found. Run MagicAgentHelix first to generate instruction files.',
          );
          return;
        }

        const files = fs
          .readdirSync(instructionsPath)
          .filter((f) => f.endsWith('.md'))
          .map((f) => ({
            label: f,
            description: path.join(instructionsPath, f),
          }));

        const selected = await vscode.window.showQuickPick(files, {
          placeHolder: 'Select an instruction file to refine with AI',
        });

        if (!selected) {
          return;
        }

        fileUri = vscode.Uri.file(selected.description);
      }
    }

    // Read the current content
    const document = await vscode.workspace.openTextDocument(fileUri);
    const currentContent = document.getText();

    // Check if Language Model API is available
    const models = await vscode.lm.selectChatModels({ vendor: 'copilot' });

    if (models.length === 0) {
      const installCopilot = await vscode.window.showErrorMessage(
        'GitHub Copilot is required for AI refinement. Would you like to install it?',
        'Install Copilot',
        'Cancel',
      );

      if (installCopilot === 'Install Copilot') {
        vscode.commands.executeCommand(
          'workbench.extensions.search',
          '@id:github.copilot',
        );
      }
      return;
    }

    const model = models[0];

    // Show progress
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Refining instruction file with AI...',
        cancellable: true,
      },
      async (progress, token) => {
        progress.report({ increment: 0, message: 'Analyzing file...' });

        // Craft the prompt
        if (!fileUri) {
          vscode.window.showErrorMessage('No file selected');
          return;
        }

        const fileName = path.basename(fileUri.fsPath);
        const projectContext = await getProjectContext(fileUri);

        const prompt = `You are an expert at writing clear, actionable AI instructions for GitHub Copilot and other AI coding assistants.

I have an instruction file for my project that needs refinement. Please analyze it and improve it by:

1. **Clarity**: Make instructions more specific and actionable
2. **Completeness**: Add missing context or important patterns
3. **Structure**: Improve organization and readability
4. **Relevance**: Ensure instructions match the project context
5. **Best Practices**: Include coding standards and conventions

**File**: ${fileName}
**Project Context**: 
${projectContext}

**Current Content**:
\`\`\`markdown
${currentContent}
\`\`\`

Please provide an improved version of this instruction file. Keep the same general structure and purpose, but make it more effective. Return ONLY the improved markdown content, no explanations.`;

        const messages = [vscode.LanguageModelChatMessage.User(prompt)];

        progress.report({
          increment: 30,
          message: 'Requesting improvements from AI...',
        });

        if (token.isCancellationRequested) {
          return;
        }

        // Make the request
        const response = await model.sendRequest(messages, {}, token);

        progress.report({
          increment: 40,
          message: 'Receiving AI suggestions...',
        });

        let improvedContent = '';
        for await (const chunk of response.text) {
          if (token.isCancellationRequested) {
            return;
          }
          improvedContent += chunk;
        }

        progress.report({
          increment: 20,
          message: 'Processing suggestions...',
        });

        // Show diff and ask user to confirm
        const action = await vscode.window.showInformationMessage(
          'AI has refined the instruction file. Would you like to preview the changes?',
          'Preview & Apply',
          'Cancel',
        );

        if (action === 'Preview & Apply') {
          // Create a temporary file with the improved content
          const tempUri = vscode.Uri.file(`${fileUri.fsPath}.ai-refined.md`);
          await vscode.workspace.fs.writeFile(
            tempUri,
            Buffer.from(improvedContent, 'utf-8'),
          );

          // Show diff
          await vscode.commands.executeCommand(
            'vscode.diff',
            fileUri,
            tempUri,
            `${fileName} ← AI Refined`,
          );

          // Ask if they want to apply
          const apply = await vscode.window.showInformationMessage(
            'Apply the AI refinements to the original file?',
            'Apply',
            'Keep Original',
            'Save As New',
          );

          if (apply === 'Apply') {
            const edit = new vscode.WorkspaceEdit();
            edit.replace(
              fileUri,
              new vscode.Range(0, 0, document.lineCount, 0),
              improvedContent,
            );
            await vscode.workspace.applyEdit(edit);
            await document.save();
            vscode.window.showInformationMessage(
              '✓ Instruction file refined with AI',
            );

            // Delete temp file
            await vscode.workspace.fs.delete(tempUri);
          } else if (apply === 'Save As New') {
            const newFileName = fileName.replace('.md', '.ai-refined.md');
            const newUri = vscode.Uri.file(
              path.join(path.dirname(fileUri.fsPath), newFileName),
            );
            await vscode.workspace.fs.writeFile(
              newUri,
              Buffer.from(improvedContent, 'utf-8'),
            );
            vscode.window.showInformationMessage(
              `✓ Saved refined version as ${newFileName}`,
            );

            // Delete temp file
            await vscode.workspace.fs.delete(tempUri);
          } else {
            // Keep original, delete temp
            await vscode.workspace.fs.delete(tempUri);
          }
        }

        progress.report({ increment: 10, message: 'Complete!' });
      },
    );
  } catch (err) {
    if (err instanceof vscode.LanguageModelError) {
      vscode.window.showErrorMessage(
        `AI refinement failed: ${err.message} (${err.code})`,
      );
      outputChannel.appendLine(`[AI Refine Error] ${err.message}`);
    } else {
      vscode.window.showErrorMessage(
        `Failed to refine instruction file: ${err}`,
      );
      outputChannel.appendLine(`[AI Refine Error] ${err}`);
    }
  }
}

/**
 * Get project context for AI refinement
 */
async function getProjectContext(fileUri: vscode.Uri): Promise<string> {
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(fileUri);
  if (!workspaceFolder) {
    return 'Unknown project';
  }

  const context: string[] = [];

  // Try to read package.json
  const packageJsonPath = path.join(workspaceFolder.uri.fsPath, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      if (packageJson.name) {
        context.push(`Project: ${packageJson.name}`);
      }
      if (packageJson.description) {
        context.push(`Description: ${packageJson.description}`);
      }
      if (packageJson.dependencies) {
        const deps = Object.keys(packageJson.dependencies)
          .slice(0, 10)
          .join(', ');
        context.push(
          `Dependencies: ${deps}${Object.keys(packageJson.dependencies).length > 10 ? '...' : ''}`,
        );
      }
    } catch {
      // Ignore parsing errors
    }
  }

  // Get file-specific context from filename
  const fileName = path.basename(fileUri.fsPath);
  const tags = fileName
    .replace('.md', '')
    .split('.')
    .filter((t) => t);
  if (tags.length > 0) {
    context.push(`Instruction tags: ${tags.join(', ')}`);
  }

  return context.length > 0
    ? context.join('\n')
    : 'Project details unavailable';
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
