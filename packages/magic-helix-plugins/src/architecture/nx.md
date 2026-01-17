# Nx Monorepo Guidelines

## Overview
This monorepo uses Nx for build orchestration, code generation, and project management.

## Commands
- Run target: `nx run <project>:<target>`
- Run for all projects: `nx run-many --target=build --all`
- Run affected: `nx affected --target=build`
- Show dependency graph: `nx graph`
- Generate code: `nx generate @nx/react:component`

## Project Configuration
```json
{
  "name": "my-app",
  "targets": {
    "build": {
      "executor": "@nx/webpack:webpack",
      "outputs": ["{workspaceRoot}/dist/apps/my-app"],
      "options": {
        "outputPath": "dist/apps/my-app"
      }
    }
  }
}
```

## Affected Commands
- Build affected: `nx affected:build`
- Test affected: `nx affected:test`
- Lint affected: `nx affected:lint`
- Based on git diff from base branch

## Caching
- Nx caches task outputs automatically
- Cache key based on inputs
- Restore from cache for unchanged code
- Configure cacheable operations

## Generators
- Generate applications: `nx g @nx/react:app`
- Generate libraries: `nx g @nx/js:lib`
- Custom generators for consistency
- Automated code scaffolding

## Project Graph
- Visualize dependencies: `nx graph`
- See affected projects
- Understand project relationships
- Detect circular dependencies

## Configuration Files
- `nx.json`: Nx configuration
- `workspace.json` or `project.json`: Project config
- `.nxignore`: Files to ignore

## Task Pipeline
```json
{
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"]
    }
  }
}
```

## Plugins
- Framework-specific plugins: React, Angular, Next.js
- Tool-specific plugins: Jest, Cypress, ESLint
- Custom plugins for specific needs

## Workspace Libraries
- Organize code into libraries
- Enforce module boundaries
- Share code between apps
- Use tags for constraints

## Best Practices
- Use affected commands in CI
- Organize libs by scope and type
- Set up import restrictions
- Use generators for consistency
- Enable computation caching
- Configure remote caching for teams

## CI/CD Integration
```yaml
- name: Nx Cache
  uses: actions/cache@v4
  with:
    path: node_modules/.cache/nx
    key: nx-${{ github.sha }}
    restore-keys: nx-

- name: Build affected
  run: nx affected --target=build --base=origin/main
```

## Performance
- Parallel execution of independent tasks
- Computation caching
- Remote caching with Nx Cloud
- Affected-only builds in CI

## Module Boundaries
```json
{
  "@nx/enforce-module-boundaries": [
    "error",
    {
      "depConstraints": [
        {
          "sourceTag": "scope:shared",
          "onlyDependOnLibsWithTags": ["scope:shared"]
        }
      ]
    }
  ]
}
```
