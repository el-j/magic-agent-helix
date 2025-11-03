# Docker Compose Best Practices

## Overview
This project uses Docker Compose for multi-container orchestration.

## Commands
- Start services: `docker compose up`
- Start in background: `docker compose up -d`
- Stop services: `docker compose down`
- View logs: `docker compose logs -f`
- Rebuild: `docker compose up --build`
- Run command: `docker compose exec <service> <command>`

## Service Definition
- Define services clearly with descriptive names
- Specify image or build context
- Set restart policies: `restart: unless-stopped`
- Use environment variables
- Define health checks

## Networking
- Services can communicate by service name
- Define custom networks if needed
- Use `depends_on` for startup order
- Expose only necessary ports

## Volumes
- Use named volumes for persistent data
- Use bind mounts for development
- Mount volumes in development for hot reload
- Example:
  ```yaml
  volumes:
    - ./src:/app/src
    - node_modules:/app/node_modules
  ```

## Environment Variables
- Use `.env` file for environment variables
- Reference in compose file: `${VARIABLE_NAME}`
- Use `env_file` directive for multiple files
- Never commit sensitive `.env` files

## Development vs Production
- Use `docker-compose.yml` for base configuration
- Use `docker-compose.override.yml` for development
- Use `docker-compose.prod.yml` for production
- Override with: `docker compose -f docker-compose.yml -f docker-compose.prod.yml up`

## Common Services
- **Database**: PostgreSQL, MySQL, MongoDB
- **Cache**: Redis, Memcached
- **Queue**: RabbitMQ, Redis
- **Web Server**: Nginx, Apache

## Best Practices
- Pin service versions
- Use health checks for dependencies
- Set resource limits in production
- Use secrets for sensitive data (v3.1+)
- Don't run containers as root
- Use separate networks for isolation

## Example Structure
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      - db
      - redis
    
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

## Troubleshooting
- Check logs: `docker compose logs <service>`
- Inspect containers: `docker compose ps`
- Access shell: `docker compose exec <service> sh`
- View networks: `docker network ls`
- Clean up: `docker compose down -v` (removes volumes)

## Performance
- Use volumes for better I/O performance
- Limit services to necessary ones during development
- Use profiles to group optional services
- Consider using `docker compose watch` for development
