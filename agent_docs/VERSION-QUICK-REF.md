# Version Management Quick Reference

## TL;DR - Common Commands

```bash
# Check current version
grep '"version"' package.json

# Sync all packages to match root version
npm run sync:versions

# Sync to a specific version
npm run sync:versions -- --set 2.0.2

# Verify all packages are synced
grep -h '"version"' package.json packages/*/package.json

# Build with current version (outputs correct VSIX)
npm run build
npm run package --workspace=magic-helix-vscode
# Output: magic-helix-vscode-X.Y.Z.vsix ✅
```

## Key Principles

| Principle | Rule |
|-----------|------|
| **Single Source of Truth** | Root `package.json` defines the monorepo version |
| **No Manual Updates** | Don't edit individual package.json versions |
| **Automatic Sync** | Use `npm run sync:versions` before building |
| **Release Automation** | Semantic-release handles sync during publish |
| **One Version Per Branch** | Each branch maintains consistent version across all packages |

## Branch Version Strategy

- **main** → `2.0.1` (stable)
- **develop** → `2.1.0-beta.1` (beta)
- **feature/2.0.1-bug** → `2.0.1-alpha.1` (alpha)

## Build Artifact Names

```
magic-helix-vscode-2.0.1.vsix              # Main release
magic-helix-vscode-2.1.0-beta.1.vsix      # Beta release
magic-helix-vscode-2.0.1-alpha.1.vsix     # Feature branch (your current)
```

## The Old Problem (NOW FIXED ✅)

```
BEFORE: ❌
- Root: 1.4.0
- Core: 2.0.0
- Agent: 2.0.0
- VS Code: 1.3.0 (OUT OF SYNC!)
- Plugins: 3.0.0

AFTER: ✅
- Root: 2.0.1-alpha.1
- Core: 2.0.1-alpha.1
- Agent: 2.0.1-alpha.1
- VS Code: 2.0.1-alpha.1 (IN SYNC!)
- Plugins: 2.0.1-alpha.1
```

## Release Flow (Automated)

```
1. Make conventional commits (feat:, fix:, chore:)
2. Push to main/develop/feature/* branch
3. Semantic-release triggered automatically
4. All npm packages published with new version
5. npm run sync:versions automatically runs ← KEY
6. All package.json files updated to match
7. GitHub release created with VSIX
8. Done! All versions match ✅
```

## When You Need Manual Action

| Scenario | Action |
|----------|--------|
| Updating version locally | Edit root `package.json`, then `npm run sync:versions` |
| Switching between branches | Run `npm run sync:versions` |
| Before building artifacts | Run `npm run sync:versions` |
| Packages got out of sync | Run `npm run sync:versions` |
| Everything else | Semantic-release handles it automatically |

## Verify Everything Is Correct

```bash
# All checks in one command
npm run sync:versions && npm run build && npm run test:coverage

# Expected output:
# ✅ Versions synced
# ✅ All packages built
# ✅ 160/160 tests passed
# ✅ VSIX named correctly (magic-helix-vscode-2.0.1-alpha.1.vsix)
```

---

**For detailed info:** See `VERSION-MANAGEMENT.md`
