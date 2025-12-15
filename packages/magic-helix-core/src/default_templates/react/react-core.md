# Framework: React

## Modern React: Functional, Composable, Framework-Agnostic

**PREFER** functional programming over classes. Use plain objects, pure functions, and React hooks.

## Architecture: Separation of Concerns

**Components should be logic-free presentation layers. Business logic lives in framework-free services.**

### Layer Structure

```
src/
├── components/          # Presentation layer (React-specific, logic-free)
│   ├── UserProfile.tsx  # UI only: rendering, event handlers → call hooks
│   └── OrderList.tsx
│
├── hooks/              # React bridge layer (connects React to business logic)
│   ├── useUser.ts      # Wraps services in React state/effects
│   └── useOrders.ts
│
├── services/           # Business logic layer (framework-free, pure functions)
│   ├── user.ts         # Pure functions, no React dependencies
│   └── order.ts
│
└── models/             # Domain models (types + pure functions)
    ├── user.ts         # Plain types + validators
    └── order.ts
```

## Modern Patterns

### ✅ DO: Use Functional Components + Hooks

```tsx
// ✅ Modern: Functional component
export function UserProfile({ userId }: { userId: string }) {
  const { user, loading } = useUser(userId);
  
  if (loading) return <Spinner />;
  return <div>{user.name}</div>;
}
```

### ❌ DON'T: Use Class Components

```tsx
// ❌ Outdated: Class component
class UserProfile extends React.Component {
  // Don't use classes in modern React
}
```

### ✅ DO: Use Plain Objects and Pure Functions

```tsx
// ✅ Modern: Plain type + pure functions
export type User = {
  id: string;
  name: string;
  email: string;
};

export function validateUser(user: User): boolean {
  return user.email.includes('@');
}
```

### ❌ DON'T: Use Classes for Models

```tsx
// ❌ Outdated: Class-based model
class User {
  constructor(public id: string, public name: string) {}
  validate() { /* ... */ }
}
```

### Rule: Components are Logic-Free

**ALWAYS** keep components focused on rendering and user interactions. **NEVER** put business logic in components.

```tsx
// ✅ Good: Logic-free component
export function UserProfile({ userId }: { userId: string }) {
  const { user, loading, updateEmail } = useUser(userId);

  if (loading) return <Spinner />;
  if (!user) return <NotFound />;

  return (
    <div>
      <h1>{user.name}</h1>
      <EmailForm 
        currentEmail={user.email} 
        onSubmit={updateEmail}  // Hook handles the logic
      />
    </div>
  );
}

// ❌ Bad: Business logic in component
export function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);

  async function updateEmail(newEmail: string) {
    // ❌ Validation logic in component
    if (!newEmail.includes('@')) {
      alert('Invalid email');
      return;
    }

    // ❌ API call in component
    const response = await fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify({ email: newEmail })
    });

    const updated = await response.json();
    setUser(updated);
  }

  return (/* ... */);
}
```

### Rule: Hooks Wire React to Services

**ALWAYS** use custom hooks to bridge React state/effects with framework-free services.

```tsx
// ✅ hooks/useUser.ts - React bridge
import { useState, useEffect } from 'react';
import * as userService from '@/services/userService';
import type { User } from '@/models/User';

export function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      try {
        setLoading(true);
        const data = await userService.getUser(userId);  // Pure function call
        if (!cancelled) {
          setUser(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      cancelled = true;  // Cleanup
    };
  }, [userId]);

  const updateEmail = async (newEmail: string) => {
    const updated = await userService.updateUserEmail(userId, newEmail);
    setUser(updated);
  };

  return { user, loading, error, updateEmail };
}
```

### Rule: Services are Framework-Free

**ALWAYS** write services as pure functions or plain objects. **NEVER** import React or use hooks in services.

