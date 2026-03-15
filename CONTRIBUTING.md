# Contributing to MagicAgentHelix

## Development Setup

**Prerequisites**: Node.js 20 LTS (use `.nvmrc` with `nvm use` or `fnm use`).

```bash
# Install all workspace dependencies
npm install

# Install the pre-commit hook (lint + format on every commit)
npm run install:hooks
```

---

## Development Workflow

1. Branch from `develop` (use `feature/<topic>` naming)
2. Make changes with [Conventional Commits](#conventional-commit-format)
3. Run `npm run lint && npm run format:check && npm test` before pushing
4. Open a PR against `develop`

### Branch → Release mapping

| Branch | Release channel | Example version |
|---|---|---|
| `main` | stable | `4.1.0` |
| `develop` | beta pre-release | `4.1.0-beta.1` |

> **Note**: `feature/*` branches do **not** trigger automatic releases. Only `main` and `develop` do.

---

## Conventional Commit Format

All commits **must** follow the [Conventional Commits](https://www.conventionalcommits.org/) spec:

```
<type>(<scope>): <subject>

<optional body>

<optional footer>
```

### Commit types that trigger a release

| Type | Release | Example |
|---|---|---|
| `feat` | MINOR | `feat(cli): add --output-format json flag` |
| `fix` | PATCH | `fix(core): correct globToRegex escaping` |
| `perf` | PATCH | `perf(plugins): cache detection results` |
| `build(deps)` | PATCH | `build(deps): bump vitest to 4.1.0` |
| `feat!` / `BREAKING CHANGE:` | MAJOR | `feat!: remove deprecated v2 plugin API` |

### Commit types that do NOT trigger a release

`docs`, `style`, `refactor`, `test`, `chore`, `ci`, `build` (without `deps` scope)

### Examples

```bash
# New feature → 4.1.0
feat(formatters): add Cursor and Windsurf formatter targets

# Bug fix → 4.0.1
fix(core): fix globToRegex ** pattern matching

# Breaking change → 5.0.0
feat!: remove AnalysisService (v2 plugin API)

BREAKING CHANGE: Use PluginRegistry from plugin-registry.ts instead.
```

---

## CI/CD Pipeline

### Workflows

| Workflow | Trigger | Purpose |
|---|---|---|
| **CI** | push/PR to `main`, `develop`, `feature/*` | Lint, format-check, test on Node 20 + 22 |
| **Release** | push to `main` or `develop` | Run CI then semantic-release |
| **Deploy Web** | push to `main` | Build playground and deploy to GitHub Pages |

### CI checks (must pass before merging)
- `npm run lint` — Biome linter
- `npm run format:check` — Biome formatter check
- `npm run build` — TypeScript compilation + bundling
- `npm run test` — Vitest unit tests (Node 20 + 22)

### Running checks locally

```bash
# Full check (matches CI)
npm run lint && npm run format:check && npm run build && npm run test

# Auto-fix lint + format
npm run lint:fix && npm run format

# Via Makefile
make test
```

---

## Release Process

This project uses [semantic-release](https://semantic-release.gitbook.io/) to automate versioning and publishing.

### What happens on a release

1. `@semantic-release/commit-analyzer` determines the version bump from commit types
2. `@semantic-release/release-notes-generator` generates the changelog entry
3. `@semantic-release/changelog` updates `CHANGELOG.md`
4. `@semantic-release/exec` — syncs versions across all workspace packages, rebuilds, and packages the VS Code extension
5. `@semantic-release/npm` — publishes `@el-j/magic-helix-core`, `@el-j/magic-agent-helix`, `@el-j/magic-helix-plugins` to npm (with provenance attestation)
6. `@semantic-release/github` — creates a GitHub Release with CLI and VSIX assets
7. `@semantic-release/git` — commits `package.json` files, `package-lock.json`, and `CHANGELOG.md` back to the repo with `[skip ci]`

> **Never manually edit `version` fields in `package.json`** — semantic-release + `scripts/sync-versions.js` handle all version bumps.

### Required repository secrets

| Secret | Purpose |
|---|---|
| `GITHUB_TOKEN` | Auto-provided by GitHub Actions — creates releases and writes back |
| `NPM_TOKEN` | npm access token with `publish` permission for the `@el-j` scope |
| `CODECOV_TOKEN` | (Optional) Coverage uploads to Codecov |

### npm Provenance

`.npmrc` sets `provenance=true`. The release workflow requests `id-token: write` permission so that npm can attach a signed SLSA provenance attestation to every published package. This requires the npm token to be a [Granular Access Token](https://docs.npmjs.com/creating-and-viewing-access-tokens) with publish access.

---

## Package Structure

```
magic-agent-helix/
├── packages/
│   ├── magic-helix-core/       # @el-j/magic-helix-core — analysis engine
│   ├── magic-agent-helix/      # @el-j/magic-agent-helix — CLI
│   ├── magic-helix-plugins/    # @el-j/magic-helix-plugins — language plugins
│   └── vscode-magic-helix/     # VS Code extension (not published to npm)
├── playground/                  # Web demo (deployed to GitHub Pages)
├── scripts/sync-versions.js     # Monorepo version sync utility
├── .releaserc.json              # semantic-release configuration
├── .nvmrc                       # Pinned Node.js version (20 LTS)
└── .npmrc                       # npm provenance setting
```

---

## Troubleshooting

**Release not triggering?**  
Check your commit follows conventional format and is pushed to `main` or `develop`. Review the GitHub Actions Release workflow logs.

**npm publish failing with 403?**  
Ensure `NPM_TOKEN` is set in repository secrets with publish access to the `@el-j` scope.

**Build failing in CI but passing locally?**  
Run `npm ci` (not `npm install`) to use the exact locked versions from `package-lock.json`.

**Version mismatch across packages?**  
Run `npm run sync:versions` to reset all workspace packages to the root version.
