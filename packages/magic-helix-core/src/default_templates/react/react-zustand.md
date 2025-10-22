# State: Zustand
- **ALWAYS** use Zustand for global state management.
- Define stores in `src/stores/` or `src/hooks/`.
- **PREFER** the `create(set => ({ ... }))` syntax.
- **ACTIONS** should be defined as methods inside the created store object.
- **NEVER** mutate state directly. Always use the `set` function.
- `set({ count: state.count + 1 })`