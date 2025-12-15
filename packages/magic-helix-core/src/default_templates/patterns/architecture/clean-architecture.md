# Clean Architecture Pattern

## Purpose
Enforce separation of concerns through concentric layers, keeping business logic independent of frameworks, UI, and external dependencies.

## Core Principles

### Layer Dependency Rule
**Inner layers NEVER depend on outer layers. Dependencies point inward only.**

```
┌─────────────────────────────────────┐
│     Frameworks & Drivers (UI, DB)  │  ← Outermost layer
├─────────────────────────────────────┤
│     Interface Adapters (Controllers)│
├─────────────────────────────────────┤
│     Application Business Rules      │
│     (Use Cases / Interactors)       │
├─────────────────────────────────────┤
│     Enterprise Business Rules       │
│     (Entities / Domain Models)      │  ← Innermost layer
└─────────────────────────────────────┘
```

### Layer Responsibilities

#### 1. Entities (Domain Models) - Innermost
**Pure business logic. No framework dependencies. Use plain objects + pure functions.**

```typescript
// ✅ Modern: Domain entity as immutable data + pure functions
export type User = {
  readonly id: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly createdAt: Date;
};

// Factory function to create user
export function createUser(email: string, password: string): User {
  if (!isValidEmail(email)) {
    throw new Error('Invalid email format');
  }
  
  return {
    id: generateId(),
    email,
    passwordHash: hashPassword(password),
    createdAt: new Date(),
  };
}

// Pure functions for business logic
export function validatePassword(user: User, plainPassword: string): boolean {
  return hashPassword(plainPassword) === user.passwordHash;
}

export function changeEmail(user: User, newEmail: string): User {
  if (!isValidEmail(newEmail)) {
    throw new Error('Invalid email format');
  }
  // Immutable update - return new object
  return { ...user, email: newEmail };
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function hashPassword(plain: string): string {
  // Business rule for password hashing
  return /* hashing logic */;
}
```

#### 2. Use Cases (Application Business Rules)
**Orchestrate entities. Define application-specific business rules. Framework-independent.**

```typescript
// ✅ Modern: Repository as plain interface (no class)
export type UserRepository = {
  findById: (id: string) => Promise<User | null>;
  findByEmail: (email: string) => Promise<User | null>;
  save: (user: User) => Promise<void>;
};

export type EmailService = {
  sendWelcomeEmail: (email: string) => Promise<void>;
};

// ✅ Use case as pure function with dependencies injected as parameters
export async function registerUser(
  email: string,
  password: string,
  deps: {
    userRepository: UserRepository;
    emailService: EmailService;
  }
): Promise<User> {
  // Application business rule
  const existingUser = await deps.userRepository.findByEmail(email);
  if (existingUser) {
    throw new Error('User already exists');
  }

  const user = createUser(email, password);
  await deps.userRepository.save(user);
  await deps.emailService.sendWelcomeEmail(email);
  
  return user;
}

// Alternative: Factory pattern for partial application
export function makeRegisterUser(deps: {
  userRepository: UserRepository;
  emailService: EmailService;
}) {
  return async (email: string, password: string) => {
    return registerUser(email, password, deps);
  };
}
```

#### 3. Interface Adapters (Controllers, Presenters, Gateways)
**Convert data between use cases and external layers. Adapt external formats to internal formats.**

```typescript
// ✅ Modern: Controller as pure function (no class)
export async function registerUserHandler(
  req: Request,
  res: Response,
  deps: { registerUser: typeof registerUser }
): Promise<void> {
  try {
    const { email, password } = req.body;
    
    // Adapt HTTP input to use case input
    const user = await deps.registerUser(email, password, deps);
    
    // Adapt use case output to HTTP response
    res.status(201).json({
      id: user.id,
      email: user.email,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// ✅ Repository adapter implements type interface
export function createPostgresUserRepository(db: Database): UserRepository {
  return {
    async findById(id: string): Promise<User | null> {
      const row = await db.query('SELECT * FROM users WHERE id = $1', [id]);
      if (!row) return null;
      
      // Adapt database row to domain entity
      return {
        id: row.id,
        email: row.email,
        passwordHash: row.password_hash,
        createdAt: new Date(row.created_at),
      };
    },

    async findByEmail(email: string): Promise<User | null> {
      const row = await db.query('SELECT * FROM users WHERE email = $1', [email]);
      if (!row) return null;
      
      return {
        id: row.id,
        email: row.email,
        passwordHash: row.password_hash,
        createdAt: new Date(row.created_at),
      };
    },

    async save(user: User): Promise<void> {
      // Adapt domain entity to database row
      await db.query(
        'INSERT INTO users (id, email, password_hash, created_at) VALUES ($1, $2, $3, $4)',
        [user.id, user.email, user.passwordHash, user.createdAt]
      );
    },
  };
}
```

#### 4. Frameworks & Drivers (UI, Database, External Services)
**Implementation details. Frameworks, libraries, databases.**

