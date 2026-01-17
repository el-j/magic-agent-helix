# ✨ MagicAgentHelix Monorepo ✨

A powerful tool that inspects your project and generates granular, path-specific AI instructions for agents like GitHub Copilot.

**Current Version: 2.0.0-beta.1** | **Roadmap: [v2.0.0 Polyglot](ROADMAP-v2.0.0.md)** | **Plugin System: [Documentation](PLUGIN-SYSTEM.md)**

## 📦 Packages

This is a monorepo containing:

* **`packages/magic-helix-core`**: The core library with analysis and configuration logic (published to NPM as `@el-j/magic-helix-core`).
* **`packages/magic-agent-helix`**: The CLI tool (published to NPM as `@el-j/magic-agent-helix`).
* **`packages/vscode-magic-helix`**: The VS Code extension that provides a "Run" command.
* **`playground/`**: A browser-based playground for testing the core engine (not published to NPM).

## 🚀 Quick Start (For Users)

### Using the CLI

```bash
# Install globally
npm install -g @el-j/magic-agent-helix

# Or use with npx
npx @el-j/magic-agent-helix run
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

## 🔌 Plugin System (v2.0.0)

Magic-Agent-Helix features a powerful plugin-based architecture for polyglot support:

- **Extensible**: Create custom plugins for any language, framework, or tool
- **Built-in Plugins**: Go, Python, Docker support out of the box
- **Easy to Use**: Simple `DetectionPlugin` interface
- **Well Tested**: Comprehensive test coverage

See the [Plugin System Documentation](PLUGIN-SYSTEM.md) for details on creating and using plugins.

## 🎨 Pattern Templates & Instruction Quality (v2.0.1)

### Pattern-Based Instruction Generation

Magic-Agent-Helix Phase 5 introduces a sophisticated pattern template system based on research from [awesome-ai-system-prompts](https://github.com/mehmetkahya0/awesome-ai-system-prompts):

- **33 Pattern Templates** across 8 categories:
  - **Role Definition**: Expert identity, scope boundaries, capability declarations
  - **Organization**: XML-like structure, heading hierarchy, sequential workflows
  - **Tool Guidelines**: Function schemas, usage policies, parameter examples
  - **Reasoning**: Thinking tags, subtask breakdown, agent loops, confirmation gates
  - **Domain Expertise**: Framework-specific rules (React, Next.js, Vue, Tailwind, shadcn/ui)
  - **Environment**: OS commands, container awareness, IDE features
  - **Tone**: Concise communication, forbidden phrases, adaptive styles
  - **Safety**: Refusal messages, destructive warnings, credential handling

- **Context-Aware Selection**: Automatically chooses relevant patterns based on your project:
  ```typescript
  import { generateInstructions } from '@el-j/magic-helix-core';

  const instructions = generateInstructions({
    framework: 'react',
    libraries: ['tailwind', 'shadcn-ui'],
    aiModel: 'claude',
    tone: 'concise',
    environment: 'vscode',
  });
  ```

- **Quality Validation**: 15-element scoring system (0-100 scale, A-F grades):
  ```bash
  # Validate generated instructions
  magic-helix validate

  # Output:
  # ✅ A 95/100 - react-patterns.md
  # ⚠️  C 72/100 - python-basics.md
  #    Missing: Tool Documentation, Refusal Guidelines
  #    Tip: Add inline tool schemas with examples
  ```

See the detailed guides:
- [Pattern Templates Guide](packages/magic-helix-core/PATTERN-TEMPLATES.md)
- [Instruction Validation Guide](packages/magic-helix-core/INSTRUCTION-VALIDATION.md)

## 🎉 Roadmap Completion Status

**Current Implementation: 98% Complete**

### ✅ Phase 1: Config Rename (100% Complete)
- Configuration system fully refactored to `.magic-helix.json`
- All references updated across codebase
- Documentation aligned

### ✅ Phase 2: Container Support & Polyglot (100% Complete)
- **9 Built-in Language Plugins**: Node.js, Go, Python, Rust, Java, Ruby, PHP, C#, Swift
- Swift plugin migrated to v3 BasePlugin architecture
- Template system supports all major languages
- Container detection and optimization

### ✅ Phase 3: AI Refinement (100% Complete)
- Model-specific optimizations (Claude, GPT-4, Gemini)
- Token budget management
- Prompt engineering refinements
- A/B testing framework

### ✅ Phase 4: Meta-Instruction System (100% Complete)
- Core meta-instruction infrastructure built
- **4 Context-Aware Modes**:
  - `magic-helix-meta.md` - Universal agent optimization
  - `meta-roadmap.md` - Strategic planning mode
  - `meta-implement.md` - Implementation mode
  - `meta-debug.md` - Debugging mode
- Dynamic context injection based on task type

### ✅ Phase 5: Pattern Templates (100% Complete)
- 33 pattern templates across 8 categories
- Quality validation system (15-element scoring, A-F grades)
- Context-aware template selection
- A/B testing and telemetry integration

**See [ROADMAP-UNIVERSAL-AI-PLATFORM.md](ROADMAP-UNIVERSAL-AI-PLATFORM.md) for detailed phase documentation.**

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

This builds: `@el-j/magic-helix-core`, `@el-j/magic-agent-helix`, and `@magic-helix/vscode`.

### 3. Build Individual Packages

```bash
npm run build:core      # Build @el-j/magic-helix-core
npm run build:cli       # Build @el-j/magic-agent-helix CLI
npm run build:vscode    # Build @magic-helix/vscode extension
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
8.  The extension will execute `npx @el-j/magic-agent-helix run` in your test project.

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

Create `magic-helix.config.json` in your project root (legacy `ai-aligner.config.json` still loads automatically):

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

Releases are automated via semantic-release. Both `@el-j/magic-helix-core` and `@el-j/magic-agent-helix` are published to NPM when pushing to `main`.

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
6. Publishes `@el-j/magic-helix-core` to NPM
7. Publishes `@el-j/magic-agent-helix` to NPM
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