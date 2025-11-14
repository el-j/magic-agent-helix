#!/usr/bin/env node

/**
 * Copy template files from src to dist
 * 
 * This script copies template files (.md, .txt) from src directories
 * to the dist folder during build.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const srcDir = path.join(__dirname, '../src');
const distDir = path.join(__dirname, '../dist');

function copyTemplates(src, dest) {
  if (!fs.existsSync(src)) {
    console.log(`Source directory does not exist: ${src}`);
    return;
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      // Recursively copy directory
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }
      copyTemplates(srcPath, destPath);
    } else if (entry.isFile() && /\.(md|txt)$/i.test(entry.name)) {
      // Copy template files
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied: ${path.relative(srcDir, srcPath)} → ${path.relative(distDir, destPath)}`);
    }
  }
}

console.log('Copying template files...');
copyTemplates(srcDir, distDir);
console.log('Template files copied successfully!');
