# Turborepo Guidelines

## Overview
This monorepo uses Turborepo for build orchestration and caching.

## Configuration
```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": []
    },
    "lint": {
      "outputs": []
    },
    "dev": {
      "cache": false
    }
  }
}
```

## Commands
- Run task across all workspaces: `turbo run build`
- Run task in specific workspace: `turbo run build --filter=package-name`
- Run with no cache: `turbo run build --force`
- Clear cache: `turbo run build --no-cache`
- Dry run: `turbo run build --dry-run`

## Pipeline Configuration
- `dependsOn`: Task dependencies
- `^dependsOn`: Dependencies from workspace dependencies
- `outputs`: Files to cache
- `cache`: Enable/disable caching
- `inputs`: Files that affect cache validity

## Caching
- Turborepo caches task outputs
- Cache key based on inputs (files, env vars)
- Shared cache across team (remote caching)
- Restore from cache for unchanged code

## Filtering
- By package: `--filter=package-name`
- By directory: `--filter=./apps/*`
- By dependency: `--filter=...package-name`
- By changed files: `--filter=[HEAD^1]`

## Remote Caching
```bash
# Enable remote cache
turbo login
turbo link

# Or use Vercel
vercel link
```

## Environment Variables
- Automatically included in cache key
- Prefix with `TURBO_` for Turbo-specific vars
- Use `.env` files for local development

## Performance
- Tasks run in parallel when possible
- Skips cached tasks
- Shows cache hit ratio
- Optimizes based on dependencies

## Best Practices
- Define clear task dependencies
- Specify all outputs for caching
- Use `^` for workspace dependencies
- Enable remote caching for teams
- Run affected tasks only in CI
- Keep pipeline config simple

## Monorepo Commands
```json
{
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev --parallel",
    "test": "turbo run test",
    "lint": "turbo run lint"
  }
}
```

## CI/CD Integration
```yaml
# GitHub Actions
- name: Setup Turborepo cache
  uses: actions/cache@v4
  with:
    path: .turbo
    key: turbo-${{ github.sha }}
    restore-keys: turbo-

- name: Build
  run: turbo run build
```

## Debugging
- Use `--dry-run` to see execution plan
- Check `.turbo/runs/*.json` for logs
- Enable verbose output: `--verbose`
- View graph: `turbo run build --graph`
