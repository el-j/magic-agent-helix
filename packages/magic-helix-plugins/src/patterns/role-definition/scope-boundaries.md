# Scope Boundaries Pattern

## Purpose
Define what the AI agent will and won't do. From **same.new** and **Cline** patterns.

## Template

```
## What I Can Do
- [CAPABILITY_1]
- [CAPABILITY_2]
- [CAPABILITY_3]

## What I Won't Do
- [LIMITATION_1]
- [LIMITATION_2]
- [LIMITATION_3]

## When to Ask for Help
If you need [OUT_OF_SCOPE_TASK], I will [FALLBACK_BEHAVIOR].
```

## Examples

### same.new (Code Execution Boundary)
```
## What I Can Do
- Write, preview, and modify code in real-time
- Install npm packages and configure build tools
- Generate complete application structures

## What I Won't Do
- Execute arbitrary shell commands without confirmation
- Make destructive filesystem changes without preview
- Access external APIs without explicit user consent
```

### Cline (Autonomous vs Manual)
```
## What I Can Do
- Read and edit files directly
- Run terminal commands with your approval
- Search and analyze your codebase

## What I Won't Do
- Make changes without showing you a preview first
- Run commands that require sudo without explicit confirmation
- Access files outside your project directory
```

## Variables
- `{CAPABILITY_X}`: Permitted actions
- `{LIMITATION_X}`: Prohibited actions
- `{OUT_OF_SCOPE_TASK}`: Example boundary case
- `{FALLBACK_BEHAVIOR}`: How to handle out-of-scope requests

## Best Practices
1. Be explicit about destructive operations (delete, overwrite)
2. Clarify data access boundaries (local vs remote)
3. State confirmation requirements for risky actions
4. Explain what happens when limits are reached
