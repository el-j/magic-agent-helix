# MagicAgentHelix VS Code Extension

A VS Code extension that runs MagicAgentHelix to align AI instructions across your monorepo projects.

## Features

### 🪄 One-Click Execution
- Click the "Magic Helix" button in the status bar or use the Command Palette
- Use the quick access menu with **Ctrl+Shift+M** (or Cmd+Shift+M on Mac)
- Automatically detects and uses the local CLI in development mode
- Falls back to `npx @magic-helix/agent` in production mode

### 📊 Real-Time Status Panel
- Visual progress tracking with percentage completion
- Stage-by-stage status updates
- Activity log showing all operations
- Color-coded messages (info, success, error, warning)

### 📝 Output Channel
- Detailed logging of all operations
- Timestamps for debugging
- Shows CLI output, errors, and warnings
- Easy access via "Show Output" command

### 🎯 Enhanced Status Bar
- Persistent status bar item with magic wand icon (🪄)
- Shows current state with progress percentage:
  - Idle: "$(wand) Magic Helix"
  - Running: "$(loading~spin) Magic Helix Running... [45%]"
  - Success: "$(check) Magic Helix Done"
  - Error: "$(error) Magic Helix Failed"
- Auto-resets to idle state after completion

### ⚙️ Settings & Configuration
- **Global Settings**: Configure default commands and options in VS Code settings
- **Workspace-Specific Config**: Create `.magic-helix.json` for per-workspace customization
- **Command History**: Automatically tracks your last 10 command executions
- **Favorites**: Save frequently-used configurations for quick access
- **Persistent Storage**: Settings and history persist across VS Code sessions

### 🔧 Available Commands

The extension provides access to all MagicAgentHelix CLI commands with **full option support**:

- **Quick Access Menu** (`magic-helix.quickAccess`) - Fast command launcher (Ctrl+Shift+M)
  - Access all commands from one menu
  - View and run from command history
  - Load saved favorite configurations
  - Keyboard shortcut for instant access
- **Run MagicAgentHelix** (`magic-helix.run`) - Generate AI instruction files
  - Interactive options selector for --dry-run, --force, --verbose, --quiet
  - Custom project targeting
  - Custom config file path
  - Custom output directory
- **Initialize Config** (`magic-helix.init`) - Create the Magic Helix config file (`ai-aligner.config.json`)
- **Refresh MagicAgentHelix** (`magic-helix.refresh`) - Update existing instruction files
  - Interactive options selector for --verbose, --quiet
  - Custom project targeting
  - Custom config file path
- **List Projects & Tags** (`magic-helix.list`) - Show detected projects and tags
- **Validate Instruction Files** (`magic-helix.validate`) - Check instruction files integrity
- **Clean Generated Files** (`magic-helix.clean`) - Remove all generated files
- **Save as Favorite** (`magic-helix.saveFavorite`) - Save current configuration for reuse
- **Configure Workspace** (`magic-helix.configureWorkspace`) - Create/edit `.magic-helix.json`
- **Show Output** (`magic-helix.showOutput`) - Display the output channel
- **Show Status Panel** (`magic-helix.showStatus`) - Display the status panel

### ⚙️ Interactive Options

When running `Run` or `Refresh` commands, you'll be presented with an interactive options menu:

1. **Quick Options** - Choose from common presets:
   - Run with defaults
   - Dry run (preview only)
   - Force (no prompts)
   - Verbose output
   - Quiet mode
   - Custom options...

2. **Custom Options** - Configure everything:
   - Multiple flag selection (dry-run, force, skip-pruning, verbose, quiet)
   - Target specific project
   - Use custom config file
   - Set custom output directory

### 🔧 Available Commands

The extension provides access to all MagicAgentHelix CLI commands:

- **Run MagicAgentHelix** (`magic-helix.run`) - Generate AI instruction files
- **Refresh MagicAgentHelix** (`magic-helix.refresh`) - Update existing instruction files  
- **List Projects & Tags** (`magic-helix.list`) - Show detected projects and tags
- **Validate Instruction Files** (`magic-helix.validate`) - Check instruction files integrity
- **Clean Generated Files** (`magic-helix.clean`) - Remove all generated files
- **Show Output** (`magic-helix.showOutput`) - Display the output channel
- **Show Status Panel** (`magic-helix.showStatus`) - Display the status panel

## Usage

### Running MagicAgentHelix

