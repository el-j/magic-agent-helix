# Release Flow: Complete End-to-End Guide

## Release Lifecycle with Automatic Version Sync

This document explains how the release pipeline works with the new version synchronization system.

### Overview Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Developer: Make conventional commits on main/develop/feature/* │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ↓
         ┌─────────────────────────────────┐
         │ GitHub Actions: release.yml     │
         │ Triggered on push               │
         └──────────────┬──────────────────┘
                        │
         ┌──────────────┴──────────────────┐
         │ 1. Checkout & Install           │
         │ 2. Lint check                   │
         │ 3. Full build                   │
         │ 4. Test & Coverage              │
         └──────────────┬──────────────────┘
                        │
         ┌──────────────┴──────────────────────────────────────┐
         │ semantic-release (.releaserc.json)                  │
         │                                                     │
         │ ├─ Analyze commits (feat:, fix:, BREAKING:)       │
         │ ├─ Determine next version (e.g., 2.0.0 → 2.0.1)   │
         │ │                                                  │
         │ ├─ Publish npm: @el-j/magic-helix-core@2.0.1            │
         │ ├─ Publish npm: @el-j/magic-agent-helix@2.0.1           │
         │ ├─ Publish npm: @el-j/magic-helix-plugins@2.0.1         │
         │ │                                                  │
         │ ├─ **EXEC SYNC: npm run sync:versions -- --set 2.0.1**  ← KEY STEP
         │ │  └─ Updates ALL 5 package.json files to 2.0.1   │
         │ │                                                  │
         │ ├─ Create GitHub Release                          │
         │ │  └─ Attach: magic-helix-vscode-2.0.1.vsix       │
         │ │  └─ Attach: CLI distribution                    │
         │ │                                                  │
         │ └─ Git commit & tag                               │
         │    └─ All 5 package.json synced in commit         │
         └──────────────┬──────────────────────────────────────┘
                        │
         ┌──────────────┴──────────────────┐
         │ ✅ Release Complete!            │
         │                                 │
         │ NPM packages published          │
         │ GitHub release created          │
         │ VSIX attached                   │
         │ All versions synced             │
         │ Tags pushed                     │
         └──────────────────────────────────┘
```

## Step-by-Step Release Process

### Phase 1: Developer Commits

```bash
# On feature/2.0.1-externalPluginSystem branch
git commit -m "fix: Handle plugin edge case"
# Conventional format: fix:, feat:, chore:, refactor:, etc.

# Push to feature branch
git push origin feature/2.0.1-externalPluginSystem
```

**What gets analyzed:**
- Commit messages must follow [Conventional Commits](https://www.conventionalcommits.org/)
- `feat:` → minor version bump (e.g., 2.0.0 → 2.1.0)
- `fix:` → patch version bump (e.g., 2.0.0 → 2.0.1)
- `BREAKING CHANGE:` → major version bump (e.g., 2.0.0 → 3.0.0)

### Phase 2: GitHub Actions Workflow

**File: `.github/workflows/release.yml`**

```yaml
on:
  push:
    branches:
      - main        # Release versions: 2.0.1
      - develop     # Prerelease: 2.1.0-beta.1
      - 'feature/*' # Prerelease: 2.1.0-alpha.1
