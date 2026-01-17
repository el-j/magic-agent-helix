# Release Strategy for Magic Agent Helix

## Branch-Based Release Strategy

This project uses semantic-release with branch-based versioning:

| Branch | Release Type | Version Format | Example |
|--------|-------------|----------------|---------|
| `main` | Production | `X.Y.Z` | `1.4.0`, `1.5.0` |
| `develop` | Beta (Pre-release) | `X.Y.Z-beta.N` | `1.4.0-beta.1` |
| `feature/*` | Alpha (Pre-release) | `X.Y.Z-alpha.N` | `1.4.0-alpha.1` |

## Typical Release Flow

```
feature/new-thing → develop → main
   (alpha)          (beta)    (production)
```

### Step-by-Step Process

1. **Feature Development**
   ```bash
   git checkout -b feature/new-feature develop
   # Make changes, commit with conventional commits
   git push origin feature/new-feature
   ```
   - Triggers alpha release (e.g., `1.4.0-alpha.1`)
   - Used for early testing

2. **Merge to Develop**
   ```bash
   # Via Pull Request or:
   git checkout develop
   git merge feature/new-feature
   git push origin develop
   ```
   - Triggers beta release (e.g., `1.4.0-beta.1`)
   - Used for integration testing and pre-production validation

3. **Merge to Main (Production)**
   ```bash
   # When beta is stable and tested:
   git checkout main
   git merge develop
   git push origin main
   ```
   - Triggers production release (e.g., `1.4.0`)
   - **Same base version as beta, just removes the `-beta.N` suffix**

## Version Increment Rules

Semantic-release analyzes commit messages to determine version bumps:

### Commit Types and Version Impact

| Commit Type | Version Change | Example |
|-------------|----------------|---------|
| `feat:` | Minor (Y) | `1.4.0` → `1.5.0` |
| `fix:` | Patch (Z) | `1.4.0` → `1.4.1` |
| `BREAKING CHANGE:` | Major (X) | `1.4.0` → `2.0.0` |
| `docs:`, `chore:`, etc. | None | `1.4.0` → `1.4.0` |

### Examples

```bash
# Feature commit (minor bump)
git commit -m "feat: add new AI refinement feature"
# Result: 1.4.0 → 1.5.0

# Bug fix commit (patch bump)
git commit -m "fix: resolve null pointer in plugin analyzer"
# Result: 1.4.0 → 1.4.1

# Breaking change (major bump)
git commit -m "feat: redesign CLI interface

BREAKING CHANGE: command syntax has changed"
# Result: 1.4.0 → 2.0.0
```

## Real-World Scenario

Let's trace through a complete release cycle:

### Scenario: Adding Multiple Features

1. **Starting Point**: `main` is at `v1.3.0`

2. **Feature Branch Work**
   ```bash
   git checkout -b feature/ai-refinement develop
   git commit -m "feat: add AI refinement capability"
   git push
   ```
   - Creates: `v1.4.0-alpha.1`

3. **Merge to Develop**
   ```bash
   git checkout develop
   git merge feature/ai-refinement
   git push
   ```
   - Creates: `v1.4.0-beta.1` (includes AI refinement)

4. **Another Feature**
   ```bash
   git checkout -b feature/lint-enforcement develop
   git commit -m "fix: add lint enforcement to CI"
   git push
   ```
   - Creates: `v1.4.0-alpha.2` (on feature branch)

5. **Merge Second Feature to Develop**
   ```bash
   git checkout develop
   git merge feature/lint-enforcement
   git push
   ```
   - Creates: `v1.4.0-beta.2` (includes both features)

6. **Test Beta, Then Promote to Production**
   ```bash
   git checkout main
   git merge develop
   git push
   ```
   - Creates: `v1.4.0` ← **Same base version, not 1.5.0!**

7. **Next Feature on Develop**
   ```bash
   git checkout -b feature/new-commands develop
   git commit -m "feat: add new CLI commands"
   git checkout develop
   git merge feature/new-commands
   git push
   ```
   - Creates: `v1.5.0-beta.1` ← **NOW it increments to 1.5.0**

8. **Merge to Main**
   ```bash
   git checkout main
   git merge develop
   git push
   ```
   - Creates: `v1.5.0` (production)

## Common Questions

### Q: Why doesn't main jump to 1.5.0 after beta testing 1.4.0-beta.X?

**A**: Because semantic-release promotes the same base version from beta to production. The beta releases (1.4.0-beta.1, 1.4.0-beta.2) are all testing versions of the future 1.4.0 production release. When you merge to main, you're saying "1.4.0 is ready for production" - not "let's create a new 1.5.0 version."

### Q: When will we get to 1.5.0?

**A**: After 1.4.0 is released on main, the next feature added to develop will trigger 1.5.0-beta.1. When that beta is merged to main, it becomes 1.5.0.

### Q: What if I have a hotfix needed urgently on main?

**A**: 
```bash
# Create hotfix branch from main
git checkout -b hotfix/urgent-fix main
git commit -m "fix: critical security issue"
git checkout main
git merge hotfix/urgent-fix
git push
```
- Creates: `v1.4.1` (patch bump)
- Then merge main back to develop to keep them in sync

### Q: Can I skip the beta phase?

**A**: Yes, but not recommended for production projects. Merge feature branches directly to main:
```bash
git checkout main
git merge feature/new-feature
git push
```
- Skips beta testing, goes straight to production release

### Q: What if semantic-release says "no new version to release"?

**A**: This means no commits since the last release matched the version bump rules. You need at least one `feat:` or `fix:` commit.

## Best Practices

1. ✅ **Always use conventional commit messages**
   - `feat:`, `fix:`, `docs:`, `chore:`, etc.
   
2. ✅ **Test in beta before promoting to main**
   - Beta releases should be thoroughly tested
   
3. ✅ **Keep develop and main in sync**
   - After releasing to main, ensure develop is up-to-date
   
4. ✅ **Use feature branches for development**
   - Never commit directly to develop or main
   
5. ✅ **Document breaking changes clearly**
   - Use `BREAKING CHANGE:` in commit body

6. ❌ **Never manually create version tags**
   - Let semantic-release handle all versioning
   
7. ❌ **Don't merge main back to develop with old versions**
   - Can cause version conflicts

## Troubleshooting

### Issue: Tag already exists

**Problem**: `fatal: tag 'v1.4.0-beta.1' already exists`

**Solution**: Delete the tag and release, then re-run:
```bash
git push origin :refs/tags/v1.4.0-beta.1
```

See [BETA-RELEASE-FIX.md](./BETA-RELEASE-FIX.md) for detailed instructions.

### Issue: Wrong version calculated

**Problem**: Expected v1.5.0 but got v1.4.1

**Solution**: Check your commit messages. Only `feat:` triggers minor bumps. `fix:` triggers patch bumps.

### Issue: No release created

**Problem**: Workflow runs but says "no new version"

**Solution**: Ensure you have conventional commits since the last release:
```bash
git log --oneline $(git describe --tags --abbrev=0)..HEAD
```

---

**Last Updated**: 2025-11-07  
**Configuration File**: `.releaserc.json`  
**Workflow File**: `.github/workflows/release.yml`
