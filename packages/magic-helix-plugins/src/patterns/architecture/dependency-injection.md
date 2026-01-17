# Dependency Injection Pattern

## Purpose
Remove hard dependencies between components. Inject dependencies from outside rather than creating them internally. Improves testability, flexibility, and maintainability.

## Core Principle

**"Don't create dependencies, receive them."**

```typescript
// ❌ Bad: Hard dependency (tight coupling)
class UserService {
  private repository = new PostgresUserRepository(); // Creates its own dependency
  
  async getUser(id: string) {
    return this.repository.findById(id);
  }
}

// ✅ Good: Dependency injection (loose coupling)
class UserService {
  constructor(private repository: IUserRepository) {} // Receives dependency
  
  async getUser(id: string) {
    return this.repository.findById(id);
  }
}
```

## Dependency Injection Methods

### 1. Constructor Injection (Recommended)

```typescript
// ✅ Inject dependencies via constructor
export class OrderService {
  constructor(
    private orderRepository: IOrderRepository,
    private paymentService: IPaymentService,
    private emailService: IEmailService
  ) {}

  async createOrder(items: Item[]): Promise<Order> {
    const order = new Order(items);
    await this.orderRepository.save(order);
    await this.paymentService.charge(order.total);
    await this.emailService.sendOrderConfirmation(order);
    return order;
  }
}

// Usage (manual wiring)
const orderService = new OrderService(
  new PostgresOrderRepository(db),
  new StripePaymentService(apiKey),
  new SendGridEmailService(sendGridKey)
);
```

**Pros:**
- Dependencies are explicit and immutable
- Easy to test (pass mocks in constructor)
- Compiler enforces all dependencies are provided

### 2. Property Injection

```typescript
// ⚠️ Less common: Inject via properties
export class UserService {
  public repository!: IUserRepository; // Set externally

  async getUser(id: string) {
    return this.repository.findById(id);
  }
}

// Usage
const service = new UserService();
service.repository = new PostgresUserRepository(db);
```

**Pros:**
- Optional dependencies
- Circular dependency resolution

**Cons:**
- Dependencies not explicit
- Can forget to set properties
- Harder to test

### 3. Method Injection

```typescript
// ⚠️ Rare: Inject per method call
export class ReportGenerator {
  generateReport(data: Data, formatter: IReportFormatter): string {
    return formatter.format(data);
  }
}

// Usage
const generator = new ReportGenerator();
const pdf = generator.generateReport(data, new PdfFormatter());
const excel = generator.generateReport(data, new ExcelFormatter());
```

**Use when:** Dependency varies per call

## Inversion of Control (IoC) Containers

### Manual Wiring (Simple Projects)

```typescript
// ✅ composition-root.ts - Wire dependencies manually
export function createApp() {
  // Infrastructure
  const db = new PostgresDatabase(config.dbUrl);
  const redis = new Redis(config.redisUrl);

  // Repositories
  const userRepo = new PostgresUserRepository(db);
  const orderRepo = new PostgresOrderRepository(db);

  // Services
  const emailService = new SendGridEmailService(config.sendGridKey);
  const paymentService = new StripePaymentService(config.stripeKey);

  // Use Cases / Services
  const userService = new UserService(userRepo, emailService);
  const orderService = new OrderService(orderRepo, paymentService, emailService);

  // Controllers
  const userController = new UserController(userService);
  const orderController = new OrderController(orderService);

  return {
    userController,
    orderController,
  };
}
```

### IoC Container (Larger Projects)

#### TypeScript with InversifyJS

