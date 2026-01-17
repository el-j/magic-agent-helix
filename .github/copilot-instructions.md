---
applyTo: "**/*"
---

## Role & Scope
- You are maintaining the MagicAgentHelix monorepo that builds tools to generate file-scoped AI instruction files; prioritize correctness of detection + generation flows over cosmetic refactors.
- Keep edits minimal and aligned with the existing CLI/core/plugin architectures; avoid inventing new behaviors unless asked.

## Architecture Map
- Packages: `packages/magic-helix-core` (analysis, templates, plugin system, validation), `packages/magic-agent-helix` (CLI wrapper), `packages/vscode-magic-helix` (VS Code command runner), `packages/magic-helix-plugins` (builtin language plugins with templates), `playground/` (Vue demo of the engine).
- Core config lives in `packages/magic-helix-core/src/built-in-config.ts`; maps dependencies/config/globs → tags. All language plugins and templates live in `packages/magic-helix-plugins/src/` with each plugin providing its own templates via `getTemplates()`.
- CLI entry `packages/magic-agent-helix/src/cli.ts` wires `run`, `refresh`, `list`, `validate`, `clean`, `init`, `plugins` commands. The `run` command loads configs, resolves formatter by target, finds projects via the plugin registry, derives `applyTo` globs with `buildPreciseGlobPattern`, then writes `<suffix>.md` files into `.github/instructions` (default) with frontmatter `applyTo: "<glob>"`.
- Plugin system v3: `packages/magic-helix-core/src/plugin-registry.ts` + `plugin-loader.ts` load builtin plugins from `@el-j/magic-helix-plugins` (NodeJS, Go, Python, Rust, Java, Ruby, PHP, C#, C++, Swift) and optional npm/local/workspace plugins; configurable via `.magic-helix.json` or `~/.magic-helix/config.json`.
- Pattern + quality system: pattern templates catalog in `packages/magic-helix-core/PATTERN-TEMPLATES.md`; instruction validator rules in `INSTRUCTION-VALIDATION.md` and `src/instruction-validator.ts` (expects frontmatter, tool docs/examples, role/tone/safety checkpoints).

## Development Workflows
- Install once at root: `npm install` (Node 20+). Lint/format with Biome: `npm run lint`, `npm run format`. Tests: `npm test`, `npm run test:core`, `npm run test:coverage`. Builds: `npm run build` (all) or `build:core|cli|vscode|playground`.
- CLI smoke: `npm run build:cli && node packages/magic-agent-helix/dist/cli.mjs run --dry-run` (adds `--project <name>` or `--template <pattern>` filters). Validate generated files: `npm run validate:instructions` or `magic-helix validate`.
- VS Code extension dev: run "Run VS Code Extension (Dev Mode)" launch config; extension shells out to `npx @el-j/magic-agent-helix run` in the target workspace.

## File-Type Guidance
- TypeScript-first repo; keep `tsconfig.base.json` settings intact. Favor small, pure functions and keep CLI logging style (picocolors gradients, ora spinners) consistent. In `run.ts`, preserve dry-run/force/skip-pruning behaviors and tag → template filtering.
- When touching formatters (`packages/magic-helix-core/src/formatters.ts`), maintain frontmatter shape (`applyTo`) and assistant-specific tweaks (Claude rewording, Copilot Chat emoji replacements). Changes ripple into generated instruction files.
- Plugins: ensure each `LanguagePlugin` sets `name`, `displayName`, `priority`, and returns `ProjectMetadata` with `tags`, `projectPath`, `dependencies`; keep detection fast (avoid heavy IO) and test under `packages/magic-helix-core/src/builtin-plugins/**` tests.
- Templates/config: keep tag keys stable (`framework-vue`, `style-tailwind`, `test-vitest`, etc.) since CLI maps them to applyTo globs via `TAG_FILE_EXTENSIONS` and `buildPreciseGlobPattern`.

## Instruction Generation Expectations
- Generated files must include frontmatter with `applyTo` glob and, for non-default targets, assistant/context fields (see `formatters.ts`).
- Use precise globs rooted at the project (e.g., `packages/my-app/src/**/*.{ts,vue}`) and honor `--exclude` filters. Do not write files outside `config.outputDirectory`.
- Validator requires headings + ≥2 code fences and explicit tool documentation/safety language; run `validate` after editing templates or formatters.

## Safety & Communication
- Be concise; narrate risky steps (writes, deletes). Preserve user data by respecting `--dry-run` unless explicitly disabled. Never drop existing user changes in generated instruction directories without confirmation (pruning only when requested/forced).
