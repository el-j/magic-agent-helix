# State: Pinia
- **ALWAYS** use Pinia for global state management.
- Define stores in the `src/stores` directory (e.g., `useUserStore.ts`).
- **ALWAYS** use the `setup` store syntax (function-based) instead of the `options` store syntax.
- **NEVER** access `localStorage` directly from a component. Encapsulate this logic within the Pinia store itself.