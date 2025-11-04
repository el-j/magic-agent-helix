## [1.3.0] - 2025-11-03 (Current Stable Release)

### ⚠️ BREAKING CHANGES

#### Branch Naming Convention Change
**The default development branch has been renamed from `development` to `develop`.**

**Migration Guide:**
If you have existing forks, local clones, or CI/CD pipelines that reference the `development` branch, you need to update them:

1. **Update your local repository:**
   ```bash
   # Fetch the latest changes
   git fetch origin
   
   # If you're on the old 'development' branch, switch to 'develop'
   git checkout develop
   
   # Update your local branch to track the new remote branch
   git branch -u origin/develop
   
   # (Optional) Delete the old local 'development' branch
   git branch -d development
   ```

2. **Update CI/CD configurations:**
   - Update any references to `development` branch in your workflows, scripts, or deployment pipelines to use `develop` instead.
   - Check branch protection rules in your repository settings.
   - Update any documentation or team guides that reference the branch name.

3. **Update pull request base branches:**
   - New pull requests should target the `develop` branch instead of `development`.
   - Existing open pull requests targeting `development` should be updated to target `develop`.

**Why this change?**
The `develop` naming convention is more widely adopted in the industry and aligns with common Git workflow patterns (e.g., git-flow). This change improves consistency and reduces confusion for new contributors.

### ✨ Version Alignment
- Unified all package versions to 1.3.0 for consistency
- Aligned monorepo, core, CLI, and VS Code extension versions
- Prepared foundation for v2.0.0 polyglot architecture

### 🎉 Major Features - VS Code Extension Improvements

#### Settings & Configuration
- Added global VS Code settings for default commands and options
- Workspace-specific configuration via `.magic-helix.json`
- Configurable command history size (default: 10 commands)
- Notification preferences (success, error, progress)
- Status bar customization options

#### Command History & Favorites
- Automatic tracking of last 10 command executions
- Save frequently-used configurations as favorites
- Quick access to history and favorites via keyboard shortcut
- Persistent storage across VS Code sessions

#### Enhanced UI/UX
- **Quick Access Menu** with keyboard shortcut (`Ctrl+Shift+M` / `Cmd+Shift+M`)
- Enhanced status bar with progress percentage display
- Progress notifications using VS Code native API
- Auto-reset status bar after completion
- New commands: `Save as Favorite`, `Configure Workspace`

#### Developer Experience
- Comprehensive inline documentation
- Type-safe interfaces for all configuration objects
- Better error handling and user feedback
- Improved extension manifest with detailed metadata

### 📝 Documentation
- Updated VS Code extension README with all features
- Added settings documentation with examples
- Documented keyboard shortcuts and quick access menu
- Added workspace configuration guide

### 🔧 Technical Improvements
- TypeScript strict mode compliance
- Zero critical issues or TODOs in codebase
- All builds passing successfully
- Full test coverage maintained

---

## [1.1.0-beta.1](https://github.com/el-j/magic-agent-helix/compare/v1.0.0...v1.1.0-beta.1) (2025-10-29)

### Features

* enhance run command with CLI options and logging ([88df109](https://github.com/el-j/magic-agent-helix/commit/88df109438ac8d70357544dd16c6209187fe15cd))

## 1.0.0 (2025-10-27)

### Features

* **ci:** enable manual workflow triggers ([2da38f0](https://github.com/el-j/magic-agent-helix/commit/2da38f02fbb7d4ce4d4258200160ea7d572cf117))

### Bug Fixes

* **ci:** build packages before running tests ([beb59bc](https://github.com/el-j/magic-agent-helix/commit/beb59bc0d367aa5781df8756ca0d66feab75f20d))
* **ci:** remove vscode extension tests from CI ([cfbde0a](https://github.com/el-j/magic-agent-helix/commit/cfbde0a83724a951c8a6d7a0d4d6dec16099c1d3))
* **ci:** test only on Node 20.x and 22.x ([480437f](https://github.com/el-j/magic-agent-helix/commit/480437fea36c3ba957796aca8405b7f0c64c8c12))
* **release:** add missing @semantic-release/git dependency ([378a35d](https://github.com/el-j/magic-agent-helix/commit/378a35d637095f6006d07d87db5a02ab2d904a96))
* **release:** update permissions and configure Git for semantic-release ([b5e732d](https://github.com/el-j/magic-agent-helix/commit/b5e732df347b06a5a4b05835f2cdf9d18495dcd6))
* **vscode:** remove unnecessary TypeScript project reference ([975ec75](https://github.com/el-j/magic-agent-helix/commit/975ec75164e406525bc6f83f2d58ee963b14a4ec))
