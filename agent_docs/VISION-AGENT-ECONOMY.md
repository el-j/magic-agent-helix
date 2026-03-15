# MagicAgentHelix — Vision for the Agent Economy

**Document type**: Strategic Vision  
**Version**: 1.0  
**Status**: Living document — updated as the ecosystem evolves

---

## Table of Contents

1. [Vision Statement](#1-vision-statement)
2. [The Agent Economy Context](#2-the-agent-economy-context)
3. [Current State vs Future State](#3-current-state-vs-future-state)
4. [Five Key Innovation Opportunities](#4-five-key-innovation-opportunities)
5. [Integration Architecture](#5-integration-architecture)
6. [Agent Identity Catalog Integration](#6-agent-identity-catalog-integration)
7. [Multi-Agent Workflow Generation](#7-multi-agent-workflow-generation)
8. [MCP Server Design](#8-mcp-server-design)
9. [Competitive Positioning](#9-competitive-positioning)
10. [Implementation Roadmap](#10-implementation-roadmap)
11. [Success Metrics](#11-success-metrics)

---

## 1. Vision Statement

> **MagicAgentHelix will become the source-of-truth configuration layer for every AI agent that touches a codebase — not just by pre-generating instruction files, but by synthesizing project identity, curating agent team configurations, and serving live context to agents at runtime via MCP.**

Today, MagicAgentHelix solves a real and immediate problem: AI agents operating on a project without any project-specific context produce generic, often incorrect advice. MagicAgentHelix fixes this by inspecting the codebase and generating path-scoped instruction files.

Tomorrow, the problem is larger. Developers are not working with a single agent — they are orchestrating **teams of agents**: an Architect agent that designs, a Coder agent that implements, a Reviewer agent that critiques, a Writer agent that documents. Each agent needs not just file-scope rules, but a **role identity**, **team awareness**, and **live access to project context**.

MagicAgentHelix is uniquely positioned to become the infrastructure layer that makes multi-agent development on real projects coherent, consistent, and powerful.

---

## 2. The Agent Economy Context

### 2.1 The Shift from Autocomplete to Agentic Workflows

The AI tooling landscape has undergone three phases in rapid succession:

**Phase 1: Autocomplete (2021–2023)**  
GitHub Copilot, Tabnine, Codeium. Agents complete the line you're on. No project context needed — everything is local and immediate.

**Phase 2: Chat + Context Windows (2023–2024)**  
Claude, ChatGPT, Copilot Chat. Developers paste files into chat and ask questions. Context is manually assembled on each conversation.

**Phase 3: Agentic IDEs and Agent Orchestration (2024–present)**  
Cursor, Windsurf, Claude Code, GitHub Copilot Workspace. Agents autonomously read files, write code, run tests, and iterate. Long-running tasks, sub-agent delegation, and multi-tool use are the norm.

We are entering Phase 4: **Agent Teams on Production Codebases**.

### 2.2 Key Developments Shaping the Landscape

**Agent Identity Files**  
Projects like [agency-agents](https://github.com/msitarzewski/agency-agents) have demonstrated that curated agent identity files — role definitions, expertise declarations, behavioral constraints — dramatically improve the consistency and quality of agentic output. These files can be dropped into Claude Code, Cursor, or any system-prompt-aware tool. The pattern is catching on across the ecosystem.

**Multi-Agent Orchestration**  
Claude Code supports `@agent` delegation within conversations. Cursor supports "agent mode" with sub-agents. GitHub Copilot Workspace plans multi-step task execution. The common thread: a **primary orchestrator** delegates to **specialist sub-agents**, each with its own identity and context.

**Model Context Protocol (MCP)**  
MCP, introduced by Anthropic and rapidly adopted across the ecosystem, allows agents to call **tools** exposed by other services at runtime. An agent working on a Vue file can call `magic_helix.get_instructions("src/components/Button.vue")` and receive the applicable rules on-demand, without needing any pre-generated files in the repository.

**Agentic IDE Rule Systems**  
- **Cursor**: `.cursor/rules/` with `.mdc` files, `globs:` and `alwaysApply:` frontmatter
- **Windsurf**: `.windsurf/rules/` with Markdown files
- **Claude Code**: `CLAUDE.md` project context + `@agent` delegation
- **GitHub Copilot**: `.github/instructions/` with `applyTo:` frontmatter (current target)

Each tool has its own format — a fragmentation problem that MagicAgentHelix can uniquely solve.

**Community Agent Repositories**  
The ecosystem is developing catalogs of reusable agent identity definitions. These are to agents what npm packages are to code: composable, versioned, community-curated building blocks that developers can pull into their projects rather than writing from scratch.

### 2.3 The Gap MagicAgentHelix Fills

The central insight is this: **every project has an implicit team of agent specialists it needs — but no tool synthesizes that team automatically from the project's own structure.**

A developer starting a Vue 3 + TypeScript + Vitest project needs:
- A Frontend Developer agent identity (Vue 3, Composition API)
- A TypeScript Expert agent (strict mode, interface design)
- A Testing Engineer agent (Vitest, coverage patterns)
- File-scoped rules for each file type
- A team orchestration config that wires these agents together

Today they must assemble this by hand, searching GitHub for examples, copy-pasting from agent repositories, and manually adapting each file. MagicAgentHelix can automate all of this.

---

## 3. Current State vs Future State

### 3.1 Current State: File-Scoped Instruction Generator

```
Input:  Project directory
Output: .github/instructions/<name>.md files with applyTo globs

Flow:
  Detect project type (18 language plugins)
    → Map to tags (framework-vue, test-vitest, style-tailwind…)
    → Load matching templates
    → Format for target (github-copilot, claude, copilot-chat, generic)
    → Write .md files
```

**What it does well:**
- Automatic detection via dependency analysis, config files, and glob matching
- Clean plugin architecture for extensibility
- Consistent file-scope instruction format
- Validation scoring for generated content

**What it doesn't do:**
- Generate agent role identities (who the agent *is*, not just what files it works on)
- Generate multi-agent team configurations
- Support Cursor, Windsurf, Aider, or other popular tools
- Serve instructions to agents at runtime (requires pre-generated files)
- Pull from community agent repositories
- Understand the *relationships* between files and agents

### 3.2 Future State: Agent Configuration Platform

```
Input:  Project directory + optional community agent catalog
Output: Complete agent configuration stack for all tools

Stack:
  ├── Agent identities/         ← Who each agent is
  │   ├── frontend-developer.md
  │   ├── typescript-expert.md
  │   └── testing-engineer.md
  ├── Team configuration/       ← How agents work together
  │   └── team.md (Orchestrator → Coder → Reviewer pipeline)
  ├── File-scope instructions/  ← What rules apply to which files
  │   ├── .github/instructions/     (GitHub Copilot)
  │   ├── .cursor/rules/            (Cursor)
  │   └── .windsurf/rules/          (Windsurf)
  └── MCP server/               ← Live runtime context for any agent
      └── magic-helix-mcp        (serves context on demand)
```

---

## 4. Five Key Innovation Opportunities

### Opportunity 1: Agent Identity Synthesis

**What it is**: Automatically derive the set of agent role identities a project needs from its detected technologies, then synthesize or pull those identities from community catalogs.

**Current gap**: Magic-helix detects `framework-vue` and generates `vue.md` instruction files. It does not generate a "Vue 3 Frontend Developer" agent persona that defines who the agent *is* — its expertise, vocabulary, decision-making style, and behavioral constraints.

**How it works**:
1. Existing tag detection runs as today
2. Tag → agent identity mapping (new): `framework-vue` → `Frontend Developer + Vue Expert`, `lang-typescript` → `TypeScript Expert`, `test-vitest` → `Testing Engineer`
3. For each required identity:
   - Check community catalog (agency-agents, user-configured sources) for a matching identity
   - If found: pull and adapt with project-specific context (project name, conventions, tech stack details)
   - If not found: synthesize from template using detected project metadata
4. Write identities to `.github/instructions/agents/` or equivalent per-tool directory

**Example output** (synthesized Vue 3 agent identity):
```markdown
---
applyTo: "**/*"
---

# Agent Identity: Frontend Developer

## Expert Identity
You are an expert Frontend Developer specializing in Vue 3, TypeScript, and
the Composition API. You have been configured for the `magic-agent-helix`
project, a TypeScript monorepo using Vite, Vitest, and PrimeVue.

## Core Expertise
- Vue 3 Composition API with `<script setup lang="ts">`
- TypeScript strict mode with interface-first design
- Vitest for unit testing of composables and utilities
- PrimeVue component library with Tailwind CSS pass-through
...
```

**Implementation roadmap**:
- Phase 1: Tag → agent identity template mapping table in `built-in-config.ts`
- Phase 2: Community catalog integration (pull from agency-agents and similar)
- Phase 3: Project-context injection (adapt templates with real project metadata)
- Phase 4: `magic-helix run --generate-identities` flag to enable opt-in

---

### Opportunity 2: Multi-Agent Team Workflow Generation

**What it is**: Generate a complete multi-agent team configuration for a project, defining the orchestration pipeline: which agents exist, what their roles are, how they delegate to each other, and what context each receives.

**Current gap**: Magic-helix generates per-file rules but has no concept of agent *roles* or *delegation*. Modern agentic IDEs like Claude Code and Cursor can route tasks to specialized sub-agents — but only if the team is defined.

**How it works**:
1. After agent identity synthesis (Opportunity 1), analyze the project to determine an appropriate team structure
2. Map project type → team template:
   - **SaaS frontend project**: Orchestrator → Architect → Frontend Developer → Reviewer → Tech Writer
   - **Open-source library**: Orchestrator → API Designer → Implementer → Test Engineer → Documentation Writer
   - **Data pipeline**: Orchestrator → Data Engineer → ML Engineer → Infrastructure Engineer → Reviewer
   - **Full-stack monorepo**: Orchestrator → Backend Developer → Frontend Developer → DevOps Engineer → QA Engineer
3. Generate a `AGENTS.md` (or equivalent per-tool file) that defines the team:

```markdown
# Agent Team: MagicAgentHelix Monorepo

## Team Structure

### Orchestrator
Coordinates work across the team. Delegates tasks to specialists.
Escalates architectural decisions to the Architect.

### Architect
Owns the plugin system, package boundaries, and data flow design.
Review all changes to `types.ts`, `plugin-registry.ts`, and `plugin-loader.ts`.
Delegate implementation to the TypeScript Developer.

### TypeScript Developer
Implements features in `magic-helix-core` and `magic-agent-helix`.
Follow strict TypeScript mode. Prefer interfaces over types for public APIs.
Run tests with `npm run test:core` before marking work complete.

### Test Engineer
Owns test coverage for all packages. Ensure all new utility functions
have corresponding Vitest tests in `__tests__/` directories.
```

**Implementation roadmap**:
- Phase 1: Define `AgentTeamTemplate` type and a library of team archetypes
- Phase 2: Team archetype detection from project tags
- Phase 3: Team workflow file writer (AGENTS.md, Cursor workspace config)
- Phase 4: `magic-helix run --generate-team` flag

---

### Opportunity 3: Cross-Tool Synchronization

**What it is**: A single `magic-helix sync` command that generates instruction files for **all configured AI tools simultaneously**, ensuring consistency across tools and surfacing any content divergence.

**Current gap**: A developer using both GitHub Copilot and Cursor must run two separate commands and manually ensure the output is consistent. There is no mechanism to detect when the Copilot instructions are updated but the Cursor rules are stale.

**How it works**:
1. `magic-helix sync` reads the project's configured targets (from `.magic-helix.json`)
2. For each target, runs the full generation pipeline in parallel
3. After generation, produces a **consistency report**: identifies topics covered in one target's output but missing in another
4. Optionally: applies a **cross-tool diff** to surface when one tool's instructions contradict another
5. Outputs a sync manifest (`magic-helix-sync.json`) tracking what was generated when

**Example sync config in `.magic-helix.json`**:
```json
{
  "sync": {
    "targets": ["github-copilot", "cursor", "windsurf", "claude"],
    "consistencyCheck": true,
    "outputDirs": {
      "github-copilot": ".github/instructions",
      "cursor": ".cursor/rules",
      "windsurf": ".windsurf/rules",
      "claude": "."
    }
  }
}
```

**Implementation roadmap**:
- Phase 1: Add Cursor and Windsurf formatter targets (unblock cross-tool generation)
- Phase 2: Implement parallel multi-target generation in `run.ts`
- Phase 3: Consistency analysis (compare topic coverage across targets)
- Phase 4: `magic-helix sync` command with `--check` (CI mode, exit 1 on divergence)

---

### Opportunity 4: MCP Server for Runtime Context Injection

**What it is**: An MCP (Model Context Protocol) server that agents can query at runtime to get applicable instruction content for any file in the project, without requiring pre-generated static files.

**Current gap**: Pre-generated instruction files are static snapshots. They become stale as the project evolves. Agents that support MCP can get live, always-accurate context if an MCP endpoint is available. No such endpoint exists for magic-helix today.

**How it works**: See [Section 8: MCP Server Design](#8-mcp-server-design) for full technical design.

**Value proposition**:
- **No stale instructions**: context is computed fresh on each request
- **Dynamic scoping**: the server can compute the *intersection* of applicable rules for a specific file at a specific point in time
- **Agent composability**: any MCP-compatible agent can use magic-helix as a tool, regardless of whether instruction files have been generated
- **IDE-independent**: works with Claude Code, Cursor, Windsurf, any future MCP-compatible tool

---

### Opportunity 5: Community Catalog Integration

**What it is**: Integration with community-maintained agent identity catalogs (like agency-agents) as first-class sources for the identity synthesis pipeline. Instead of only synthesizing identities from internal templates, magic-helix can pull battle-tested identities from the community.

**Current gap**: Magic-helix has no mechanism to pull from external sources. All templates are bundled in `magic-helix-plugins`. The community has developed high-quality agent identity files that are maintained separately.

**How it works**:
1. Define a **catalog source interface**:
   ```typescript
   interface AgentCatalogSource {
     name: string;
     type: 'git' | 'npm' | 'url';
     url: string;
     indexPath?: string; // path to catalog index within the source
   }
   ```
2. Provide built-in catalog sources (configurable in `.magic-helix.json`):
   ```json
   {
     "catalogs": [
       {
         "name": "agency-agents",
         "type": "git",
         "url": "https://github.com/msitarzewski/agency-agents",
         "indexPath": "agents/index.json"
       }
     ]
   }
   ```
3. When generating agent identities, query catalogs for matching role archetypes
4. Fetch, cache, and adapt catalog entries with project-specific context
5. Track catalog versions for repeatability and auditing

**Implementation roadmap**:
- Phase 1: Define `AgentCatalogSource` interface and local catalog loading
- Phase 2: Git-based catalog fetching with local caching in `~/.magic-helix/catalog-cache/`
- Phase 3: Catalog index format specification (propose to community repos)
- Phase 4: `magic-helix catalog list/search/update` commands

---

## 5. Integration Architecture

The following diagram describes how MagicAgentHelix fits into the broader agent ecosystem after the full vision is realized:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Developer's Project                           │
│                                                                  │
│  package.json, *.vue, *.ts, go.mod, Cargo.toml, etc.           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              MagicAgentHelix Core Engine                         │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐    │
│  │ Project      │  │ Agent        │  │ Community          │    │
│  │ Detection    │→ │ Identity     │← │ Catalog Sources    │    │
│  │ (18 plugins) │  │ Synthesis    │  │ (agency-agents,    │    │
│  └──────────────┘  └──────┬───────┘  │  npm packages)     │    │
│                           │          └────────────────────┘    │
│  ┌──────────────────────────────────────────────────────┐      │
│  │              Output Generation Layer                  │      │
│  │                                                       │      │
│  │  File-scope    Agent       Team         MCP           │      │
│  │  Instructions  Identities  Workflows    Server        │      │
│  └──────────────────────────────────────────────────────┘      │
└────────────────────────────┬────────────────────────────────────┘
                             │
          ┌──────────────────┼───────────────────────┐
          │                  │                        │
          ▼                  ▼                        ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────────┐
│  GitHub Copilot  │ │  Cursor          │ │  Claude Code /       │
│                  │ │                  │ │  Windsurf / Aider    │
│ .github/         │ │ .cursor/rules/   │ │  CLAUDE.md           │
│ instructions/    │ │   *.mdc          │ │  .windsurf/rules/    │
│   *.md           │ │                  │ │  AGENTS.md           │
└──────────────────┘ └──────────────────┘ └──────────────────────┘
          │                  │                        │
          └──────────────────┴───────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   MCP Server    │
                    │  (runtime tool) │
                    │                 │
                    │  get_instructions│
                    │  list_projects  │
                    │  validate       │
                    └─────────────────┘
                             │
                    ┌────────▼────────┐
                    │  Any MCP-aware  │
                    │  Agent at       │
                    │  Runtime        │
                    └─────────────────┘
```

---

## 6. Agent Identity Catalog Integration

### 6.1 What Agent Catalogs Are

Agent identity catalogs are repositories of pre-authored agent persona files, each defining:
- **Expert Identity**: The role the agent plays ("You are an expert React developer…")
- **Capability Declarations**: What the agent can do
- **Behavioral Constraints**: What the agent refuses to do
- **Technology Conventions**: Specific rules for the technologies the agent knows
- **Communication Style**: How the agent explains its reasoning

Projects like [agency-agents](https://github.com/msitarzewski/agency-agents) maintain catalogs of these files, designed to be dropped directly into Claude Code, Cursor, or any instruction-aware tool.

### 6.2 The Integration Model

MagicAgentHelix integrates with catalogs at the **identity synthesis step**:

```
1. Detect project tags (existing)
   → framework-vue, lang-typescript, test-vitest, style-tailwind

2. Map tags → required agent roles (new)
   → Frontend Developer, TypeScript Expert, Testing Engineer, CSS/UI Specialist

3. For each required role:
   a. Query configured catalogs for matching identity
   b. If catalog match found:
      → Fetch catalog entry
      → Adapt: inject project name, detected tech stack, project-specific conventions
      → Write adapted identity to output directory
   c. If no catalog match:
      → Synthesize from built-in template (existing template system)
      → Optionally: flag as "synthesized — consider contributing to catalog"

4. Write team composition manifest
   → Lists active agent identities, their sources, and their file-scope assignments
```

### 6.3 Catalog Index Format (Proposed)

To enable programmatic discovery, magic-helix proposes a lightweight catalog index format that any community catalog can adopt:

```json
{
  "catalog": "agency-agents",
  "version": "1.0.0",
  "agents": [
    {
      "id": "frontend-developer-vue",
      "displayName": "Frontend Developer (Vue 3)",
      "tags": ["framework-vue", "lang-typescript", "build-vite"],
      "path": "agents/frontend-developer-vue.md",
      "version": "2.1.0",
      "author": "community"
    },
    {
      "id": "typescript-expert",
      "displayName": "TypeScript Expert",
      "tags": ["lang-typescript"],
      "path": "agents/typescript-expert.md",
      "version": "1.3.0",
      "author": "community"
    }
  ]
}
```

This format:
- Is a single JSON file at a well-known path (e.g., `agents/index.json`)
- Is human-readable and easy to contribute to
- Supports semantic versioning for repeatability
- Uses the same tag vocabulary as magic-helix detection

### 6.4 Adaptation Pipeline

When a catalog identity is pulled, it is adapted using project-specific context before being written:

| Placeholder | Replaced With |
|---|---|
| `{{project_name}}` | Detected project/monorepo name |
| `{{primary_language}}` | Primary language from detected tags |
| `{{frameworks}}` | Comma-separated list of detected framework tags |
| `{{test_framework}}` | Detected test framework (vitest, jest, rspec, etc.) |
| `{{build_tool}}` | Detected build tool (vite, webpack, gradle, etc.) |
| `{{package_manager}}` | npm / yarn / pnpm / cargo / pip etc. |
| `{{conventions}}` | Bullet list synthesized from project's config files |

---

## 7. Multi-Agent Workflow Generation

### 7.1 The Case for Pre-Defined Teams

When agents work without explicit team structure, they tend to:
- Overlap on the same concerns (two agents both try to architect the same change)
- Conflict on conventions (one agent writes Java-style TypeScript, another writes functional-style)
- Miss handoff points (Coder agent completes implementation but no Reviewer agent is triggered)
- Lose context across conversation boundaries (the Architect's decisions are unknown to the Coder)

A pre-defined team configuration solves this by specifying:
1. Which agents exist on this project
2. What each agent is responsible for
3. How tasks are escalated between agents
4. What shared conventions all agents follow

### 7.2 Team Archetypes

Magic-helix maintains a library of team archetypes matched to project types:

| Project Type | Detection Signal | Recommended Team |
|---|---|---|
| Frontend SPA | `framework-vue` or `framework-react` | Orchestrator, Frontend Dev, UI Designer, Test Engineer |
| Full-stack monorepo | Multiple language tags + monorepo structure | Orchestrator, Architect, Backend Dev, Frontend Dev, DevOps, QA |
| Open-source library | No framework, `test-*` tags, `ci-github-actions` | Orchestrator, API Designer, Implementer, Test Engineer, Doc Writer |
| Data pipeline | Python + `framework-pandas` or `framework-spark` | Orchestrator, Data Engineer, ML Engineer, Data Analyst |
| CLI/DevOps tool | Node.js + Commander.js, or Go/Rust | Orchestrator, Systems Developer, Test Engineer, Doc Writer |
| Mobile app | `lang-swift` or `lang-kotlin` or `framework-flutter` | Orchestrator, Mobile Dev, UI Designer, Test Engineer |

### 7.3 Team Workflow File Format

Generated team workflow files follow a consistent format compatible with Claude Code's `AGENTS.md` convention and extensible to other tools:

```markdown
# Agent Team: <Project Name>

> Generated by MagicAgentHelix v4.x
> Project type: Full-stack TypeScript monorepo
> Last updated: <date>

## Team Composition

| Role | Scope | Primary Capabilities |
|---|---|---|
| Orchestrator | All files | Task decomposition, delegation, synthesis |
| Architect | `packages/*/src/`, `*.config.ts` | System design, API contracts, dependency decisions |
| TypeScript Developer | `packages/magic-helix-core/src/**/*.ts` | Core logic, plugin system, formatters |
| CLI Developer | `packages/magic-agent-helix/src/**/*.ts` | CLI commands, UX, error handling |
| Test Engineer | `**/*.test.ts`, `**/*.spec.ts` | Test strategy, coverage, fixture design |
| Documentation Writer | `*.md`, `agent_docs/` | Technical writing, API documentation |

## Delegation Rules

### Orchestrator
You coordinate work across the team. When a task requires:
- **Architecture changes**: delegate to Architect first, then TypeScript Developer
- **New CLI features**: delegate to CLI Developer, with Test Engineer for coverage
- **Bug fixes**: delegate to the Developer whose scope contains the affected file
- **Documentation**: delegate to Documentation Writer after implementation is complete

### Architect
You own `plugin-registry.ts`, `plugin-loader.ts`, `types.ts`, and `built-in-config.ts`.
Before approving changes to these files, verify:
- No new circular dependencies are introduced
- The `LanguagePlugin` v3 interface is not broken
- New plugin authors can implement the interface without reading core internals

### TypeScript Developer
You own `magic-helix-core/src/`. Follow these conventions:
- Strict TypeScript mode; never use `any` without justification
- Prefer `interface` for public API types, `type` for internal utilities
- All new utilities must have co-located Vitest tests
- Use `micromatch` for glob matching (not hand-rolled regex)

## Shared Conventions
- Commit style: Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`)
- Test command: `npm run test:core` (must pass before marking work complete)
- Lint command: `npm run lint` (Biome, zero warnings policy)
- Build validation: `npm run build` after any change to `magic-helix-core`
```

### 7.4 Tool-Specific Outputs

| Tool | Team Config Location | Format Notes |
|---|---|---|
| Claude Code | `AGENTS.md` (project root) | Standard markdown, Claude-native format |
| Cursor | `.cursor/rules/team.mdc` | MDX with `alwaysApply: true` frontmatter |
| Windsurf | `.windsurf/rules/team.md` | Standard markdown |
| GitHub Copilot | `.github/instructions/team.md` | With `applyTo: "**/*"` frontmatter |
| Generic | `TEAM.md` (project root) | Human-readable reference |

---

## 8. MCP Server Design

### 8.1 Overview

The MagicAgentHelix MCP server exposes the analysis and instruction retrieval engine as a set of tools callable by any MCP-compatible agent. This enables **runtime context injection**: instead of querying pre-generated files, an agent calls the MCP server and receives fresh, accurate instructions for exactly the file it is about to edit.

**Package**: `@el-j/magic-helix-mcp`  
**Transport**: stdio (primary), HTTP/SSE (secondary)  
**Protocol**: MCP 1.0

### 8.2 Tool Catalog

#### Tool: `get_instructions`

Returns the applicable instruction content for a given file path.

**Input schema**:
```json
{
  "file_path": {
    "type": "string",
    "description": "Path to the file relative to the project root"
  },
  "project_root": {
    "type": "string",
    "description": "Absolute path to the project root (optional, defaults to cwd)"
  }
}
```

**Output schema**:
```json
{
  "file": "src/components/Button.vue",
  "applicable_instructions": [
    {
      "name": "vue3-composition-api",
      "content": "# Framework: Vue 3\n\n...",
      "source": "generated",
      "score": 87,
      "tags": ["framework-vue", "lang-typescript"]
    }
  ],
  "agent_identity": {
    "name": "Frontend Developer",
    "content": "# Agent Identity: Frontend Developer\n\n..."
  }
}
```

#### Tool: `list_projects`

Returns all detected projects in a monorepo and their tag sets.

**Output schema**:
```json
{
  "projects": [
    {
      "name": "magic-helix-core",
      "path": "packages/magic-helix-core",
      "tags": ["lang-typescript", "build-vite", "test-vitest"],
      "instruction_count": 4
    }
  ]
}
```

#### Tool: `validate_file_instructions`

Scores a block of instruction content against the 15-element quality rubric.

**Input**: `{ "content": "string" }`  
**Output**: `{ "score": 87, "grade": "B+", "missing": ["Safety Guidelines"], "recommendations": [...] }`

#### Tool: `synthesize_agent_identity`

Synthesizes an agent identity for a given role and technology stack.

**Input**: `{ "role": "frontend-developer", "tags": ["framework-vue", "lang-typescript"] }`  
**Output**: `{ "identity": "# Agent Identity: Frontend Developer\n\n..." }`

#### Tool: `get_team_config`

Returns the recommended agent team configuration for the project.

**Input**: `{ "project_root": "/path/to/project" }`  
**Output**: `{ "team_config": "# Agent Team: ...\n\n..." }`

### 8.3 Server Configuration

The MCP server is configured via `mcp.json` in the project root or via CLI flags:

```json
{
  "mcpServers": {
    "magic-helix": {
      "command": "npx",
      "args": ["@el-j/magic-helix-mcp", "--project-root", "/path/to/project"],
      "env": {
        "MAGIC_HELIX_VERBOSE": "false"
      }
    }
  }
}
```

### 8.4 Startup Sequence

```
1. Server starts, reads project root from args
2. PluginRegistry.initialize() — loads all plugins (same as CLI)
3. Eager project detection: scan projectRoot, cache ProjectMetadata per project
4. Ready: begin accepting JSON-RPC requests over stdio
5. On each request: check if project cache is stale (file watcher), recompute if needed
6. On shutdown: write telemetry summary (if enabled)
```

### 8.5 File Watching

For development environments where files change frequently:
- The server maintains a `Map<projectPath, ProjectMetadata>` cache
- A file watcher (using Node.js `fs.watch` or `chokidar`) invalidates cache entries when `package.json` or config files change
- For glob-based detection, the cache is invalidated when new files are added to tracked directories

### 8.6 Security Considerations

- The server only reads files from the configured `project_root`; no path traversal is permitted
- No network calls are made by the server; all processing is local
- File system access is read-only; the MCP server never writes files (that is the CLI's responsibility)
- In multi-project environments, each project root is isolated

---

## 9. Competitive Positioning

### 9.1 Current Landscape

| Tool | What It Does | How Magic-Helix Compares |
|---|---|---|
| GitHub Copilot (built-in) | Manual `.github/instructions/` file authoring | Magic-helix automates authoring |
| Cursor Rules | Manual `.cursor/rules/` authoring | Magic-helix automates and syncs |
| agency-agents | Curated agent identity catalog | Magic-helix integrates and auto-selects from it |
| Aider | CLI agent with `.aider.conf.yml` | Magic-helix generates config; Aider consumes it |
| Cline / Continue | VS Code agents with workspace context | Magic-helix generates the context files they read |
| Pieces for Developers | Code snippet and context management | Orthogonal; different use case |
| Custom GPTs / Claude Projects | Manually authored system prompts | Magic-helix automates system prompt generation for local dev |

### 9.2 Unique Value Propositions

**1. Codebase-First Generation**  
Unlike all other tools that require manual authoring, magic-helix *derives* instructions from the actual codebase. It is the only tool that generates configuration by reading `package.json`, config files, and file patterns.

**2. Cross-Tool Consistency**  
Magic-helix is the only tool designed to generate consistent instruction sets across multiple AI tools simultaneously. In a world where developers use Copilot for suggestions and Claude for complex reasoning, magic-helix ensures they receive the same project context.

**3. Quality Validation**  
The 15-element instruction quality scorer is unique in the ecosystem. No other tool validates the quality of AI instructions before writing them.

**4. Community Catalog Composability**  
By integrating with community agent catalogs rather than building a closed ecosystem, magic-helix aligns with the open-source spirit of the developer community and benefits from community-maintained content.

**5. Extensible Plugin Architecture**  
The v3 `LanguagePlugin` interface allows any developer to extend detection and template generation for new languages or frameworks without modifying core code.

### 9.3 Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| AI tool vendors standardize on a single format, making multi-tool support unnecessary | Low | All major tools currently have different formats; standardization is years away if it happens |
| One of the target tools builds native instruction generation | Medium | Focus on cross-tool sync and quality validation as differentiators; they are harder to replicate |
| The project loses momentum and the community ecosystem doesn't form | Medium | Invest in developer experience, documentation, and early community outreach |
| MCP becomes obsolete or is replaced by a different protocol | Low | MCP has strong backing from Anthropic and broad ecosystem adoption; even if it changes, the server architecture is portable |

---

## 10. Implementation Roadmap

### Phase 1: Foundation Consolidation (Months 1–3)

**Goal**: Resolve existing technical debt and unblock the path to new features.

| Item | Priority | Effort |
|---|---|---|
| Fix `globToRegex()` with `micromatch` | P0 | Small |
| Fix `ClaudeFormatter` bold mutation | P0 | Trivial |
| Add telemetry disclosure + opt-in consent | P0 | Small |
| Resolve dual plugin interface (deprecate v2) | P1 | Medium |
| Add Cursor formatter target | P1 | Small |
| Add Windsurf formatter target | P1 | Small |
| Add CLI command tests | P1 | Medium |
| Add language plugin tests | P1 | Medium |
| Add `--output-format json` structured output | P1 | Small |

**Milestone**: Magic-helix v4.1 — clean foundation, Cursor/Windsurf support, structured output.

---

### Phase 2: Cross-Tool Sync + Agent Identities (Months 3–6)

**Goal**: Deliver the highest-value user-facing features from the agent economy vision.

| Item | Priority | Effort |
|---|---|---|
| Implement `magic-helix sync` multi-target command | P1 | Medium |
| Agent identity template library (built-in) | P2 | Medium |
| Tag → agent role mapping table | P2 | Small |
| Agent identity file writer | P2 | Small |
| Aider formatter target | P2 | Small |
| Gemini CLI formatter target | P2 | Small |
| Community catalog source interface (local catalogs) | P2 | Medium |

**Milestone**: Magic-helix v4.2 — multi-tool sync, agent identity generation, 6+ target support.

---

### Phase 3: MCP Server + Community Catalogs (Months 6–12)

**Goal**: Enable runtime context injection and community ecosystem formation.

| Item | Priority | Effort |
|---|---|---|
| `@el-j/magic-helix-mcp` package scaffolding | P2 | Medium |
| MCP tool: `get_instructions` | P2 | Medium |
| MCP tool: `list_projects` | P2 | Small |
| MCP tool: `validate_file_instructions` | P2 | Small |
| MCP tool: `get_team_config` | P2 | Small |
| File watcher for cache invalidation | P2 | Medium |
| Git-based catalog source fetching | P2 | Medium |
| `magic-helix catalog` commands (list/search/update) | P2 | Medium |
| Propose catalog index format to agency-agents | P2 | Small |

**Milestone**: Magic-helix v5.0 — MCP server GA, community catalog integration.

---

### Phase 4: Team Workflow Generation + Advanced Features (Months 12–18)

**Goal**: Complete the agent team orchestration vision.

| Item | Priority | Effort |
|---|---|---|
| Team archetype library | P2 | Large |
| Team workflow file generation | P2 | Medium |
| Multi-agent coordination rules generation | P2 | Large |
| `magic-helix run --generate-team` flag | P2 | Small |
| Project-context template injection | P2 | Medium |
| Plugin marketplace discovery (`magic-helix plugins search`) | P2 | Medium |
| Plugin versioning and compatibility checking | P2 | Medium |
| Streaming/incremental instruction generation | P2 | Large |

**Milestone**: Magic-helix v5.x — full agent team generation, ecosystem tooling, streaming output.

---

## 11. Success Metrics

### Phase 1 Metrics (3-month horizon)

| Metric | Baseline | Target |
|---|---|---|
| Open bug reports for `globToRegex` | 1+ known | 0 |
| Formatter target count | 4 | 6 (+ Cursor, Windsurf) |
| Test coverage: language plugins | 0% | ≥ 70% |
| Test coverage: CLI commands | 0% | ≥ 60% |
| Structured output format supported | No | Yes (JSON) |

### Phase 2 Metrics (6-month horizon)

| Metric | Baseline | Target |
|---|---|---|
| Formatter target count | 6 | 8 (+ Aider, Gemini) |
| Multi-target sync supported | No | Yes |
| Agent identity files generated per project | 0 | 3–5 per project |
| Weekly npm downloads | Baseline | +50% vs. baseline |
| Community plugin contributions | 0 | ≥ 3 external plugins |

### Phase 3 Metrics (12-month horizon)

| Metric | Baseline | Target |
|---|---|---|
| MCP server available | No | Yes (v1.0) |
| MCP-compatible tools supported | 0 | ≥ 3 (Claude Code, Cursor, Windsurf) |
| Community catalog sources supported | 0 | ≥ 2 (agency-agents + 1 more) |
| Agent identities from catalog vs. synthesized | 0% | ≥ 40% |
| GitHub stars | Baseline | +200% vs. baseline |

### Phase 4 Metrics (18-month horizon)

| Metric | Baseline | Target |
|---|---|---|
| Agent team archetypes available | 0 | ≥ 8 project types |
| Projects using team workflow generation | 0 | Measurable adoption |
| Plugin ecosystem size | Built-ins only | ≥ 10 community plugins on npm |
| "Magic-helix-plugin-*" npm packages | 0 | ≥ 5 |
| Usage in CI pipelines (via telemetry) | Unknown | Measurable, growing |

### North Star Metric

> **Every developer working with AI agents on a real codebase uses magic-helix to configure their agent environment — as automatically as `git init` initializes version control.**

Magic-helix is successful when:
1. Running `magic-helix run` on a new project takes under 30 seconds and produces a complete, high-quality agent configuration
2. Running `magic-helix sync` keeps that configuration current as the project evolves
3. The MCP server is included in the default MCP config of at least one major agentic IDE
4. The community has contributed enough catalog entries and plugins that most common project types have world-class agent identities out of the box

---

*This document is a living strategy. As the agent ecosystem evolves — new tools emerge, MCP matures, community catalogs grow — this vision should be revisited and updated accordingly. The goal is not to predict the future precisely, but to ensure that every architectural decision made today leaves the door open to the future described here.*
