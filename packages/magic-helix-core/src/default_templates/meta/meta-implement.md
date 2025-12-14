# 🔨 Implementation & Code Generation Mode

*This context-specific meta-instruction activates when you're implementing features, writing code, or making technical changes.*

## Implementation Mindset

You are in **code implementation mode**. Focus on:
- Writing clean, maintainable code
- Following existing patterns
- Ensuring test coverage
- Incremental, verifiable changes

## Implementation Workflow

### 1. Understand the Requirement

**Before writing any code:**
- Read the full requirement carefully
- Identify acceptance criteria
- Understand edge cases
- Know what success looks like

**Clarify ambiguities:**
- Ask about expected behavior in edge cases
- Confirm error handling approach
- Verify backwards compatibility requirements
- Check performance constraints

### 2. Research Existing Patterns

**Search for similar implementations:**
```
1. Semantic search: Find similar features
2. Read relevant files completely
3. Identify naming conventions
4. Note testing patterns
5. Check error handling approaches
```

**Key questions:**
- How are similar features structured?
- What libraries/utilities already exist?
- What's the established pattern for this type of code?
- Are there helpers or abstractions I should use?

### 3. Plan Your Changes

**Create a logical implementation order:**

```
1. Types/Interfaces first
   - Define data structures
   - Create type definitions
   - Update existing types

2. Core logic second
   - Implement business logic
   - Add validation
   - Handle errors

3. Integration third
   - Wire up dependencies
   - Connect to existing code
   - Add configuration

4. Tests fourth
   - Unit tests for core logic
   - Integration tests for workflows
   - Edge case coverage

5. Documentation last
   - Update README
   - Add code comments
   - Document public APIs
```

### 4. Make Incremental Changes

**Small, verifiable steps:**
- One logical change at a time
- Verify compilation after each step
- Run tests frequently
- Commit working code early

**Example incremental workflow:**
```
Step 1: Add interface definition → Verify compiles
Step 2: Create basic implementation → Verify compiles
Step 3: Add error handling → Run tests
Step 4: Add validation → Run tests
Step 5: Integrate with existing code → Run all tests
Step 6: Add documentation → Final verification
```

### 5. Follow Code Quality Standards

**Every implementation should:**

✓ **Be properly typed** (if using TypeScript/typed language)
```typescript
// Good
function processUser(user: User): ProcessedUser {
  return { ...user, processed: true };
}

// Bad
function processUser(user: any) {
  return { ...user, processed: true };
}
```

✓ **Have meaningful names**
```typescript
// Good
const activeUserCount = users.filter(u => u.isActive).length;

// Bad
const x = users.filter(u => u.isActive).length;
```

✓ **Include error handling**
```typescript
// Good
try {
  const data = await fetchData();
  return processData(data);
} catch (error) {
  logger.error('Failed to fetch data', error);
  throw new DataFetchError('Unable to load user data', { cause: error });
}

// Bad
const data = await fetchData();
return processData(data);
```

✓ **Have appropriate comments**
```typescript
// Good: Explain WHY, not WHAT
// Using binary search because dataset can be > 10K items
const index = binarySearch(sortedArray, target);

// Bad: Obvious comment
// Increment counter
counter++;
```

✓ **Follow existing style**
- Match indentation (tabs vs spaces)
- Match brace style
- Match naming conventions
- Use same patterns as similar code

### 6. Write Tests Alongside Code

**Test-driven approach:**

```typescript
// 1. Write test first (TDD style)
test('should validate email format', () => {
  expect(validateEmail('user@example.com')).toBe(true);
  expect(validateEmail('invalid')).toBe(false);
});

// 2. Implement to make test pass
function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// 3. Add edge cases
test('should handle edge cases', () => {
  expect(validateEmail('')).toBe(false);
  expect(validateEmail('   ')).toBe(false);
  expect(validateEmail('user@')).toBe(false);
});

// 4. Update implementation
function validateEmail(email: string): boolean {
  if (!email || !email.trim()) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

## Code Quality Checklist

Before marking implementation complete, verify:

### Functionality
- [ ] Feature works as specified
- [ ] Edge cases handled
- [ ] Error cases handled gracefully
- [ ] No obvious bugs

### Code Quality
- [ ] Follows existing patterns
- [ ] Properly typed (if applicable)
- [ ] Meaningful variable/function names
- [ ] No code duplication
- [ ] Appropriate abstraction level

### Testing
- [ ] Unit tests written
- [ ] Integration tests added (if needed)
- [ ] Tests cover edge cases
- [ ] All tests passing
- [ ] No test warnings

### Integration
- [ ] Integrates with existing code
- [ ] Backwards compatible (unless intentional break)
- [ ] Configuration added (if needed)
- [ ] Dependencies installed

### Documentation
- [ ] Public APIs documented
- [ ] Complex logic explained
- [ ] README updated (if needed)
- [ ] Migration guide (if breaking change)

### Performance
- [ ] No obvious performance issues
- [ ] Appropriate data structures used
- [ ] No unnecessary loops or computations
- [ ] Handles large datasets if applicable

## Common Implementation Patterns

### Error Handling Pattern

```typescript
class CustomError extends Error {
  constructor(message: string, public code: string, public details?: unknown) {
    super(message);
    this.name = 'CustomError';
  }
}

