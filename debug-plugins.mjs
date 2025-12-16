#!/usr/bin/env node
/**
 * Debug script to check plugin template loading
 */

import { PluginRegistry } from '@el-j/magic-helix-core';

async function debug() {
  console.log('Initializing plugin registry...');
  const registry = PluginRegistry.getInstance();
  await registry.initialize();
  
  console.log('\nLoading all plugins...');
  const plugins = await registry.getAllPlugins();
  console.log(`Found ${plugins.length} plugins:`, plugins.map(p => p.name).join(', '));
  
  console.log('\nChecking Rust plugin templates...');
  const rustPlugin = plugins.find(p => p.name === 'rust');
  if (rustPlugin) {
    console.log('Rust plugin found!');
    const templates = await rustPlugin.getTemplates();
    console.log(`Rust plugin has ${templates.length} templates:`);
    for (const tmpl of templates) {
      console.log(`  - ${tmpl.name}: tags=${tmpl.tags.join(', ')}`);
      const content = typeof tmpl.content === 'function' ? await tmpl.content() : tmpl.content;
      console.log(`    Content length: ${content?.length || 0} chars`);
    }
  } else {
    console.log('Rust plugin NOT FOUND!');
  }
  
  console.log('\nDetecting projects in Hardware2Rust...');
  const rootPath = '/Users/rex-fab-alt/Documents/code/playground/Hardware2Rust';
  const detectedProjects = await registry.detectAllProjects(rootPath);
  console.log(`Detected ${detectedProjects.length} projects`);
  for (const result of detectedProjects.slice(0, 3)) {
    console.log(`  - ${result.metadata.name}: tags=${result.metadata.tags?.join(', ') || 'none'}`);
  }
}

debug().catch(console.error);
