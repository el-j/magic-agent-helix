# Server Components Pattern

## Purpose
Guide usage of React Server Components (RSC) in Next.js. From **v0** pattern.

## Template

```markdown
## React Server Components (RSC)

### When to Use Server Components
- {SCENARIO_1_FOR_SERVER}
- {SCENARIO_2_FOR_SERVER}
- {SCENARIO_3_FOR_SERVER}

### When to Use Client Components
- {SCENARIO_1_FOR_CLIENT}
- {SCENARIO_2_FOR_CLIENT}
- {SCENARIO_3_FOR_CLIENT}

### Composition Patterns
- {HOW_TO_MIX_SERVER_AND_CLIENT}
- {PASSING_PROPS_BETWEEN_TYPES}
- {HANDLING_SERIALIZATION}
```

## Examples

### v0 (Next.js App Router RSC Guidelines)
```markdown
## React Server Components (RSC) in Next.js

### When to Use Server Components (Default)
- **Data Fetching**: When you need to fetch data from APIs or databases
  ```typescript
  // ✅ Server Component - fetch directly
  export default async function BlogPost({ params }: { params: { id: string } }) {
    const post = await fetch(`https://api.example.com/posts/${params.id}`)
      .then(r => r.json());
    return <article>{post.content}</article>;
  }
  ```

- **Static Content**: Components that don't need interactivity
  ```typescript
  // ✅ Server Component - no hooks or events
  export function Footer() {
    return (
      <footer>
        <p>&copy; 2024 Company Name</p>
        <nav>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
        </nav>
      </footer>
    );
  }
  ```

- **Sensitive Operations**: Backend logic that shouldn't be exposed to client
  ```typescript
  // ✅ Server Component - API key stays on server
  async function fetchData() {
    return await fetch('https://api.example.com/data', {
      headers: { 'Authorization': `Bearer ${process.env.API_KEY}` }
    }).then(r => r.json());
  }
  ```

### When to Use Client Components ('use client')
- **Interactivity**: Components with event handlers or React hooks
  ```typescript
  'use client';
  import { useState } from 'react';
  
  export function Counter() {
    const [count, setCount] = useState(0);
    return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;
  }
  ```

- **Browser APIs**: Components using window, document, localStorage, etc.
  ```typescript
  'use client';
  import { useEffect } from 'react';
  
  export function Tracker() {
    useEffect(() => {
      console.log('Page viewed:', window.location.href);
    }, []);
    return null;
  }
  ```

- **Third-Party Libraries**: Components using client-only libraries
  ```typescript
  'use client';
  import { useFormik } from 'formik'; // Client-side form library
  
  export function SignupForm() {
    const formik = useFormik({ /* ... */ });
    return <form onSubmit={formik.handleSubmit}>...</form>;
  }
  ```

### Composition Patterns
- **Server Component as Parent**: Client components can be children
  ```typescript
  // ✅ Server Component
  export default async function Page() {
    const data = await fetchData();
    
    return (
      <div>
        <h1>{data.title}</h1>
        <InteractiveWidget data={data} /> {/* Client Component */}
      </div>
    );
  }
  ```

- **Pass Serializable Props**: Only JSON-serializable data between boundaries
  ```typescript
  // ✅ Serializable props (string, number, plain object)
  <ClientComponent title="Hello" count={5} data={{ id: 1 }} />
  
  // ❌ Non-serializable props (functions, class instances)
  <ClientComponent onClick={() => {}} instance={new Date()} />
  ```

- **Workaround for Non-Serializable**: Use Server Actions or move logic to client
  ```typescript
  // ✅ Server Action (async function from server)
  async function updateData(formData: FormData) {
    'use server';
    // Server-side logic
  }
  
  // Pass action to client component
  <ClientForm action={updateData} />
  ```

- **Client Component as Wrapper**: Server components can be passed as children
  ```typescript
  // ✅ Client Component wrapper
  'use client';
  export function AnimatedContainer({ children }: { children: React.ReactNode }) {
    return <motion.div>{children}</motion.div>;
  }
  
  // Usage: Server Component as child
  <AnimatedContainer>
    <ServerRenderedContent /> {/* Still a Server Component */}
  </AnimatedContainer>
  ```

### Performance Considerations
- **Minimize Client Bundles**: Keep 'use client' boundary as low as possible
  ```typescript
  // ❌ Entire page is client component (large bundle)
  'use client';
  export default function Page() {
    const [state, setState] = useState();
    return <div>...</div>;
  }
  
  // ✅ Only interactive part is client component
  export default function Page() {
    return (
      <div>
        <StaticHeader /> {/* Server Component */}
        <InteractiveWidget /> {/* Client Component - small bundle */}
        <StaticFooter /> {/* Server Component */}
      </div>
    );
  }
  ```

- **Data Fetching Location**: Fetch in Server Component, not Client Component
  ```typescript
  // ✅ Fetch in Server Component (faster, no loading state)
  export default async function Page() {
    const data = await fetchData();
    return <ClientDisplay data={data} />;
  }
  
  // ❌ Fetch in Client Component (slower, needs loading state)
  'use client';
  export default function Page() {
    const [data, setData] = useState(null);
    useEffect(() => { fetchData().then(setData); }, []);
    if (!data) return <Spinner />;
    return <div>{data}</div>;
  }
  ```
```

## Variables
- `{SCENARIO_X_FOR_SERVER}`: When to use Server Component
- `{SCENARIO_X_FOR_CLIENT}`: When to use Client Component
- `{HOW_TO_MIX_SERVER_AND_CLIENT}`: Composition strategies
- `{PASSING_PROPS_BETWEEN_TYPES}`: Serialization rules
- `{HANDLING_SERIALIZATION}`: Workarounds for non-serializable data

## Best Practices
1. Default to Server Components (add 'use client' only when needed)
2. Explain serialization boundaries (common source of bugs)
3. Show composition patterns (client wrapping server, server wrapping client)
4. Highlight performance benefits (smaller bundles, faster data fetching)
5. Provide migration guide (Pages Router → App Router)
6. Address common mistakes ('use client' on entire page)
7. Benefits: Optimal performance, secure API calls, smaller JS bundles
