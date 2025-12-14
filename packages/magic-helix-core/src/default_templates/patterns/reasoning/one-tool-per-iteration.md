# One Tool Per Iteration Pattern

## Purpose
Enforce sequential tool usage to maintain state consistency. From **Manus** and **Cline** patterns.

## Template

```markdown
## Tool Execution Policy

Execute tools sequentially, one per iteration:

1. **Select One Tool**: Choose single tool based on current state
2. **Gather Parameters**: Collect all required inputs for that tool
3. **Execute**: Call the tool and wait for completion
4. **Process Results**: Analyze output before next action
5. **Repeat**: Select next tool based on new state

**Never**:
- Call multiple tools in parallel within the agent loop
- Assume tool output without checking
- Chain tools without validating intermediate results
```

## Examples

### Manus (File Analysis)
```markdown
## Tool Execution Policy: Analyze Codebase

Execute tools sequentially, one per iteration:

**Iteration 1**: Search for files
```
tool: file_search
params: { pattern: "**/*.ts" }
result: [src/app.ts, src/utils.ts, src/config.ts]
next_action: Read first file
```

**Iteration 2**: Read primary file
```
tool: read_file
params: { path: "src/app.ts", startLine: 1, endLine: 100 }
result: Contains import from "./utils"
next_action: Read dependency
```

**Iteration 3**: Read dependency file
```
tool: read_file
params: { path: "src/utils.ts", startLine: 1, endLine: 50 }
result: Contains helper functions
next_action: Analyze config
```

**Why Sequential?**
- Iteration 2 revealed dependency on utils.ts (couldn't predict before iteration 1)
- Iteration 3 needed based on imports found in iteration 2
- Parallel calls would miss these dependencies
```

### Cline (Debugging Workflow)
```markdown
## Tool Execution Policy: Fix Runtime Error

Execute tools sequentially, one per iteration:

**Iteration 1**: Search for error in logs
```
tool: grep_search
params: { query: "Error: Module not found", isRegexp: false }
result: Found in src/components/Header.tsx line 5
next_action: Read file with error
```

**Iteration 2**: Read file containing error
```
tool: read_file
params: { path: "src/components/Header.tsx", startLine: 1, endLine: 20 }
result: import { Button } from '@/components/ui/button'
next_action: Check if file exists
```

**Iteration 3**: Verify imported file exists
```
tool: file_search
params: { pattern: "**/ui/button.*" }
result: src/components/ui/Button.tsx (capital B!)
next_action: Fix import path
```

**Iteration 4**: Correct the import
```
tool: replace_string_in_file
params: {
  path: "src/components/Header.tsx",
  oldString: "from '@/components/ui/button'",
  newString: "from '@/components/ui/Button'"
}
result: File updated successfully
next_action: Verify build passes
```

**Why Sequential?**
- Couldn't identify file path until grep found it (iteration 1)
- Couldn't determine fix until seeing actual import (iteration 2)
- Couldn't know correct path until searching filesystem (iteration 3)
- Each step informed the next action
```

## When to Break This Rule

### Parallel Reads (Cline Exception)
```markdown
**Allowed**: Reading multiple independent files
```
tools: [
  read_file({ path: "src/app.ts", startLine: 1, endLine: 50 }),
  read_file({ path: "src/config.ts", startLine: 1, endLine: 30 }),
  read_file({ path: "tests/app.test.ts", startLine: 1, endLine: 40 })
]
```

**Why Allowed?**
- Files are known to exist (from previous search)
- No dependencies between reads
- Just gathering context, not modifying state
- Significantly faster than 3 sequential iterations

**Not Allowed**: Reading files discovered during search
- Risk: Files might not exist or might not contain expected content
- Better: Read first file, validate, then read others if needed
```

## Variables
- N/A (this is a process pattern, not a template)

## Best Practices
1. One tool call per iteration in agent loops
2. Validate tool output before next call
3. Exception: Parallel reads when files are pre-validated
4. Never parallelize: writes, terminal commands, state-changing operations
5. Use tool output to inform next tool selection
6. Document why each tool was chosen (reasoning chain)
7. Benefits: Predictable state, easier debugging, adaptive execution

## Implementation Notes
- Most models naturally follow this pattern
- Explicitly state in system prompt to prevent parallel tool abuse
- Useful for autonomous agents (Manus, Cline, Augment)
- Less critical for user-directed agents (v0, same.new) where user provides guidance between steps
