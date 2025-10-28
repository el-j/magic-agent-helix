# MagicAgentHelix VS Code Extension

A VS Code extension that runs MagicAgentHelix to align AI instructions across your monorepo projects.

## Features

### 🪄 One-Click Execution
- Click the "Magic Helix" button in the status bar or use the Command Palette
- Automatically detects and uses the local CLI in development mode
- Falls back to `npx magic-agent-helix` in production mode

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

### 🎯 Status Bar Integration
- Persistent status bar item with magic wand icon (🪄)
- Shows current state:
  - Idle: "$(wand) Magic Helix"
  - Running: "$(loading~spin) Magic Helix Running..."
  - Success: "$(check) Magic Helix Done"
  - Error: "$(error) Magic Helix Failed"

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

1. **Via Status Bar**: Click the "Magic Helix" button in the bottom-left status bar
2. **Via Command Palette**: 
   - Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
   - Type "MagicAgentHelix" and select from the available commands:
     - "Run MagicAgentHelix" - Generate new instruction files
     - "Refresh MagicAgentHelix" - Update existing instruction files
     - "List Projects & Tags" - Show project information
     - "Validate Instruction Files" - Check file integrity
     - "Clean Generated Files" - Remove all generated files

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

In production mode, the extension will use `npx magic-agent-helix`.

### Extension Not Activating

The extension activates on workspace startup. If it's not showing:
1. Reload VS Code window (Command Palette > "Reload Window")
2. Check that you have a workspace folder open
3. Look for errors in Output > Log (Extension Host)

## License

MIT