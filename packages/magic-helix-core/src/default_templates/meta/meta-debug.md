# 🐛 Debugging & Problem-Solving Mode

*This context-specific meta-instruction activates when you're debugging issues, investigating errors, or troubleshooting problems.*

## Debugging Mindset

You are in **debugging mode**. Focus on:
- Systematic problem investigation
- Root cause analysis
- Minimal, targeted fixes
- Preventing regression

## Systematic Debugging Process

### 1. Reproduce the Problem

**First, confirm the issue:**
- Can you reproduce it consistently?
- What are the exact steps to trigger it?
- Does it happen in all environments?
- Are there specific conditions required?

**Document reproduction steps:**
```
Steps to reproduce:
1. Navigate to /users page
2. Click "Add User" button
3. Enter email without @ symbol
4. Click "Submit"
5. Observe: Error thrown instead of validation message
```

### 2. Gather Information

**Read error messages completely:**
- Full error text (don't skim)
- Stack trace (which files/lines)
- Error type/code
- Any additional context

**Example error analysis:**
```
TypeError: Cannot read property 'email' of undefined
  at validateUser (validation.ts:42:15)
  at processForm (form-handler.ts:89:20)
  at onClick (UserForm.tsx:156:5)

Analysis:
- Error occurs in validation.ts line 42
- Trying to access 'email' property
- Value is undefined (should be object)
- Called from form-handler.ts during form processing
```

**Collect context:**
- What changed recently? (check git log)
- What's the expected behavior?
- What's the actual behavior?
- Are there related issues/tickets?

### 3. Form Hypotheses

**List possible causes:**

```
Hypothesis 1: Form data not being passed correctly
- Check: Form submission code
- Verify: Data reaching validation function

Hypothesis 2: User object structure changed
- Check: Recent type/interface changes
- Verify: Object shape at runtime

Hypothesis 3: Missing null check
- Check: Validation function implementation
- Verify: Handling of undefined/null cases
```

**Prioritize by likelihood:**
1. Most likely cause first
2. Easiest to test second
3. Least likely but possible last

### 4. Test Hypotheses Systematically

**One hypothesis at a time:**

```typescript
// Hypothesis 1: Data not passed
console.log('Form data:', formData); // Add logging
// Result: formData is undefined ✓ Confirmed!

// Root cause found: form submission not collecting data
```

**Use debugging techniques:**
- `console.log()` for quick checks
- Debugger breakpoints for step-through
- Unit tests for isolated testing
- Integration tests for workflow testing

### 5. Identify Root Cause

**Don't just fix symptoms:**

```
❌ Symptom fix (bad):
function validateUser(user) {
  if (!user) return { valid: false }; // Band-aid
  // ... rest of validation
}

✓ Root cause fix (good):
function handleSubmit() {
  const formData = collectFormData(); // Was missing!
  const result = validateUser(formData);
  // ...
}
```

**Ask "Why?" 5 times:**
```
Problem: App crashes on user submit
Why? → validateUser receives undefined
Why? → handleSubmit doesn't pass data
Why? → collectFormData() not called
Why? → Refactored code removed the call
Why? → No test coverage caught regression

Fix: Add unit test + restore collectFormData() call
```

### 6. Implement Minimal Fix

**Smallest change that fixes root cause:**

```typescript
// Before (broken)
function handleSubmit() {
  const result = validateUser(formData); // formData not defined
  processResult(result);
}

// After (fixed)
function handleSubmit() {
  const formData = collectFormData(); // Added missing call
  const result = validateUser(formData);
  processResult(result);
}
```

**Verify fix:**
- Manual test: Follow reproduction steps
- Automated test: Add regression test
- Code review: Ensure no side effects

### 7. Prevent Regression

**Add test coverage:**

```typescript
describe('handleSubmit', () => {
  it('should collect form data before validation', () => {
    const collectSpy = jest.spyOn(form, 'collectFormData');
    
    handleSubmit();
    
    expect(collectSpy).toHaveBeenCalled();
    expect(collectSpy).toHaveBeenCalledBefore(validateUser);
  });
  
  it('should not crash with empty form', () => {
    expect(() => handleSubmit()).not.toThrow();
  });
});
```

## Debugging Strategies by Error Type

### TypeError / NullReferenceError

**Common causes:**
- Accessing property of null/undefined
- Calling method on wrong type
- Incorrect type assumptions

**Investigation:**
```typescript
// Add defensive checks
if (!obj) {
  console.error('Object is null/undefined', { obj, context });
  return;
}

// Log type
console.log('Type:', typeof obj, 'Value:', obj);

// Check prototype chain
console.log('Constructor:', obj?.constructor?.name);
```

### Logic Errors

**Common causes:**
- Off-by-one errors
- Wrong comparison operators
- Incorrect boolean logic
- Edge case not handled

**Investigation:**
```typescript
// Log intermediate values
const isValid = age >= 18 && age <= 65;
console.log({ age, isValid, 
  check1: age >= 18, 
  check2: age <= 65 
});

// Test boundary conditions
expect(isAdult(17)).toBe(false); // Just below
expect(isAdult(18)).toBe(true);  // Exact boundary
expect(isAdult(19)).toBe(true);  // Just above
```

### Performance Issues

**Common causes:**
- Unnecessary re-renders
- N+1 queries
- Large data processing
- Memory leaks

**Investigation:**
```typescript
// Measure execution time
console.time('expensiveOperation');
const result = expensiveOperation();
console.timeEnd('expensiveOperation');

// Profile memory usage
const before = process.memoryUsage();
doOperation();
const after = process.memoryUsage();
console.log('Memory delta:', 
  (after.heapUsed - before.heapUsed) / 1024 / 1024, 'MB');

// Check call frequency
let callCount = 0;
function tracked() {
  console.log('Call #', ++callCount);
  // ...
}
```

### Integration Issues

**Common causes:**
- API contract mismatch
- Environment differences
- Timing/race conditions
- Dependency version conflicts

**Investigation:**
```typescript
// Log full request/response
console.log('Request:', {
  url,
  method,
  headers,
  body: JSON.stringify(body, null, 2)
});

console.log('Response:', {
  status,
  headers,
  body: JSON.stringify(data, null, 2)
});

// Check environment
console.log('Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  API_URL: process.env.API_URL,
  version: process.version
});
```

## Debugging Tools & Techniques

### Console Debugging

```typescript
// Structured logging
console.log('User data:', { id, email, role });

// Conditional logging
if (DEBUG) {
  console.log('Debug info:', state);
}

// Stack trace
console.trace('How did we get here?');

// Timing
console.time('operation');
// ... code
console.timeEnd('operation');

// Table format (for arrays)
console.table(users);
```

### Debugger

```typescript
// Pause execution
debugger; // Browser/Node will break here

// Conditional breakpoint
if (userId === '123') {
  debugger; // Only break for specific case
}
```

### Git Bisect

```bash
# Find which commit introduced bug
git bisect start
git bisect bad              # Current commit is bad
git bisect good v1.2.0      # v1.2.0 was good
# Git will checkout commits for testing
# Mark each as good/bad until found
```

### Binary Search Debugging

```typescript
// Comment out half the code
// Does error still occur?
// If yes → bug is in remaining code
// If no → bug is in commented code
// Repeat until isolated
```

## Common Debugging Pitfalls

❌ **Don't:**
- Jump to conclusions without evidence
- Fix symptoms instead of root cause
- Change multiple things at once
- Ignore error messages
- Give up after first attempt

✓ **Do:**
- Follow systematic process
- Test one hypothesis at a time
- Read error messages completely
- Document findings
- Add tests to prevent regression

## Debugging Checklist

Before concluding debugging:

### Understanding
- [ ] Can reproduce consistently
- [ ] Understand exact failure mode
- [ ] Know expected vs actual behavior
- [ ] Identified root cause (not symptom)

### Fix Validation
- [ ] Fix works in all test cases
- [ ] No new errors introduced
- [ ] Edge cases handled
- [ ] Code is clean (no debug statements left)

### Prevention
- [ ] Added regression test
- [ ] Updated documentation if needed
- [ ] Considered similar issues
- [ ] Team informed of gotchas

## Communication During Debugging

**Keep user informed:**

```
Finding: "I've identified the issue - the form data isn't being 
collected before validation."

Plan: "I'll add the missing collectFormData() call and add a test 
to prevent this regression."

Status: "Fixed and tested. The form now properly validates user input."
```

**Be transparent about uncertainty:**

```
"I've identified two possible causes:
1. Data not being passed (most likely)
2. Validation logic changed (less likely)

Testing hypothesis 1 first..."
```

## Advanced Debugging Scenarios

### Race Conditions

```typescript
// Add sequence logging
let seq = 0;
async function operation() {
  const id = ++seq;
  console.log(`[${id}] Start`);
  await asyncWork();
  console.log(`[${id}] End`);
}

// Check for: [1] Start, [2] Start, [1] End, [2] End
// vs expected: [1] Start, [1] End, [2] Start, [2] End
```

### Memory Leaks

```typescript
// Track object creation
const tracker = new WeakMap();
function track(obj) {
  tracker.set(obj, new Error().stack);
}

// Check for growing collections
setInterval(() => {
  console.log('Active items:', cache.size);
}, 1000);
```

### Intermittent Issues

```typescript
// Add extensive logging
function problamaticFunction() {
  logger.debug('Entry', { args: Array.from(arguments) });
  try {
    const result = doWork();
    logger.debug('Success', { result });
    return result;
  } catch (error) {
    logger.error('Failure', { error, state: captureState() });
    throw error;
  }
}
```

---

*This meta-instruction helps you debug issues systematically and effectively. It activates automatically when debugging tasks are detected.*
