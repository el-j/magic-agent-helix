# GitLab CI/CD Templates

## Node.js/TypeScript Pipeline
```yaml
image: node:20-alpine

stages:
  - build
  - test
  - docker
  - deploy

cache:
  key:
    files:
      - package-lock.json
  paths:
    - node_modules/
    - .npm/

variables:
  npm_config_cache: "$CI_PROJECT_DIR/.npm"

build:
  stage: build
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 hour

test:
  stage: test
  coverage: '/Lines\s*:\s*(\d+\.\d+)%/'
  script:
    - npm ci
    - npm test -- --coverage
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml
      junit: junit.xml

lint:
  stage: test
  script:
    - npm ci
    - npm run lint

docker-build:
  stage: docker
  image: docker:latest
  services:
    - docker:dind
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA .
    - docker tag $CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA $CI_REGISTRY_IMAGE:latest
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA
    - docker push $CI_REGISTRY_IMAGE:latest
  only:
    - main

deploy-production:
  stage: deploy
  image: alpine/kubectl:latest
  script:
    - kubectl config set-cluster k8s --server="$KUBE_URL" --insecure-skip-tls-verify=true
    - kubectl config set-credentials admin --token="$KUBE_TOKEN"
    - kubectl config set-context default --cluster=k8s --user=admin
    - kubectl config use-context default
    - kubectl set image deployment/app app=$CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA -n production
  environment:
    name: production
    url: https://app.example.com
  only:
    - main
```

## Python Pipeline
```yaml
image: python:3.12-slim

stages:
  - test
  - build
  - deploy

variables:
  PIP_CACHE_DIR: "$CI_PROJECT_DIR/.cache/pip"

cache:
  paths:
    - .cache/pip
    - .venv/

before_script:
  - pip install poetry
  - poetry config virtualenvs.in-project true
  - poetry install

test:
  stage: test
  script:
    - poetry run pytest --cov --cov-report=xml --cov-report=term
    - poetry run ruff check .
    - poetry run mypy .
  coverage: '/(?i)total.*? (100(?:\.0+)?\%|[1-9]?\d(?:\.\d+)?\%)$/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage.xml

docker:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA
  only:
    - main
```

## Go Pipeline
```yaml
image: golang:1.21

stages:
  - test
  - build

variables:
  GOPATH: $CI_PROJECT_DIR/.go

cache:
  paths:
    - .go/pkg/mod/

before_script:
  - mkdir -p .go
  - go mod download

test:
  stage: test
  script:
    - go fmt $(go list ./... | grep -v /vendor/)
    - go vet $(go list ./... | grep -v /vendor/)
    - go test -race -coverprofile=coverage.txt -covermode=atomic ./...
  coverage: '/coverage: \d+\.\d+% of statements/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage.xml

build:
  stage: build
  script:
    - CGO_ENABLED=0 go build -ldflags="-s -w" -o app
  artifacts:
    paths:
      - app
```

## Rust Pipeline
```yaml
image: rust:1.75

stages:
  - test
  - build

variables:
  CARGO_HOME: $CI_PROJECT_DIR/.cargo

cache:
  paths:
    - .cargo/
    - target/

test:
  stage: test
  script:
    - rustc --version && cargo --version
    - cargo fmt -- --check
    - cargo clippy -- -D warnings
    - cargo test --verbose

build:
  stage: build
  script:
    - cargo build --release
  artifacts:
    paths:
      - target/release/app
```

## Java/Maven Pipeline
```yaml
image: maven:3.9-eclipse-temurin-21

stages:
  - build
  - test
  - package

variables:
  MAVEN_OPTS: "-Dmaven.repo.local=$CI_PROJECT_DIR/.m2/repository"

cache:
  paths:
    - .m2/repository

build:
  stage: build
  script:
    - mvn compile

test:
  stage: test
  script:
    - mvn test
    - mvn jacoco:report
  coverage: '/Total.*?([0-9]{1,3})%/'
  artifacts:
    reports:
      junit: target/surefire-reports/TEST-*.xml

package:
  stage: package
  script:
    - mvn package -DskipTests
  artifacts:
    paths:
      - target/*.jar
```

## Multi-Stage with Environments
```yaml
stages:
  - build
  - test
  - staging
  - production

build:
  stage: build
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/

test:
  stage: test
  script:
    - npm test

deploy-staging:
  stage: staging
  script:
    - echo "Deploying to staging"
    - kubectl set image deployment/app app=$CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA -n staging
  environment:
    name: staging
    url: https://staging.example.com
  only:
    - develop

deploy-production:
  stage: production
  script:
    - echo "Deploying to production"
    - kubectl set image deployment/app app=$CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA -n production
  environment:
    name: production
    url: https://app.example.com
  when: manual
  only:
    - main
```

## Docker with Buildx (Multi-arch)
```yaml
docker-multiarch:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  before_script:
    - docker run --rm --privileged multiarch/qemu-user-static --reset -p yes
    - docker buildx create --use --name multiarch
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - docker buildx build --platform linux/amd64,linux/arm64 -t $CI_REGISTRY_IMAGE:latest --push .
```

## Security Scanning
```yaml
include:
  - template: Security/SAST.gitlab-ci.yml
  - template: Security/Dependency-Scanning.gitlab-ci.yml
  - template: Security/Container-Scanning.gitlab-ci.yml

container_scanning:
  variables:
    DOCKER_IMAGE: $CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA
  dependencies:
    - docker-build
```

## Best Practices
1. **Caching**: Cache dependencies (`node_modules/`, `.m2/`, `.cargo/`)
2. **Artifacts**: Pass build outputs between stages
3. **Environments**: Use GitLab environments for deployment tracking
4. **Manual Gates**: Use `when: manual` for production deployments
5. **Templates**: Use `include:` to reuse common configurations
6. **Variables**: Store secrets in GitLab CI/CD Variables (masked & protected)
7. **Docker Layer Caching**: Use `DOCKER_BUILDKIT=1` for faster builds
8. **Coverage**: Use `coverage:` regex to display coverage in merge requests
9. **Resource Groups**: Prevent concurrent deployments to the same environment
10. **Rules**: Use `rules:` instead of `only:`/`except:` for modern syntax
