# Pre-Release Checklist

Use this checklist before any release to ensure everything is ready.

## Pre-Release Verification

- [ ] **Versions Synchronized**
  ```bash
  grep -h '"version"' package.json packages/*/package.json
  # All should show the same version
  ```

- [ ] **All Tests Passing**
  ```bash
  npm run test:coverage
  # Expected: 160/160 tests passing
  ```

- [ ] **Build Successful**
  ```bash
  npm run build
  # Expected: 0 errors, all packages built
  ```

- [ ] **Linting Passes**
  ```bash
  npm run lint
  # Expected: 0 issues
  ```

- [ ] **VSIX Artifact Correct**
  ```bash
  npm run package --workspace=magic-helix-vscode
  ls packages/vscode-magic-helix/*.vsix
  # Expected: magic-helix-vscode-X.Y.Z.vsix
  ```

- [ ] **CLI Version Matches**
  ```bash
  node packages/magic-agent-helix/dist/cli.mjs --version
  # Expected: Should match package.json version
  ```

## Commit Format Check

- [ ] **Commits Use Conventional Format**
  ```bash
  git log --oneline -10
  # All commits should start with: feat:, fix:, chore:, refactor:, docs:, etc.
  ```

- [ ] **No Manual Version Changes**
  ```bash
  git diff HEAD~10 -- packages/*/package.json
  # Should only show automated sync changes, not manual edits
  ```

## Release Readiness

- [ ] **Semantic Release Will Work**
  ```bash
  npx semantic-release --dry-run
  # Should calculate next version without errors
  ```

- [ ] **GitHub Token Available** (for CI/CD)
  - Verify `GITHUB_TOKEN` secret in repository
  - Verify `NPM_TOKEN` secret in repository

- [ ] **VSCE Token Available** (optional, for Marketplace)
  - If publishing to VS Code Marketplace, verify `VSCE_TOKEN` secret

## Final Check

- [ ] All checklist items above completed
- [ ] Ready to push to main/develop/feature branch
- [ ] Release.yml will automatically:
  - Run tests
  - Build packages
  - Publish to npm
  - Sync all versions (npm run sync:versions)
  - Create GitHub release
  - Attach VSIX with correct version

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Tests failing | `npm run test:coverage` locally first |
| Build errors | `npm run build` with full output |
| Versions out of sync | `npm run sync:versions` |
| VSIX wrong version | Ensure package.json synced before packaging |
| Semantic release won't trigger | Check commit format (feat:, fix:, etc.) |
| VSIX not named correctly | Check `.releaserc.json` npm publish step |

## After Release

- [ ] Verify GitHub release created: https://github.com/el-j/magic-agent-helix/releases
- [ ] Verify VSIX attached to release
- [ ] Verify npm packages published:
  - https://www.npmjs.com/package/@el-j/magic-helix-core
  - https://www.npmjs.com/package/@el-j/magic-agent-helix
  - https://www.npmjs.com/package/@el-j/magic-helix-plugins
- [ ] All versions match the release tag

---

**Remember:** You no longer need to manually update package.json versions! The `npm run sync:versions` command and semantic-release automation handle everything.
