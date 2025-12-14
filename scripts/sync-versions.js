#!/usr/bin/env node

/**
 * Sync versions across the entire monorepo.
 * 
 * This script reads the root package.json version and updates all workspace
 * package.json files to match, ensuring a single source of truth.
 * 
 * Usage:
 *   npm run sync:versions
 *   npm run sync:versions -- --set 2.0.1-alpha.1
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const rootPkgPath = path.join(__dirname, '..', 'package.json');
const workspacePaths = [
  'packages/magic-helix-core',
  'packages/magic-agent-helix',
  'packages/vscode-magic-helix',
  'packages/magic-helix-plugins',
  'playground',
];

function getVersionFromArg(args) {
  const setIndex = args.indexOf('--set');
  if (setIndex !== -1 && setIndex + 1 < args.length) {
    return args[setIndex + 1];
  }
  return null;
}

function syncVersions() {
  let rootPkg = JSON.parse(fs.readFileSync(rootPkgPath, 'utf8'));
  let rootVersion = getVersionFromArg(args) || rootPkg.version;

  console.log(`🔄 Syncing monorepo version to: ${rootVersion}`);

  // Update root
  rootPkg.version = rootVersion;
  fs.writeFileSync(rootPkgPath, JSON.stringify(rootPkg, null, 2) + '\n');
  console.log(`✅ Updated root package.json: ${rootVersion}`);

  // Update all workspaces
  const monoRepoRoot = path.dirname(rootPkgPath);
  workspacePaths.forEach((wsPath) => {
    const pkgPath = path.join(monoRepoRoot, wsPath, 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      const oldVersion = pkg.version;
      pkg.version = rootVersion;
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
      console.log(`✅ Updated ${wsPath}/package.json: ${oldVersion} → ${rootVersion}`);
    }
  });

  console.log(`\n✨ All versions synced to ${rootVersion}`);
}

try {
  syncVersions();
} catch (err) {
  console.error('❌ Error syncing versions:', err.message);
  process.exit(1);
}
