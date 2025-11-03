# ✨ Magic-Agent-Helix v2.0 Roadmap ✨

This document outlines the strategic plan to evolve `magic-agent-helix` from a JavaScript-focused tool into a "polyglot" (multi-language) and "meta-aware" (DevOps, architecture) project analyzer.

## 🎯 Vision
The goal is for `magic-agent-helix` to be able to scan *any* modern software project, understand its "tech stack DNA" (code, architecture, and workflows), and generate highly-specific, contextual instructions for AI agents like GitHub Copilot.

## Status Key
* `[ ]` **Not Started**
* `[~]` **In Progress**
* `[x]` **Completed**

---

### 1. 🏗️ Core: Plugin-Based Architecture
The foundation for all new features. This involves refactoring the core analysis engine to use a plugin-based system, where each technology (e.g., Go, Docker, GitHub Actions) is a self-contained plugin.

* `[x]` **Define Plugin Interface:** Create a standard `DetectionPlugin` interface (e.g., `name`, `detect()`, `generateInstructions()`).
* `[~]` **Refactor Core Engine:** Update the main analysis service to load and execute all registered plugins.
* `[x]` **Create Detection Context:** Build a `DetectionContext` utility that plugins can use to access the file list and file content (e.g., `context.files`, `context.getTextFile()`).

---

### 2. 🌍 Feature: Polyglot Ecosystem Detection
Expand detection beyond the Node.js ecosystem.

* `[x]` **Go (Golang):**
    * **Detection:** `go.mod` ✅ (GolangPlugin implemented)
    * **Instructions:** `go.mod` usage, `go mod tidy`, idiomatic error handling.
* `[x]` **Python:**
    * **Detection:** `pyproject.toml` (Poetry/PEP 621), `requirements.txt` ✅ (PythonPlugin implemented)
    * **Instructions:** `poetry` vs. `pip` usage, virtual environments, common tools (black, ruff).
* `[ ]` **Rust:**
    * **Detection:** `Cargo.toml`
    * **Instructions:** `cargo` commands (build, test, clippy), ownership/borrow checker concepts.
* `[ ]` **PHP:**
    * **Detection:** `composer.json`
    * **Instructions:** `composer` usage, `artisan` (if Laravel is detected).

---

### 3. ⚙️ Feature: DevOps & CI/CD Awareness
Analyze the *workflows* that build and deploy the code.

* `[ ]` **GitHub Actions:**
    * **Detection:** `.github/workflows/*.yml`
    * **Instructions:** Parse YAML to identify job names, triggers (push/pr), and `matrix` strategies.
* `[ ]` **GitLab CI:**
    * **Detection:** `.gitlab-ci.yml`
    * **Instructions:** Parse YAML to identify `stages`, `cache` paths, and `rules/only` logic.
* `[x]` **Docker:**
    * **Detection:** `Dockerfile`, `docker-compose.yml` ✅ (DockerPlugin implemented)
    * **Instructions:** Multi-stage build best practices, local `docker compose` usage.

---

### 4. 🏛️ Feature: Architectural & Structural Awareness
Detect high-level project patterns and "ways of working."

* `[ ]` **Monorepo Structure:**
    * **Detection:** `turbo.json`, `nx.json`, `pnpm-workspace.yaml`.
    * **Instructions:** Root-level commands (`turbo run build`), package locations.
* `[ ]` **Code Ownership:**
    * **Detection:** `.github/CODEOWNERS`
    * **Instructions:** Parse file to list key owners (e.g., "Changes to `packages/auth/` require review from @team-auth").
* `[ ]` **Architectural Patterns (Heuristic):**
    * **Detection:** Folder names (`src/domain`, `src/application`, `src/infrastructure`).
    * **Instructions:** Explain DDD layer responsibilities (e.g., "Domain layer must not depend on infrastructure").

---

### 5. 💡 Feature: Core Engine & Developer Experience
Improve the usability of the tool itself.

* `[ ]` **Instruction Merging:**
    * **Logic:** When re-running `run`, add new instruction files without overwriting existing, user-modified ones.
* `[ ]` **VS Code Extension v2:**
    * **Feature:** Add Codelens "View AI Instructions" on detected files (e.g., `Dockerfile`).
    * **Feature:** Add a custom webview editor to see all generated instructions in one panel.