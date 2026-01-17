# Quick Start: Publishing with Trusted Publisher

## Current Status ✅

Your repo is **fully configured** for npm Trusted Publisher (OIDC):

- ✅ Workflow has `id-token: write` permission
- ✅ `setup-node` configured with npm registry
- ✅ All packages have `provenance: true`
- ✅ Scoped packages: `@el-j/magic-helix-core`, `@el-j/magic-agent-helix`, `@el-j/magic-helix-plugins`

## What You Need to Do

### Step 1: Generate Automation Token (For First Publish)

Since your scoped packages don't exist yet on npm, you need a token for the **first publish only**:

1. Go to: https://www.npmjs.com/settings/el-j/tokens
2. Click **"Generate New Token"** → **"Automation"**
   - ⚠️ **NOT** "Publish" or "Granular Access Token"
   - Automation tokens **bypass 2FA** (needed for CI)
3. Copy the token (starts with `npm_...`)

### Step 2: Add Token to GitHub Secrets

1. Go to: https://github.com/el-j/magic-agent-helix/settings/secrets/actions
2. Click **"New repository secret"**
3. Name: `NPM_TOKEN`
4. Value: (paste the automation token from step 1)
5. Click **"Add secret"**

### Step 3: Trigger First Release

```bash
# Merge to develop or main
git push origin develop
```

The GitHub Action will:
1. Build all packages
2. Run tests
3. Use `NPM_TOKEN` to publish to npm (first time)
4. Create GitHub release
5. Publish VS Code extension

### Step 4: Set Up Trusted Publishers (After First Publish)

Once packages exist on npm, configure Trusted Publishers for **each package**:

#### For `@el-j/magic-helix-core`:
1. Go to: https://www.npmjs.com/package/@el-j/magic-helix-core
2. Click **"Settings"** tab
3. Scroll to **"Publishing access"**
4. Select **"Require two-factor authentication and Granular Access Token (recommended)"**
5. Scroll to **"Trusted Publisher"**
6. Click **"Set up connection"**
7. Fill in:
   ```
   Organization or user: el-j
   Repository: magic-agent-helix
   Workflow: .github/workflows/release.yml
   Environment name: (leave empty)
   ```
8. Click **"Add Trusted Publisher"**

#### Repeat for other packages:
- `@el-j/magic-agent-helix`
- `@el-j/magic-helix-plugins`

### Step 5: Future Releases (Automatic!)

After Trusted Publishers are configured:
- ✅ No need to use `NPM_TOKEN` (OIDC handles auth)
- ✅ Token stays as fallback (no harm keeping it)
- ✅ Every publish includes **provenance attestation** (cryptographic proof)
- ✅ npm package page shows 🛡️ "Published using GitHub Actions" badge

## Verification

After first release, check npm package pages:

1. **Packages exist**: 
   - https://www.npmjs.com/package/@el-j/magic-helix-core
   - https://www.npmjs.com/package/@el-j/magic-agent-helix
   - https://www.npmjs.com/package/@el-j/magic-helix-plugins

2. **Provenance visible**: Each package page shows provenance section linking to GitHub Actions run

3. **Trusted Publisher configured**: Settings page shows GitHub workflow connection

## Troubleshooting

### "EOTP - This operation requires a one-time password"
- Your token is a **User token** (not Automation)
- Regenerate as **Automation token**

### "403 Forbidden" on publish
- Check `NPM_TOKEN` secret is set correctly
- Verify you have publish access to `@el-j` org
- Ensure packages have `publishConfig.access: "public"`

### Trusted Publisher option not showing
- Package must be published first (chicken-egg problem)
- Use Automation token for first publish
- Then configure Trusted Publisher

## Why This Setup?

**Security**: Automation token for bootstrap → Trusted Publisher for ongoing releases

**Benefits**:
- No long-lived credentials in CI (after Trusted Publisher setup)
- Cryptographic proof of build origin
- Automatic rotation
- Scoped to specific workflow + repo

**Backward Compatible**: Token stays as fallback if OIDC fails

---

## TL;DR

1. **Now**: Generate Automation token → Add as `NPM_TOKEN` secret
2. **First release**: Push to `develop` → GitHub Actions publishes packages
3. **After publish**: Configure Trusted Publishers on npm for all 3 packages
4. **Future**: OIDC handles everything automatically ✨

For full details, see: [NPM-TRUSTED-PUBLISHER-SETUP.md](./NPM-TRUSTED-PUBLISHER-SETUP.md)