```typescript
// ✅ Modern: services/userService.ts - Pure functions (no class)
import type { User } from '@/models/User';
import { validateEmail } from '@/models/User';
import { apiClient } from '@/lib/apiClient';

export async function getUser(userId: string): Promise<User> {
  const response = await apiClient.get(`/users/${userId}`);
  return {
    id: response.data.id,
    name: response.data.name,
    email: response.data.email,
    createdAt: new Date(response.data.created_at),
  };
}

export async function updateUserEmail(userId: string, newEmail: string): Promise<User> {
  // Business logic: validation
  if (!validateEmail(newEmail)) {
    throw new Error('Invalid email format');
  }

  // API call
  const response = await apiClient.patch(`/users/${userId}`, {
    email: newEmail
  });

  return {
    id: response.data.id,
    name: response.data.name,
    email: response.data.email,
    createdAt: new Date(response.data.created_at),
  };
}

export async function deleteUser(userId: string): Promise<void> {
  await apiClient.delete(`/users/${userId}`);
}

// Alternative: Object grouping for organization
export const userService = {
  getUser,
  updateUserEmail,
  deleteUser,
} as const;
```

**Benefits:**
- Easy to test (no React mocking needed)
- Reusable in Node.js scripts, CLI tools, React Native
- Can swap React for Vue/Svelte/Angular without rewriting logic
- Tree-shakeable (only import functions you use)

### Rule: Domain Models are Plain Objects + Pure Functions

**PREFER** plain TypeScript types with pure utility functions over classes.

```typescript
// ✅ Modern: models/User.ts - Type + pure functions
export type User = {
  readonly id: string;
  name: string;
  email: string;
  createdAt: Date;
};

// Pure utility functions
export function createUser(data: { name: string; email: string }): User {
  if (!validateEmail(data.email)) {
    throw new Error('Invalid email format');
  }
  
  return {
    id: crypto.randomUUID(),
    name: data.name,
    email: data.email,
    createdAt: new Date(),
  };
}

export function isAdmin(user: User): boolean {
  return user.email.endsWith('@company.com');
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// For complex transformations
export function userFromAPI(data: unknown): User {
  // Add runtime validation with zod or similar
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    createdAt: new Date(data.created_at),
  };
}
```

### Complete Example: Order Management

```
src/
├── components/
│   └── OrderList.tsx          # UI only
├── hooks/
│   └── useOrders.ts           # React state bridge
├── services/
│   └── orderService.ts        # Business logic
└── models/
    └── Order.ts               # Domain model
```

```tsx
// components/OrderList.tsx - Presentation
export function OrderList() {
  const { orders, loading, createOrder, cancelOrder } = useOrders();

  if (loading) return <Spinner />;

  return (
    <div>
      <button onClick={() => createOrder({ items: [...] })}>
        New Order
      </button>
      {orders.map(order => (
        <OrderCard 
          key={order.id} 
          order={order}
          onCancel={() => cancelOrder(order.id)}
        />
      ))}
    </div>
  );
}

// hooks/useOrders.ts - React bridge
export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getOrders().then(setOrders).finally(() => setLoading(false));
  }, []);

  const createOrder = async (data: CreateOrderData) => {
    const newOrder = await orderService.createOrder(data);
    setOrders(prev => [...prev, newOrder]);
  };

  const cancelOrder = async (orderId: string) => {
    await orderService.cancelOrder(orderId);
    setOrders(prev => prev.filter(o => o.id !== orderId));
  };

  return { orders, loading, createOrder, cancelOrder };
}

// services/orderService.ts - Framework-free logic
class OrderService {
  async getOrders(): Promise<Order[]> {
    const response = await apiClient.get('/orders');
    return response.data.map(Order.fromAPI);
  }

  async createOrder(data: CreateOrderData): Promise<Order> {
    // Validation
    if (data.items.length === 0) {
      throw new Error('Order must have at least one item');
    }

    const response = await apiClient.post('/orders', data);
    return Order.fromAPI(response.data);
  }

  async cancelOrder(orderId: string): Promise<void> {
    await apiClient.post(`/orders/${orderId}/cancel`);
  }
}

export const orderService = new OrderService();

// models/Order.ts - Domain model
export class Order {
  constructor(
    public readonly id: string,
    public status: OrderStatus,
    public items: OrderItem[],
    public total: number
  ) {}

  static fromAPI(data: any): Order {
    return new Order(
      data.id,
      data.status,
      data.items.map(OrderItem.fromAPI),
      data.total
    );
  }

  canBeCancelled(): boolean {
    return this.status === 'pending' || this.status === 'processing';
  }
}
```