```typescript
import { Container, injectable, inject } from 'inversify';
import 'reflect-metadata';

// ✅ Define identifiers
const TYPES = {
  UserRepository: Symbol.for('IUserRepository'),
  EmailService: Symbol.for('IEmailService'),
  UserService: Symbol.for('UserService'),
};

// ✅ Mark classes as injectable
@injectable()
class PostgresUserRepository implements IUserRepository {
  constructor(@inject(TYPES.Database) private db: Database) {}
  // ...
}

@injectable()
class SendGridEmailService implements IEmailService {
  // ...
}

@injectable()
class UserService {
  constructor(
    @inject(TYPES.UserRepository) private userRepo: IUserRepository,
    @inject(TYPES.EmailService) private emailService: IEmailService
  ) {}
  // ...
}

// ✅ Configure container
const container = new Container();
container.bind<IUserRepository>(TYPES.UserRepository).to(PostgresUserRepository);
container.bind<IEmailService>(TYPES.EmailService).to(SendGridEmailService);
container.bind<UserService>(TYPES.UserService).to(UserService);

// ✅ Resolve dependencies
const userService = container.get<UserService>(TYPES.UserService);
```

#### NestJS (Built-in DI)

```typescript
// ✅ NestJS uses decorators for DI
@Injectable()
export class UserService {
  constructor(
    @Inject('IUserRepository') private userRepo: IUserRepository,
    private emailService: EmailService // Auto-resolves by type
  ) {}
}

// ✅ Register in module
@Module({
  providers: [
    UserService,
    EmailService,
    {
      provide: 'IUserRepository',
      useClass: PostgresUserRepository,
    },
  ],
})
export class UserModule {}
```

#### Python with dependency-injector

```python
from dependency_injector import containers, providers

# ✅ Define container
class Container(containers.DeclarativeContainer):
    config = providers.Configuration()

    # Infrastructure
    database = providers.Singleton(
        PostgresDatabase,
        connection_string=config.db_url
    )

    # Repositories
    user_repository = providers.Factory(
        PostgresUserRepository,
        db=database
    )

    # Services
    email_service = providers.Singleton(
        SendGridEmailService,
        api_key=config.sendgrid_key
    )

    user_service = providers.Factory(
        UserService,
        user_repository=user_repository,
        email_service=email_service
    )

# ✅ Usage
container = Container()
container.config.from_yaml('config.yaml')

user_service = container.user_service()
```

#### Go (Manual DI recommended)

```go
// ✅ Go uses explicit dependency passing
type UserService struct {
    userRepo     UserRepository
    emailService EmailService
}

func NewUserService(repo UserRepository, email EmailService) *UserService {
    return &UserService{
        userRepo:     repo,
        emailService: email,
    }
}

// ✅ Wire dependencies in main
func main() {
    db := postgres.NewDatabase(connString)
    userRepo := postgres.NewUserRepository(db)
    emailService := sendgrid.NewEmailService(apiKey)
    
    userService := NewUserService(userRepo, emailService)
    
    // ...
}

// Or use wire.go for compile-time DI
```

## Service Locator (Anti-Pattern, Avoid)

```typescript
// ❌ Service Locator (looks like DI but isn't)
class ServiceLocator {
  private services = new Map<string, any>();

  register(name: string, service: any) {
    this.services.set(name, service);
  }

  get<T>(name: string): T {
    return this.services.get(name);
  }
}

// ❌ Hidden dependency (bad)
class UserService {
  async getUser(id: string) {
    // Dependency hidden inside method - hard to test
    const repo = ServiceLocator.get<IUserRepository>('UserRepository');
    return repo.findById(id);
  }
}
```

**Why it's bad:**
- Hidden dependencies (not visible in constructor)
- Runtime errors if service not registered
- Hard to test
- Hard to understand dependencies

**Use constructor injection instead!**

## Testing with DI

```typescript
// ✅ Easy to test with constructor injection
describe('UserService', () => {
  it('sends email after creating user', async () => {
    // Create mocks
    const mockRepo: IUserRepository = {
      save: jest.fn(),
      findByEmail: jest.fn().mockResolvedValue(null),
    };
    const mockEmail: IEmailService = {
      send: jest.fn(),
    };

    // Inject mocks
    const service = new UserService(mockRepo, mockEmail);

    // Test
    await service.createUser('test@example.com', 'password');

    expect(mockEmail.send).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'test@example.com' })
    );
  });
});
```

## Lifetime Management

### Singleton (One instance for application)

