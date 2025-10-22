# Framework: React
- **ALWAYS** use Functional Components with Hooks.
- **NEVER** use Class Components.
- **HOOKS**: Use `useState` for simple component state and `useReducer` for complex state logic.
- **EFFECTS**: `useEffect` dependencies must be complete. Use `eslint-plugin-react-hooks`.
- **MEMOIZATION**: Use `useCallback` for functions passed as props and `useMemo` for expensive calculations.
- **NAMING**: Files should be `PascalCase.tsx` (e.g., `MyComponent.tsx`).