## React Best Practices

### Modern React Patterns

- **ALWAYS** use Functional Components with Hooks (never classes)
- **ALWAYS** use plain objects and pure functions over classes for models/services
- **PREFER** function exports over default exports for better tree-shaking
- **PREFER** named exports: `export function Component()` over `export default`
- **HOOKS**: Use `useState` for simple state, `useReducer` for complex state logic
- **EFFECTS**: `useEffect` dependencies must be complete. Use `eslint-plugin-react-hooks`
- **MEMOIZATION**: Use `useCallback` for functions passed as props, `useMemo` for expensive calculations
- **NAMING**: Components are `PascalCase.tsx`, utilities are `camelCase.ts`

### Recommended Modern Libraries

**State Management:**
- ✅ Zustand (simple, functional, no boilerplate)
- ✅ Jotai (atomic state, React-like)
- ✅ TanStack Query (server state, caching)
- ⚠️ Redux Toolkit (if you need Redux, use RTK not classic Redux)
- ❌ Classic Redux (too much boilerplate)

**Forms:**
- ✅ React Hook Form (performant, minimal re-renders)
- ✅ Zod (schema validation, type-safe)
- ❌ Formik (legacy, prefer React Hook Form)

**Data Fetching:**
- ✅ TanStack Query (React Query) - best for server state
- ✅ SWR (simple, from Vercel)
- ✅ Native `fetch` + custom hooks for simple cases

**Styling:**
- ✅ Tailwind CSS (utility-first, fast)
- ✅ CSS Modules (scoped, simple)
- ✅ Vanilla Extract (type-safe CSS-in-TS)
- ⚠️ Styled Components (runtime cost, slower)
- ⚠️ Emotion (runtime cost, slower)

**Type Safety:**
- ✅ TypeScript (essential)
- ✅ Zod (runtime validation + type inference)
- ✅ ts-pattern (pattern matching)

**Testing:**
- ✅ Vitest (modern, fast, Vite-compatible)
- ✅ Testing Library (user-centric testing)
- ⚠️ Jest (slower, but widely used)

### Example: Modern Stack

```tsx
// ✅ Modern React with TanStack Query + Zod
import { useQuery, useMutation } from '@tanstack/react-query';
import { z } from 'zod';

// Schema validation with Zod
const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});

type User = z.infer<typeof UserSchema>;

// Pure function for API call
async function fetchUser(userId: string): Promise<User> {
  const res = await fetch(`/api/users/${userId}`);
  const data = await res.json();
  return UserSchema.parse(data); // Runtime validation
}

// Component using TanStack Query (no custom hook needed!)
export function UserProfile({ userId }: { userId: string }) {
  const { data: user, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });

  if (isLoading) return <Spinner />;
  if (!user) return <NotFound />;

  return <div>{user.name}</div>;
}
```

### Example: Zustand for Client State

```typescript
// stores/userStore.ts - Simple, functional state
import { create } from 'zustand';

type UserStore = {
  currentUser: User | null;
  setUser: (user: User) => void;
  logout: () => void;
};

export const useUserStore = create<UserStore>((set) => ({
  currentUser: null,
  setUser: (user) => set({ currentUser: user }),
  logout: () => set({ currentUser: null }),
}));

// Usage in component
export function Header() {
  const currentUser = useUserStore((state) => state.currentUser);
  const logout = useUserStore((state) => state.logout);
  
  return <button onClick={logout}>{currentUser?.name}</button>;
}
```