```typescript
// ✅ Singleton: Shared instance
class DatabaseConnection {
  private static instance: DatabaseConnection;

  private constructor(private connectionString: string) {}

  static getInstance(connectionString: string): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection(connectionString);
    }
    return DatabaseConnection.instance;
  }
}

// Or use IoC container
container.bind<Database>(TYPES.Database).toSingleton(PostgresDatabase);
```

**Use for:** Database connections, configuration, caching services

### Transient (New instance per request)

```typescript
// ✅ Transient: New instance every time
container.bind<IUserService>(TYPES.UserService).toTransient(UserService);

// Every call creates new instance
const service1 = container.get<IUserService>(TYPES.UserService);
const service2 = container.get<IUserService>(TYPES.UserService);
// service1 !== service2
```

**Use for:** Stateful services, request handlers

### Scoped (One instance per scope/request)

```typescript
// ✅ Scoped: One instance per HTTP request
container.bind<IUserService>(TYPES.UserService).toScoped(UserService);

// In HTTP middleware
app.use((req, res, next) => {
  req.container = container.createChild(); // New scope
  next();
});

app.get('/users', (req, res) => {
  const service = req.container.get<IUserService>(TYPES.UserService);
  // Same instance within this request
});
```

**Use for:** Request-scoped data (current user, transaction)

## Best Practices

### 1. Depend on Interfaces, Not Implementations

```typescript
// ✅ Good: Depend on interface
class UserService {
  constructor(private repository: IUserRepository) {} // Interface
}

// ❌ Bad: Depend on concrete class
class UserService {
  constructor(private repository: PostgresUserRepository) {} // Concrete
}
```

### 2. Keep Dependencies Explicit

```typescript
// ✅ Good: All dependencies in constructor
class OrderService {
  constructor(
    private orderRepo: IOrderRepository,
    private paymentService: IPaymentService,
    private emailService: IEmailService,
    private logger: ILogger
  ) {}
}

// ❌ Bad: Hidden service locator
class OrderService {
  async createOrder() {
    const logger = ServiceLocator.get('Logger'); // Hidden!
  }
}
```

### 3. Don't Inject Configuration Objects

```typescript
// ❌ Bad: Inject entire config
class EmailService {
  constructor(private config: AppConfig) {
    this.apiKey = config.sendGrid.apiKey; // Knows too much
  }
}

// ✅ Good: Inject only what's needed
class EmailService {
  constructor(private apiKey: string) {}
}
```

### 4. Avoid Circular Dependencies

```typescript
// ❌ Bad: Circular dependency
class UserService {
  constructor(private orderService: OrderService) {}
}

class OrderService {
  constructor(private userService: UserService) {} // Circular!
}

// ✅ Good: Extract shared logic to new service
class UserService {
  constructor(private notificationService: NotificationService) {}
}

class OrderService {
  constructor(private notificationService: NotificationService) {}
}
```

## File Organization

```
src/
├── core/
│   ├── interfaces/              # Dependency interfaces
│   │   ├── IUserRepository.ts
│   │   ├── IEmailService.ts
│   │   └── IPaymentService.ts
│   └── services/
│       ├── UserService.ts       # Depends on interfaces
│       └── OrderService.ts
│
├── infrastructure/
│   ├── repositories/            # Interface implementations
│   │   └── PostgresUserRepository.ts
│   ├── services/
│   │   ├── SendGridEmailService.ts
│   │   └── StripePaymentService.ts
│   └── di/                      # DI configuration
│       └── container.ts
│
└── composition-root.ts          # Wire dependencies
```

## Rules Summary

- **ALWAYS** use constructor injection for required dependencies
- **ALWAYS** depend on interfaces, not concrete classes
- **ALWAYS** keep dependencies explicit (visible in constructor)
- **ALWAYS** wire dependencies at composition root (e.g., main.ts, app.ts)
- **NEVER** use service locator pattern
- **NEVER** create dependencies inside classes (new SomeDependency())
- **NEVER** access global state from classes
- **PREFER** manual DI for simple projects, IoC containers for complex ones
- **PREFER** immutable dependencies (constructor injection)
- **CONSIDER** property injection only for optional dependencies or circular refs
