# Version Management Guide for Magic Agent Helix Monorepo

## Problem Solved

Previously, the monorepo had **version inconsistencies** across packages:
- Root: 1.4.0
- Core: 2.0.0
- Agent: 2.0.0
- VS Code Extension: **1.3.0** ❌ (OUT OF SYNC!)
- Plugins: 3.0.0
- Playground: 0.1.0

This caused confusion and release artifacts with mismatched versions.

## Solution: Synchronized Version Management

All packages now share **a single source of truth**: the root `package.json` version.

### How It Works

#### 1. **Single Version Source**
All 5 workspace packages automatically stay in sync with the root `package.json` version.

```bash
# Root package.json defines the monorepo version
"version": "2.0.1-alpha.1"

# All workspace packages automatically get the same version:
# - packages/magic-helix-core
# - packages/magic-agent-helix
# - packages/vscode-magic-helix (now correctly versioned!)
# - packages/magic-helix-plugins
# - playground
```

#### 2. **Automated Sync Script**
Use `sync-versions.js` to synchronize all versions instantly:

```bash
# Sync to current root version
npm run sync:versions

# Sync to a specific version
npm run sync:versions -- --set 2.0.1
```

**Output Example:**
```
🔄 Syncing monorepo version to: 2.0.1-alpha.1
✅ Updated root package.json: 2.0.1-alpha.1
✅ Updated packages/magic-helix-core/package.json: 2.0.0 → 2.0.1-alpha.1
✅ Updated packages/magic-agent-helix/package.json: 2.0.0 → 2.0.1-alpha.1
✅ Updated packages/vscode-magic-helix/package.json: 1.3.0 → 2.0.1-alpha.1
✅ Updated packages/magic-helix-plugins/package.json: 3.0.0 → 2.0.1-alpha.1
✅ Updated playground/package.json: 0.1.0 → 2.0.1-alpha.1

✨ All versions synced to 2.0.1-alpha.1
```

#### 3. **Automated Release Pipeline**
During `semantic-release`, versions are automatically synced:

```json
// .releaserc.json includes:
[
  "@semantic-release/npm",  // Publish core
  // ... publish agent, plugins ...
  [
    "@semantic-release/exec",
    {
      "publishCmd": "npm run sync:versions -- --set ${nextRelease.version}"
    }
  ],
  "@semantic-release/github",  // Create GitHub release with correct version
  "@semantic-release/git"       // Commit all synced versions
]
```

## Workflow Examples

### Local Development (Current Feature Branch)

**Feature branches** use prerelease versions with alpha tags:

```bash
# On feature/2.0.1-externalPluginSystem branch
# Current version: 2.0.1-alpha.1

# Build artifacts include correct version
npm run build
# Output: magic-helix-vscode-2.0.1-alpha.1.vsix ✅

# Make a fix, update root version manually:
# Edit package.json: "version": "2.0.1-alpha.2"

# Sync all packages
npm run sync:versions

# Rebuild with new version
npm run build:vscode
# Output: magic-helix-vscode-2.0.1-alpha.2.vsix ✅
```

### Release Process (Semantic Release)

**Automatic on push to main/develop branches:**

1. Conventional commits analyzed (feat:, fix:, BREAKING CHANGE:, etc.)
2. **semantic-release** determines next version (2.0.1 → 2.1.0, etc.)
3. All 3 npm packages published with new version
4. **`npm run sync:versions` automatically runs** ← Key step!
5. All package.json files updated to match
6. GitHub release created with VSIX attachment
7. Git tag created and pushed

**Result:** All versions automatically match, no manual edits needed!

### Switching Between Branches

```bash
# Working on feature/2.0.1-externalPluginSystem at 2.0.1-alpha.5
npm run build  # Creates 2.0.1-alpha.5 artifacts

# Switch to develop
git checkout develop

# Pull latest (now at 2.1.0-beta.3)
git pull origin develop

# Auto-sync to develop's version
npm run sync:versions

# Now building with correct version
npm run build  # Creates 2.1.0-beta.3 artifacts
```