```typescript
// ✅ Modern: Framework-specific setup with functional composition
import express from 'express';
import { createDatabase } from './infrastructure/database';
import { createPostgresUserRepository } from './adapters/repositories/user-repository';
import { createSendGridEmailService } from './adapters/services/email-service';
import { makeRegisterUser } from './usecases/register-user';
import { registerUserHandler } from './adapters/controllers/user-controller';

const app = express();
const db = createDatabase();

// Wire up dependencies (Dependency Injection via composition)
const userRepository = createPostgresUserRepository(db);
const emailService = createSendGridEmailService(process.env.SENDGRID_KEY!);

// Create use case with dependencies
const registerUser = makeRegisterUser({ userRepository, emailService });

// Register route with handler
app.post('/api/users', (req, res) => 
  registerUserHandler(req, res, { registerUser })
);

app.listen(3000);
```

## File Organization

### Recommended Structure

```
src/
├── domain/                    # Entities layer (innermost)
│   ├── entities/
│   │   ├── User.ts
│   │   ├── Order.ts
│   │   └── Product.ts
│   └── value-objects/
│       ├── Email.ts
│       └── Money.ts
│
├── usecases/                  # Application business rules
│   ├── user/
│   │   ├── RegisterUser.ts
│   │   ├── LoginUser.ts
│   │   └── interfaces/        # Interfaces for repositories, services
│   │       ├── IUserRepository.ts
│   │       └── IEmailService.ts
│   └── order/
│       ├── CreateOrder.ts
│       └── interfaces/
│           └── IOrderRepository.ts
│
├── adapters/                  # Interface adapters layer
│   ├── controllers/           # HTTP/API controllers
│   │   ├── UserController.ts
│   │   └── OrderController.ts
│   ├── presenters/            # Format output for UI
│   │   └── UserPresenter.ts
│   ├── repositories/          # Database implementations
│   │   ├── PostgresUserRepository.ts
│   │   └── PostgresOrderRepository.ts
│   └── services/              # External service implementations
│       └── SendGridEmailService.ts
│
└── infrastructure/            # Frameworks & drivers (outermost)
    ├── database/
    │   └── postgres.ts
    ├── http/
    │   └── express-app.ts
    └── config/
        └── env.ts
```

## Testing Strategy

### Test Each Layer Independently

```typescript
// ✅ Test domain entity (no mocks needed - pure logic)
describe('User', () => {
  it('validates password correctly', () => {
    const user = new User('1', 'test@example.com', 'hashedPass');
    expect(user.validatePassword('wrongPass')).toBe(false);
  });
});

// ✅ Test use case (mock repository and service interfaces)
describe('RegisterUserUseCase', () => {
  it('registers new user and sends welcome email', async () => {
    const mockRepo: IUserRepository = {
      findById: jest.fn().mockResolvedValue(null),
      save: jest.fn(),
    };
    const mockEmail: IEmailService = {
      sendWelcomeEmail: jest.fn(),
    };

    const useCase = new RegisterUserUseCase(mockRepo, mockEmail);
    await useCase.execute('new@example.com', 'password');

    expect(mockRepo.save).toHaveBeenCalled();
    expect(mockEmail.sendWelcomeEmail).toHaveBeenCalledWith('new@example.com');
  });
});

// ✅ Test controller (mock use case)
describe('UserController', () => {
  it('returns 201 on successful registration', async () => {
    const mockUseCase = {
      execute: jest.fn().mockResolvedValue(new User('1', 'test@example.com', 'hash')),
    };

    const controller = new UserController(mockUseCase);
    const req = { body: { email: 'test@example.com', password: 'pass' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await controller.register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });
});
```

## Migration Strategy

### Step 1: Identify Current Layers
- What's your business logic? (→ Entities)
- What are your application operations? (→ Use Cases)
- What talks to the outside world? (→ Adapters)
- What are framework implementations? (→ Infrastructure)

### Step 2: Extract Entities First
```typescript
// ❌ Before: Mixed concerns
class UserService {
  async register(req: Request): Promise<Response> {
    const user = await db.query('SELECT * FROM users WHERE email = $1', [req.body.email]);
    if (user) throw new Error('Exists');
    await db.query('INSERT INTO users...');
    await sendEmail(req.body.email);
    return res.json({ success: true });
  }
}

// ✅ After: Extracted entity
class User {
  constructor(public id: string, public email: string) {}
  // Business logic here
}
```

### Step 3: Create Use Cases
```typescript
// ✅ Extract application logic
class RegisterUserUseCase {
  async execute(email: string, password: string): Promise<User> {
    // Application business rules
  }
}
```

### Step 4: Create Adapters
```typescript
// ✅ Separate database adapter
class PostgresUserRepository implements IUserRepository {
  // Database-specific code
}
```

## Rules Summary

- **ALWAYS** keep entities framework-free
- **ALWAYS** define interfaces in use cases, implement in adapters
- **ALWAYS** point dependencies inward (outer layers depend on inner)
- **ALWAYS** test each layer independently
- **NEVER** import frameworks in entities or use cases
- **NEVER** let inner layers know about outer layers
- **PREFER** dependency injection over direct instantiation
- **PREFER** small, focused use cases over large service classes
