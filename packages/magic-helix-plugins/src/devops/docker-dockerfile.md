# Dockerfile Best Practices

## Overview
This project uses Docker for containerization. Follow Docker best practices for efficient and secure images.

## Multi-Stage Builds
- Use multi-stage builds to reduce final image size
- Separate build and runtime stages
- Copy only necessary artifacts to final stage
- Example:
  ```dockerfile
  FROM node:20 AS builder
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci
  COPY . .
  RUN npm run build
  
  FROM node:20-slim
  WORKDIR /app
  COPY --from=builder /app/dist ./dist
  COPY package*.json ./
  RUN npm ci --only=production
  CMD ["node", "dist/index.js"]
  ```

## Base Image Selection
- Use official images when available
- Choose slim or alpine variants for smaller sizes
- Pin specific versions, avoid `latest` tag
- Use distroless images for production when possible

## Layer Optimization
- Order instructions from least to most frequently changing
- Combine RUN commands to reduce layers
- Use `.dockerignore` to exclude unnecessary files
- Clean up in the same RUN command (apt-get clean, rm cache)

## Security Best Practices
- Run as non-root user: `USER node` or custom user
- Scan images for vulnerabilities regularly
- Don't store secrets in images
- Use `COPY` instead of `ADD` unless you need tar extraction
- Keep base images updated

## Dockerfile Instructions
- `FROM`: Base image
- `WORKDIR`: Set working directory
- `COPY`: Copy files (preferred over ADD)
- `RUN`: Execute commands
- `CMD`: Default command (can be overridden)
- `ENTRYPOINT`: Main executable (harder to override)
- `ENV`: Set environment variables
- `EXPOSE`: Document ports (doesn't actually publish)
- `VOLUME`: Define mount points

## Environment Variables
- Use `ENV` for build-time variables
- Use `ARG` for build arguments
- Don't hardcode sensitive data
- Use `.env` files with docker-compose

## Health Checks
- Define `HEALTHCHECK` instruction
- Example: `HEALTHCHECK CMD curl -f http://localhost/ || exit 1`
- Helps orchestrators know when container is ready

## Image Tagging
- Tag images with semantic versions
- Use descriptive tags: `app:1.2.3`, `app:latest`, `app:dev`
- Don't rely solely on `latest` tag

## Build Context
- Keep build context small
- Use `.dockerignore` file
- Exclude: `node_modules`, `.git`, `dist`, test files
- Only include what's needed for the build

## Performance Tips
- Use layer caching effectively
- Leverage BuildKit features
- Use `--mount=type=cache` for package managers
- Minimize the number of layers in final image

## Common Patterns
- Copy package files first, then install dependencies
- This caches dependencies when source code changes
- Use `COPY package*.json ./` before `RUN npm install`

## Documentation
- Add labels for metadata: `LABEL maintainer="team@example.com"`
- Include README with Docker commands
- Document exposed ports and volumes
- Provide example docker-compose.yml
