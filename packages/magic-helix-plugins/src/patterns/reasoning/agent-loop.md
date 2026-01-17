# Agent Loop Pattern

## Purpose
Define iterative execution cycle for autonomous agents. From **Manus** pattern.

## Template

```markdown
## Agent Execution Loop

Repeat the following cycle until goal is achieved:

### 1. Observe
- Read current state: {WHAT_TO_CHECK}
- Identify changes: {WHAT_CHANGED_SINCE_LAST_ITERATION}
- Note user input: {NEW_REQUIREMENTS_OR_FEEDBACK}

### 2. Orient
- Assess progress: {HOW_CLOSE_TO_GOAL}
- Identify blockers: {WHAT_IS_PREVENTING_COMPLETION}
- Update plan: {ADJUST_STRATEGY_IF_NEEDED}

### 3. Decide
- Select next action: {WHICH_TOOL_OR_OPERATION}
- Validate feasibility: {CAN_THIS_ACTION_SUCCEED}
- Prepare parameters: {GATHER_REQUIRED_INPUTS}

### 4. Act
- Execute selected action: {CALL_TOOL_OR_PERFORM_OPERATION}
- Capture results: {STORE_OUTPUT_FOR_NEXT_ITERATION}
- Handle errors: {RETRY_OR_FALLBACK_IF_FAILED}

### 5. Reflect
- Evaluate outcome: {DID_ACTION_ACHIEVE_INTENDED_EFFECT}
- Learn from result: {UPDATE_KNOWLEDGE_OR_ASSUMPTIONS}
- Decide continuation: {REPEAT_LOOP_OR_TERMINATE}

**Termination Conditions**:
- Goal achieved: {SUCCESS_CRITERIA_MET}
- Unrecoverable error: {CANNOT_PROCEED_FURTHER}
- Max iterations reached: {SAFETY_LIMIT_HIT}
- User interruption: {USER_REQUESTED_STOP}
```

## Examples

### Manus (Code Debugging Loop)
```markdown
## Agent Execution Loop: Debug and Fix Error

Repeat the following cycle until error is resolved:

### 1. Observe
- Read current state: Error message, stack trace, failed test output
- Identify changes: What code was just modified?
- Note user input: Any hints or context provided?

### 2. Orient
- Assess progress: Is error message clearer than before?
- Identify blockers: Missing dependencies? Syntax errors? Logic bugs?
- Update plan: Do we need to install packages, fix imports, or rewrite logic?

### 3. Decide
- Select next action: Read error source file, check imports, run tests
- Validate feasibility: Do we have file path? Are tools available?
- Prepare parameters: File path, line numbers, test command

### 4. Act
- Execute selected action: `read_file(errorFile, errorLine-5, errorLine+5)`
- Capture results: Store file contents, understand context
- Handle errors: If file not found, search for similar files

### 5. Reflect
- Evaluate outcome: Does file content reveal the issue?
- Learn from result: Update mental model of codebase
- Decide continuation: If root cause found, apply fix; else investigate deeper

**Termination Conditions**:
- Goal achieved: Tests pass, error no longer occurs
- Unrecoverable error: Required file deleted, system-level issue
- Max iterations reached: 10 loops without progress (escalate to user)
- User interruption: User provides new direction or cancels
```

### same.new (Feature Implementation Loop)
```markdown
## Agent Execution Loop: Build Feature

Repeat the following cycle until feature is complete:

### 1. Observe
- Read current state: Existing components, dependencies, file structure
- Identify changes: What was just created/modified?
- Note user input: Feature requirements, design preferences

### 2. Orient
- Assess progress: Which components are done? What's remaining?
- Identify blockers: Missing libraries? Unclear requirements?
- Update plan: Break feature into smaller components if needed

### 3. Decide
- Select next action: Create component, install package, write test
- Validate feasibility: Do we have design? Dependencies available?
- Prepare parameters: Component name, props, styling approach

### 4. Act
- Execute selected action: `create_file(ComponentName.tsx, content)`
- Capture results: Store component path for imports
- Handle errors: If file exists, modify instead of create

### 5. Reflect
- Evaluate outcome: Does component match requirements?
- Learn from result: Note patterns for similar components
- Decide continuation: If feature incomplete, build next piece; else finalize

**Termination Conditions**:
- Goal achieved: Feature works, tests pass, user approves
- Unrecoverable error: Conflicting requirements, impossible constraints
- Max iterations reached: 20 loops (feature too complex, break down further)
- User interruption: User requests changes or different feature
```

## Variables
- `{WHAT_TO_CHECK}`: State to examine each iteration
- `{WHAT_CHANGED_SINCE_LAST_ITERATION}`: Delta from previous cycle
- `{NEW_REQUIREMENTS_OR_FEEDBACK}`: User input to incorporate
- `{HOW_CLOSE_TO_GOAL}`: Progress measurement
- `{WHAT_IS_PREVENTING_COMPLETION}`: Blockers/dependencies
- `{ADJUST_STRATEGY_IF_NEEDED}`: Plan modifications
- `{WHICH_TOOL_OR_OPERATION}`: Next action to take
- `{CAN_THIS_ACTION_SUCCEED}`: Feasibility check
- `{GATHER_REQUIRED_INPUTS}`: Parameter preparation
- `{CALL_TOOL_OR_PERFORM_OPERATION}`: Execution step
- `{STORE_OUTPUT_FOR_NEXT_ITERATION}`: Result capture
- `{RETRY_OR_FALLBACK_IF_FAILED}`: Error handling
- `{DID_ACTION_ACHIEVE_INTENDED_EFFECT}`: Outcome evaluation
- `{UPDATE_KNOWLEDGE_OR_ASSUMPTIONS}`: Learning
- `{REPEAT_LOOP_OR_TERMINATE}`: Continuation decision
- `{SUCCESS_CRITERIA_MET}`: Goal achieved condition
- `{CANNOT_PROCEED_FURTHER}`: Unrecoverable error condition
- `{SAFETY_LIMIT_HIT}`: Max iterations condition
- `{USER_REQUESTED_STOP}`: User interruption condition

## Best Practices
1. Use OODA framework (Observe, Orient, Decide, Act) + Reflect
2. One tool call per iteration (no parallel in loop)
3. State termination conditions explicitly
4. Include safety limit (max iterations)
5. Capture learnings between iterations
6. Allow user interruption at any point
7. Benefits: Autonomous operation, adaptability, progress tracking, safety bounds
