# Makefile for MagicAgentHelix monorepo
# Usage examples:
#   make install
#   make build
#   make test/core
#   make test/core/combiner
#   make validate ARGS="--project my-app --quiet"

SHELL := /bin/zsh
.DEFAULT_GOAL := help

help: ## Show this help
	@awk 'BEGIN {FS = ":.*##"}; /^[a-zA-Z0-9_\/-]+:.*##/ {printf "\033[36m%-28s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST) | sort

install: ## Install dependencies (root + workspaces)
	npm install

# Builds
build: ## Build all packages
	npm run build

build/core: ## Build @magic-helix/core
	npm run build:core

build/cli: ## Build @magic-helix/agent (CLI)
	npm run build:cli

build/vscode: ## Build @magic-helix/vscode
	npm run build:vscode

build/playground: ## Build playground
	npm run build:playground

# Tests
test: test/all ## Run all tests (core + lint + format checks)

test/all: ## Run comprehensive tests (core tests + lint + format)
	npm run test:all

test/core: ## Run all @magic-helix/core tests
	npm run test:core

# Optional: pass FILE=src/pattern-combiner.test.ts
test/core/file: ## Run a specific test file in core (FILE=...)
	@if [ -z "$(FILE)" ]; then echo "Usage: make test/core/file FILE=src/file.test.ts" && exit 1; fi
	cd packages/magic-helix-core && npx vitest run $(FILE) --reporter=verbose

test/core/watch: ## Watch mode for core tests
	npm run test:core:watch

test/core/coverage: ## Coverage for core tests
	npm run test:core:coverage

test/core/combiner: ## Run pattern-combiner tests
	npm run test:core:combiner

test/core/integration: ## Run integration tests for pattern system
	npm run test:core:integration

test/core/telemetry: ## Run telemetry tests
	cd packages/magic-helix-core && npx vitest run src/telemetry.test.ts --reporter=verbose

# Lint & Format
lint: ## Lint entire repo via Biome
	npm run lint

lint/fix: ## Lint and auto-fix via Biome
	npm run lint:fix

format: ## Format entire repo via Biome
	npm run format

format/check: ## Check formatting without changing files
	npm run format:check

# Validate Instructions via CLI
validate: build/cli ## Validate instruction files using CLI (ARGS="--project <name> ...")
	node packages/magic-agent-helix/dist/cli.mjs validate $(ARGS)

# Git Hooks
install/hooks: ## Install pre-commit hooks for lint/format
	npm run install:hooks

# Clean artifacts
clean: ## Remove build artifacts
	find packages -type d -name dist -prune -exec rm -rf {} +
	find playground -type d -name dist -prune -exec rm -rf {} +

.PHONY: help install build build/core build/cli build/vscode build/playground \
	test test/all test/core test/core/file test/core/watch test/core/coverage test/core/combiner test/core/integration \
	lint lint/fix format format/check validate install/hooks clean