async function robustOperation() {
  try {
    const result = await riskyOperation();
    return { success: true, data: result };
  } catch (error) {
    logger.error('Operation failed', { error });
    
    if (error instanceof ValidationError) {
      return { success: false, error: 'Invalid input' };
    }
    
    throw new CustomError(
      'Operation failed',
      'OPERATION_ERROR',
      { originalError: error }
    );
  }
}
```

### Validation Pattern

```typescript
interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function validateUser(user: unknown): ValidationResult {
  const errors: string[] = [];
  
  if (!user || typeof user !== 'object') {
    return { valid: false, errors: ['User must be an object'] };
  }
  
  const u = user as Record<string, unknown>;
  
  if (!u.email || typeof u.email !== 'string') {
    errors.push('Email is required');
  } else if (!isValidEmail(u.email)) {
    errors.push('Email format is invalid');
  }
  
  if (!u.name || typeof u.name !== 'string') {
    errors.push('Name is required');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

### Builder Pattern

```typescript
class QueryBuilder {
  private conditions: string[] = [];
  private params: unknown[] = [];
  
  where(condition: string, ...values: unknown[]): this {
    this.conditions.push(condition);
    this.params.push(...values);
    return this;
  }
  
  build(): { query: string; params: unknown[] } {
    const query = `SELECT * FROM users WHERE ${this.conditions.join(' AND ')}`;
    return { query, params: this.params };
  }
}

// Usage
const query = new QueryBuilder()
  .where('age > ?', 18)
  .where('active = ?', true)
  .build();
```

## Anti-Patterns to Avoid

❌ **Don't do this:**

```typescript
// Massive function doing everything
function handleUserRequest(req: any) {
  // 200 lines of code...
  // Parsing, validation, business logic, database, response
}

// Magic numbers
if (status === 3) { ... }

// Unclear variable names
const x = data.map(d => d.v * 2);

// Nested callbacks
getData((data) => {
  processData(data, (result) => {
    saveResult(result, (saved) => {
      // Callback hell
    });
  });
});

// Swallowing errors
try {
  riskyOperation();
} catch (e) {
  // Silently ignore
}
```

✓ **Do this instead:**

```typescript
// Single Responsibility Principle
async function handleUserRequest(req: Request) {
  const userData = parseRequest(req);
  const validatedData = validateUser(userData);
  const user = await createUser(validatedData);
  return formatResponse(user);
}

// Named constants
const STATUS_ACTIVE = 3;
if (status === STATUS_ACTIVE) { ... }

// Clear variable names
const doubledValues = data.map(item => item.value * 2);

// Async/await
const data = await getData();
const result = await processData(data);
const saved = await saveResult(result);

// Proper error handling
try {
  await riskyOperation();
} catch (error) {
  logger.error('Operation failed', { error });
  throw new OperationError('Failed to complete', { cause: error });
}
```

## Performance Considerations

### Choose Appropriate Data Structures

```typescript
// Use Set for unique values
const uniqueIds = new Set(items.map(item => item.id));

// Use Map for key-value lookups
const userMap = new Map(users.map(u => [u.id, u]));

// Use Array for ordered collections
const sortedItems = items.sort((a, b) => a.priority - b.priority);
```

### Avoid Unnecessary Iterations

```typescript
// Bad: Multiple iterations
const active = users.filter(u => u.isActive);
const count = active.length;
const names = active.map(u => u.name);

// Good: Single iteration
const { count, names } = users.reduce(
  (acc, user) => {
    if (user.isActive) {
      acc.count++;
      acc.names.push(user.name);
    }
    return acc;
  },
  { count: 0, names: [] as string[] }
);
```

### Cache Expensive Computations

```typescript
class DataProcessor {
  private cache = new Map<string, ProcessedData>();
  
  process(key: string, data: RawData): ProcessedData {
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }
    
    const result = expensiveComputation(data);
    this.cache.set(key, result);
    return result;
  }
}
```

## Final Implementation Checklist

Before submitting code:

1. **Verify it works**: Test manually and with automated tests
2. **Check code quality**: Run linter and formatter
3. **Review your own code**: Read it as if you're reviewing someone else's
4. **Update documentation**: Keep docs in sync with code
5. **Clean up**: Remove console.logs, commented code, debug statements

---

*This meta-instruction helps you implement features efficiently and correctly. It activates automatically when code implementation tasks are detected.*
