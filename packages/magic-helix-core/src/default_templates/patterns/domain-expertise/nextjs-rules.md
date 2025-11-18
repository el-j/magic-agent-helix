# Next.js Rules Pattern

## Purpose
Enforce Next.js-specific best practices and constraints. From **v0** pattern.

## Template

```markdown
## Next.js {VERSION} Guidelines

### App Router (Next.js 13+)
- {RULE_ABOUT_SERVER_COMPONENTS}
- {RULE_ABOUT_CLIENT_COMPONENTS}
- {RULE_ABOUT_FILE_CONVENTIONS}
- {RULE_ABOUT_ROUTING}

### Data Fetching
- {RULE_ABOUT_ASYNC_COMPONENTS}
- {RULE_ABOUT_CACHING}
- {RULE_ABOUT_REVALIDATION}

### Performance
- {RULE_ABOUT_IMAGES}
- {RULE_ABOUT_FONTS}
- {RULE_ABOUT_BUNDLING}
```

## Examples

### v0 (Next.js 14 App Router)
```markdown
## Next.js 14 App Router Guidelines

### Server vs Client Components
- **Default to Server Components**: All components in app/ are Server Components unless marked with 'use client'
- **Use 'use client' only when**:
  - Component uses React hooks (useState, useEffect, useContext)
  - Component uses browser APIs (window, document, localStorage)
  - Component needs event handlers (onClick, onSubmit, etc.)
  - Component uses third-party libraries that depend on browser features

**Example**:
```typescript
// ✅ Server Component (default) - good for static content
export default function ProductList({ products }: Props) {
  return <div>{products.map(p => <ProductCard key={p.id} {...p} />)}</div>;
}

// ✅ Client Component - needed for interactivity
'use client';
export default function SearchBar() {
  const [query, setQuery] = useState('');
  return <input value={query} onChange={e => setQuery(e.target.value)} />;
}
```

### File Conventions
- **page.tsx**: Route segment UI (exported as default)
- **layout.tsx**: Shared UI across route segments
- **loading.tsx**: Loading UI (Suspense boundary)
- **error.tsx**: Error UI (Error boundary)
- **not-found.tsx**: 404 UI
- **route.ts**: API endpoint (GET, POST, etc.)

**Route Groups**: Use (folder) to organize without affecting URL structure

### Data Fetching
- **Async Server Components**: Fetch data directly in component
  ```typescript
  export default async function Page() {
    const data = await fetch('https://api.example.com/data').then(r => r.json());
    return <div>{data.title}</div>;
  }
  ```
- **Caching**: Fetch requests are automatically cached
- **Revalidation**: Use `revalidate` or `revalidatePath` for on-demand updates

### Performance
- **Image Optimization**: Always use `next/image` component
  ```typescript
  import Image from 'next/image';
  <Image src="/photo.jpg" width={500} height={300} alt="Photo" />
  ```
- **Font Optimization**: Use `next/font` for self-hosted fonts
  ```typescript
  import { Inter } from 'next/font/google';
  const inter = Inter({ subsets: ['latin'] });
  ```
- **Dynamic Imports**: Code-split heavy components
  ```typescript
  const HeavyComponent = dynamic(() => import('./HeavyComponent'), { ssr: false });
  ```

### Metadata
- Export `metadata` object or `generateMetadata` function for SEO
  ```typescript
  export const metadata = {
    title: 'Page Title',
    description: 'Page description',
  };
  ```
```

## Variables
- `{VERSION}`: Next.js version (13, 14, 15)
- `{RULE_ABOUT_X}`: Specific guideline for feature X

## Best Practices
1. Specify Next.js version (APIs change between versions)
2. Distinguish Pages Router vs App Router
3. Highlight breaking changes from previous versions
4. Show code examples (good ✅ vs bad ❌)
5. Link to official docs for deep dives
6. Update when new Next.js versions release
7. Benefits: Version-appropriate code, avoids deprecated patterns, follows framework conventions
