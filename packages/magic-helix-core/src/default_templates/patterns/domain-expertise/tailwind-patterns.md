# Tailwind CSS Patterns

## Purpose
Enforce Tailwind CSS best practices and utility patterns. From **same.new** and **Loveable**.

## Key Patterns

### Utility-First Approach
```tsx
// ✅ Use utility classes
<button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
  Click me
</button>

// ❌ Avoid custom CSS
<button className="custom-button">Click me</button>
```

### Responsive Design
```tsx
// ✅ Mobile-first responsive utilities
<div className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4">
  Responsive width
</div>
```

### Dark Mode
```tsx
// ✅ Dark mode variants
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Content
</div>
```

### Component Extraction
```tsx
// When utilities get too long (>5 classes), extract to component
// ✅ Extract reusable pattern
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg shadow-md p-6 bg-white dark:bg-gray-800">
      {children}
    </div>
  );
}
```

## Best Practices
- Use arbitrary values sparingly: `w-[137px]` (prefer standard scale)
- Group related utilities: layout, spacing, typography, colors
- Use @apply only for component styles (avoid in utility classes)
- Configure theme in tailwind.config.js for brand colors
