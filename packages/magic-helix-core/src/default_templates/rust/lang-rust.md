# Rust Development Guidelines

## Overview
This project uses Rust. Follow Rust idioms, ownership rules, and best practices.

## Code Style
- Use `rustfmt` for automatic code formatting
- Follow the [Rust API Guidelines](https://rust-lang.github.io/api-guidelines/)
- Use `clippy` for linting: `cargo clippy`
- Keep functions small and focused
- Use descriptive variable names

## Ownership & Borrowing
- Follow Rust's ownership rules strictly
- Prefer borrowing (`&T`) over taking ownership when possible
- Use `&mut T` for mutable borrows
- Avoid unnecessary `.clone()` calls
- Use `Cow<'_, T>` for conditional ownership

## Error Handling
- Use `Result<T, E>` for operations that can fail
- Use the `?` operator for error propagation
- Create custom error types using `thiserror` crate
- Avoid `unwrap()` and `expect()` in production code
- Provide meaningful error messages

## Types & Traits
- Use strong typing and avoid `String` everywhere
- Implement common traits (`Debug`, `Clone`, `PartialEq`) when appropriate
- Use `derive` macros for automatic implementations
- Define traits for shared behavior
- Use generics for code reuse

## Cargo Commands
- Build: `cargo build` (debug) or `cargo build --release` (optimized)
- Run: `cargo run`
- Test: `cargo test`
- Check: `cargo check` (faster than build for syntax checking)
- Format: `cargo fmt`
- Lint: `cargo clippy`
- Doc: `cargo doc --open`

## Project Structure
- `src/main.rs` - Binary entry point
- `src/lib.rs` - Library entry point
- `src/bin/` - Additional binaries
- `tests/` - Integration tests
- `benches/` - Benchmarks
- `examples/` - Example code

## Dependencies
- Add dependencies in `Cargo.toml`
- Use semantic versioning
- Run `cargo update` to update dependencies
- Check for outdated deps: `cargo outdated`

## Testing
- Write unit tests in the same file: `#[cfg(test)] mod tests { ... }`
- Write integration tests in `tests/` directory
- Use `assert!`, `assert_eq!`, `assert_ne!` macros
- Run specific tests: `cargo test test_name`
- Run with output: `cargo test -- --nocapture`

## Async/Await
- Use `tokio` or `async-std` for async runtime
- Mark async functions with `async fn`
- Use `.await` to wait for futures
- Use `#[tokio::main]` or `#[async_std::main]` for async main

## Documentation
- Use `///` for public API documentation
- Use `//!` for module-level documentation
- Include examples in doc comments
- Run `cargo doc` to generate documentation
- Use `#[doc = "..."]` for advanced docs

## Performance
- Profile before optimizing: use `cargo flamegraph`
- Use release builds for benchmarks: `cargo bench`
- Avoid unnecessary allocations
- Use iterators instead of loops when appropriate
- Consider using `rayon` for parallel processing

## Common Patterns
- Builder pattern for complex constructors
- Newtype pattern for type safety
- Use `match` for exhaustive pattern matching
- Use `if let` for simple pattern matching
- Use `Option<T>` instead of null
