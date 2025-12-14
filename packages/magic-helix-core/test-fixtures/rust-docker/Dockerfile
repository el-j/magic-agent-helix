# Rust Docker test fixture for Magic Helix plugin
FROM rust:1.73-alpine AS builder
WORKDIR /app
COPY . .
RUN cargo init --bin && \
    echo 'fn main() { println!("hello world"); }' > src/main.rs && \
    cargo build --release

FROM alpine:3.18
WORKDIR /app
COPY --from=builder /app/target/release/app ./app
CMD ["./app"]