```

**Jobs run in sequence:**

1. **Checkout Code**
   ```bash
   git clone repo
   git checkout feature/2.0.1-externalPluginSystem
   ```

2. **Install Dependencies**
   ```bash
   npm ci  # Clean install
   ```

3. **Lint Check**
   ```bash
   npm run lint  # Biome checks all code
   ```

4. **Build All Packages**
   ```bash
   npm run build
   # Outputs with current version in package.json
   # (still at 2.0.1-alpha.1 at this point)
   ```

5. **Test & Coverage**
   ```bash
   npm run test:coverage  # 160/160 tests must pass
   ```

6. **Package VS Code Extension**
   ```bash
   npm run package --workspace=magic-helix-vscode
   # Creates: magic-helix-vscode-2.0.1-alpha.1.vsix
   ```

7. **Semantic Release** ← **THE MAGIC HAPPENS HERE**
   ```
   Only runs if: startsWith(github.ref, 'refs/tags/') == false
   (i.e., don't run on already-tagged releases)
   ```

### Phase 3: Semantic Release Pipeline

**File: `.releaserc.json`**

#### Step 3.1: Analyze Commits
```bash
# Semantic-release reads all commits since last release
# Analyzes conventional format
# Determines next version

Example:
  Last release: v2.0.0
  New commits: fix:, fix:, feat:
  → Next version: v2.1.0 (minor bump from feat:)
```

#### Step 3.2: Publish NPM Packages
```bash
# 3 separate @semantic-release/npm blocks

npm publish packages/magic-helix-core@2.1.0
npm publish packages/magic-agent-helix@2.1.0
npm publish packages/magic-helix-plugins@2.1.0
```

**Each package publishes independently** with the calculated version.

#### Step 3.3: **SYNC VERSIONS** (Your New Feature! 🎉)
```bash
# @semantic-release/exec block
npm run sync:versions -- --set 2.1.0

Action:
  1. Update root package.json: 2.0.1-alpha.1 → 2.1.0
  2. Update packages/magic-helix-core/package.json → 2.1.0
  3. Update packages/magic-agent-helix/package.json → 2.1.0
  4. Update packages/vscode-magic-helix/package.json → 2.1.0
  5. Update packages/magic-helix-plugins/package.json → 2.1.0
  6. Update playground/package.json → 2.1.0

Result: All 5 packages now at 2.1.0 in version control
```

#### Step 3.4: Create GitHub Release
```bash
# @semantic-release/github block
- Create release tag: v2.1.0
- Attach assets:
  - magic-helix-vscode-2.1.0.vsix ✅ Correct version!
  - CLI distribution files
```

#### Step 3.5: Git Commit & Push
```bash
# @semantic-release/git block
git add:
  - package.json (root)
  - packages/magic-helix-core/package.json
  - packages/magic-agent-helix/package.json
  - packages/vscode-magic-helix/package.json
  - packages/magic-helix-plugins/package.json
  - playground/package.json
  - CHANGELOG.md

git commit -m "chore(release): 2.1.0 [skip ci]

Generated changelog notes..."

git push --follow-tags
```

### Phase 4: Release Complete

All artifacts are now published with **consistent, matching versions**:

```
NPM Registry:
  @el-j/magic-helix-core@2.1.0          ✅
  @el-j/magic-agent-helix@2.1.0         ✅
  @el-j/magic-helix-plugins@2.1.0       ✅

GitHub Release:
  Tag: v2.1.0
  Assets:
    - magic-helix-vscode-2.1.0.vsix ✅ Correct!
    - CLI distribution

Version Control:
  All package.json files: 2.1.0    ✅ Synced!
```

## Release Scenarios

### Scenario 1: Release from Main Branch

```bash
# On main (stable releases)
git commit -m "fix: Critical bug fix"
git push origin main

# Release.yml triggers
# Conventional analyzer: sees "fix:" → patch bump
# semantic-release: v2.0.0 → v2.0.1
# sync:versions: all packages → 2.0.1
# GitHub release: v2.0.1 with VSIX

Result: Stable release 2.0.1 across all packages ✅
```

### Scenario 2: Prerelease from Develop

```bash
# On develop (beta releases)
git commit -m "feat: New plugin system"
git push origin develop

# Release.yml triggers
# .releaserc.json: develop branch → prerelease: "beta"
# semantic-release: v2.0.1 → v2.1.0-beta.1
# sync:versions: all packages → 2.1.0-beta.1
# GitHub release: v2.1.0-beta.1 with VSIX

Result: Beta release 2.1.0-beta.1 across all packages ✅
```

### Scenario 3: Feature Branch Work (Your Current Case)

```bash
# On feature/2.0.1-externalPluginSystem
git commit -m "fix: Handle plugin loading error"
git push origin feature/2.0.1-externalPluginSystem

# Release.yml triggers
# .releaserc.json: feature/* branch → prerelease: "alpha"
# semantic-release: v2.0.0 → v2.0.1-alpha.1
# sync:versions: all packages → 2.0.1-alpha.1
# GitHub release: v2.0.1-alpha.1 with VSIX

Result: Alpha release 2.0.1-alpha.1 across all packages ✅
VSIX filename: magic-helix-vscode-2.0.1-alpha.1.vsix ✅
```

## Version Number Progression

### Typical Release Journey

```
Initial develop: v2.0.0

Week 1 - Feature Branch Work:
  feature/feature-x
  → sync:versions: 2.0.0-alpha.1
  → commit: 2.0.0-alpha.2
  → commit: 2.0.0-alpha.3

Merge to develop:
  develop → v2.0.1-beta.1
  develop → v2.0.1-beta.2
  develop → v2.0.1-beta.3

Merge to main (Release):
  main → v2.0.1 (stable!)

Next feature branch:
  feature/next-feature
  → v2.1.0-alpha.1 (preparing for 2.1.0)
```

## Configuration Deep Dive

### .releaserc.json Structure

```json
{
  "branches": [
    "main",           // Stable releases: v2.0.1
    {
      "name": "develop",
      "prerelease": "beta"  // v2.1.0-beta.1
    },
    {
      "name": "feature/*",
      "prerelease": "alpha" // v2.1.0-alpha.1
    }
  ],
  "plugins": [
    // Commit analyzer: determine version bump
    ["@semantic-release/commit-analyzer", {...}],
    
    // Generate release notes
    ["@semantic-release/release-notes-generator", {...}],
    
    // Update CHANGELOG.md
    ["@semantic-release/changelog", {...}],
    
    // Publish 3 npm packages
    ["@semantic-release/npm", {"pkgRoot": "packages/magic-helix-core"}],
    ["@semantic-release/npm", {"pkgRoot": "packages/magic-agent-helix"}],
    ["@semantic-release/npm", {"pkgRoot": "packages/magic-helix-plugins"}],
    
    // ✅ SYNC VERSIONS (YOUR KEY ADDITION!)
    ["@semantic-release/exec", {
      "publishCmd": "npm run sync:versions -- --set ${nextRelease.version}"
    }],
    
    // Create GitHub release with VSIX
    ["@semantic-release/github", {...}],
    
    // Commit synced versions to git
    ["@semantic-release/git", {...}]
  ]
}
```

## Troubleshooting Release Issues

### Problem: Commits not triggering release

**Solution:** Ensure conventional format
```bash
✅ fix: Handle edge case
✅ feat: Add new feature
❌ Fixed bug
❌ Updated code
```

### Problem: Versions still out of sync

**Solution:** Run manually before pushing
```bash
npm run sync:versions
git add package.json packages/*/package.json
git commit -m "chore: sync versions"
git push
```

### Problem: VSIX has wrong version

**Solution:** The version comes from sync:versions during release
```bash
# Check current version
grep '"version"' package.json

# Manually fix if needed
npm run sync:versions -- --set 2.0.1
```

### Problem: Release didn't publish

**Solution:** Check if commits are conventional format
```bash
# Dry run to see what would happen
npx semantic-release --dry-run

# Check git log
git log --oneline | head -10
```

## Summary

The new version synchronization system ensures:

✅ **No manual version updates** - Sync script handles it
✅ **Consistent releases** - All packages at same version
✅ **Correct VSIX names** - Version always matches tag
✅ **Automated releases** - semantic-release runs the sync
✅ **One source of truth** - Root package.json rules

**Key Innovation:** The `@semantic-release/exec` plugin runs `npm run sync:versions` after npm publishes, ensuring all packages stay synchronized in the git commit that semantic-release creates.