1. **Via Quick Access Menu**: Press `Ctrl+Shift+M` (or `Cmd+Shift+M` on Mac) for instant command launcher
2. **Via Status Bar**: Click the "Magic Helix" button in the bottom-left status bar
3. **Via Command Palette**: 
   - Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
   - Type "MagicAgentHelix" and select from the available commands:
     - "Quick Access Menu" - Fast command launcher with history and favorites
     - "Run MagicAgentHelix" - Generate new instruction files (with options)
    - "Initialize Config" - Create the Magic Helix config file (`ai-aligner.config.json`)
     - "Refresh MagicAgentHelix" - Update existing instruction files (with options)
     - "List Projects & Tags" - Show project information
     - "Validate Instruction Files" - Check file integrity
     - "Clean Generated Files" - Remove all generated files
     - "Save as Favorite" - Save current configuration
     - "Configure Workspace" - Create/edit .magic-helix.json

### Interactive Workflow

#### First Time Setup
1. Run **"Initialize Config"** to create the Magic Helix config file (`ai-aligner.config.json`)
2. Optionally run **"Configure Workspace"** to create `.magic-helix.json` for workspace-specific settings
3. Edit the config files to customize your setup
4. Run **"Run MagicAgentHelix"** to generate instruction files

#### Regular Usage
1. Use **Quick Access Menu** (`Ctrl+Shift+M`) for fastest access
2. Select from command history or favorites
3. Or click the status bar / use Command Palette
4. Select your desired options from the interactive menu
5. Preview with `--dry-run` before committing changes
6. Use `--force` to skip confirmation prompts for automation

#### Working with Favorites
1. Run a command with your preferred options
2. Use **"Save as Favorite"** to save the configuration
3. Give it a descriptive name
4. Access it anytime from the Quick Access Menu

#### Quick Options
When running `Run` or `Refresh`, select from:
- **Run with defaults** - Standard behavior
- **Dry run** - Preview changes without writing files
- **Force** - Skip all prompts (great for CI/CD)
- **Verbose** - See detailed output
- **Quiet** - Minimal output only
- **Custom options...** - Full control over all settings

### Extension Settings

Configure the extension via VS Code settings (`Cmd+,` or `Ctrl+,`):

- `magicHelix.defaultCommand`: Default command to run (default: "run")
- `magicHelix.defaultOptions`: Default CLI options as object
- `magicHelix.historySize`: Number of commands to keep in history (default: 10)
- `magicHelix.notifications.enabled`: Show notifications (default: true)
- `magicHelix.notifications.showProgress`: Show progress notifications (default: true)
- `magicHelix.statusBar.show`: Show status bar item (default: true)
- `magicHelix.statusBar.autoReset`: Auto-reset to idle after completion (default: true)
- `magicHelix.statusBar.autoResetDelay`: Delay before resetting in ms (default: 3000)

### Workspace Configuration

Create a `.magic-helix.json` file in your workspace root for project-specific settings:

```json
{
  "defaultCommand": "run",
  "defaultOptions": {
    "verbose": true,
    "skipPruning": true
  },
  "autoRunOnSave": false,
  "watchPatterns": ["package.json", "tsconfig.json"]
}
```

### Viewing Status

- The status panel opens automatically when you run MagicAgentHelix
- Or use Command Palette: "MagicAgentHelix: Show Status Panel"

### Viewing Output

- Use Command Palette: "MagicAgentHelix: Show Output"
- Or click "Show Output" in success/error notifications

## Requirements

- VS Code 1.85.0 or higher
- Node.js 20.11.1 or higher
- A workspace with a monorepo structure

## Development

This package is intended to be developed as part of the `magic-agent-helix` monorepo. See the [monorepo root README.md](../../README.md) for full usage and development instructions.

### Testing in Development Mode

1. Open this monorepo in VS Code
2. Press F5 to launch Extension Development Host
3. Open a test project in the new window
4. The extension will automatically use the local CLI from `../../magic-agent-helix/dist/cli.mjs`

### Building

```bash
npm run build:vscode
```

## Troubleshooting

### No Output or Errors

If the extension runs but you don't see output:
1. Check the Output panel: "MagicAgentHelix: Show Output"
2. Look for error messages in the VS Code Developer Tools (Help > Toggle Developer Tools)
3. Ensure you have a valid workspace open with a `package.json`

### CLI Not Found

In development mode, make sure you've built the CLI:
```bash
npm run build:cli
```

In production mode, the extension will use `npx @magic-helix/agent`.

### Extension Not Activating

The extension activates on workspace startup. If it's not showing:
1. Reload VS Code window (Command Palette > "Reload Window")
2. Check that you have a workspace folder open
3. Look for errors in Output > Log (Extension Host)

## License

MIT