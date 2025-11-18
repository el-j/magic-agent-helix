# React Patterns Pattern

## Purpose
Enforce React best practices and common patterns. From **v0** and **same.new**.

## Template

```markdown
## React Best Practices

### Component Structure
- {RULE_ABOUT_FUNCTIONAL_VS_CLASS}
- {RULE_ABOUT_HOOKS_USAGE}
- {RULE_ABOUT_COMPOSITION}

### State Management
- {RULE_ABOUT_LOCAL_STATE}
- {RULE_ABOUT_PROP_DRILLING}
- {RULE_ABOUT_CONTEXT}

### Performance
- {RULE_ABOUT_MEMOIZATION}
- {RULE_ABOUT_KEYS}
- {RULE_ABOUT_EFFECTS}
```

## Examples

### v0 (React 18+ Patterns)
```markdown
## React 18+ Best Practices

### Component Structure
- **Use Functional Components**: No class components (deprecated pattern)
  ```typescript
  // ✅ Functional component with TypeScript
  interface ButtonProps {
    label: string;
    onClick: () => void;
  }
  
  export const Button: React.FC<ButtonProps> = ({ label, onClick }) => {
    return <button onClick={onClick}>{label}</button>;
  };
  
  // ❌ Class component (outdated)
  class Button extends React.Component { /* ... */ }
  ```

- **Extract Custom Hooks**: Reuse stateful logic
  ```typescript
  // ✅ Custom hook for form state
  function useFormField(initialValue: string) {
    const [value, setValue] = useState(initialValue);
    const [error, setError] = useState<string | null>(null);
    
    const validate = () => {
      if (!value) setError('Required');
      else setError(null);
    };
    
    return { value, setValue, error, validate };
  }
  
  // Usage in component
  function SignupForm() {
    const email = useFormField('');
    const password = useFormField('');
    // ...
  }
  ```

- **Prefer Composition over Inheritance**
  ```typescript
  // ✅ Composition with children prop
  function Card({ children }: { children: React.ReactNode }) {
    return <div className="card">{children}</div>;
  }
  
  function ProductCard() {
    return (
      <Card>
        <h2>Product Name</h2>
        <p>Description</p>
      </Card>
    );
  }
  ```

### State Management
- **Start with Local State**: Use useState for component-specific state
- **Lift State Up**: Move state to common parent when multiple children need it
- **Use Context for Global State**: Avoid prop drilling for deeply nested components
  ```typescript
  // ✅ Context for theme (accessed by many components)
  const ThemeContext = createContext<'light' | 'dark'>('light');
  
  function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
  }
  ```

- **Consider Zustand/Jotai**: For complex client-side state (alternative to Redux)

### Performance
- **Memoize Expensive Calculations**: Use useMemo
  ```typescript
  const sortedItems = useMemo(() => 
    items.sort((a, b) => a.price - b.price),
    [items]
  );
  ```

- **Memoize Callbacks**: Use useCallback for props passed to children
  ```typescript
  const handleClick = useCallback(() => {
    console.log('Clicked');
  }, []); // Empty deps = never recreated
  ```

- **Always Provide Keys**: For lists (use stable IDs, not indexes)
  ```typescript
  // ✅ Stable unique key
  {products.map(p => <ProductCard key={p.id} {...p} />)}
  
  // ❌ Index as key (causes bugs when list changes)
  {products.map((p, i) => <ProductCard key={i} {...p} />)}
  ```

- **Avoid Side Effects in Render**: Use useEffect for side effects
  ```typescript
  // ❌ Side effect in render (runs every render)
  function Component() {
    document.title = 'New Title'; // Bad!
    return <div>Content</div>;
  }
  
  // ✅ Side effect in useEffect (runs only when needed)
  function Component() {
    useEffect(() => {
      document.title = 'New Title';
    }, []);
    return <div>Content</div>;
  }
  ```

### TypeScript Integration
- **Define Prop Interfaces**: Explicit types for all components
- **Use React.FC sparingly**: Prefer explicit return types
  ```typescript
  // ✅ Explicit props and return type
  interface Props {
    name: string;
    age: number;
  }
  
  function UserCard({ name, age }: Props): JSX.Element {
    return <div>{name}, {age}</div>;
  }
  ```

- **Type Event Handlers**: Use React's event types
  ```typescript
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    console.log(e.target.value);
  }
  ```
```

## Variables
- `{RULE_ABOUT_X}`: Specific React guideline

## Best Practices
1. Cover React fundamentals (components, hooks, effects)
2. Show TypeScript integration examples
3. Include good/bad code comparisons
4. Address common mistakes (useEffect dependencies, key props)
5. Mention state management options (Context, Zustand, Redux)
6. Update for React version features (18+: Suspense, Concurrent Rendering)
7. Benefits: Consistent React patterns, avoids common pitfalls, TypeScript-safe code
