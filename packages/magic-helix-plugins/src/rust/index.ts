/**
 * Rust Language Plugin
 * 
 * Detects Rust projects via Cargo.toml
 * Supports Cargo workspaces for monorepo detection
 */

import * as path from 'node:path';
import type { ProjectMetadata, TemplateDefinition } from '@el-j/magic-helix-core';
import { BasePlugin } from '../base/BasePlugin';

export class RustPlugin extends BasePlugin {
  name = 'rust';
  displayName = 'Rust';
  version = '3.0.0';
  priority = 80;
  async detect(projectPath: string): Promise<ProjectMetadata | null> {
    if (!this.fileExists(projectPath, 'Cargo.toml')) {
      return null;
    }

    const content = this.readFile(projectPath, 'Cargo.toml');
    if (!content) {
      return {
        language: 'Rust',
        name: this.getProjectName(projectPath),
        dependencies: {},
        manifestFile: 'Cargo.toml',
        projectPath,
      };
    }

    const nameMatch = content.match(/\[package\][\s\S]*?name\s*=\s*"([^"]+)"/);
    const descMatch = content.match(/\[package\][\s\S]*?description\s*=\s*"([^"]+)"/);
    const deps: Record<string, string> = {};

    // Parse dependencies
    const depsSection = content.match(/\[dependencies\]([\s\S]*?)(?:\n\[|$)/);
    if (depsSection) {
      const lines = depsSection[1].split('\n');
      for (const line of lines) {
        const depMatch = line.match(/^([a-zA-Z0-9_-]+)\s*=\s*(?:"([^"]+)"|{[^}]*version\s*=\s*"([^"]+)")/);
        if (depMatch) {
          deps[depMatch[1]] = depMatch[2] || depMatch[3] || '*';
        }
      }
    }

    // Check for workspace members
    const workspaceMatch = content.match(/\[workspace\][\s\S]*?members\s*=\s*\[([\s\S]*?)\]/);
    const workspaceMembers: string[] = [];
    if (workspaceMatch) {
      const members = workspaceMatch[1]
        .split(',')
        .map(m => m.trim().replace(/["']/g, ''))
        .filter(Boolean);
      workspaceMembers.push(...members);
    }

    return {
      language: 'Rust',
      name: nameMatch?.[1] || this.getProjectName(projectPath),
      description: descMatch?.[1],
      dependencies: deps,
      manifestFile: 'Cargo.toml',
      projectPath,
      workspaceMembers: workspaceMembers.length > 0 ? workspaceMembers : undefined,
    };
  }

  getTemplates(): TemplateDefinition[] {
    const dirname = this.getDirname(import.meta.url);
    return [
      {
        name: 'rust-core',
        tags: ['rust'],
        content: () => this.loadTemplateFromFile(
          path.join(dirname, 'templates/lang-rust.md')
        ).then(c => c || this.getRustFallbackTemplate()),
      },
    ];
  }

  private getRustFallbackTemplate(): string {
    return `# Rust Development Guidelines

This project uses Rust.

## Project Structure
- Follow Cargo conventions
- Organize code in modules
- Use workspace for monorepos

## Code Style
- Run \`rustfmt\` for formatting
- Use \`clippy\` for linting
- Follow Rust naming conventions

## Safety & Ownership
- Leverage Rust's ownership system
- Minimize unsafe code
- Handle Result and Option properly

## Testing
- Write unit tests with \`#[test]\`
- Use integration tests in \`tests/\`
- Leverage \`cargo test\`

## Dependencies
- Manage with Cargo.toml
- Review crate security
- Keep dependencies updated`;
  }

  getDependencyTagMap() {
    return {
      'tokio': 'tokio',
      'actix-web': 'actix',
      'rocket': 'rocket',
      'serde': 'serde',
    };
  }
}
