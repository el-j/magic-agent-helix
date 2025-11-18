/**
 * Rust Language Plugin
 *
 * Detects Rust projects via Cargo.toml with hardware-aware heuristics.
 */

import { parse } from '@iarna/toml';
import type { ProjectMetadata, TemplateDefinition } from '../../types';
import { BasePlugin } from '../base/BasePlugin';

type CargoDependency = string | number | boolean | Record<string, unknown>;
type DependencySection = Record<string, CargoDependency>;
interface CargoTargetSection {
  dependencies?: DependencySection;
  ['dev-dependencies']?: DependencySection;
  ['build-dependencies']?: DependencySection;
}
interface CargoManifest {
  package?: {
    name?: string;
    description?: string;
    keywords?: string[];
    categories?: string[];
  };
  dependencies?: DependencySection;
  ['dev-dependencies']?: DependencySection;
  ['build-dependencies']?: DependencySection;
  workspace?: {
    members?: string[];
    dependencies?: DependencySection;
  };
  target?: Record<string, CargoTargetSection>;
}

export class RustPlugin extends BasePlugin {
  name = 'rust';
  displayName = 'Rust';
  version = '3.1.0';
  priority = 80;

  private static readonly EMBEDDED_DEPENDENCIES = new Set(
    [
      'hardware2rust',
      'embedded-hal',
      'embedded-hal-async',
      'cortex-m',
      'cortex-m-rt',
      'cortex-m-rtic',
      'rtic',
      'nrf52840-hal',
      'atsamd-hal',
      'stm32f4xx-hal',
      'stm32h7xx-hal',
      'esp-idf-hal',
      'esp-hal',
      'rp2040-hal',
      'probe-run',
      'probe-rs',
      'defmt',
      'heapless',
      'microbit',
      'drone-core',
    ].map(name => name.toLowerCase()),
  );

  private static readonly EMBEDDED_KEYWORDS = new Set(
    [
      'embedded',
      'hardware',
      'no_std',
      'nostd',
      'microcontroller',
      'firmware',
      'hal',
      'baremetal',
      'bare-metal',
    ],
  );

