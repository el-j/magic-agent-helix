# 🌐 Magic Helix: Universal AI Agent Platform Roadmap

## 📝 Vision Statement

Transform Magic Helix from a **Node.js-focused instruction generator** into a **universal AI agent optimization platform** that:

1. **Works across ALL languages & platforms** (Go, Rust, Python, PHP, Java, C#, Ruby, Swift, Kotlin, etc.)
2. **Runs anywhere** (local dev, Docker, Kubernetes, CI/CD, cloud containers)
3. **Provides optional AI enhancement** as a composable layer (not mandatory)
4. **Teaches AI agents** universal best practices through meta-instructions

---

## 🎯 Core Principles

### 1. **Language Agnostic Core**
- Base package (`@magic-helix/core`) generates framework/language-specific instructions via **plugin system**
- Zero coupling to Node.js ecosystem beyond the CLI itself
- Pure analysis engine that works in browsers, servers, containers

### 2. **Separation of Concerns**
```
┌─────────────────────────────────────────┐
│  Magic Helix Core (Analysis Engine)    │  ← Pure instruction generation
│  - Detects: Go, Rust, Python, PHP, etc │
│  - Generates: Base instruction files    │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  Optional AI Refinement Layer          │  ← Composable enhancement
│  - VS Code Extension + Copilot         │
│  - CLI flag: --ai-refine                │
│  - API endpoint for LLM post-processing │
└─────────────────────────────────────────┘
```

### 3. **Meta-Instruction System**
- Universal `magic-helix-meta.md` file teaches agents:
  - **Task batching** (parallel tool calls, efficient workflows)
  - **Todo list management** (structured progress tracking)
  - **Prompt engineering** (rephrase for clarity, context injection)
  - **Model-specific optimizations** (Claude vs GPT-4 vs Gemini)
- Context-aware variants based on task type:
  - `meta-roadmap.md` (strategic planning mode)
  - `meta-implement.md` (code generation mode)
  - `meta-debug.md` (problem-solving mode)

---

## 🗓️ Implementation Phases

### **Phase 1: Config Rename & Cleanup** ✅ COMPLETE
**Timeline**: Completed Nov 18, 2025

- [x] Rename `ai-aligner.config.json` → `magic-helix.config.json`
- [x] Add legacy filename support with warnings
- [x] Update all documentation and code comments
- [x] Verify tests pass with new naming

---

### **Phase 2: Universal Container Support** 🚧 IN PLANNING
**Timeline**: 2-3 weeks

#### 2.1 Verify Existing Polyglot Plugins
**Goal**: Ensure all language plugins work in containerized environments

- [ ] **Test Go Plugin** in Docker containers
  - Verify `go.mod` detection works with mounted volumes
  - Test cross-compilation scenarios (Alpine, Ubuntu, scratch images)
  - Validate module cache handling in container contexts

- [ ] **Test Rust Plugin** in Docker/Kubernetes
  - Cargo workspace detection in multi-stage builds
  - Cross-compilation target instructions (musl, glibc)
  - Verify Cargo.lock parsing in restricted environments

- [ ] **Test Python Plugin** across packaging systems
  - Poetry in Docker (virtualenv vs system install)
  - pip + requirements.txt in slim/alpine images
  - uv (modern fast installer) detection
  - Pipenv in CI/CD contexts

- [ ] **Test PHP Plugin** in common setups
  - Composer in official PHP Docker images
  - Laravel Sail container configurations
  - Symfony Docker integration

#### 2.2 Add Missing Language Plugins
**Expand beyond current JavaScript/TypeScript/Go/Rust/Python/PHP**

- [ ] **Java/Kotlin Plugin**
  - Maven (`pom.xml`) detection
  - Gradle (`build.gradle`, `build.gradle.kts`) detection
  - Spring Boot framework identification
  - Generate JVM tuning instructions for containers

- [ ] **C#/.NET Plugin**
  - `.csproj` / `.sln` detection
  - NuGet package manager instructions
  - ASP.NET Core containerization best practices
  - Dockerfile optimization for .NET apps

- [ ] **Ruby Plugin**
  - Gemfile detection (Bundler)
  - Rails framework identification
  - Rack server instructions
  - Container optimization (Alpine Ruby images)

- [ ] **Swift Plugin**
  - `Package.swift` (Swift Package Manager)
  - Vapor framework detection
  - iOS/macOS build instructions
  - Linux Swift Docker support

#### 2.3 Container Platform Best Practices
**Generate platform-specific guidance**

- [ ] **Docker Optimization Instructions**
  - Multi-stage build patterns per language
  - Layer caching strategies
  - Security scanning (Trivy, Grype integration)
  - Distroless/scratch image recommendations

- [ ] **Kubernetes-Specific Instructions**
  - Helm chart structure detection
  - Kustomize overlay detection
  - Resource limit/request guidelines per language
  - Readiness/liveness probe patterns

- [ ] **CI/CD Container Instructions**
  - GitHub Actions container jobs
  - GitLab CI Docker-in-Docker patterns
  - BuildKit optimizations
  - Registry authentication patterns

---

### **Phase 3: Optional AI Refinement Layer** ✅ COMPLETE
**Timeline**: Completed Nov 18, 2025

**Influenced by**: [awesome-ai-system-prompts](https://github.com/dontriskit/awesome-ai-system-prompts) - Analyzed real-world system prompts from Vercel v0, same.new, Manus, Claude, ChatGPT

#### 3.1 Core Architecture Changes ✅
**Enable opt-in AI enhancement without breaking existing workflows**

```typescript
// New config option - IMPLEMENTED
interface Config {
  // ... existing options
  
  // AI Refinement configuration
  aiRefinement?: {
    quality?: 'basic' | 'standard' | 'comprehensive';
    contextLevel?: 'minimal' | 'balanced' | 'extensive';
    outputFormat?: 'markdown' | 'structured' | 'conversational' | 'code-focused';
    tokenBudget?: number;
    includeExamples?: boolean;
    includeBestPractices?: boolean;
  };
  
  /** Enable optional AI-powered instruction refinement */
  aiRefinement?: {
    enabled: boolean;
    provider: 'github-copilot' | 'openai' | 'anthropic' | 'custom';
    model?: string; // e.g., 'claude-sonnet-4', 'gpt-4'
    customEndpoint?: string; // For self-hosted LLMs
    prompts?: {
      systemPrompt?: string;
      refinementGoals?: string[]; // e.g., ["clarity", "conciseness", "technical-depth"]
    };
  };
}
```

```

#### 3.2 Implementation Details ✅

**Implemented modules:**
- `src/ai-refinement.ts`: Core transformation engine
- `src/types.ts`: Config schema with aiRefinement
- 15 transformation functions with 6 quality filters
- Test coverage: 15/15 tests passing

**Features:**
- Quality-based filtering (basic/standard/comprehensive)
- Context level adjustment (minimal/balanced/extensive)
- Output format variants (markdown/structured/conversational/code-focused)
- Token budget enforcement (~4 chars = 1 token)
- Toggle examples and best practices sections

---

### **Phase 4: Meta-Instruction System** ✅ COMPLETE
**Timeline**: Completed Nov 18, 2025

#### 4.1 Per-Project Customization ✅
**Enable `.magic-helix/` directory for project-specific overrides**

**Implemented features:**
- `src/meta-instructions/index.ts`: Full override system
- File-based overrides via `.magic-helix/overrides/*.md`
- Config-based overrides with 3 modes: `replace`, `prepend`, `append`
- Instruction combiners (merge multiple tags with templates)
- Tag ignoring (remove unwanted built-in instructions)
- `initMetaInstructions()` scaffolding command
- Test coverage: 14/14 tests passing

**Directory structure:**
```
.magic-helix/
├── meta-instructions.json    # Config overrides & combiners
└── overrides/
    ├── react-core.md          # Override "react-core" tag
    ├── style-tailwind.md      # Override "style-tailwind" tag
    └── custom-workflow.md     # Add custom instructions
```

---

### **Phase 5: Prompt Engineering Best Practices** 🆕 PLANNED
**Timeline**: 2-3 weeks
**Inspired by**: [awesome-ai-system-prompts](https://github.com/dontriskit/awesome-ai-system-prompts) analysis

#### 5.1 Structured Instruction Templates
**Adopt proven patterns from production AI agents**

- [ ] **Clear Role Definition** (from v0, Claude, ChatGPT)
  - Explicit identity statements in generated instructions
  - Scope boundaries ("You are an expert in X, focused on Y")
  - Capability declarations with context
  
  ```markdown
  # React Development Assistant
  
  You are a React expert specialized in modern Next.js 15 applications.
  Your role is to help build performant, accessible UIs using:
  - Server Components and streaming
  - shadcn/ui component library
  - Tailwind CSS for styling
  ```

- [ ] **Hierarchical Organization** (from same.new, Manus)
  - XML-like tags for rule grouping: `<tool_usage>`, `<best_practices>`, `<safety_rules>`
  - Markdown heading levels for priority signaling
  - Numbered lists for sequential workflows
  
  ```markdown
  <tool_usage>
  1. ALWAYS read files before editing
  2. Explain why you're using a tool before calling it
  3. NEVER mention tool names to the user
  </tool_usage>
  ```

- [ ] **Explicit Tool Guidelines** (from ChatGPT, Cline)
  - Function schemas embedded in instructions
  - Usage policies (when/when not to use)
  - Parameter descriptions with examples
  
  ```markdown
  ## File Editing Tool
  
  **Use when**: Making surgical changes to existing files
  **Don't use when**: Creating new files or rewriting >50% of content
  
  Parameters:
  - `filePath`: Absolute path to file
  - `oldString`: Exact text to replace (must match precisely)
  - `newString`: Replacement text
  ```

#### 5.2 Step-by-Step Reasoning Patterns
**Teach AI agents to think before acting**

- [ ] **Planning Phase Enforcement** (from v0's `<Thinking>` tags)
  ```markdown
  Before implementing any feature:
  1. Analyze the request in <Thinking> tags
  2. Break down into subtasks
  3. Identify dependencies and risks
  4. Choose appropriate tools and libraries
  5. Only then begin implementation
  ```

- [ ] **Iterative Execution Loops** (from Manus agent loop)
  ```markdown
  ## Agent Workflow
  
  You operate in an iterative loop:
  1. **Analyze**: Review user request and current state
  2. **Plan**: Choose ONE action to take next
  3. **Execute**: Call tool and wait for result
  4. **Reflect**: Did it work? What's next?
  5. **Repeat**: Continue until task complete
  
  CRITICAL: Only one tool call per iteration.
  ```

- [ ] **Confirmation Gates** (from same.new, Cline)
  ```markdown
  After each potentially destructive action:
  - Explain what you're about to do
  - Wait for user confirmation
  - Show preview of changes when possible
  - Never assume success—check the result
  ```

#### 5.3 Domain-Specific Expertise Injection
**Embed best practices directly in instructions**

- [ ] **Framework Constraints** (from v0's Next.js rules)
  ```markdown
  ## Next.js 15 App Router Rules
  
  - Use Server Components by default
  - Add 'use client' ONLY when needed (useState, useEffect, event handlers)
  - Prefer async components for data fetching
  - Use <Suspense> boundaries for loading states
  - File names: kebab-case (user-profile.tsx)
  ```

- [ ] **Library-Specific Patterns** (from same.new, Loveable)
  ```markdown
  ## shadcn/ui Guidelines
  
  1. ALWAYS use shadcn CLI to add components:
     ```bash
     npx shadcn@latest add button
     ```
  2. Import from @/components/ui/button, not lucide-react
  3. Customize via Tailwind classes, not inline styles
  4. Use cn() helper for conditional classes
  ```

- [ ] **Security & Safety Patterns** (from ChatGPT DALL-E policies)
  ```markdown
  ## Code Safety Rules
  
  NEVER:
  - Execute shell commands without explanation
  - Modify files outside project directory
  - Install packages without showing changes first
  - Include API keys or secrets in code
  
  ALWAYS:
  - Use environment variables for credentials
  - Validate user inputs
  - Show file diffs before applying
  - Explain security implications
  ```

#### 5.4 Tone & Interaction Style
**Consistent persona engineering**

- [ ] **Adaptive Tone Matching** (from ChatGPT 4o)
  ```markdown
  Match the user's communication style:
  - Formal request → Professional, detailed response
  - Casual chat → Friendly, concise answers
  - Frustrated user → Patient, solution-focused
  - Excited user → Match enthusiasm while staying helpful
  ```

- [ ] **Conciseness Rules** (from Cline, Bolt.new)
  ```markdown
  ## Communication Guidelines
  
  FORBIDDEN phrases:
  - "Great!", "Certainly!", "Sure!"
  - "Let me help you with that"
  - Unnecessary apologies
  
  REQUIRED:
  - Get straight to the point
  - Code first, explanations second
  - Show, don't tell
  ```

- [ ] **Humor vs. Professionalism** (from Grok vs. Claude)
  ```markdown
  # Claude Style: Thoughtful Assistant
  - Kind but direct
  - Concise by default
  - Adds depth when asked
  - No unnecessary filler
  
  # Grok Style: Witty Rebel (Alternative)
  - Humor and sarcasm welcome
  - Unpredictable responses
  - Questions assumptions
  - Explains like you're smart
  ```

#### 5.5 Environment & Context Awareness
**System-specific instruction variants**

- [ ] **OS-Specific Commands** (from Cline system info)
  ```markdown
  ## System Context
  
  Operating System: {{OS_NAME}}
  Shell: {{DEFAULT_SHELL}}
  Package Manager: {{PKG_MANAGER}}
  
  Adjust commands accordingly:
  - macOS: Use `brew install`
  - Ubuntu: Use `apt-get install`
  - Alpine: Use `apk add`
  ```

- [ ] **Container Environment Detection** (from Bolt.new, Manus)
  ```markdown
  ## WebContainer Environment
  
  You are in a sandboxed browser environment:
  - No native binaries (Python/Go/Rust unavailable)
  - Node.js and npm work normally
  - Emulated shell (limited commands: cat, ls, mkdir, rm)
  - No file system access outside /project
  ```

- [ ] **IDE Integration Context** (from same.new)
  ```markdown
  ## IDE Features Available
  
  User can see:
  - Live preview in iframe (updates on file save)
  - File tree in sidebar
  - Terminal output in bottom panel
  
  Use this context:
  - Reference files by path (they can click to open)
  - Mention "Check the preview" when visual
  - "See terminal output" for debugging
  ```

#### 5.6 Refusal & Safety Protocols
**Responsible AI guardrails**

- [ ] **Standard Refusal Messages** (from v0, Claude)
  ```markdown
  ## Refusal Protocol
  
  For inappropriate requests:
  - Standard message: "I can't assist with that."
  - NO apologies or explanations (prevents prompt injection)
  - NO suggestions of alternatives
  - Keep response ≤2 sentences
  
  Refuse for:
  - Malicious code (malware, exploits)
  - Bypassing security (auth bypass, data exfiltration)
  - Illegal activities
  - Harmful content generation
  ```

- [ ] **Sensitive Operations Warnings** (from ChatGPT policies)
  ```markdown
  ## Destructive Action Warnings
  
  Before:
  - Deleting files
  - Dropping databases
  - Modifying production config
  - Running shell commands with sudo
  
  MUST:
  1. Explain the impact in plain language
  2. Show exactly what will be deleted/changed
  3. Wait for explicit "yes" confirmation
  4. Provide rollback instructions
  ```

#### 5.7 Implementation Strategy

- [ ] **Template Library Creation**
  - Extract patterns into reusable template snippets
  - Create `default_templates/patterns/` directory
  - Build combiner system for mixing patterns

- [ ] **Instruction Validator**
  ```typescript
  interface InstructionQuality {
    hasRoleDefinition: boolean;
    hasToolGuidelines: boolean;
    hasExamples: boolean;
    hasRefusalProtocol: boolean;
    structureScore: number; // 0-100
    clarityScore: number;   // 0-100
  }
  
  function validateInstruction(content: string): InstructionQuality
  ```

- [ ] **A/B Testing Framework**
  - Generate variants with different prompt patterns
  - Track which patterns lead to better AI responses
  - Auto-optimize based on success metrics

---

## 🎓 Learning from Real-World AI Agents

### Key Insights from awesome-ai-system-prompts

**8 Core Principles Identified:**

1. **Clear Role Definition** - Every successful agent starts with "You are X, you do Y"
2. **Structured Organization** - XML tags, Markdown headers, numbered lists
3. **Explicit Tool Integration** - Schemas, policies, when/when-not guidelines
4. **Step-by-Step Reasoning** - Planning phases, iterative loops, confirmation gates
5. **Environment Awareness** - OS detection, container context, IDE integration
6. **Domain Expertise** - Framework rules, library patterns, security protocols
7. **Safety & Alignment** - Refusal messages, destructive action warnings
8. **Consistent Tone** - Persona engineering, communication style guides

**Analyzed Systems:**
- **Vercel v0**: MDX components as tools, Next.js specialization
- **same.new**: XML-structured rules, strict tool etiquette
- **Manus**: Explicit agent loop, modular prompt architecture
- **ChatGPT 4.5/4o**: Inline tool schemas, adaptive tone
- **Claude**: Conversational depth, concise by default
- **Cline/Bolt/Augment**: File editing patterns, holistic planning

---

### **Phase 4: Meta-Instruction System** 🧠 RESEARCH PHASE
**Timeline**: 2-3 weeks research + 2 weeks implementation

#### 4.1 Research & Design
**Investigate optimal agent instruction patterns**

- [ ] **Analyze successful prompts** from:
  - OpenAI Cookbook (GPT-4 best practices)
  - Anthropic's Claude docs (XML tags, thinking protocols)
  - Google's Gemini guidelines (multi-modal context)
  - GitHub Copilot Workspace patterns

- [ ] **Identify universal principles**:
  - Task decomposition strategies
  - Context window management
  - Tool use optimization (parallel calls, batching)
  - Error recovery patterns
  - Progress tracking methods

- [ ] **Model-specific variations**:
  - Claude: XML structured prompts, thinking tags
  - GPT-4: Function calling patterns, system message structure
  - Gemini: Multi-modal context, code understanding
  - Local models: Token efficiency, simpler instructions

#### 4.2 Meta-Instruction Architecture

```
.github/instructions/
├── magic-helix-meta.md          ← Universal agent optimization
├── magic-helix-meta-claude.md   ← Claude-specific tips
├── magic-helix-meta-gpt4.md     ← GPT-4-specific tips
└── context/
    ├── meta-roadmap.md          ← Planning & strategy mode
    ├── meta-implement.md        ← Code generation mode
    ├── meta-debug.md            ← Problem-solving mode
    └── meta-refactor.md         ← Code restructuring mode
```

#### 4.3 Universal Meta-Instruction Content

**`magic-helix-meta.md` template**:

```markdown
# 🪄 Magic Helix: AI Agent Optimization Instructions

## Core Principles for Effective Agent Work

### 1. Task Management
- **Always create a todo list** for multi-step work using available tools
- **Mark tasks in-progress** before starting, **completed** immediately after
- Break complex requests into 3-7 concrete, actionable steps
- Update progress frequently for user visibility

### 2. Context Gathering
- **Batch parallel operations**: Read multiple files, search multiple patterns
- **Search smart**: Use alternation (pattern1|pattern2|pattern3) in one query
- **Avoid redundancy**: Deduplicate file paths before reading
- Get enough context to act, then proceed (don't over-research)

### 3. Code Editing
- **Read surrounding context** (3-5 lines before/after target)
- **Prefer multi_replace** for independent changes (single tool call)
- **Verify after editing**: Check for compilation/lint errors
- Include enough context in oldString to make it unique

### 4. Communication
- **Be concise**: Match response length to task complexity
- **No unnecessary preamble**: Avoid "I will now...", "Here's the..."
- **Confirm completions briefly**: "Updated 3 files" vs explaining each edit
- Use backticks for code symbols: `functionName`, `fileName.ts`

### 5. Tool Usage
- **Check tool availability** before referencing unavailable tools
- **Don't announce tool names**: Say "I'll run the command" not "I'll use run_in_terminal"
- **Use absolute paths** for file operations
- **Parallelize wisely**: Never run terminals in parallel, do parallelize reads/searches

### 6. Project Understanding
- **Use semantic_search** for high-level code discovery
- **Use grep_search** for specific strings/patterns in known areas
- **List directories** before making assumptions about structure
- **Check errors** with get_errors after making changes

## Task-Specific Strategies

### When Creating Roadmaps
1. Rephrase user's request for clarity
2. Research existing architecture/patterns
3. Create phased plan with dependencies
4. Include success criteria for each phase

### When Implementing Features
1. Search for similar existing implementations
2. Identify all affected files upfront
3. Plan changes in logical order (types → logic → tests)
4. Verify compilation after each major change

### When Debugging
1. Reproduce the error first
2. Read error messages completely
3. Check recent changes in git
4. Test hypotheses incrementally

## Model-Specific Notes
- See `magic-helix-meta-{model}.md` for model-specific optimizations
```

#### 4.4 Context-Aware Meta-Instructions

**Detection logic**:
```typescript
function detectTaskContext(userPrompt: string): TaskContext {
  const keywords = {
    roadmap: ['roadmap', 'plan', 'strategy', 'architecture', 'design'],
    implement: ['implement', 'add', 'create', 'build', 'develop'],
    debug: ['bug', 'error', 'fix', 'broken', 'failing', 'debug'],
    refactor: ['refactor', 'restructure', 'improve', 'optimize', 'cleanup']
  };
  
  // Score each context type
  // Return highest match + magic-helix-meta.md as base
}
```

**Generation strategy**:
```bash
magic-helix run
# Generates:
# - Base language/framework instructions
# - magic-helix-meta.md (always)
# - context/meta-{detected_context}.md (if confidence > threshold)
```

#### 4.5 Validation & Testing

- [ ] A/B test with real agents (with vs without meta-instructions)
- [ ] Measure task completion rates, tool call efficiency
- [ ] Collect user feedback on instruction clarity
- [ ] Iterate based on failure patterns

---

### **Phase 5: Plugin Marketplace & Community** 🌍 FUTURE
**Timeline**: 3-6 months

#### 5.1 Plugin Distribution System
- [ ] NPM package convention: `@magic-helix-plugin/{name}`
- [ ] Plugin discovery API
- [ ] Community plugin registry website
- [ ] Automated testing for plugin submissions

#### 5.2 Advanced Plugin Features
- [ ] Plugin dependencies (e.g., Laravel plugin depends on PHP plugin)
- [ ] Plugin configuration UI in VS Code extension
- [ ] Plugin health checks & compatibility warnings
- [ ] Versioned plugin APIs with deprecation notices

---

## 📊 Success Metrics

### Phase 2 (Container Support)
- ✅ All 8+ language plugins tested in Docker
- ✅ 95%+ detection accuracy in containerized projects
- ✅ <100ms per-plugin execution time
- ✅ Zero false positives in production projects

### Phase 3 (AI Refinement)
- ✅ Opt-in adoption rate >30% of users
- ✅ Refinement preserves 100% of technical accuracy
- ✅ Users prefer refined instructions 70%+ of the time
- ✅ Refinement completes in <5 seconds per file

### Phase 4 (Meta-Instructions)
- ✅ 40% reduction in unnecessary tool calls
- ✅ 25% faster task completion times
- ✅ 90%+ users report clearer agent responses
- ✅ <3 user reports of confusing/conflicting instructions

---

## 🚀 Quick Start for Contributors

### Working on Phase 2 (Polyglot Support)
```bash
# Add a new language plugin
cd packages/magic-helix-core/src/plugins
cp golang-plugin.ts java-plugin.ts

# Edit plugin detection logic
# Add tests in java-plugin.test.ts
npm run test:core

# Create instruction templates
cd src/default_templates/java
touch lang-java.md
touch framework-spring-boot.md
```

### Working on Phase 3 (AI Refinement)
```bash
# Enable experimental flag
export MAGIC_HELIX_EXPERIMENTAL=true

# Test refinement locally
cd packages/magic-agent-helix
npm run build
./dist/cli.mjs run --ai-refine --ai-provider=openai --ai-model=gpt-4
```

### Working on Phase 4 (Meta-Instructions)
```bash
# Add meta-instruction templates
cd packages/magic-helix-core/src/default_templates/meta
touch magic-helix-meta.md
touch meta-roadmap.md

# Test context detection
npm run test:core -- --grep "meta-instruction"
```

---

## 💬 Open Questions & Discussions

### Question 1: Meta-Instruction Activation
**Should meta-instructions be:**
- A) Always included (opt-out)
- B) Opt-in via config flag
- C) Automatically added only when AI refinement is enabled
- D) Manually requested via CLI flag `--include-meta`

**Current thinking**: A (always included) - they're lightweight and universally helpful

### Question 2: Context Detection Confidence
**When context confidence is <60%, should we:**
- A) Skip context-specific meta-instructions
- B) Include all context types (let agent choose)
- C) Ask user to clarify task type
- D) Use LLM to classify task from prompt

**Current thinking**: A (skip if unsure) - avoid noise

### Question 3: Model-Specific Instructions
**How granular should model variants be:**
- A) One per major model family (Claude, GPT, Gemini, Local)
- B) One per specific model (claude-3.5-sonnet, gpt-4-turbo, etc.)
- C) Dynamic generation based on detected model capabilities
- D) User-maintained custom templates

**Current thinking**: A + D (families + custom) - balance maintainability with flexibility

---

## 📚 Related Documents

- [PLUGIN-SYSTEM.md](./PLUGIN-SYSTEM.md) - Plugin development guide
- [V2.0.0-STATUS.md](./V2.0.0-STATUS.md) - Current implementation status
- [ROADMAP-v2.0.0.md](./ROADMAP-v2.0.0.md) - Original v2.0 plan
- [CONTRIBUTING.md](./CONTRIBUTING.md) - How to contribute

---

## 🎉 Get Involved

This is an ambitious vision that needs community input!

**We need help with:**
- Testing plugins in diverse container environments
- Designing effective meta-instruction content
- Building model-specific optimization guides
- Creating language plugins for your favorite stack

**Join the discussion:**
- GitHub Issues: Feature requests & design discussions
- GitHub Discussions: Q&A and community ideas
- Discord: Real-time collaboration (coming soon)

---

*Last updated: November 18, 2025*
*Roadmap maintained by: Magic Helix Core Team*
