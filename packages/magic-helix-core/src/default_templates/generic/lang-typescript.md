# Language: TypeScript

* **ALWAYS** use strict mode (`"strict": true`).

* **AVOID** the `any` type. Prefer `unknown` when the type is truly unknown.

* **ALWAYS** use `interface` for public API definitions (e.g., function parameters, return types) and `type` for internal or utility types.

* **ALWAYS** use optional chaining (`?.`) and nullish coalescing (`??`) over `&&` checks.

* **NEVER** use `require`. Always use ES module `import` syntax.