## File Organization

```
src/
├── components/          # React components (presentation only)
│   ├── UserProfile/
│   │   ├── UserProfile.tsx
│   │   ├── UserProfile.test.tsx
│   │   └── index.ts
│   └── shared/          # Reusable UI components
│       ├── Button.tsx
│       └── Card.tsx
│
├── hooks/              # Custom hooks (React bridge to services)
│   ├── useUser.ts
│   ├── useOrders.ts
│   └── useAuth.ts
│
├── services/           # Business logic (framework-free)
│   ├── userService.ts
│   ├── orderService.ts
│   └── authService.ts
│
├── models/             # Domain models and types
│   ├── User.ts
│   ├── Order.ts
│   └── types.ts
│
├── lib/                # Utilities (API client, formatters, etc.)
│   ├── apiClient.ts
│   └── validators.ts
│
└── App.tsx
```

## Testing Strategy

**Components:** Test rendering and user interactions (shallow tests)
```tsx
// UserProfile.test.tsx
import { render, screen } from '@testing-library/react';
import { UserProfile } from './UserProfile';

// Mock the hook
jest.mock('@/hooks/useUser', () => ({
  useUser: () => ({
    user: { id: '1', name: 'John', email: 'john@example.com' },
    loading: false,
    updateEmail: jest.fn()
  })
}));

test('renders user name', () => {
  render(<UserProfile userId="1" />);
  expect(screen.getByText('John')).toBeInTheDocument();
});
```

**Hooks:** Test React state/effect integration
```tsx
// useUser.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useUser } from './useUser';
import { userService } from '@/services/userService';

jest.mock('@/services/userService');

test('loads user on mount', async () => {
  const mockUser = { id: '1', name: 'John', email: 'john@example.com' };
  (userService.getUser as jest.Mock).mockResolvedValue(mockUser);

  const { result } = renderHook(() => useUser('1'));

  expect(result.current.loading).toBe(true);

  await waitFor(() => {
    expect(result.current.loading).toBe(false);
    expect(result.current.user).toEqual(mockUser);
  });
});
```

**Services:** Test business logic (no React involved)
```typescript
// userService.test.ts
import { userService } from './userService';
import { apiClient } from '@/lib/apiClient';

jest.mock('@/lib/apiClient');

describe('UserService', () => {
  test('validates email before updating', async () => {
    await expect(
      userService.updateUserEmail('1', 'invalid-email')
    ).rejects.toThrow('Invalid email format');

    expect(apiClient.patch).not.toHaveBeenCalled();
  });

  test('updates email when valid', async () => {
    const mockUser = { id: '1', email: 'new@example.com' };
    (apiClient.patch as jest.Mock).mockResolvedValue({ data: mockUser });

    const result = await userService.updateUserEmail('1', 'new@example.com');

    expect(apiClient.patch).toHaveBeenCalledWith('/users/1', {
      email: 'new@example.com'
    });
    expect(result.email).toBe('new@example.com');
  });
});
```

## Architecture Summary

1. **Components** = Presentation (UI rendering, event handlers)
   - Import: hooks, UI libraries, CSS
   - Export: JSX components
   - No business logic, no API calls

2. **Hooks** = React Bridge (state management, effects)
   - Import: React hooks, services
   - Export: State + actions
   - Minimal logic (mostly wiring)

3. **Services** = Business Logic (framework-free)
   - Import: models, utilities, API client
   - Export: Business operations
   - No React dependencies

4. **Models** = Domain Rules (types, validation, transformations)
   - Import: nothing or minimal utilities
   - Export: Classes, types, validators
   - Pure TypeScript

**Reference:** See `patterns/architecture/clean-architecture.md` and `patterns/architecture/layered-architecture.md` for detailed architectural guidance.