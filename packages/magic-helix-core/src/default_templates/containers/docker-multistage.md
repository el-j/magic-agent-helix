# Docker Multi-Stage Build Best Practices

## Overview
Multi-stage builds reduce image size and improve security by separating build-time and runtime dependencies.

## Basic Pattern
```dockerfile
# Stage 1: Build
FROM builder-image AS builder
WORKDIR /build
COPY source files
RUN build commands

# Stage 2: Runtime
FROM runtime-image
WORKDIR /app
COPY --from=builder /build/artifacts .
CMD ["run", "app"]
```

## Language-Specific Optimizations

### Go
```dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /build
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -ldflags="-s -w" -o app

FROM scratch
COPY --from=builder /build/app /app
ENTRYPOINT ["/app"]
```

### Rust
```dockerfile
FROM rust:1.75-alpine AS builder
WORKDIR /build
RUN apk add --no-cache musl-dev
COPY Cargo.toml Cargo.lock ./
RUN mkdir src && echo "fn main() {}" > src/main.rs && cargo build --release && rm -rf src
COPY src ./src
RUN touch src/main.rs && cargo build --release

FROM alpine:latest
RUN apk add --no-cache ca-certificates
COPY --from=builder /build/target/release/app /app
CMD ["/app"]
```

### Node.js
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /build
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /build/node_modules ./node_modules
COPY . .
CMD ["node", "index.js"]
```

### Java/Spring Boot
```dockerfile
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /build
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /build/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Python
```dockerfile
FROM python:3.12-slim AS builder
WORKDIR /build
RUN pip install --no-cache-dir poetry
COPY pyproject.toml poetry.lock ./
RUN poetry export -f requirements.txt -o requirements.txt --without-hashes
RUN pip wheel --no-cache-dir --wheel-dir /wheels -r requirements.txt

FROM python:3.12-slim
WORKDIR /app
COPY --from=builder /wheels /wheels
RUN pip install --no-cache-dir /wheels/*
COPY . .
CMD ["python", "main.py"]
```

## Security Hardening
- Use specific image tags, not `latest`
- Run as non-root user: `USER 1000:1000`
- Scan images: `docker scout cves image:tag`
- Use distroless or alpine base images
- Multi-platform builds: `docker buildx build --platform linux/amd64,linux/arm64`

## .dockerignore Template
```
node_modules
.git
.env
*.log
dist
coverage
.vscode
```

## Build Optimization
- Layer caching: COPY dependency files before source code
- Parallel builds: `RUN cmd1 & cmd2 & wait`
- Build contexts: Use `.dockerignore` to exclude unnecessary files
