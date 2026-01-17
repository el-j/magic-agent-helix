# Framework: NestJS
- **ALWAYS** follow the standard architecture: `Module` > `Controller` > `Service`.
- **CONTROLLERS** should *only* handle HTTP request/response logic and DTO validation.
- **SERVICES** should contain *all* business logic.
- **ALWAYS** use DTOs (Data Transfer Objects) for `POST`/`PUT` bodies and validate them with `class-validator`.
- **ALWAYS** use Dependency Injection. Never instantiate services manually.
- **MODULES**: Keep modules granular. Import only what is needed.