# Testing: Vitest
- **ALWAYS** use `describe`, `it`, and `expect` syntax.
- **ALWAYS** mock dependencies using `vi.mock()`.
- **ALWAYS** clean up mocks after each test using `afterEach(() => { vi.restoreAllMocks(); })`.
- Use `it.todo('should do a thing')` for pending tests.
- For component testing, prefer `@vitest/ui` for a visual runner.