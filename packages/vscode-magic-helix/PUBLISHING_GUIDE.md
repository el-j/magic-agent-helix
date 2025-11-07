# VS Code Marketplace Publishing Guide

## ✅ Extension Package Ready!

Your extension has been successfully packaged:
- **File**: `vscode-magic-helix-0.3.0.vsix`
- **Size**: 15.96 KB
- **Location**: `/Users/rex-fab-alt/Documents/code/playground/magic-agent-helix/packages/vscode-magic-helix/`

## 📝 Pre-Publishing Checklist

- ✅ Extension built successfully
- ✅ Package.json configured with publisher "el-j"
- ✅ README.md included (8.33 KB)
- ✅ LICENSE file added
- ✅ Version set to 0.3.0
- ✅ .vscodeignore configured correctly

## 🚀 Publishing Steps

### Step 1: Get a Personal Access Token (PAT)

If you don't already have one:

1. Go to https://dev.azure.com/
2. Sign in with your Microsoft account
3. Click on your profile icon → Security → Personal Access Tokens
4. Click "+ New Token"
5. Configure:
   - **Name**: VS Code Marketplace Publishing
   - **Organization**: All accessible organizations
   - **Expiration**: Custom (1 year recommended)
   - **Scopes**: Click "Show all scopes" → select **Marketplace** → check **Manage**
6. Click "Create" and **copy the token immediately** (you won't see it again!)

### Step 2: Create/Verify Publisher

If you haven't registered the publisher "el-j":

1. Go to https://marketplace.visualstudio.com/manage
2. Sign in with your Microsoft account
3. Click "Create publisher"
4. Enter:
   - **ID**: el-j (must match package.json)
   - **Name**: Your display name
   - **Email**: Your email

### Step 3: Login to vsce

Run this command in terminal:

```bash
cd /Users/rex-fab-alt/Documents/code/playground/magic-agent-helix/packages/vscode-magic-helix
npx @vscode/vsce login el-j
```

When prompted, paste your Personal Access Token.

### Step 4: Publish the Extension

Once logged in, publish with:

```bash
npx @vscode/vsce publish --no-yarn
```

This will:
- Upload your extension to the marketplace
- Make it available for users to install
- Update automatically in VS Code

### Alternative: Manual Upload

If you prefer not to use the CLI:

1. Go to https://marketplace.visualstudio.com/manage/publishers/el-j
2. Click "New extension" → "Visual Studio Code"
3. Upload the `vscode-magic-helix-0.3.0.vsix` file
4. Submit for publication

## 🔄 Updating the Extension

For future updates:

1. Update version in `package.json`
2. Rebuild: `npm run build`
3. Publish: `npx @vscode/vsce publish --no-yarn`

Or bump version automatically:

```bash
# Patch version (0.3.0 → 0.3.1)
npx @vscode/vsce publish patch --no-yarn

# Minor version (0.3.0 → 0.4.0)
npx @vscode/vsce publish minor --no-yarn

# Major version (0.3.0 → 1.0.0)
npx @vscode/vsce publish major --no-yarn
```

## 📊 After Publishing

Your extension will be available at:
- **Marketplace URL**: https://marketplace.visualstudio.com/items?itemName=el-j.vscode-magic-helix
- **Install Command**: `code --install-extension el-j.vscode-magic-helix`

It may take a few minutes to appear in the marketplace search after publishing.

## 🔒 Security Notes

- Store your PAT securely (use a password manager)
- Never commit your PAT to git
- Set expiration dates on your tokens
- Use the minimum required scopes

## 📝 Next Steps

1. Get your PAT from Azure DevOps
2. Run the login command above
3. Run the publish command
4. Verify the extension appears in the marketplace
5. Test installation from marketplace

---

**Need help?** Check the official docs: https://code.visualstudio.com/api/working-with-extensions/publishing-extension
