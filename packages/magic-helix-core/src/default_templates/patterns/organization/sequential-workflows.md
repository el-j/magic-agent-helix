# Sequential Workflows Pattern

## Purpose
Define step-by-step processes with clear ordering. From **Manus** agent loop pattern.

## Template

```markdown
## {WORKFLOW_NAME}

Follow these steps in order:

1. **{STEP_1_NAME}**: {STEP_1_DESCRIPTION}
   - {SUBSTEP_1_1}
   - {SUBSTEP_1_2}

2. **{STEP_2_NAME}**: {STEP_2_DESCRIPTION}
   - {SUBSTEP_2_1}
   - {SUBSTEP_2_2}

3. **{STEP_3_NAME}**: {STEP_3_DESCRIPTION}
   - {SUBSTEP_3_1}
   - {SUBSTEP_3_2}

Repeat until {COMPLETION_CONDITION}.
```

## Examples

### Manus (Agent Execution Loop)
```markdown
## Agent Execution Loop

Follow these steps in order:

1. **Analyze Request**: Understand user intent and break down into subtasks
   - Read the user's message carefully
   - Identify required information and tools
   - Determine if clarification is needed

2. **Plan Actions**: Decide which tool(s) to use
   - Select one tool per iteration (no parallel tool calls)
   - Gather necessary parameters
   - Anticipate potential errors

3. **Execute Tool**: Call the selected tool and process results
   - Invoke tool with validated parameters
   - Parse output for relevant information
   - Update internal state with findings

4. **Reflect**: Evaluate progress and decide next action
   - Compare current state to goal
   - Identify remaining subtasks
   - Determine if another iteration is needed

Repeat until all subtasks are completed or user goal is achieved.
```

### v0 (Code Generation Workflow)
```markdown
## Code Generation Workflow

Follow these steps in order:

1. **Understand Requirements**: Parse user request for technical specs
   - Identify framework (React, Vue, etc.)
   - Determine styling approach (Tailwind, CSS modules)
   - Note any specific libraries requested

2. **Plan Structure**: Design component hierarchy
   - Break UI into logical components
   - Identify shared vs unique elements
   - Map out data flow

3. **Generate Code**: Write implementation
   - Start with outer container/layout
   - Add child components progressively
   - Include proper TypeScript types

4. **Verify Quality**: Check for common issues
   - Ensure accessibility (ARIA labels, semantic HTML)
   - Validate responsive design breakpoints
   - Confirm proper error handling

Repeat for each component in the hierarchy.
```

## Variables
- `{WORKFLOW_NAME}`: Process title (e.g., "Request Processing", "Error Recovery")
- `{STEP_X_NAME}`: Phase name (e.g., "Analyze", "Execute", "Verify")
- `{STEP_X_DESCRIPTION}`: What happens in this phase
- `{SUBSTEP_X_Y}`: Granular actions within phase
- `{COMPLETION_CONDITION}`: When to stop iterating

## Best Practices
1. Number steps explicitly (1, 2, 3...) for clarity
2. Use bold for step names to make them scannable
3. Limit to 5-7 main steps (sub-steps for detail)
4. Include decision points ("If X, then Y")
5. State iteration/termination conditions clearly
6. Use present tense imperative ("Analyze", not "You should analyze")
7. Benefits: Reproducible process, clear sequencing, easy to debug
