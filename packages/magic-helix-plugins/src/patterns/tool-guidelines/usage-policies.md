# Usage Policies Pattern

## Purpose
Define when and how to use tools, including restrictions. From **Cline** and **ChatGPT** patterns.

## Template

```markdown
## {TOOL_NAME} Usage Policy

### When to Use
- {USE_CASE_1}
- {USE_CASE_2}
- {USE_CASE_3}

### When NOT to Use
- {ANTI_PATTERN_1}
- {ANTI_PATTERN_2}
- {ANTI_PATTERN_3}

### Restrictions
- {RESTRICTION_1}
- {RESTRICTION_2}
- {RESTRICTION_3}

### Preferred Alternatives
If {CONDITION}, use {ALTERNATIVE_TOOL} instead because {REASON}.
```

## Examples

### Cline (Terminal Commands)
```markdown
## run_in_terminal Usage Policy

### When to Use
- Installing packages (npm, pip, brew)
- Running build commands (npm run build)
- Git operations (commit, push, pull)
- Executing test suites

### When NOT to Use
- Running Python code snippets (use pylance_runCodeSnippet instead)
- Reading file contents (use read_file instead)
- Making file edits (use replace_string_in_file instead)
- Parallel execution (terminal doesn't support concurrent commands)

### Restrictions
- Run one command at a time (wait for output before next)
- Use absolute paths to avoid navigation issues
- Disable paging (--no-pager, | cat) to prevent truncation
- Filter output with grep/awk for large results (>1000 lines)

### Preferred Alternatives
If running Python code, use `pylance_runCodeSnippet` instead because it:
- Uses correct workspace interpreter automatically
- Avoids shell escaping/quoting problems
- Provides clean, formatted output
```

### ChatGPT (Image Generation)
```markdown
## generate_image Usage Policy

### When to Use
- User explicitly requests an image
- Visual aid would enhance understanding
- Demonstrating design concepts
- Creating illustrations for explanations

### When NOT to Use
- User asked for text description only
- Depicting real people (use generic descriptions)
- Generating logos/brands (copyright concerns)
- Creating images of copyrighted characters

### Restrictions
- NEVER generate images of named real people (living or deceased)
- NEVER create content that is harmful, hateful, or violent
- NEVER generate trademarked characters or logos
- NEVER include recognizable brand names or products

### Preferred Alternatives
If user wants a person, describe generic attributes instead:
❌ "Generate an image of Taylor Swift"
✅ "Generate an image of a young woman with curly blonde hair performing on stage"
```

## Variables
- `{TOOL_NAME}`: Tool/function name
- `{USE_CASE_X}`: Appropriate scenarios
- `{ANTI_PATTERN_X}`: Inappropriate scenarios
- `{RESTRICTION_X}`: Hard constraints
- `{CONDITION}`: Circumstance triggering alternative
- `{ALTERNATIVE_TOOL}`: Better tool for scenario
- `{REASON}`: Why alternative is better

## Best Practices
1. Start with positive use cases (what to do)
2. Follow with anti-patterns (what not to do)
3. Use concrete examples (✅/❌ pairs)
4. Explain reasoning behind restrictions
5. Suggest alternatives when rejecting patterns
6. Include edge cases and gotchas
7. Benefits: Prevents misuse, improves efficiency, reduces errors
