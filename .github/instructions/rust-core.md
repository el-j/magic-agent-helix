---
applyTo: "packages/magic-helix-core/test-fixtures/rust-docker/src/**/*.{rs}"
---


# Rust Development Guidelines

This project uses Rust.

## Project Structure
- Follow Cargo conventions
- Organize code with modules and crates
- Prefer workspace members for shared libraries

## Tooling
- Run `cargo fmt` and `cargo clippy` before committing
- Enable `deny(warnings)` in CI for regression catch
- Keep the MSRV documented in README or `rust-toolchain.toml`

## Safety & Ownership
- Embrace ownership and borrowing to prevent data races
- Minimize `unsafe` blocks and document why they're required
- Handle `Result`/`Option` exhaustively with meaningful errors

## Testing
- Cover critical code paths with unit tests in-module
- Add integration tests under `tests/`
- Use property tests or fuzzing for complex parsing logic

## Dependencies
- Keep Cargo.lock committed for binaries
- Audit crates with `cargo audit`
- Prefer feature flags over forked crates when possible