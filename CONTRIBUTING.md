# Contributing to MagicAgentHelix

## Release Process

This project uses [semantic-release](https://semantic-release.gitbook.io/) to automate versioning and publishing to NPM.

### How Releases Work

Releases are **automatically** triggered when commits following the [Conventional Commits](https://www.conventionalcommits.org/) specification are pushed to the `main` branch.

### Conventional Commit Format

Commits must follow this format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Commit Types that Trigger Releases

- **`feat:`** - A new feature (triggers a **MINOR** version bump, e.g., 1.0.0 → 1.1.0)
- **`fix:`** - A bug fix (triggers a **PATCH** version bump, e.g., 1.0.0 → 1.0.1)
- **`perf:`** - Performance improvement (triggers a **PATCH** version bump)

#### Breaking Changes

To trigger a **MAJOR** version bump (e.g., 1.0.0 → 2.0.0), add `BREAKING CHANGE:` in the commit footer or append `!` after the type:

```
feat!: remove deprecated API
```

or

```
feat: update authentication

BREAKING CHANGE: The authentication API has been redesigned
```

#### Other Commit Types (No Release)

These types **do not** trigger a release:
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks
- `ci:` - CI/CD changes
- `build:` - Build system changes

### Examples

#### Feature commit (triggers MINOR release)
```
feat: add validate command for instruction files

Added a new validate command that checks instruction files
for common issues and provides helpful error messages.
```

#### Bug fix commit (triggers PATCH release)
```
fix: correct path resolution on Windows

Fixed an issue where path resolution failed on Windows
systems due to incorrect path separator handling.
```

#### Documentation update (no release)
```
docs: update README with new command examples
```

### Publishing to NPM

When a release is triggered:
1. semantic-release analyzes commits since the last release
2. Determines the new version number based on commit types
3. Updates package.json files
4. Generates/updates CHANGELOG.md
5. Creates a Git tag
6. Publishes packages to NPM:
   - `magic-helix-core`
   - `magic-agent-helix`
7. Creates a GitHub release

### Manual Testing Before Release

Before pushing commits to `develop` or `main`:

1. Test locally:
   ```bash
   npm ci
   npm run lint
   npm run build
   npm test
   ```

2. For the CLI:
   ```bash
   cd packages/magic-agent-helix
   node dist/cli.mjs --help
   ```

3. Test the packages work together:
   ```bash
   npm pack packages/magic-helix-core
   npm pack packages/magic-agent-helix
   ```

### Troubleshooting

#### Release not triggering?

Check if your commit follows the conventional commit format:
- Does it start with `feat:`, `fix:`, or `perf:`?
- Is it pushed to `main`, `develop`, or a `feature/*` branch?
- Check the GitHub Actions workflow logs

#### Package version not updating?

semantic-release updates versions automatically. Never manually update version numbers in package.json - let semantic-release handle it.

#### NPM publish failing?

Ensure the `NPM_TOKEN` secret is configured in GitHub repository settings with a valid npm access token that has publish permissions for the `@magic-helix` scope (or remove scope if publishing to root).

### Development Workflow

1. Create a feature branch from `develop` or `main`
2. Make your changes
3. Commit with conventional commit messages
4. Create a PR:
   - Feature branches (`feature/*`) automatically create **alpha** releases when pushed (e.g., `1.1.0-alpha.1`)
   - Merging to `develop` automatically creates **beta** releases (e.g., `1.1.0-beta.1`)
   - Merging `develop` to `main` creates a **stable release** (e.g., `1.1.0`)
5. semantic-release automatically handles versioning and publishing

### Testing Prerelease Versions

For testing changes before merging to main, push to branches:
- `develop` - Creates beta releases (e.g., `1.1.0-beta.1`)
- `feature/*` - Creates alpha releases (e.g., `1.1.0-alpha.1`)

These prereleases allow you to test changes before they are merged to `main` and published as stable releases.
