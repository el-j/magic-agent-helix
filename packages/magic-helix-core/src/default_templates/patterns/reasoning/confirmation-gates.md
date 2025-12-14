# Confirmation Gates Pattern

## Purpose
Require user approval before destructive or high-impact operations. From **same.new** and **Cline** patterns.

## Template

```markdown
## Confirmation Gates

Before executing {OPERATION_TYPE}, show preview and wait for approval:

### Operations Requiring Confirmation
- **File Deletion**: {LIST_FILES_TO_DELETE}
- **Overwrite**: {SHOW_DIFF_OLD_VS_NEW}
- **Bulk Changes**: {SUMMARIZE_SCOPE_AND_IMPACT}
- **Destructive Commands**: {EXPLAIN_WHAT_WILL_BE_LOST}

### Confirmation Format
```
⚠️ **Confirmation Required**

**Operation**: {OPERATION_NAME}
**Impact**: {WHAT_WILL_CHANGE}
**Files Affected**: {COUNT_AND_LIST}

**Preview**:
{SHOW_BEFORE_AFTER_OR_DIFF}

Proceed? (yes/no)
```
```

## Examples

### same.new (File Overwrite)
```markdown
## Confirmation Gates: File Operations

Before overwriting existing files, show diff and wait for approval:

⚠️ **Confirmation Required**

**Operation**: Overwrite `src/components/Button.tsx`
**Impact**: Existing component will be replaced
**Files Affected**: 1 file

**Preview (diff)**:
```diff
- export const Button = ({ label }: ButtonProps) => {
-   return <button className="btn">{label}</button>;
+ export const Button = ({ children, variant = 'primary' }: ButtonProps) => {
+   return <button className={`btn btn-${variant}`}>{children}</button>;
  };
```

**Risk Assessment**:
- ✅ TypeScript types will catch breaking changes
- ⚠️ Existing usages with `label` prop will need updates
- ℹ️ Found 8 files importing this component

Proceed? (yes/no)
```

### Cline (Bulk Deletion)
```markdown
## Confirmation Gates: Destructive Operations

Before deleting multiple files, show impact and wait for approval:

⚠️ **Confirmation Required**

**Operation**: Delete unused test fixtures
**Impact**: 12 files will be permanently deleted
**Files Affected**:
- tests/fixtures/user-data.json
- tests/fixtures/product-catalog.json
- tests/fixtures/old-api-response.json
- ... (9 more files)

**Risk Assessment**:
- ⚠️ **WARNING**: This cannot be undone unless files are in git
- ✅ Git status: All files committed (can recover from history)
- ℹ️ These files are not referenced in any test files

**Recommended Action**: Review list carefully before confirming

Proceed? (yes/no)
```

### ChatGPT (Credential Exposure)
```markdown
## Confirmation Gates: Security Risk

Before generating code with sensitive data, warn and request confirmation:

⚠️ **Confirmation Required**

**Operation**: Generate API client with authentication
**Impact**: Code will include authentication logic
**Security Risk**: HIGH

**Warning**:
- ❌ NEVER hardcode API keys in code
- ❌ NEVER commit credentials to git
- ✅ Use environment variables (.env file)
- ✅ Add .env to .gitignore

**Proposed Implementation**:
```typescript
const apiKey = process.env.API_KEY; // ✅ From environment
// NOT: const apiKey = 'sk-abc123...'; // ❌ Hardcoded
```

I will generate code using environment variables. Proceed? (yes/no)
```

## Variables
- `{OPERATION_TYPE}`: Category of operation (delete, overwrite, bulk edit)
- `{LIST_FILES_TO_DELETE}`: Affected file paths
- `{SHOW_DIFF_OLD_VS_NEW}`: Side-by-side or unified diff
- `{SUMMARIZE_SCOPE_AND_IMPACT}`: How many files, what changes
- `{EXPLAIN_WHAT_WILL_BE_LOST}`: Data that can't be recovered
- `{OPERATION_NAME}`: Specific action (e.g., "Delete 12 test fixtures")
- `{WHAT_WILL_CHANGE}`: User-facing description
- `{COUNT_AND_LIST}`: Number and paths
- `{SHOW_BEFORE_AFTER_OR_DIFF}`: Visual comparison

## Best Practices
1. Always show confirmation for:
   - File/directory deletion
   - Overwriting existing files (unless explicitly replacing)
   - Running commands with sudo/admin privileges
   - Exposing credentials or secrets
   - Bulk operations (>5 files)
2. Include risk assessment (✅ safe, ⚠️ warning, ❌ danger)
3. Explain what can't be undone vs. what's recoverable
4. Show concrete preview (diff, file list, command output)
5. Suggest safer alternatives when applicable
6. Wait for explicit "yes" (don't proceed on silence)
7. Benefits: Prevents accidents, builds trust, surfaces unintended consequences