  private static readonly HARDWARE_NAME_HINTS = ['hardware', 'hardware2rust', 'embedded'];
  private static readonly CARGO_CONFIG_FILES = ['.cargo/config', '.cargo/config.toml'];
  private static readonly MEMORY_LAYOUT_FILES = ['memory.x', 'memory.x.in'];

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
        tags: ['lang-rust'],
      };
    }

    const manifest = this.parseManifest(content);
    const dependencies = manifest
      ? this.extractDependenciesFromManifest(manifest)
      : this.extractDependenciesFromText(content);
    const workspaceMembers = this.extractWorkspaceMembers(manifest, content);
    const tags = await this.computeProjectTags(projectPath, dependencies, manifest, content);

    const metadata: ProjectMetadata = {
      language: 'Rust',
      name:
        manifest?.package?.name ||
        this.extractNameFromContent(content) ||
        this.getProjectName(projectPath),
      description:
        manifest?.package?.description || this.extractDescriptionFromContent(content),
      dependencies,
      manifestFile: 'Cargo.toml',
      projectPath,
      workspaceMembers: workspaceMembers.length > 0 ? workspaceMembers : undefined,
      tags: tags.length > 0 ? tags : undefined,
      keywords: manifest?.package?.keywords,
      categories: manifest?.package?.categories,
    };

    return metadata;
  }

  getTemplates(): TemplateDefinition[] {
    return [
      {
        name: 'rust-core',
        tags: ['lang-rust'],
        content: `# Rust Development Guidelines

This project uses Rust.

## Project Structure
- Follow Cargo conventions
- Organize code with modules and crates
- Prefer workspace members for shared libraries

## Tooling
- Run \`cargo fmt\` and \`cargo clippy\` before committing
- Enable \`deny(warnings)\` in CI for regression catch
- Keep the MSRV documented in README or \`rust-toolchain.toml\`

## Safety & Ownership
- Embrace ownership and borrowing to prevent data races
- Minimize \`unsafe\` blocks and document why they're required
- Handle \`Result\`/\`Option\` exhaustively with meaningful errors

## Testing
- Cover critical code paths with unit tests in-module
- Add integration tests under \`tests/\`
- Use property tests or fuzzing for complex parsing logic

## Dependencies
- Keep Cargo.lock committed for binaries
- Audit crates with \`cargo audit\`
- Prefer feature flags over forked crates when possible`,
      },
      {
        name: 'rust-embedded-core',
        tags: ['rust-embedded'],
        content: `# Embedded & Hardware Rust Guidelines

This project targets hardware/embedded environments.

## Build & Profiles
- Define \`[profile.dev]\` / \`[profile.release]\` tweaks for probe-run
- Track linker scripts such as \`memory.x\` inside version control
- Pin the toolchain with \`rust-toolchain.toml\` to keep firmware reproducible

## Runtime Constraints
- Prefer \`#![no_std]\` libraries and audit for heap allocations
- Use \`heapless\` or ring buffers instead of Vec when RAM is limited
- Tune interrupt priorities and minimize busy waits

## HAL & Drivers
- Adhere to \`embedded-hal\` traits for portability
- Isolate board support packages under \`boards/<target>\`
- Document pin mappings and peripheral ownership

## Observability
- Route logs through \`defmt\` or RTT instead of printf polling
- Keep probe-run + probe-rs configs under \`.cargo/config.toml\`
- Include instructions for flashing + debugging (UF2, JLink, etc.)

## Testing on Hardware
- Maintain hardware-in-the-loop smoke tests
- Provide mocks for driver crates to unblock CI
- Capture oscilloscope/logic-analyzer traces for tricky regressions`,
      },
      {
        name: 'hardware2rust-profile',
        tags: ['hardware2rust'],
        content: `# hardware2rust Project Notes

These guidelines focus on packages aligned with the hardware2rust stack.

## Package Layout
- Keep reusable primitives in \`crates/core\` and board-specific glue in \`crates/boards/<target>\`
- Expose ergonomic builder APIs for configuring buses, clocks, and peripherals
- Document supported targets (nRF, RP2040, ESP) in README badges

## Feature Flags
- Mirror hardware variants with Cargo features (e.g. \`rtic\`, \`defmt\`, \`probe-run\`)
- Ensure mutually exclusive features guard incompatible HAL implementations

## Developer Experience
- Ship ready-to-flash examples under \`examples/\` (blinky, I2C scanner, sensor demos)
- Provide VS Code + probe-rs launch.json snippets for teammates
- Keep CI workflows building representative targets to catch regressions early`,
      },
    ];
  }

  getDependencyTagMap() {
    return {
      tokio: 'rust-async',
      'actix-web': 'rust-actix',
      rocket: 'rust-rocket',
      serde: 'serde',
      'embedded-hal': 'rust-embedded',
      'embedded-hal-async': 'rust-embedded',
      'cortex-m': 'rust-embedded',
      'cortex-m-rt': 'rust-embedded',
      'cortex-m-rtic': 'rust-embedded',
      rtic: 'rust-embedded',
      'hardware2rust': 'hardware2rust',
      'probe-run': 'rust-embedded',
      'probe-rs': 'rust-embedded',
      defmt: 'rust-embedded',
      heapless: 'rust-embedded',
      'rp2040-hal': 'rust-embedded',
      'nrf52840-hal': 'rust-embedded',
      'stm32f4xx-hal': 'rust-embedded',
      'esp-idf-hal': 'rust-embedded',
    };
  }

  private parseManifest(content: string): CargoManifest | null {
    try {
      return parse(content) as CargoManifest;
    } catch {
      return null;
    }
  }

  private extractDependenciesFromManifest(manifest: CargoManifest): Record<string, string> {
    const deps: Record<string, string> = {};
    this.collectDependencies(manifest.dependencies, deps);
    this.collectDependencies(manifest['dev-dependencies'], deps);
    this.collectDependencies(manifest['build-dependencies'], deps);
    this.collectDependencies(manifest.workspace?.dependencies, deps);

    if (manifest.target) {
      for (const section of Object.values(manifest.target)) {
        if (!section) continue;
        this.collectDependencies(section.dependencies, deps);
        this.collectDependencies(section['dev-dependencies'], deps);
        this.collectDependencies(section['build-dependencies'], deps);
      }
    }

    return deps;
  }

  private collectDependencies(
    section: DependencySection | undefined,
    accumulator: Record<string, string>,
  ): void {
    if (!section) return;
    for (const [name, value] of Object.entries(section)) {
      accumulator[name] = this.normalizeDependencyVersion(value);
    }
  }

  private normalizeDependencyVersion(value: CargoDependency): string {
    if (typeof value === 'string' || typeof value === 'number') {
      return String(value);
    }

    if (typeof value === 'boolean') {
      return value ? '*' : 'disabled';
    }

    if (value && typeof value === 'object') {
      const record = value as Record<string, unknown>;
      const version = record['version'];
      if (typeof version === 'string') {
        return version;
      }

      const git = record['git'];
      if (typeof git === 'string') {
        const rev = record['rev'];
        return typeof rev === 'string' ? `git:${git}#${rev}` : `git:${git}`;
      }

      const path = record['path'];
      if (typeof path === 'string') {
        return `path:${path}`;
      }
    }

    return '*';
  }

  private extractWorkspaceMembers(
    manifest: CargoManifest | null,
    content: string,
  ): string[] {
    if (manifest?.workspace?.members?.length) {
      return manifest.workspace.members
        .map(member => member.trim())
        .filter(Boolean);
    }

    return this.fallbackWorkspaceMembers(content);
  }

  private fallbackWorkspaceMembers(content: string): string[] {
    const match = content.match(/\[workspace\][\s\S]*?members\s*=\s*\[([\s\S]*?)\]/);
    if (!match) {
      return [];
    }

    return match[1]
      .split(',')
      .map(member => member.trim().replace(/['"]/g, ''))
      .filter(Boolean);
  }

  private extractDependenciesFromText(content: string): Record<string, string> {
    const deps: Record<string, string> = {};
    const sections = [
      'dependencies',
      'dev-dependencies',
      'build-dependencies',
      'workspace.dependencies',
    ];

    for (const section of sections) {
      const block = this.extractSection(content, section);
      if (block) {
        this.parseDependencyLines(block, deps);
      }
    }

    return deps;
  }

  private extractSection(content: string, sectionName: string): string | null {
    const escaped = sectionName.replace('.', '\\.');
    const regex = new RegExp(`\\[${escaped}\\]([\\s\\S]*?)(?:\\n\\[|$)`, 'i');
    const match = regex.exec(content);
    return match ? match[1] : null;
  }

  private parseDependencyLines(block: string, deps: Record<string, string>): void {
    const lines = block.split('\n');
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) {
        continue;
      }

      const match = line.match(/^([A-Za-z0-9_\-]+)\s*=\s*(.+)$/);
      if (!match) {
        continue;
      }

      const [, name, value] = match;
      const trimmedValue = value.trim();
      if (trimmedValue.startsWith('{')) {
        const versionMatch = trimmedValue.match(/version\s*=\s*"([^"]+)"/);
        const gitMatch = trimmedValue.match(/git\s*=\s*"([^"]+)"/);
        const pathMatch = trimmedValue.match(/path\s*=\s*"([^"]+)"/);
        deps[name] =
          versionMatch?.[1] ||
          (gitMatch ? `git:${gitMatch}` : pathMatch ? `path:${pathMatch}` : '*');
      } else {
        deps[name] = trimmedValue.replace(/"/g, '');
      }
    }
  }

  private extractNameFromContent(content: string): string | undefined {
    const match = content.match(/\[package\][\s\S]*?name\s*=\s*"([^"]+)"/);
    return match?.[1];
  }

  private extractDescriptionFromContent(content: string): string | undefined {
    const match = content.match(/\[package\][\s\S]*?description\s*=\s*"([^"]+)"/);
    return match?.[1];
  }

  private async computeProjectTags(
    projectPath: string,
    dependencies: Record<string, string>,
    manifest: CargoManifest | null,
    content: string,
  ): Promise<string[]> {
    const tags = new Set<string>(['lang-rust']);
    const depNames = Object.keys(dependencies).map(dep => dep.toLowerCase());
    const hasEmbeddedDep = depNames.some(dep => RustPlugin.EMBEDDED_DEPENDENCIES.has(dep));

    const keywords = (manifest?.package?.keywords ?? []).map(keyword => keyword.toLowerCase());
    const categories = (manifest?.package?.categories ?? []).map(category => category.toLowerCase());
    const hasEmbeddedKeyword = keywords.some(keyword => RustPlugin.EMBEDDED_KEYWORDS.has(keyword));
    const hasEmbeddedCategory = categories.some(category => RustPlugin.EMBEDDED_KEYWORDS.has(category));

    const hasMemoryLayout = RustPlugin.MEMORY_LAYOUT_FILES.some(file => this.fileExists(projectPath, file));
    const hasCargoConfig = RustPlugin.CARGO_CONFIG_FILES.some(file => this.fileExists(projectPath, file));

    const normalizedName = manifest?.package?.name?.toLowerCase() ?? '';
    const contentLower = content.toLowerCase();
    const mentionsHardware = RustPlugin.HARDWARE_NAME_HINTS.some(
      hint => normalizedName.includes(hint) || contentLower.includes(hint),
    );
    const isHardware2Rust =
      normalizedName.includes('hardware2rust') ||
      depNames.some(dep => dep.includes('hardware2rust'));

    if (
      hasEmbeddedDep ||
      hasEmbeddedKeyword ||
      hasEmbeddedCategory ||
      hasMemoryLayout ||
      hasCargoConfig ||
      mentionsHardware
    ) {
      tags.add('rust-embedded');
    }

    if (isHardware2Rust) {
      tags.add('hardware2rust');
    }

    return Array.from(tags);
  }
}
