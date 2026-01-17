# Preview Before Action Pattern

## Purpose
Show what will happen before executing, even for non-destructive operations. From **Cline** pattern.

## Template

```markdown
## Preview Policy

Before any file modification, show preview:

### Preview Format
```
📝 **Preview**: {OPERATION_NAME}

**File**: {FILE_PATH}
**Lines**: {START_LINE}-{END_LINE}

**Current**:
```{LANGUAGE}
{OLD_CODE}
```

**Proposed**:
```{LANGUAGE}
{NEW_CODE}
```

**Changes**:
- {CHANGE_DESCRIPTION_1}
- {CHANGE_DESCRIPTION_2}
```
```

## Examples

### Cline (Code Edit Preview)
```markdown
## Preview Policy: File Edits

Before modifying files, show exact changes:

📝 **Preview**: Update import path in Header component

**File**: `src/components/Header.tsx`
**Lines**: 1-10

**Current**:
```typescript
import React from 'react';
import { Button } from './ui/button';
import { Logo } from './Logo';

export const Header = () => {
  return (
    <header>
      <Logo />
      <Button>Click me</Button>
    </header>
  );
};
```

**Proposed**:
```typescript
import React from 'react';
import { Button } from '@/components/ui/Button'; // Fixed path and capitalization
import { Logo } from './Logo';

export const Header = () => {
  return (
    <header>
      <Logo />
      <Button>Click me</Button>
    </header>
  );
};
```

**Changes**:
- Changed `./ui/button` to `@/components/ui/Button`
- Fixed case sensitivity (button → Button)
- Uses absolute path alias (@/) for clarity

Proceeding with edit...
```

### same.new (Component Creation Preview)
```markdown
## Preview Policy: New File Creation

Before creating files, show complete content:

📝 **Preview**: Create UserProfile component

**File**: `src/components/UserProfile.tsx` (new file)

**Content**:
```typescript
import React from 'react';

interface UserProfileProps {
  name: string;
  email: string;
  avatarUrl?: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  name,
  email,
  avatarUrl
}) => {
  return (
    <div className="user-profile">
      {avatarUrl && <img src={avatarUrl} alt={name} />}
      <h2>{name}</h2>
      <p>{email}</p>
    </div>
  );
};
```

**Features**:
- TypeScript with proper interface
- Optional avatar support
- Accessible img alt text
- Clean, minimal styling hooks

Creating file...
```

### v0 (Multi-File Preview)
```markdown
## Preview Policy: Multiple File Generation

Before creating multiple files, show structure and key content:

📝 **Preview**: Generate authentication system

**Files to Create**:
1. `src/lib/auth.ts` - Auth utilities (45 lines)
2. `src/app/login/page.tsx` - Login page (80 lines)
3. `src/app/signup/page.tsx` - Signup page (75 lines)
4. `src/middleware.ts` - Route protection (20 lines)

**Key Sections**:

**auth.ts**:
```typescript
export async function hashPassword(password: string): Promise<string> { /*...*/ }
export async function verifyPassword(password: string, hash: string): Promise<boolean> { /*...*/ }
export async function createSession(userId: string): Promise<string> { /*...*/ }
```

**login/page.tsx**:
```typescript
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // ... form handling
}
```

**Structure**:
- Uses bcrypt for password hashing
- JWT for session tokens
- Server Actions for form submission
- Protected routes via middleware

Proceed with generation?
```

## Variables
- `{OPERATION_NAME}`: What you're doing (e.g., "Update import path")
- `{FILE_PATH}`: Absolute or relative path
- `{START_LINE}` / `{END_LINE}`: Line range
- `{LANGUAGE}`: Syntax highlighting language
- `{OLD_CODE}`: Current file contents
- `{NEW_CODE}`: Proposed changes
- `{CHANGE_DESCRIPTION_X}`: Plain English explanation

## Best Practices
1. Show preview for:
   - All file edits (even single-line changes)
   - New file creation (show full content if <100 lines)
   - File deletion (show what's being removed)
   - Terminal commands with side effects
2. Use syntax highlighting (```typescript, ```python, etc.)
3. Include context lines (3-5 lines above/below change)
4. Explain *why* change is needed, not just *what* changed
5. For large files (>100 lines), show key sections + summary
6. For multiple files, prioritize most critical/complex
7. Benefits: Catches mistakes before execution, educates user, builds confidence
