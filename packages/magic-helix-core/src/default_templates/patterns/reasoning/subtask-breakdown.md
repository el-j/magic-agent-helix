# Subtask Breakdown Pattern

## Purpose
Decompose complex requests into manageable steps. From **Manus** and **Bolt.new** patterns.

## Template

```markdown
When faced with a complex task, break it down:

## Task: {MAIN_GOAL}

### Subtasks:
1. {SUBTASK_1}
   - Input: {WHAT_YOU_NEED}
   - Output: {WHAT_YOU_PRODUCE}
   - Depends on: {PREREQUISITES}

2. {SUBTASK_2}
   - Input: {WHAT_YOU_NEED}
   - Output: {WHAT_YOU_PRODUCE}
   - Depends on: {PREREQUISITES}

3. {SUBTASK_3}
   - Input: {WHAT_YOU_NEED}
   - Output: {WHAT_YOU_PRODUCE}
   - Depends on: {PREREQUISITES}

### Execution Order:
{WHICH_CAN_RUN_IN_PARALLEL}, {WHICH_MUST_BE_SEQUENTIAL}
```

## Examples

### Bolt.new (Full-Stack App Creation)
```markdown
When creating a new application, break it down:

## Task: Create a Next.js blog with authentication

### Subtasks:
1. **Initialize Project Structure**
   - Input: Framework choice (Next.js), styling (Tailwind)
   - Output: package.json, tsconfig.json, basic file structure
   - Depends on: Nothing (can start immediately)

2. **Set Up Database Schema**
   - Input: Data models (User, Post, Comment)
   - Output: Prisma schema, migrations
   - Depends on: Project structure

3. **Implement Authentication**
   - Input: Auth provider (NextAuth.js), database schema
   - Output: Login/signup pages, session management
   - Depends on: Database schema

4. **Build Blog Features**
   - Input: Post CRUD operations, authentication
   - Output: Create/edit/delete post UI, public blog pages
   - Depends on: Authentication

5. **Add Styling and Polish**
   - Input: Component library (shadcn/ui), design tokens
   - Output: Consistent UI, responsive design
   - Depends on: Blog features (can run in parallel with testing)

### Execution Order:
- Sequential: 1 → 2 → 3 → 4
- Parallel: 5 (styling) can happen alongside 4 (features)
```

### Manus (Debugging Workflow)
```markdown
When debugging an error, break it down:

## Task: Fix "Module not found" error in React app

### Subtasks:
1. **Locate Error Source**
   - Input: Error message, stack trace
   - Output: File path and line number of import
   - Depends on: Nothing

2. **Verify Module Exists**
   - Input: Import statement, project file structure
   - Output: Confirmation if module exists or is missing
   - Depends on: Error location

3. **Check Import Path**
   - Input: Relative vs absolute path, tsconfig paths
   - Output: Correct import syntax
   - Depends on: Module verification

4. **Install Missing Package** (if needed)
   - Input: Package name, package manager (npm/yarn/pnpm)
   - Output: Updated package.json, node_modules
   - Depends on: Module not existing in project

5. **Verify Fix**
   - Input: Updated import, build command
   - Output: Successful build or new error
   - Depends on: Import correction or package installation

### Execution Order:
- Sequential: 1 → 2 → (3 OR 4) → 5
- Branch: If module exists (3), else (4)
```

## Variables
- `{MAIN_GOAL}`: High-level objective
- `{SUBTASK_X}`: Concrete, achievable step
- `{WHAT_YOU_NEED}`: Required inputs/context
- `{WHAT_YOU_PRODUCE}`: Expected output/deliverable
- `{PREREQUISITES}`: Dependencies (other subtasks or external factors)
- `{WHICH_CAN_RUN_IN_PARALLEL}`: Independent subtasks
- `{WHICH_MUST_BE_SEQUENTIAL}`: Dependent subtasks

## Best Practices
1. Keep subtasks small (completable in 1-3 tool calls)
2. Make dependencies explicit (enables parallelization)
3. Identify inputs/outputs for each step (validates completeness)
4. Number subtasks for easy reference
5. Show alternative paths (if/else branches)
6. Estimate complexity (simple/medium/complex)
7. Benefits: Enables progress tracking, reveals missing steps, improves estimation

## Implementation Notes
- Use this pattern for tasks requiring >3 distinct operations
- Can be combined with thinking tags (plan subtasks in <thinking>)
- Update subtask status as you progress (✓ completed, ⏳ in progress)
- Re-evaluate after each subtask (dependencies may change)
