# Monorepo Development Guidelines

## Overview
This project uses a monorepo structure to manage multiple packages/applications in a single repository.

## Structure
```
project-root/
├── packages/
│   ├── package-a/
│   ├── package-b/
│   └── shared/
├── apps/
│   ├── web/
│   └── mobile/
├── package.json (workspace root)
└── turbo.json or nx.json
```

## Workspace Commands
- Install all dependencies: `npm install` (at root)
- Run script in workspace: `npm run <script> --workspace=<package-name>`
- Run script in all workspaces: `npm run <script> --workspaces`
- Add dependency to workspace: `npm install <pkg> --workspace=<name>`

## Benefits
- Code sharing between packages
- Atomic changes across multiple packages
- Unified versioning and releases
- Shared tooling and configuration
- Single source of truth

## Package Dependencies
- Reference workspace packages: `"package-a": "*"` or `"workspace:*"`
- Changes in dependencies trigger downstream rebuilds
- Use semver for external dependencies

## Build Orchestration
- Define build order based on dependencies
- Use `turbo` or `nx` for caching and parallelization
- Run only affected packages on changes

## Common Tools

### Turborepo
```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"]
    }
  }
}
```

### Nx
```json
{
  "tasksRunnerOptions": {
    "default": {
      "runner": "@nrwl/workspace/tasks-runners/default",
      "options": {
        "cacheableOperations": ["build", "test"]
      }
    }
  }
}
```

## Best Practices
- Keep packages focused and small
- Use consistent naming conventions
- Share common configuration files
- Version packages independently or together
- Document package purposes in README
- Use path mappings for imports
- Hoist dependencies when possible

## Scripts Management
- Define common scripts at root
- Delegate to workspace-specific scripts
- Use parallel execution for independent tasks
- Run affected packages only

## Testing
- Run tests from root: `npm test --workspaces`
- Run tests for specific package: `npm test --workspace=<name>`
- Use shared test configuration
- Test cross-package integration

## Versioning
- **Independent**: Each package has own version
- **Fixed**: All packages share same version
- Use changesets for version management
- Document breaking changes

## Publishing
- Publish packages independently
- Use automated versioning tools
- Test before publishing
- Update changelogs

## TypeScript Configuration
```json
{
  "references": [
    { "path": "./packages/package-a" },
    { "path": "./packages/package-b" }
  ]
}
```

## Import Paths
- Use path aliases: `@company/package-name`
- Configure in `tsconfig.json` paths
- Set up module resolution

## Challenges & Solutions
- **Problem**: Dependency hell
  - **Solution**: Use workspaces, hoist dependencies
- **Problem**: Slow builds
  - **Solution**: Use caching (turbo/nx), build affected only
- **Problem**: Complex tooling
  - **Solution**: Share configs, document setup

## CI/CD
- Build only affected packages
- Cache build outputs
- Run tasks in parallel
- Use matrix builds for packages

## Performance
- Enable caching for build outputs
- Use incremental builds
- Parallelize independent tasks
- Skip unchanged packages

## Documentation
- Maintain root-level README
- Document each package purpose
- Explain workspace structure
- Provide contribution guidelines
