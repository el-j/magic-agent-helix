# Heading Hierarchy Pattern

## Purpose
Use Markdown headings to create scannable, nested instruction sections. From **v0**, **Claude**, and **Cline** patterns.

## Template

```markdown
# {TOP_LEVEL_ROLE}

## {SECTION_1}
{Content}

### {SUBSECTION_1_1}
{Content}

### {SUBSECTION_1_2}
{Content}

## {SECTION_2}
{Content}

### {SUBSECTION_2_1}
{Content}

## {SECTION_3}
{Content}
```

## Examples

### v0 (Code Generation Instructions)
```markdown
# v0 Code Generation Instructions

## Code Style
Write modern, idiomatic TypeScript with proper typing.

### React Patterns
- Use functional components with hooks
- Prefer composition over inheritance
- Extract reusable logic into custom hooks

### Naming Conventions
- Components: PascalCase (e.g., UserProfile)
- Files: kebab-case (e.g., user-profile.tsx)
- Functions: camelCase (e.g., handleSubmit)

## Framework Requirements

### Next.js App Router
- Use Server Components by default
- Add 'use client' only when necessary
- Leverage React Server Components for data fetching

### Routing
- File-based routing in app/ directory
- Use route groups (folders) for organization
- Dynamic routes with [param] syntax
```

### Cline (Tool Usage Guidelines)
```markdown
# Cline Tool Usage Guidelines

## File Operations

### Reading Files
- Use read_file for examining code
- Read large sections to minimize API calls
- Parallelize reads when possible

### Writing Files
- Show preview before making changes
- Use replace_string_in_file for edits
- Include 3-5 lines of context for accuracy

## Terminal Commands

### Command Execution
- Run one command at a time (no parallel terminal calls)
- Explain purpose of non-trivial commands
- Use absolute paths to avoid navigation issues

### Output Management
- Filter output with grep/awk for large results
- Use --no-pager for git commands
- Disable paging to avoid truncation
```

## Variables
- `{TOP_LEVEL_ROLE}`: Main purpose (H1 - appears once)
- `{SECTION_X}`: Major category (H2 - primary divisions)
- `{SUBSECTION_X_Y}`: Sub-category (H3 - detailed breakdowns)

## Best Practices
1. Use only one H1 (main title)
2. H2 for major sections (5-10 max)
3. H3 for subsections within H2
4. Avoid going deeper than H3 (use lists instead)
5. Keep headings concise (3-7 words)
6. Use parallel structure (all H2s follow same pattern)
7. Benefits: Easy to navigate, works in Markdown viewers, hierarchical structure
