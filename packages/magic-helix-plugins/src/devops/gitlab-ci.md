# GitLab CI/CD Guidelines

## Overview
This project uses GitLab CI/CD for continuous integration and deployment. Follow best practices for efficient pipelines.

## Pipeline Structure
```yaml
stages:
  - build
  - test
  - deploy

variables:
  NODE_VERSION: "20"

build:
  stage: build
  image: node:${NODE_VERSION}
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 hour

test:
  stage: test
  image: node:${NODE_VERSION}
  script:
    - npm ci
    - npm test
  coverage: '/Coverage: \d+\.\d+%/'

deploy:
  stage: deploy
  script:
    - npm run deploy
  only:
    - main
  environment:
    name: production
```

## Stages
- Define pipeline stages: `build`, `test`, `deploy`
- Jobs in same stage run in parallel
- Stages run sequentially
- Use dependencies for job order within stage

## Jobs
- Each job runs in isolated environment
- Define image for Docker-based runners
- Use `script` for commands
- Use `before_script` and `after_script` for setup/cleanup

## Variables
- Define global variables in `variables:` section
- Use in scripts: `$VARIABLE_NAME`
- Set in GitLab CI/CD settings for secrets
- Use `file` type for certificates

## Artifacts
- Share files between jobs
- Define in `artifacts:` section
- Set expiration: `expire_in: 1 week`
- Download from pipeline UI

## Cache
```yaml
cache:
  key: ${CI_COMMIT_REF_SLUG}
  paths:
    - node_modules/
    - .npm/
```

## Rules and Conditions
```yaml
deploy:
  script: deploy.sh
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
    - when: manual  # Require manual trigger
```

## Docker Integration
```yaml
build-docker:
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker build -t myapp .
    - docker push myapp
```

## Services
- Run side containers (database, cache)
- Example: `services: - postgres:15`
- Access via hostname: `postgres`

## Environments
- Define deployment environments
- Track deployments in GitLab
- Enable auto-rollback
- Use protected environments

## Include and Extends
```yaml
include:
  - local: '/.gitlab-ci-template.yml'

.node_job:
  image: node:20
  before_script:
    - npm ci

test:
  extends: .node_job
  script:
    - npm test
```

## Parallel Jobs
```yaml
test:
  parallel: 3
  script:
    - npm test -- --shard=$CI_NODE_INDEX/$CI_NODE_TOTAL
```

## Triggers
- `push`: On every push
- `merge_request_event`: On MR creation/update
- `schedule`: Scheduled pipelines
- `api`: Triggered via API
- `manual`: Requires manual action

## Best Practices
- Use `.gitlab-ci.yml` in repository root
- Pin image versions
- Use cache for dependencies
- Separate build and deploy stages
- Use artifacts for build outputs
- Set appropriate timeout values
- Use rules instead of only/except
- Validate YAML before committing

## Performance
- Use cache effectively
- Run jobs in parallel when possible
- Use shallow clone: `GIT_DEPTH: 1`
- Optimize Docker images
- Use artifacts sparingly

## Security
- Never commit secrets to `.gitlab-ci.yml`
- Use masked variables for secrets
- Use protected variables for sensitive data
- Scan for vulnerabilities in dependencies
- Use SAST and DAST tools

## Debugging
- Check pipeline logs in CI/CD > Pipelines
- Use `CI_DEBUG_TRACE: "true"` for verbose logs
- Test locally with GitLab Runner
- Use `when: always` to run on failure

## Common Patterns

### Node.js Project
```yaml
test:
  image: node:20
  script:
    - npm ci
    - npm test
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml
```

### Manual Deployment
```yaml
deploy:
  stage: deploy
  script:
    - deploy.sh
  when: manual
  only:
    - main
```

### Multi-Project Pipeline
```yaml
trigger_downstream:
  trigger:
    project: group/downstream-project
    branch: main
```

## Monitoring
- View pipeline status in GitLab UI
- Enable email notifications
- Use badges in README
- Monitor pipeline duration
- Track deployment frequency
