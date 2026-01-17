# NPM Trusted Publisher Setup Guide

## What is Trusted Publisher?

Trusted Publisher uses **OpenID Connect (OIDC)** to authenticate GitHub Actions workflows with npm **without storing any tokens**. It's more secure than classic npm tokens because:

- ✅ No secrets to manage or rotate
- ✅ Automatic authentication via GitHub's identity
- ✅ Scoped to specific workflows and branches
- ✅ Provides cryptographic proof of where packages were published (provenance)

## Setup Steps

### 1. Configure Trusted Publisher on npm

For **each package** (`@el-j/magic-helix-core`, `@el-j/magic-agent-helix`, `@el-j/magic-helix-plugins`):

1. Go to the package settings page:
   - `https://www.npmjs.com/package/@el-j/magic-helix-core/settings` (after first publish)
   - Or go to your org: `https://www.npmjs.com/settings/el-j/packages`

2. Scroll to **"Publishing access"** section

3. Select **"Require two-factor authentication and Granular Access Token (recommended)"**
   - This is the option shown in your screenshot

4. Click **"Update Access Settings"**

5. Scroll to **"Trusted Publisher"** section (you'll see this after the package exists)

6. Click **"Set up connection"**

7. Fill in the GitHub Actions workflow details:
   ```
   Organization or user: el-j
   Repository: magic-agent-helix
   Workflow: .github/workflows/release.yml
   Environment name: (leave blank for now)
   ```

8. Click **"Add Trusted Publisher"**

### 2. GitHub Workflow Configuration

Your workflow is already configured! The key parts:

```yaml
permissions:
  id-token: write  # Required for OIDC
  contents: write
  
steps:
  - uses: actions/setup-node@v4
    with:
      node-version: '20.x'
      registry-url: 'https://registry.npmjs.org'  # Important!
```

### 3. First Publish (Bootstrap)

**Important**: Trusted Publishers only work for **existing packages**. For the first publish of scoped packages, you need to use an **Automation Token**:

#### Option A: Use Automation Token (First Publish Only)

1. Go to https://www.npmjs.com/settings/el-j/tokens
2. Click **"Generate New Token"** → **"Automation"**
3. Copy the token
4. Add to GitHub Secrets: `Settings` → `Secrets and variables` → `Actions` → `New repository secret`
   - Name: `NPM_TOKEN`
   - Value: (paste the automation token)
5. First release will use this token
6. After packages exist, configure Trusted Publishers as shown above
7. Future releases will use OIDC automatically (token still works as fallback)

#### Option B: Manual First Publish

```bash
# Build all packages
npm run build

# Login to npm (you'll need 2FA code)
npm login

# Publish each package manually
cd packages/magic-helix-core
npm publish --access public

cd ../magic-agent-helix
npm publish --access public

cd ../magic-helix-plugins
npm publish --access public
```

After manual publish, set up Trusted Publishers in npm settings.

### 4. Configure Provenance (Attestations)

Provenance provides cryptographic proof of your package's build:

In each `package.json`, ensure `publishConfig` has:

```json
{
  "publishConfig": {
    "access": "public",
    "provenance": true
  }
}
```

This is automatically enabled when using GitHub Actions with OIDC.

## How It Works

1. **GitHub Actions starts** → Requests OIDC token from GitHub
2. **npm verifies** → Checks token signature and workflow details
3. **If match** → Grants publish permission (no NPM_TOKEN needed!)
4. **Provenance** → Attaches build metadata to package

## Verification

After publishing with Trusted Publisher, you'll see on the npm package page:

- 🛡️ **"Published using GitHub Actions"** badge
- 📋 **Provenance** section showing workflow details
- 🔗 Link to exact GitHub Actions run

## Troubleshooting

### Error: "EOTP - This operation requires a one-time password"
- Your `NPM_TOKEN` is a User token (requires 2FA)
- Switch to Automation token or set up Trusted Publisher

### Error: "Unable to authenticate with OIDC"
- Check workflow has `id-token: write` permission
- Verify `registry-url` is set in `setup-node`
- Ensure package name matches npm configuration

### Trusted Publisher not available
- Package must exist on npm first
- Only works with GitHub Actions (not other CI)
- Requires npm org or user scope

## Migration Path

**Current State** (your setup):
- ✅ Workflow has OIDC permissions
- ✅ Scoped packages configured: `@el-j/*`
- ⚠️ `NPM_TOKEN` secret exists (Automation token recommended for bootstrap)

**Recommended Steps**:
1. Generate Automation token → Add as `NPM_TOKEN` secret
2. Merge to `develop` → Trigger release
3. After first publish succeeds → Configure Trusted Publishers for all 3 packages
4. Future releases use OIDC automatically (token stays as fallback)
5. (Optional) Remove `NPM_TOKEN` secret after Trusted Publishers work

## Security Benefits

**Old Way (NPM_TOKEN)**:
- ❌ Long-lived token stored in GitHub
- ❌ If leaked, anyone can publish to your packages
- ❌ Must rotate manually
- ❌ Works from anywhere (not just CI)

**New Way (Trusted Publisher/OIDC)**:
- ✅ No stored credentials
- ✅ Only works from your specific GitHub workflow
- ✅ Automatic token rotation
- ✅ Scoped to specific repository + workflow
- ✅ Cryptographic proof of origin (provenance)

## References

- [npm Trusted Publishers Docs](https://docs.npmjs.com/generating-provenance-statements)
- [GitHub OIDC Docs](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- [npm Provenance Blog](https://github.blog/2023-04-19-introducing-npm-package-provenance/)
