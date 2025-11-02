# ✨ MagicAgentHelix Monorepo ✨

A powerful tool that inspects your project and generates granular, path-specific AI instructions for agents like GitHub Copilot.

## 📦 Packages

This is a monorepo containing:

* **`packages/magic-helix-core`**: The core library with analysis and configuration logic (published to NPM as `magic-helix-core`).
* **`packages/magic-agent-helix`**: The CLI tool (published to NPM as `magic-agent-helix`).
* **`packages/vscode-magic-helix`**: The VS Code extension that provides a "Run" command.
* **`playground/`**: A browser-based playground for testing the core engine (not published to NPM).

## 🚀 Quick Start (For Users)

### Using the CLI

```bash
# Install globally
npm install -g magic-agent-helix

# Or use with npx
npx magic-agent-helix run
```

### Available Commands

- `run` - Generate AI instruction files
- `refresh` / `resync` - Update existing instruction files
- `list` - Show detected projects and tags
- `validate` - Check instruction files integrity
- `clean` - Remove all generated files
- `init` - Initialize custom configuration

**Command Options:**
- `--dry-run` - Preview without writing
- `--force` - Overwrite without prompting
- `--verbose` - Detailed output
- `--quiet` - Minimal output
- `--project <name>` - Target specific project
- `--config <path>` - Custom config file
- And more...

See the [CLI README](packages/magic-agent-helix/README.md) for detailed documentation.

## 🎯 What Does It Do?

MagicAgentHelix automatically:

1. **Scans** your project to detect frameworks, libraries, and conventions
2. **Generates** specific instruction files for each detected technology
3. **Targets** files precisely with framework-aware glob patterns
4. **Integrates** with GitHub Copilot through VS Code settings

**Example:** A Vue 3 + TypeScript + Tailwind + Vitest project automatically gets:
- Vue 3 Composition API guidelines
- TypeScript best practices
- Tailwind CSS conventions
- Vitest testing patterns

Each instruction file targets only the relevant files (e.g., `.vue` files for Vue instructions).

## 🔧 Development

This is a monorepo using NPM workspaces.

### 1. Install Dependencies

```bash
npm install
```

### 2. Build All Packages (for NPM Publishing)

```bash
npm run build
```

This builds: `magic-helix-core`, `magic-agent-helix`, and `vscode-magic-helix`.

### 3. Build Individual Packages

```bash
npm run build:core      # Build magic-helix-core
npm run build:cli       # Build magic-agent-helix CLI
npm run build:vscode    # Build VS Code extension
npm run build:playground # Build playground (separately)
```

### 4. Development Commands

```bash
npm run lint            # Lint all packages
npm run format          # Format code
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # With coverage
```

## 🧪 Testing

### Testing the VS Code Extension (Dev Mode)

This is the best way to test the CLI in a real-world scenario.

1.  Open this monorepo root folder in VS Code.
2.  Make sure you've run `npm install` and `npm run build` at least once.
3.  Go to the "Run and Debug" panel (Ctrl+Shift+D).
4.  Select **"Run VS Code Extension (Dev Mode)"** from the dropdown and press F5.
5.  A new VS Code window (the "Extension Development Host") will open with the extension installed.
6.  Open any test project in this new window.
7.  Open Command Palette (Ctrl+Shift+P) and run: **"MagicAgentHelix: Align Conventions"**.
8.  The extension will execute `npx magic-helix run` in your test project.

### Testing the CLI Directly

```bash
# Build the CLI
npm run build:cli

# Test in any project directory
cd /path/to/test/project
npx /path/to/this/repo/packages/magic-agent-helix run

# Or link it globally for testing
cd packages/magic-agent-helix
npm link
magic-helix run
```

### Running Tests

```bash
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # With coverage report
```

## 🌐 Playground

The playground is a Vue 3 web app for testing the analysis engine in the browser.

### Features:
- **Load from local folder** using File System Access API
- **Load from GitHub/GitLab URL** to analyze remote repositories
- **Preview generated instructions** before downloading
- **Download individual files** or as a ZIP archive

### Running the Playground:

