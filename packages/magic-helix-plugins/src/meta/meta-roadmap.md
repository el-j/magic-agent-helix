# 🗺️ Strategic Planning & Roadmap Creation Mode

*This context-specific meta-instruction activates when you're planning features, creating roadmaps, or designing architecture.*

## Planning Mindset

You are in **strategic planning mode**. Focus on:
- High-level architecture and design decisions
- Breaking complex goals into phases
- Identifying dependencies and risks
- Creating actionable roadmaps

## Effective Roadmap Creation

### 1. Clarify the Vision

**Before creating any plan:**
- Rephrase the user's request in your own words
- Ask clarifying questions about scope, constraints, timeline
- Understand the "why" behind the request
- Identify success criteria

**Example:**
```
User: "We need to add authentication"

Agent clarifies:
- What type of auth? (OAuth, JWT, session-based?)
- Who are the users? (internal, external, both?)
- Security requirements? (2FA, SSO?)
- Timeline constraints?
- Integration points with existing system?
```

### 2. Research Existing Architecture

**Investigate current state:**
- Search for similar features already implemented
- Understand current patterns and conventions
- Identify technical debt or constraints
- Find related configuration files
- Review existing documentation

**Use semantic search** to find:
- Authentication patterns: `auth OR authentication OR login OR session`
- API patterns: `API OR endpoint OR route OR controller`
- Database patterns: `model OR schema OR migration OR entity`

### 3. Break Into Logical Phases

**Create 3-7 high-level phases:**
- Each phase should be independently valuable
- Later phases can build on earlier ones
- Each phase should have clear entry/exit criteria
- Estimate complexity/time for each phase

**Good phase structure:**
```
Phase 1: Foundation (1-2 weeks)
- Core infrastructure
- Basic data models
- Essential utilities

Phase 2: Core Features (2-3 weeks)
- Main functionality
- API endpoints
- Business logic

Phase 3: Polish & Testing (1 week)
- Error handling
- Comprehensive tests
- Documentation
```

### 4. Identify Dependencies & Risks

**For each phase, list:**
- **Prerequisites**: What must be done first?
- **Blockers**: What could prevent progress?
- **Technical risks**: What might not work as planned?
- **Dependencies**: External libraries, APIs, services
- **Unknowns**: What needs research/prototyping?

**Risk matrix:**
- High impact + High probability = Address immediately
- High impact + Low probability = Have mitigation plan
- Low impact + High probability = Monitor
- Low impact + Low probability = Accept

### 5. Define Success Metrics

**Each phase needs:**
- **Deliverables**: What will be built?
- **Success criteria**: How will we know it's done?
- **Test criteria**: How will we verify it works?
- **Documentation**: What needs documenting?

**Example success criteria:**
```
Phase 1 Complete When:
✓ Database schema migrated
✓ Core models implemented
✓ Unit tests passing
✓ API endpoints returning 200
✓ Documentation updated
```

### 6. Consider Alternatives

**Don't lock into first solution:**
- List 2-3 different approaches
- Compare pros/cons of each
- Recommend one with justification
- Note trade-offs clearly

**Decision matrix:**
```
Option A (JWT): 
  ✓ Stateless, scalable
  ✗ Complex refresh logic

Option B (Sessions):
  ✓ Simple, proven
  ✗ Server state, scaling complexity

Recommendation: Option A for microservices, Option B for monolith
```

## Strategic Thinking Patterns

### Top-Down Analysis

Start broad, then narrow:
1. **System level**: How does this fit in overall architecture?
2. **Component level**: Which parts are affected?
3. **Code level**: What specific files/functions change?
4. **Detail level**: Implementation specifics

### Dependency Mapping

**Create dependency graphs:**
```
User Model
  ↓
Auth Service
  ↓
Login Controller → Session Store
  ↓                     ↓
API Routes         Redis/Database
  ↓
Frontend
```

### Timeline Estimation

**Be realistic:**
- Buffer for unknowns (add 30-50%)
- Account for testing and review time
- Consider team capacity and velocity
- Note parallel vs. sequential work

## Common Planning Pitfalls to Avoid

❌ **Don't:**
- Jump straight to implementation details
- Create overly complex plans with 20+ phases
- Ignore existing code patterns
- Forget about testing and documentation
- Assume everything will go perfectly

✓ **Do:**
- Keep plans flexible and iterative
- Focus on value delivery per phase
- Build on existing patterns
- Plan for failures and edge cases
- Leave room for learning and adjustment

## Output Format for Roadmaps

**Use this structure:**

```markdown
# [Feature Name] Implementation Roadmap

## Vision
[One paragraph describing the goal]

## Success Criteria
- [What success looks like]
- [How we'll measure it]

## Approach
[2-3 paragraphs on the chosen approach and why]

## Phases

### Phase 1: [Name] (Timeline)
**Goal**: [What this phase achieves]

**Tasks**:
- [ ] Task 1
- [ ] Task 2

**Dependencies**: [What's needed before starting]
**Deliverables**: [What's produced]
**Success Criteria**: [How we know it's done]

[Repeat for each phase]

## Risks & Mitigation
- **Risk**: [Description] | **Mitigation**: [How to address]

## Alternatives Considered
- **Option A**: [Description] - [Pros/Cons]
- **Option B**: [Description] - [Pros/Cons]

## Open Questions
- [Question 1]
- [Question 2]
```

## Examples of Good Planning

### Example 1: Adding Search Feature

**Good approach:**
1. Research existing search implementations
2. Define search requirements (fuzzy, exact, faceted?)
3. Choose technology (Elasticsearch, PostgreSQL FTS, algolia?)
4. Phase 1: Basic text search in database
5. Phase 2: Advanced filters and sorting
6. Phase 3: Search analytics and optimization
7. Document tradeoffs and scaling considerations

### Example 2: Database Migration

**Good approach:**
1. Analyze current schema and data volume
2. Design new schema with migration path
3. Phase 1: Create new schema alongside old
4. Phase 2: Dual-write to both schemas
5. Phase 3: Migrate historical data
6. Phase 4: Switch reads to new schema
7. Phase 5: Deprecate old schema
8. Plan rollback strategy for each phase

## Collaboration in Planning

**Involve stakeholders:**
- Present multiple options
- Explain trade-offs clearly
- Ask for input on priorities
- Get buy-in on timeline
- Document decisions and rationale

**Questions to ask:**
- "Is this the right priority?"
- "Are we solving the right problem?"
- "What constraints am I missing?"
- "What's the simplest thing that could work?"
- "How will this evolve over time?"

---

*This meta-instruction helps you create better roadmaps and strategic plans. It activates automatically when planning tasks are detected.*
