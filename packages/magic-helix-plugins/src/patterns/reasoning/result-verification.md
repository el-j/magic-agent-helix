# Result Verification Pattern

## Purpose
Validate tool outputs and check for errors after execution. From **Manus** and **Bolt.new** patterns.

## Template

```markdown
## Result Verification

After every tool call, verify the outcome:

### 1. Check Status
- **Success?** {DID_TOOL_COMPLETE_SUCCESSFULLY}
- **Error?** {PARSE_ERROR_MESSAGE_IF_FAILED}

### 2. Validate Output
- **Expected?** {DOES_OUTPUT_MATCH_EXPECTATIONS}
- **Complete?** {IS_ALL_REQUIRED_DATA_PRESENT}
- **Correct?** {SPOT_CHECK_VALUES_OR_CONTENT}

### 3. Handle Issues
If verification fails:
- **Retry**: {SAME_OPERATION_WITH_ADJUSTED_PARAMS}
- **Fallback**: {ALTERNATIVE_APPROACH}
- **Escalate**: {ASK_USER_FOR_HELP}

### 4. Update State
- **Record**: {SAVE_RELEVANT_DATA_FOR_NEXT_ITERATION}
- **Track**: {UPDATE_PROGRESS_MARKERS}
- **Learn**: {NOTE_PATTERNS_FOR_FUTURE_CALLS}
```

## Examples

### Manus (File Read Verification)
```markdown
## Result Verification: Read File

After reading file, verify the outcome:

**Tool Call**:
```
read_file({ path: "src/app.ts", startLine: 1, endLine: 50 })
```

### 1. Check Status
- **Success?** ✅ Tool returned 200 OK
- **Error?** None

### 2. Validate Output
- **Expected?** ✅ File contains TypeScript code
- **Complete?** ⚠️ File is 150 lines, only got first 50
- **Correct?** ✅ Spot check: imports at top, export at bottom

### 3. Handle Issues
- **Issue**: Need more context (file is longer than expected)
- **Action**: Read lines 50-150 in next iteration
- **Record**: Note that app.ts is 150 lines total

### 4. Update State
- **Record**: app.ts imports from './config' and './utils'
- **Track**: File analysis: 33% complete (1 of 3 files read fully)
- **Learn**: Large files need multiple read calls
```

### Bolt.new (Build Command Verification)
```markdown
## Result Verification: Run Build

After running build command, verify the outcome:

**Tool Call**:
```
run_terminal({ command: "npm run build" })
```

### 1. Check Status
- **Success?** ❌ Exit code: 1 (failure)
- **Error?** "Module not found: Can't resolve '@/lib/utils'"

### 2. Validate Output
- **Expected?** ❌ Expected successful build
- **Complete?** N/A (build failed)
- **Correct?** N/A (error message is the output)

### 3. Handle Issues
- **Issue**: Module resolution error
- **Root Cause**: Path alias (@/) not configured in tsconfig.json
- **Action**: 
  1. Read tsconfig.json to verify paths config
  2. If missing, add paths: { "@/*": ["./src/*"] }
  3. Retry build command

### 4. Update State
- **Record**: Build failed due to missing path alias
- **Track**: Build attempt 1/3 failed, trying fix
- **Learn**: Always verify tsconfig before using path aliases
```

### same.new (Component Generation Verification)
```markdown
## Result Verification: Create Component

After creating component file, verify the outcome:

**Tool Call**:
```
create_file({ path: "src/components/Button.tsx", content: "..." })
```

### 1. Check Status
- **Success?** ✅ File created
- **Error?** None

### 2. Validate Output
- **Expected?** ✅ File exists at specified path
- **Complete?** ✅ Full component code written
- **Correct?** 
  - ✅ Has TypeScript interface
  - ✅ Uses React.FC type
  - ✅ Has proper exports
  - ⚠️ Missing aria-label for accessibility

### 3. Handle Issues
- **Issue**: Missing accessibility attribute
- **Action**: Edit file to add aria-label prop and usage
- **Don't Create New**: Modify existing file instead

### 4. Update State
- **Record**: Button.tsx created, needs accessibility fix
- **Track**: Component generation: 90% complete (add a11y)
- **Learn**: Include aria attributes in initial generation
```

## Variables
- `{DID_TOOL_COMPLETE_SUCCESSFULLY}`: Boolean + status code
- `{PARSE_ERROR_MESSAGE_IF_FAILED}`: Extract meaningful error
- `{DOES_OUTPUT_MATCH_EXPECTATIONS}`: Compare to intent
- `{IS_ALL_REQUIRED_DATA_PRESENT}`: Completeness check
- `{SPOT_CHECK_VALUES_OR_CONTENT}`: Validate sample data
- `{SAME_OPERATION_WITH_ADJUSTED_PARAMS}`: Retry with fixes
- `{ALTERNATIVE_APPROACH}`: Different tool or method
- `{ASK_USER_FOR_HELP}`: When stuck or uncertain
- `{SAVE_RELEVANT_DATA_FOR_NEXT_ITERATION}`: State updates
- `{UPDATE_PROGRESS_MARKERS}`: Track completion
- `{NOTE_PATTERNS_FOR_FUTURE_CALLS}`: Learning

## Best Practices
1. **Always** check tool return status (don't assume success)
2. Parse error messages (extract actionable information)
3. Validate output structure (not just success boolean)
4. Spot-check content (random sampling for large outputs)
5. Implement retry logic (up to 3 attempts with backoff)
6. Fall back gracefully (alternative tools or manual steps)
7. Update mental model (learn from successes and failures)
8. Benefits: Robust execution, early error detection, self-correction, adaptive behavior
