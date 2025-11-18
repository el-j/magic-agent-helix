# Capability Declarations Pattern

## Purpose
Enumerate specific tasks the AI can perform with concrete examples. From **ChatGPT 4o** and **Bolt.new** patterns.

## Template

```
## Core Capabilities

### [CAPABILITY_CATEGORY_1]
I can [ACTION_VERB] [OBJECT] by [METHOD].
Example: "[CONCRETE_EXAMPLE]"

### [CAPABILITY_CATEGORY_2]
I can [ACTION_VERB] [OBJECT] by [METHOD].
Example: "[CONCRETE_EXAMPLE]"

### [CAPABILITY_CATEGORY_3]
I can [ACTION_VERB] [OBJECT] by [METHOD].
Example: "[CONCRETE_EXAMPLE]"
```

## Examples

### ChatGPT 4o (Multimodal Capabilities)
```
## Core Capabilities

### Image Generation
I can create images using DALL-E 3 by translating natural language descriptions into detailed visual prompts.
Example: "Create a sunset over a cyberpunk city with neon reflections"

### Code Analysis
I can review and explain code across 50+ languages by parsing structure, identifying patterns, and suggesting improvements.
Example: "Analyze this React component for performance bottlenecks"

### Data Processing
I can analyze CSV/JSON data by computing statistics, generating visualizations, and identifying trends.
Example: "Summarize sales trends from this quarterly report"
```

### Bolt.new (Full-Stack Development)
```
## Core Capabilities

### Application Scaffolding
I can generate complete full-stack applications by analyzing requirements and selecting appropriate frameworks.
Example: "Create a Next.js blog with MDX support and Tailwind CSS"

### Live Preview
I can run code in a WebContainer by compiling and serving apps in your browser with hot reload.
Example: "Preview this React app with instant updates as you edit"

### Dependency Management
I can install packages and configure build tools by detecting framework requirements and resolving version conflicts.
Example: "Add Prisma ORM with PostgreSQL adapter and generate migrations"
```

## Variables
- `{CAPABILITY_CATEGORY_X}`: Functional domain (e.g., "Code Generation", "Debugging")
- `{ACTION_VERB}`: What you do (e.g., "generate", "analyze", "refactor")
- `{OBJECT}`: What you operate on (e.g., "React components", "SQL queries")
- `{METHOD}`: How you do it (e.g., "using AST analysis", "by pattern matching")
- `{CONCRETE_EXAMPLE}`: Real user request demonstrating the capability

## Best Practices
1. Use action-oriented language ("I can..." not "I might be able to...")
2. Include concrete examples users can copy/paste
3. Specify technical methods (not just outcomes)
4. Group related capabilities under clear categories
5. Mention limitations within each capability (e.g., "up to 10MB files")
