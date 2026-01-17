# GitHub Actions CI/CD Guidelines

## Overview
This project uses GitHub Actions for CI/CD workflows. Follow best practices for efficient and maintainable workflows.

## Workflow Structure
```yaml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test
```

## Triggers
- `push`: On push to branches
- `pull_request`: On PRs
- `workflow_dispatch`: Manual trigger
- `schedule`: Cron-based scheduling
- `release`: On release creation

## Common Actions
- `actions/checkout@v4`: Checkout code
- `actions/setup-node@v4`: Setup Node.js
- `actions/cache@v4`: Cache dependencies
- `actions/upload-artifact@v4`: Upload artifacts
- `actions/download-artifact@v4`: Download artifacts

## Best Practices

### Use Matrix Strategy
```yaml
strategy:
  matrix:
    node-version: [18, 20, 22]
    os: [ubuntu-latest, windows-latest, macos-latest]
```

### Cache Dependencies
```yaml
- uses: actions/cache@v4
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

### Use Secrets
- Store sensitive data in GitHub Secrets
- Access via: `${{ secrets.SECRET_NAME }}`
- Never hardcode credentials

### Conditional Steps
```yaml
- name: Deploy
  if: github.ref == 'refs/heads/main'
  run: npm run deploy
```

### Reusable Workflows
- Create reusable workflows in `.github/workflows/`
- Call with `uses: ./.github/workflows/reusable.yml`

## Job Dependencies
```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps: [...]
  
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps: [...]
```

## Environment Variables
```yaml
env:
  NODE_ENV: production
  API_URL: https://api.example.com
```

## Artifacts
- Upload build outputs for later jobs
- Download in subsequent jobs or manually
- Artifacts expire after 90 days by default

## Concurrency Control
```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

## Performance Tips
- Use caching for dependencies
- Run independent jobs in parallel
- Use `if` conditions to skip unnecessary steps
- Use `continue-on-error` for non-critical steps

## Security
- Use pinned versions of actions: `actions/checkout@v4`
- Review third-party actions before use
- Use GITHUB_TOKEN for authentication
- Enable branch protection rules
- Use environments for deployment approvals

## Debugging
- Enable debug logging: Set secret `ACTIONS_STEP_DEBUG` to `true`
- Use `actions/upload-artifact` to save debug files
- Check workflow logs in Actions tab

## Common Patterns

### Build and Test
```yaml
- name: Install dependencies
  run: npm ci
- name: Build
  run: npm run build
- name: Test
  run: npm test
```

### Deploy on Main
```yaml
- name: Deploy
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'
  run: npm run deploy
```

### Docker Build and Push
```yaml
- name: Build and push
  uses: docker/build-push-action@v5
  with:
    push: true
    tags: user/app:latest
```

## Monitoring
- Check workflow status in Actions tab
- Set up status checks for required workflows
- Use workflow badges in README
- Enable notifications for failures
