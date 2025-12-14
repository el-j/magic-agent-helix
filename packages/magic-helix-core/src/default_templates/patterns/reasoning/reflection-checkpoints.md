# Reflection Checkpoints Pattern

## Purpose
Periodically evaluate progress and adjust strategy. From **Claude** and **Bolt.new** patterns.

## Template

```markdown
## Reflection Checkpoints

After every {N} iterations or {MILESTONE}, pause and reflect:

### Progress Check
- **What have we accomplished?** {LIST_COMPLETED_TASKS}
- **What's remaining?** {LIST_PENDING_TASKS}
- **Are we on track?** {YES_NO_AND_WHY}

### Quality Check
- **Does output meet requirements?** {VERIFY_AGAINST_SPECS}
- **Are there obvious issues?** {BUGS_PERFORMANCE_STYLE}
- **Is code/design idiomatic?** {FOLLOWS_BEST_PRACTICES}

### Strategy Check
- **Is current approach working?** {ASSESS_EFFECTIVENESS}
- **Should we change tactics?** {ALTERNATIVE_APPROACHES}
- **Do we need clarification?** {QUESTIONS_FOR_USER}

### Decision
- ✅ **Continue**: Current approach is effective
- 🔄 **Adjust**: Modify strategy based on learnings
- ❓ **Clarify**: Ask user for guidance
- ⛔ **Stop**: Goal achieved or insurmountable blocker
```

## Examples

### Claude (Long Conversation Reflection)
```markdown
## Reflection Checkpoints: Complex Refactoring

After every 5 tool calls, pause and reflect:

### Progress Check (After Iteration 5)
- **What have we accomplished?**
  - ✅ Identified 12 files needing refactoring
  - ✅ Extracted common utility functions
  - ✅ Created new shared module
  
- **What's remaining?**
  - ⏳ Update imports in 8 consumer files
  - ⏳ Write tests for new utilities
  - ⏳ Remove duplicated code
  
- **Are we on track?**
  - Yes, 40% complete, no major blockers

### Quality Check
- **Does output meet requirements?**
  - New utilities are well-typed ✅
  - Functions are properly documented ✅
  
- **Are there obvious issues?**
  - No error handling in two functions ⚠️
  - Missing input validation ⚠️
  
- **Is code idiomatic?**
  - Follows TypeScript best practices ✅
  - Consistent naming conventions ✅

### Strategy Check
- **Is current approach working?**
  - Yes, incremental refactoring is safe and testable
  
- **Should we change tactics?**
  - Add error handling before updating consumers
  - Write tests now (easier with isolated utilities)
  
- **Do we need clarification?**
  - Should we maintain backward compatibility?
  - Preferred error handling strategy?

### Decision
- 🔄 **Adjust**: Add error handling and tests before proceeding
  - Next 5 iterations: Focus on robustness
  - Then continue with consumer updates
```

### Bolt.new (Build Pipeline Reflection)
```markdown
## Reflection Checkpoints: Full-Stack App Creation

After each major milestone, pause and reflect:

### Progress Check (After Database Setup)
- **What have we accomplished?**
  - ✅ Prisma schema defined
  - ✅ Migrations run successfully
  - ✅ Database seeded with test data
  
- **What's remaining?**
  - ⏳ API routes for CRUD operations
  - ⏳ Frontend components
  - ⏳ Authentication integration
  
- **Are we on track?**
  - Yes, 25% complete (1 of 4 phases done)

### Quality Check
- **Does output meet requirements?**
  - Schema matches user's data model ✅
  - Relationships properly defined ✅
  
- **Are there obvious issues?**
  - No indexes on frequently queried fields ⚠️
  - Missing cascade deletes on relationships ⚠️
  
- **Is code/design idiomatic?**
  - Follows Prisma naming conventions ✅
  - Uses appropriate field types ✅

### Strategy Check
- **Is current approach working?**
  - Yes, schema-first design enables type-safe API
  
- **Should we change tactics?**
  - Add indexes before building API (prevents performance issues)
  - Use `onDelete: Cascade` for parent-child relationships
  
- **Do we need clarification?**
  - Which fields will be most queried? (to optimize indexes)
  - Should soft deletes be used instead of hard deletes?

### Decision
- 🔄 **Adjust**: Optimize schema before building API
  - Add indexes on user_id, created_at
  - Add cascade deletes on comment relationships
  - Then proceed to API routes phase
```

## Variables
- `{N}`: Number of iterations between checkpoints (e.g., 5, 10)
- `{MILESTONE}`: Significant completion point (e.g., "after database setup")
- `{LIST_COMPLETED_TASKS}`: Enumeration with ✅
- `{LIST_PENDING_TASKS}`: Enumeration with ⏳
- `{YES_NO_AND_WHY}`: Assessment with reasoning
- `{VERIFY_AGAINST_SPECS}`: Compare to requirements
- `{BUGS_PERFORMANCE_STYLE}`: Common quality issues
- `{FOLLOWS_BEST_PRACTICES}`: Idiomatic code check
- `{ASSESS_EFFECTIVENESS}`: Is strategy working?
- `{ALTERNATIVE_APPROACHES}`: Other options to consider
- `{QUESTIONS_FOR_USER}`: What to clarify

## Best Practices
1. Set checkpoint frequency based on task complexity (5-10 iterations)
2. Use checkpoints at natural milestones (after component, API, test suite)
3. Be honest about issues (don't hide problems until later)
4. Adjust strategy based on findings (not just report)
5. Ask user questions when uncertain (don't guess)
6. Document decisions (why you adjusted or continued)
7. Benefits: Catches issues early, prevents wasted work, maintains quality

## Implementation Notes
- Can be explicit (show user reflection) or implicit (internal reasoning)
- Combine with thinking tags for transparent reasoning
- Especially valuable for long-running tasks (>10 iterations)
- Helps models avoid "tunnel vision" (blindly following initial plan)
