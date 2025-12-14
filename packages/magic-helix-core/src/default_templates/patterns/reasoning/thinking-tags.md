# Thinking Tags Pattern

## Purpose
Encourage explicit pre-action analysis and planning. From **v0** pattern.

## Template

```markdown
Before executing any action, think through:

<thinking>
1. **Understand**: {WHAT_USER_WANTS}
2. **Analyze**: {CURRENT_STATE_AND_CONSTRAINTS}
3. **Plan**: {APPROACH_TO_TAKE}
4. **Anticipate**: {POTENTIAL_ISSUES}
</thinking>

Then proceed with execution.
```

## Examples

### v0 (Component Generation)
```markdown
Before generating code, think through the requirements:

<thinking>
1. **Understand**: What component is needed?
   - Is this a new component or modification?
   - What props/state does it need?
   - What's the visual hierarchy?

2. **Analyze**: What are the constraints?
   - Framework: Next.js App Router or Pages?
   - Styling: Tailwind, CSS modules, or styled-components?
   - Dependencies: What libraries are available?

3. **Plan**: What's the implementation approach?
   - Component structure (parent/children)
   - Data flow (props down, events up)
   - File organization (co-located vs separate)

4. **Anticipate**: What could go wrong?
   - Missing types (add proper TypeScript interfaces)
   - Accessibility issues (add ARIA labels)
   - Responsive design (include breakpoints)
</thinking>

Then generate the component code.
```

### Manus (Tool Selection)
```markdown
Before calling a tool, analyze the situation:

<thinking>
1. **Understand**: What information do I need?
   - What's the user's end goal?
   - What data is missing?
   - What assumptions am I making?

2. **Analyze**: What tools are available?
   - Which tool provides the needed information?
   - Are there dependencies between tools?
   - Can I gather everything in one call?

3. **Plan**: What's the optimal tool sequence?
   - Start with broad context (file search)
   - Then narrow down (read specific files)
   - Validate with targeted checks (grep for patterns)

4. **Anticipate**: What if the tool fails?
   - File doesn't exist → search for similar names
   - Permission denied → check alternate paths
   - Timeout → break into smaller operations
</thinking>

Then proceed with tool call.
```

## Variables
- `{WHAT_USER_WANTS}`: Parsed intent from user message
- `{CURRENT_STATE_AND_CONSTRAINTS}`: Known facts and limitations
- `{APPROACH_TO_TAKE}`: High-level strategy
- `{POTENTIAL_ISSUES}`: Risk assessment

## Best Practices
1. Use `<thinking>` tags to separate planning from execution
2. Keep each section concise (2-4 bullet points)
3. Ask questions to surface uncertainties
4. Reference specific context (files, variables, constraints)
5. State assumptions explicitly
6. Consider failure modes and fallbacks
7. Benefits: Reduces errors, improves reasoning transparency, enables self-correction

## Implementation Notes
- Some models (Claude, GPT-4) benefit from explicit thinking sections
- Can be hidden from user output (system-level reasoning)
- Useful for complex tasks (code generation, debugging, architecture decisions)
- Can be skipped for simple operations (basic calculations, lookups)
