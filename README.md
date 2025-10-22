# ✨ MagicAgentHelix Monorepo ✨

This is the main monorepo for the `magic-agent-helix` project, containing:

* `packages/magic-agent-helix`: The core CLI tool, published to NPM and as cross-platform binaries.
* `packages/vscode-magic-helix`: The VS Code extension that provides a "Run" command.

## Development

This is a monorepo using NPM workspaces.

1.  **Install:**
    ```bash
    npm install
    ```
2.  **Build All Packages:**
    ```bash
    npm run build
    ```
3.  **Lint / Format / Test (from root):**
    ```bash
    npm run lint
    npm run format
    npm run test
    ```

### Testing the VS Code Plugin (Dev Mode)

This is the best way to test the CLI in a real-world scenario.

1.  Open this monorepo root folder in VS Code.
2.  Make sure you've run `npm install` and `npm run build` at least once.
3.  Go to the "Run and Debug" panel (Ctrl+Shift+D).
4.  Select **"Run VS Code Extension (Dev Mode)"** from the dropdown and press F5 (the green play button).
5.  A new VS Code window (the "Extension Development Host") will open. This window has your local `vscode-magic-helix` plugin installed.
6.  Open any test project (like a simple Vue or React app) in this *new* window.
7.  Open the Command Palette (Ctrl+Shift+P) and type: **"MagicAgentHelix: Align Conventions"**.
8.  Press Enter. The plugin will open a new terminal and run `npx magic-helix run`, executing your local CLI code against the test project.

### 4. Configure VS Code (Recommended)

To ensure GitHub Copilot always reads these files, add this to your workspace's `.vscode/settings.json`:

```json
{
  "github.copilot.advanced": {
    "instructions": ".github/instructions"
  }
}
```

Restart VS Code, and you're all set!

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