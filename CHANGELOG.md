## [4.0.0-beta.1](https://github.com/el-j/magic-agent-helix/compare/v3.0.1-beta.1...v4.0.0-beta.1) (2025-12-15)

### ⚠ BREAKING CHANGES

* All packages now published under @el-j scope

- Migrate @magic-helix/* to @el-j/* organization
- Add npm provenance attestations for supply chain security
- Configure OIDC authentication for GitHub Actions
- Update semantic-release configuration for scoped publishing
- Enable tarball distribution for all npm packages

This is the first release of scoped packages:
- @el-j/magic-helix-core
- @el-j/magic-agent-helix
- @el-j/magic-helix-plugins

### Features

* migrate to [@el-j](https://github.com/el-j) scoped packages with npm provenance ([2ba9d90](https://github.com/el-j/magic-agent-helix/commit/2ba9d903476190670916692f9a3723ffa69455e0))

### Bug Fixes

* **vscode:** update engines.vscode to ^1.107.0 to match @types/vscode ([13c4eba](https://github.com/el-j/magic-agent-helix/commit/13c4eba91eeed8c7ca3da1cebde56571bc53c0b2))
* **vscode:** update engines.vscode to match @types/vscode ^1.95.0 ([cc3fbb2](https://github.com/el-j/magic-agent-helix/commit/cc3fbb2aa67d8164cfb01fa7d8d5b53b71ec888a))

## [3.0.1-beta.1](https://github.com/el-j/magic-agent-helix/compare/v3.0.0...v3.0.1-beta.1) (2025-12-14)

### Bug Fixes

* **release:** move VSIX packaging to verifyConditions phase and fix asset glob pattern ([d095136](https://github.com/el-j/magic-agent-helix/commit/d095136799fea8406c03f4e8f6e447f0ad6a8ee4))

## [3.0.0-beta.1](https://github.com/el-j/magic-agent-helix/compare/v2.0.0...v3.0.0-beta.1) (2025-12-14)

### ⚠ BREAKING CHANGES

* 1.4.0 release (#24)

### Features

* add VS Code extension VSIX to release assets ([16915bb](https://github.com/el-j/magic-agent-helix/commit/16915bba63046f2f7c5355871349e52f66e0c158))

### Bug Fixes

* 1.4.0 release ([#24](https://github.com/el-j/magic-agent-helix/issues/24)) ([6b051c8](https://github.com/el-j/magic-agent-helix/commit/6b051c80720c8dcd8197c1162ef6857f8717fb6b)), closes [#2](https://github.com/el-j/magic-agent-helix/issues/2)
* CLI execution detection to work with npm bin symlinks ([61b43b3](https://github.com/el-j/magic-agent-helix/commit/61b43b34171daed163ab0ddf85fa715553c14127))
* CLI symlink execution and add VS Code extension to releases ([#25](https://github.com/el-j/magic-agent-helix/issues/25)) ([b97ac13](https://github.com/el-j/magic-agent-helix/commit/b97ac130921ae30db2422e9db4a101af2f45ca50))
* Feature/updates branch merge ([#31](https://github.com/el-j/magic-agent-helix/issues/31)) ([6719f91](https://github.com/el-j/magic-agent-helix/commit/6719f91a5c36d20b61b175785ae3580aab3e0aec)), closes [#27](https://github.com/el-j/magic-agent-helix/issues/27)
* remove tsconfig.tsbuildinfo from git tracking ([#26](https://github.com/el-j/magic-agent-helix/issues/26)) ([a085781](https://github.com/el-j/magic-agent-helix/commit/a085781baebd1e5e9d6bcf05f47b41c48037f01c))
* remove tsconfig.tsbuildinfo from git tracking to fix build ([43345d5](https://github.com/el-j/magic-agent-helix/commit/43345d5c8fd4f5eaca22a5d667672f9ce600d98b))

## [2.0.0-beta.2](https://github.com/el-j/magic-agent-helix/compare/v2.0.0-beta.1...v2.0.0-beta.2) (2025-12-14)

### Features

* add VS Code extension VSIX to release assets ([16915bb](https://github.com/el-j/magic-agent-helix/commit/16915bba63046f2f7c5355871349e52f66e0c158))

### Bug Fixes

* CLI execution detection to work with npm bin symlinks ([61b43b3](https://github.com/el-j/magic-agent-helix/commit/61b43b34171daed163ab0ddf85fa715553c14127))
* Feature/updates branch merge ([#31](https://github.com/el-j/magic-agent-helix/issues/31)) ([6719f91](https://github.com/el-j/magic-agent-helix/commit/6719f91a5c36d20b61b175785ae3580aab3e0aec)), closes [#27](https://github.com/el-j/magic-agent-helix/issues/27)
* remove tsconfig.tsbuildinfo from git tracking to fix build ([43345d5](https://github.com/el-j/magic-agent-helix/commit/43345d5c8fd4f5eaca22a5d667672f9ce600d98b))

## [3.0.0-alpha.3](https://github.com/el-j/magic-agent-helix/compare/v3.0.0-alpha.2...v3.0.0-alpha.3) (2025-12-14)

### Bug Fixes

* remove npmPublish setting for magic-helix packages in release configuration ([4e22b16](https://github.com/el-j/magic-agent-helix/commit/4e22b16a7d3837d8f2e21d1dc881bc01d5dbf76c))

## [3.0.0-alpha.2](https://github.com/el-j/magic-agent-helix/compare/v3.0.0-alpha.1...v3.0.0-alpha.2) (2025-12-14)

### Bug Fixes

* ensure npmPublish is set to false for all npm plugins and add publishConfig to magic-helix-plugins ([7e2a17e](https://github.com/el-j/magic-agent-helix/commit/7e2a17e959fd44ec73d899d8d90a541c9ed95d63))

## [3.0.0-alpha.1](https://github.com/el-j/magic-agent-helix/compare/v2.0.0...v3.0.0-alpha.1) (2025-12-14)

### ⚠ BREAKING CHANGES

* 1.4.0 release (#24)

### Features

* Add Swift Plugin and enhance documentation with roadmap completion status ([27dc57f](https://github.com/el-j/magic-agent-helix/commit/27dc57fcaa04e7902ffa8051bbc69af547318c20))
* Add test fixtures for multiple languages and Docker setups ([08e3d5c](https://github.com/el-j/magic-agent-helix/commit/08e3d5c1b9f1143e0d1938e3c8ab028735eb1dda))
* Add Vite configuration for magic-helix-plugins and enhance AI instruction refinement ([a0c046c](https://github.com/el-j/magic-agent-helix/commit/a0c046c634c75e5769c3a4c64a7ddf29793104a6))
* add VS Code extension VSIX to release assets ([16915bb](https://github.com/el-j/magic-agent-helix/commit/16915bba63046f2f7c5355871349e52f66e0c158))
* chore: update package versions and add version sync script ([5b8afb0](https://github.com/el-j/magic-agent-helix/commit/5b8afb05085ba7fd2689ea1c4da7717051e7620a))
* enhance release workflow and add vscode-magic-helix package support ([a111a4d](https://github.com/el-j/magic-agent-helix/commit/a111a4dd29813a8ff151afaa571bf42e4f72c44a))

### Bug Fixes

* 1.4.0 release ([#24](https://github.com/el-j/magic-agent-helix/issues/24)) ([6b051c8](https://github.com/el-j/magic-agent-helix/commit/6b051c80720c8dcd8197c1162ef6857f8717fb6b)), closes [#2](https://github.com/el-j/magic-agent-helix/issues/2)
* CLI execution detection to work with npm bin symlinks ([61b43b3](https://github.com/el-j/magic-agent-helix/commit/61b43b34171daed163ab0ddf85fa715553c14127))
* CLI symlink execution and add VS Code extension to releases ([#25](https://github.com/el-j/magic-agent-helix/issues/25)) ([b97ac13](https://github.com/el-j/magic-agent-helix/commit/b97ac130921ae30db2422e9db4a101af2f45ca50))
* Feature/updates branch merge ([#31](https://github.com/el-j/magic-agent-helix/issues/31)) ([6719f91](https://github.com/el-j/magic-agent-helix/commit/6719f91a5c36d20b61b175785ae3580aab3e0aec)), closes [#27](https://github.com/el-j/magic-agent-helix/issues/27)
* remove tsconfig.tsbuildinfo from git tracking ([#26](https://github.com/el-j/magic-agent-helix/issues/26)) ([a085781](https://github.com/el-j/magic-agent-helix/commit/a085781baebd1e5e9d6bcf05f47b41c48037f01c))
* remove tsconfig.tsbuildinfo from git tracking to fix build ([43345d5](https://github.com/el-j/magic-agent-helix/commit/43345d5c8fd4f5eaca22a5d667672f9ce600d98b))
* Replace any types with proper type definitions ([c467c64](https://github.com/el-j/magic-agent-helix/commit/c467c64916fd4af5a90d01e96b4f83c4dd21317f))

## [2.0.0](https://github.com/el-j/magic-agent-helix/compare/v1.4.0...v2.0.0) (2025-11-12)

### ⚠ BREAKING CHANGES

* Release 2.0.0 (#30)

### Bug Fixes

* Release 2.0.0 ([#30](https://github.com/el-j/magic-agent-helix/issues/30)) ([2dd46ef](https://github.com/el-j/magic-agent-helix/commit/2dd46ef46fce12469cf914a10d593cfdeb7a6a5a)), closes [#24](https://github.com/el-j/magic-agent-helix/issues/24) [#2](https://github.com/el-j/magic-agent-helix/issues/2)

## [2.0.0-alpha.1](https://github.com/el-j/magic-agent-helix/compare/v1.4.0...v2.0.0-alpha.1) (2025-11-12)

### ⚠ BREAKING CHANGES

* 1.4.0 release (#24)

### Features

* add VS Code extension VSIX to release assets ([16915bb](https://github.com/el-j/magic-agent-helix/commit/16915bba63046f2f7c5355871349e52f66e0c158))

### Bug Fixes

* 1.4.0 release ([#24](https://github.com/el-j/magic-agent-helix/issues/24)) ([6b051c8](https://github.com/el-j/magic-agent-helix/commit/6b051c80720c8dcd8197c1162ef6857f8717fb6b)), closes [#2](https://github.com/el-j/magic-agent-helix/issues/2)
* CLI execution detection to work with npm bin symlinks ([61b43b3](https://github.com/el-j/magic-agent-helix/commit/61b43b34171daed163ab0ddf85fa715553c14127))
* CLI symlink execution and add VS Code extension to releases ([#25](https://github.com/el-j/magic-agent-helix/issues/25)) ([b97ac13](https://github.com/el-j/magic-agent-helix/commit/b97ac130921ae30db2422e9db4a101af2f45ca50))
* Feature: Downgrade dependencies to Node 20.11.1 compatibility and fix playground frontend ([#27](https://github.com/el-j/magic-agent-helix/issues/27)) ([2fe7cac](https://github.com/el-j/magic-agent-helix/commit/2fe7cac94ded499075521ee310b280ac307a1e8c))
* remove tsconfig.tsbuildinfo from git tracking ([#26](https://github.com/el-j/magic-agent-helix/issues/26)) ([a085781](https://github.com/el-j/magic-agent-helix/commit/a085781baebd1e5e9d6bcf05f47b41c48037f01c))
* remove tsconfig.tsbuildinfo from git tracking to fix build ([43345d5](https://github.com/el-j/magic-agent-helix/commit/43345d5c8fd4f5eaca22a5d667672f9ce600d98b))

## [2.0.0-beta.1](https://github.com/el-j/magic-agent-helix/compare/v1.3.0...v2.0.0-beta.1) (2025-11-07)

### ⚠ BREAKING CHANGES

* 1.4.0 release (#24)

### Features

* align forward to version 2 0 0 ([#12](https://github.com/el-j/magic-agent-helix/issues/12)) ([96d6934](https://github.com/el-j/magic-agent-helix/commit/96d69349b8531b09d70995c91f231d2a01f38e6d))
* Copilot/align version 2 0 0 ([#13](https://github.com/el-j/magic-agent-helix/issues/13)) ([a965ea3](https://github.com/el-j/magic-agent-helix/commit/a965ea3938dcaef932ad1a37625d372293a2a168))
* semantic-release branch configuration for alpha/beta prerelease workflow ([#21](https://github.com/el-j/magic-agent-helix/issues/21)) ([9e76d7d](https://github.com/el-j/magic-agent-helix/commit/9e76d7dd5afb92c63b06a40f553a284f28c45561))

### Bug Fixes

* 1.4.0 release ([#24](https://github.com/el-j/magic-agent-helix/issues/24)) ([6b051c8](https://github.com/el-j/magic-agent-helix/commit/6b051c80720c8dcd8197c1162ef6857f8717fb6b)), closes [#2](https://github.com/el-j/magic-agent-helix/issues/2)
* Biome lint errors and add lint enforcement to CI ([#19](https://github.com/el-j/magic-agent-helix/issues/19)) ([c401976](https://github.com/el-j/magic-agent-helix/commit/c401976afbeaa1b6ab6d6a1c20635830a3df9e13))
* CLI symlink execution and add VS Code extension to releases ([#25](https://github.com/el-j/magic-agent-helix/issues/25)) ([b97ac13](https://github.com/el-j/magic-agent-helix/commit/b97ac130921ae30db2422e9db4a101af2f45ca50))
* dev back to 2.0.0 pre branch ([#17](https://github.com/el-j/magic-agent-helix/issues/17)) ([#20](https://github.com/el-j/magic-agent-helix/issues/20)) ([ca724a0](https://github.com/el-j/magic-agent-helix/commit/ca724a0b68c029b9a56e87fc8f6ed764808361ee)), closes [#13](https://github.com/el-j/magic-agent-helix/issues/13)
* remove tsconfig.tsbuildinfo from git tracking ([#26](https://github.com/el-j/magic-agent-helix/issues/26)) ([a085781](https://github.com/el-j/magic-agent-helix/commit/a085781baebd1e5e9d6bcf05f47b41c48037f01c))

## [1.4.0](https://github.com/el-j/magic-agent-helix/compare/v1.3.0...v1.4.0) (2025-11-07)

### Features

* align forward to version 2 0 0 ([#12](https://github.com/el-j/magic-agent-helix/issues/12)) ([96d6934](https://github.com/el-j/magic-agent-helix/commit/96d69349b8531b09d70995c91f231d2a01f38e6d))
* Copilot/align version 2 0 0 ([#13](https://github.com/el-j/magic-agent-helix/issues/13)) ([a965ea3](https://github.com/el-j/magic-agent-helix/commit/a965ea3938dcaef932ad1a37625d372293a2a168))
* semantic-release branch configuration for alpha/beta prerelease workflow ([#21](https://github.com/el-j/magic-agent-helix/issues/21)) ([9e76d7d](https://github.com/el-j/magic-agent-helix/commit/9e76d7dd5afb92c63b06a40f553a284f28c45561))

### Bug Fixes

* Biome lint errors and add lint enforcement to CI ([#19](https://github.com/el-j/magic-agent-helix/issues/19)) ([c401976](https://github.com/el-j/magic-agent-helix/commit/c401976afbeaa1b6ab6d6a1c20635830a3df9e13))
* dev back to 2.0.0 pre branch ([#17](https://github.com/el-j/magic-agent-helix/issues/17)) ([#20](https://github.com/el-j/magic-agent-helix/issues/20)) ([ca724a0](https://github.com/el-j/magic-agent-helix/commit/ca724a0b68c029b9a56e87fc8f6ed764808361ee)), closes [#13](https://github.com/el-j/magic-agent-helix/issues/13)

## [1.4.0-beta.1](https://github.com/el-j/magic-agent-helix/compare/v1.3.0...v1.4.0-beta.1) (2025-11-07)

### Features

* align forward to version 2 0 0 ([#12](https://github.com/el-j/magic-agent-helix/issues/12)) ([96d6934](https://github.com/el-j/magic-agent-helix/commit/96d69349b8531b09d70995c91f231d2a01f38e6d))
* Copilot/align version 2 0 0 ([#13](https://github.com/el-j/magic-agent-helix/issues/13)) ([a965ea3](https://github.com/el-j/magic-agent-helix/commit/a965ea3938dcaef932ad1a37625d372293a2a168))
* semantic-release branch configuration for alpha/beta prerelease workflow ([#21](https://github.com/el-j/magic-agent-helix/issues/21)) ([9e76d7d](https://github.com/el-j/magic-agent-helix/commit/9e76d7dd5afb92c63b06a40f553a284f28c45561))

### Bug Fixes

* Biome lint errors and add lint enforcement to CI ([#19](https://github.com/el-j/magic-agent-helix/issues/19)) ([c401976](https://github.com/el-j/magic-agent-helix/commit/c401976afbeaa1b6ab6d6a1c20635830a3df9e13))
* dev back to 2.0.0 pre branch ([#17](https://github.com/el-j/magic-agent-helix/issues/17)) ([#20](https://github.com/el-j/magic-agent-helix/issues/20)) ([ca724a0](https://github.com/el-j/magic-agent-helix/commit/ca724a0b68c029b9a56e87fc8f6ed764808361ee)), closes [#13](https://github.com/el-j/magic-agent-helix/issues/13)

## [1.4.0-beta.0](https://github.com/el-j/magic-agent-helix/compare/v1.3.0...v1.4.0-beta.1) (2025-11-02)

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
- Updated VS Code extension README with all features
- Added settings documentation with examples
- Documented keyboard shortcuts and quick access menu
- Added workspace configuration guide

### 🔧 Technical Improvements
- TypeScript strict mode compliance
- Zero critical issues or TODOs in codebase
- All builds passing successfully
- Full test coverage maintained

### ⚠️ Breaking Changes
- **Workflow Branch Names**: Changed default development branch name from `development` to `develop` in CI/CD workflows
  - If you have forked this repository and are using the `development` branch, please rename it to `develop` or update your workflow configurations accordingly
  - Affected workflows: `.github/workflows/release.yml`, `.github/workflows/ci.yml`

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
