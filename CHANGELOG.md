## [1.4.0-beta.1](https://github.com/el-j/magic-agent-helix/compare/v1.3.0...v1.4.0-beta.1) (2025-11-02)

### Features

* Add tag filters for release workflow ([#9](https://github.com/el-j/magic-agent-helix/issues/9)) ([1771a41](https://github.com/el-j/magic-agent-helix/commit/1771a412eeaa41b2ea5cde5f9f4511aee19336df)), closes [#6](https://github.com/el-j/magic-agent-helix/issues/6)

## [1.3.0](https://github.com/el-j/magic-agent-helix/compare/v1.2.0...v1.3.0) (2025-11-02)

### Features

* enhance run command with CLI options and logging ([88df109](https://github.com/el-j/magic-agent-helix/commit/88df109438ac8d70357544dd16c6209187fe15cd))

## [0.3.0] - 2025-01-XX (Pending Release)

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
- Updated VS Code extension README with all v0.3.0 features
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