## Version Naming Convention

The monorepo follows **semantic versioning with prerelease tags**:

### Release Branches
- **main**: `2.0.1` (stable release)
- **develop**: `2.1.0-beta.1` (beta prerelease)
- **feature/\***: `2.1.0-alpha.1` (alpha prerelease)

### Version Examples
- `2.0.0` - Stable release
- `2.0.1` - Patch release
- `2.1.0` - Minor release (new features)
- `3.0.0` - Major release (breaking changes)
- `2.0.1-alpha.1` - Alpha prerelease on feature branch
- `2.1.0-beta.1` - Beta prerelease on develop

## Build Artifacts

### VS Code Extension VSIX
```
magic-helix-vscode-X.Y.Z.vsix
magic-helix-vscode-2.0.1-alpha.1.vsix  ✅ Now correctly versioned!
```

### CLI Distribution
```
packages/magic-agent-helix/dist/cli.mjs
# Shebang includes version check if needed
```

### npm Packages
```
@magic-helix/core@2.0.1-alpha.1
@magic-helix/agent@2.0.1-alpha.1
@magic-helix/plugins@2.0.1-alpha.1
```

## Common Tasks

### Check Current Monorepo Version
```bash
grep '"version"' package.json
# "version": "2.0.1-alpha.1"
```

### Verify All Packages are Synced
```bash
grep -h '"version"' package.json packages/*/package.json
# Should show same version 5 times
```

### Update Version Before Release
```bash
# Edit package.json manually (for feature branches)
# Then sync everything
npm run sync:versions

# OR use shorthand for specific version
npm run sync:versions -- --set 2.0.2-alpha.1
```

### Pre-Commit Check (Optional)
To ensure versions never get out of sync, you can add a pre-commit hook:

```bash
npm run install:hooks

# Edit .git/hooks/pre-commit to add:
npm run sync:versions
```

## Release Checklist

- [ ] All commits follow conventional commit format (`feat:`, `fix:`, `chore:`, etc.)
- [ ] Tests pass: `npm run test:coverage`
- [ ] Linting passes: `npm run lint`
- [ ] Version is correct in root package.json
- [ ] Run `npm run sync:versions` to sync all packages
- [ ] Artifacts build correctly: `npm run build`
- [ ] VS Code extension packages: `npm run package --workspace=magic-helix-vscode`
- [ ] Check `.vsix` filename has correct version
- [ ] Push to main/develop for semantic-release to trigger
- [ ] Release automatically publishes with synced versions ✅

## Troubleshooting

### Versions Out of Sync After Git Pull
```bash
# Simply run sync to match root version
npm run sync:versions
```

### VSIX Filename Has Wrong Version
```bash
# Root package.json is out of date
# Update it manually then sync
npm run sync:versions
```

### Semantic-Release Not Creating Release
```bash
# Check if commits follow conventional format
git log --oneline | head -10
# Should show: feat:, fix:, chore:, refactor:, etc.

# Run semantic-release locally to test
npx semantic-release --dry-run
```

### Different Versions on Different Branches
This is **expected and correct**! Each branch maintains its own version:
- **main**: Last stable (e.g., 2.0.1)
- **develop**: Next prerelease (e.g., 2.1.0-beta.1)
- **feature/X**: Current work (e.g., 2.1.0-alpha.1)

Just run `npm run sync:versions` when you switch branches.

## Files Modified

- `package.json` - Root now defines single version source
- `scripts/sync-versions.js` - NEW: Synchronization script
- `.releaserc.json` - Updated to auto-sync during release
- `.github/workflows/release.yml` - Already references correct workspace names

## Summary

✅ **You no longer need to manually update package.json versions!**

- Root `package.json` is the single source of truth
- `npm run sync:versions` keeps everything in sync locally
- Semantic-release automatically syncs during releases
- VS Code extension now always has correct version in VSIX filename
- All artifacts match monorepo version consistently
