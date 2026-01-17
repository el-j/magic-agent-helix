#!/bin/bash

# Test script to validate monorepo detection improvements
# This creates a sample multi-language monorepo structure and tests detection

set -e

TEST_DIR="/tmp/test-magic-helix-monorepo"
CLI_PATH="$(pwd)/packages/magic-agent-helix/dist/cli.mjs"

echo "🧪 Magic-Agent-Helix Monorepo Detection Test"
echo "==========================================="

# Cleanup
rm -rf "$TEST_DIR"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"

echo ""
echo "📦 Creating test monorepo structure..."

# Root package.json with workspaces
cat > package.json << 'EOF'
{
  "name": "test-monorepo",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "devDependencies": {
    "turbo": "^1.0.0"
  }
}
EOF

cat > turbo.json << 'EOF'
{
  "pipeline": {
    "build": {},
    "test": {}
  }
}
EOF

# Create apps structure
mkdir -p apps/web
cat > apps/web/package.json << 'EOF'
{
  "name": "@test/web",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "tailwindcss": "^3.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vitest": "^1.0.0"
  }
}
EOF

cat > apps/web/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "strict": true
  }
}
EOF

mkdir -p apps/admin
cat > apps/admin/package.json << 'EOF'
{
  "name": "@test/admin",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.0.0",
    "@nestjs/core": "^10.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
EOF

cat > apps/admin/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "strict": true
  }
}
EOF

# Create Python service
mkdir -p services/ai-api
cat > services/ai-api/pyproject.toml << 'EOF'
[tool.poetry]
name = "ai-api"
version = "1.0.0"

[tool.poetry.dependencies]
python = "^3.11"
fastapi = "^0.100.0"
uvicorn = "^0.23.0"

[tool.poetry.dev-dependencies]
pytest = "^7.0.0"
EOF

# Create Go service
mkdir -p services/gateway
cat > services/gateway/go.mod << 'EOF'
module github.com/test/gateway

go 1.21

require (
    github.com/gin-gonic/gin v1.9.1
)
EOF

# Create packages
mkdir -p packages/shared
cat > packages/shared/package.json << 'EOF'
{
  "name": "@test/shared",
  "version": "1.0.0",
  "dependencies": {
    "typescript": "^5.0.0"
  }
}
EOF

cat > packages/shared/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "strict": true
  }
}
EOF

echo "✅ Test structure created"
echo ""
echo "📁 Directory structure:"
tree -L 3 -I 'node_modules'

echo ""
echo "🔍 Running magic-helix detection..."
echo ""

# Run the CLI in dry-run mode
if [ -f "$CLI_PATH" ]; then
    node "$CLI_PATH" run --dry-run --verbose
else
    echo "❌ CLI not found at $CLI_PATH"
    echo "Please run 'npm run build' first"
    exit 1
fi

echo ""
echo "🎉 Test complete!"
echo ""
echo "Expected results:"
echo "- Detected 6+ projects (root, 2 apps, 1 Python service, 1 Go service, 1 shared package)"
echo "- Tags should include: typescript, react, tailwind, vitest, nestjs, python, fastapi, pytest, go, gin"
echo "- Workspace members should be properly expanded from 'apps/*' and 'packages/*'"

cd -