```bash
npm run dev:playground
```

Then open http://localhost:5173

### Building the Playground:

```bash
npm run build:playground
```

## 📋 Configuration Example

### GitHub Copilot Integration

Add to your project's `.vscode/settings.json`:

```json
{
  "github.copilot.advanced": {
    "instructions": ".github/instructions"
  }
}
```

### Custom Configuration

Create `ai-aligner.config.json` in your project root:

```json
{
  "target": "github-copilot",
  "outputDirectory": ".github/instructions",
  "templateDirectory": "ai_templates",
  "dependencyTagMap": {
    "my-internal-lib": "domain-custom"
  },
  "tagTemplateMap": {
    "domain-custom": [
      { "template": "custom-rules.md", "suffix": "custom.md" }
    ]
  }
}
```

## 🚀 Publishing

Releases are automated via semantic-release. Both `magic-helix-core` and `magic-agent-helix` are published to NPM when pushing to `main`.

### Release Configuration

This project uses automated releases with semantic-release. **Important:** Commits must follow [Conventional Commits](https://www.conventionalcommits.org/) format to trigger releases:

- `feat:` - New feature (triggers MINOR version bump)
- `fix:` - Bug fix (triggers PATCH version bump)
- `feat!:` or `BREAKING CHANGE:` - Breaking change (triggers MAJOR version bump)

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed release guidelines.

**Automated Release Workflow:**

1. Push commits with conventional commit messages to `main` branch
2. GitHub Actions runs tests and builds
3. Semantic-release analyzes commits and determines version
4. Bumps version numbers in package.json files
5. Updates CHANGELOG.md
6. Publishes `magic-helix-core` to NPM
7. Publishes `magic-agent-helix` to NPM
8. Creates GitHub Release with changelog and assets

### Manual Publishing (if needed)

```bash
# Login to NPM
npm login

# Publish core
cd packages/magic-helix-core
npm publish

# Publish CLI
cd ../magic-agent-helix
npm publish
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         magic-agent-helix (CLI)         │
│  ┌─────────────────────────────────┐   │
│  │   Commands (run, refresh, etc)  │   │
│  └─────────────┬───────────────────┘   │
│                │                         │
│                ▼                         │
│  ┌─────────────────────────────────┐   │
│  │   magic-helix-core (Library)    │   │
│  │  - Project Analysis              │   │
│  │  - Config Merging                │   │
│  │  - Tag Detection                 │   │
│  │  - Built-in Templates            │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

## 📚 Additional Documentation

- [CLI Documentation](packages/magic-agent-helix/README.md)
- [Core Library Documentation](packages/magic-helix-core/README.md)
- [VS Code Extension Documentation](packages/vscode-magic-helix/README.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run `npm test` and `npm run lint`
6. Submit a pull request

## 📄 License

MIT

## 🙏 Credits

Built with:
- [Commander.js](https://github.com/tj/commander.js/) - CLI framework
- [Inquirer.js](https://github.com/SBoudrias/Inquirer.js/) - Interactive prompts
- [Glob](https://github.com/isaacs/node-glob) - File matching
- [Vite](https://vitejs.dev/) - Build tool
- [Vitest](https://vitest.dev/) - Testing framework

## Development & Testing

This package includes a full test suite.

Run all tests: `npm test`

Run tests in watch mode: `npm run test:watch`

Check test coverage: `npm run test:coverage`
      // ...
      "dependencyTagMap": {
        "my-internal-package": "domain-my-rules"
      },
      // ...
      "tagTemplateMap": {
        "domain-my-rules": [
          { "template": "my-custom-rule.md", "suffix": "my-rule.md" }
        ]
      }
    }
    \`\`\`
5.  Re-run `npx ai-aligner run`. The tool will merge its built-in rules with your custom ones.

### 4. Configure VS Code (Recommended)

To ensure GitHub Copilot *always* reads these files, add this to your workspace's `.vscode/settings.json`:

\`\`\`json
{
  "github.copilot.advanced": {
    "instructions": ".github/instructions"
  }
}
\`\`\`

Restart VS Code, and you're all set!