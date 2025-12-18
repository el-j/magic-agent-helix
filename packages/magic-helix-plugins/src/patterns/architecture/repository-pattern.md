# Repository Pattern

## Purpose
Abstract data access logic, providing a collection-like interface for domain objects. Decouples business logic from data persistence.

## Core Concept

**Repository = Collection of Domain Objects**

Think of a repository as an in-memory collection (like a List or Set) that persists to a database.

```typescript
// ✅ Repository interface acts like a collection
interface IProductRepository {
  // Collection-like operations
  getById(id: string): Promise<Product | null>;
  getAll(): Promise<Product[]>;
  add(product: Product): Promise<void>;
  update(product: Product): Promise<void>;
  remove(id: string): Promise<void>;
  
  // Domain-specific queries
  findByCategory(category: string): Promise<Product[]>;
  findInPriceRange(min: number, max: number): Promise<Product[]>;
}
```

## Implementation

### 1. Define Repository Interface (in domain/use case layer)

```typescript
// ✅ Interface lives in domain layer (no implementation details)
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(filters?: UserFilters): Promise<User[]>;
  save(user: User): Promise<void>;
  delete(id: string): Promise<void>;
  
  // Domain-specific queries
  findActiveUsers(): Promise<User[]>;
  findUsersByRole(role: string): Promise<User[]>;
}

export interface UserFilters {
  role?: string;
  isActive?: boolean;
  registeredAfter?: Date;
}
```

### 2. Implement Repository (in infrastructure layer)

```typescript
// ✅ Implementation with actual database
export class PostgresUserRepository implements IUserRepository {
  constructor(private db: Database) {}

  async findById(id: string): Promise<User | null> {
    const row = await this.db.queryOne(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    
    return row ? this.toDomain(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.db.queryOne(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    return row ? this.toDomain(row) : null;
  }

  async save(user: User): Promise<void> {
    // Handle both insert and update (upsert)
    await this.db.query(
      `INSERT INTO users (id, email, password, role, created_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET
         email = $2,
         password = $3,
         role = $4`,
      [user.id, user.email, user.password, user.role, user.createdAt]
    );
  }

  async delete(id: string): Promise<void> {
    await this.db.query('DELETE FROM users WHERE id = $1', [id]);
  }

  async findActiveUsers(): Promise<User[]> {
    const rows = await this.db.query(
      'SELECT * FROM users WHERE is_active = true ORDER BY created_at DESC'
    );
    
    return rows.map(row => this.toDomain(row));
  }

  async findUsersByRole(role: string): Promise<User[]> {
    const rows = await this.db.query(
      'SELECT * FROM users WHERE role = $1',
      [role]
    );
    
    return rows.map(row => this.toDomain(row));
  }

  // Map database row to domain object
  private toDomain(row: any): User {
    return new User(
      row.id,
      row.email,
      row.password,
      row.role,
      row.created_at,
      row.is_active
    );
  }

  // Map domain object to database row
  private toRow(user: User): any {
    return {
      id: user.id,
      email: user.email,
      password: user.password,
      role: user.role,
      created_at: user.createdAt,
      is_active: user.isActive,
    };
  }
}
```

### 3. Use Repository in Service/Use Case

```typescript
// ✅ Service depends on interface, not implementation
export class UserService {
  constructor(private userRepository: IUserRepository) {}

  async registerUser(email: string, password: string): Promise<User> {
    // Check if user exists
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new Error('User already exists');
    }

    // Create domain object
    const user = User.create(email, password);

    // Persist
    await this.userRepository.save(user);

    return user;
  }

  async getActiveAdmins(): Promise<User[]> {
    const admins = await this.userRepository.findUsersByRole('admin');
    return admins.filter(user => user.isActive);
  }
}
```

## Multiple Implementations

### In-Memory Repository (for testing)

```typescript
// ✅ In-memory implementation for fast tests
export class InMemoryUserRepository implements IUserRepository {
  private users: Map<string, User> = new Map();

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return Array.from(this.users.values())
      .find(user => user.email === email) || null;
  }

  async save(user: User): Promise<void> {
    this.users.set(user.id, user);
  }

  async delete(id: string): Promise<void> {
    this.users.delete(id);
  }

  async findActiveUsers(): Promise<User[]> {
    return Array.from(this.users.values())
      .filter(user => user.isActive);
  }

  async findUsersByRole(role: string): Promise<User[]> {
    return Array.from(this.users.values())
      .filter(user => user.role === role);
  }

  // Test helper
  clear(): void {
    this.users.clear();
  }
}
```

### Redis Repository (for caching)

```typescript
// ✅ Redis implementation for caching layer
export class RedisUserRepository implements IUserRepository {
  constructor(
    private redis: Redis,
    private fallbackRepo: IUserRepository // Delegate to DB if cache miss
  ) {}

  async findById(id: string): Promise<User | null> {
    // Try cache first
    const cached = await this.redis.get(`user:${id}`);
    if (cached) {
      return JSON.parse(cached);
    }

    // Fall back to database
    const user = await this.fallbackRepo.findById(id);
    if (user) {
      await this.redis.setex(`user:${id}`, 3600, JSON.stringify(user));
    }

    return user;
  }

  async save(user: User): Promise<void> {
    // Save to database
    await this.fallbackRepo.save(user);

    // Update cache
    await this.redis.setex(`user:${user.id}`, 3600, JSON.stringify(user));
  }

  async delete(id: string): Promise<void> {
    await this.fallbackRepo.delete(id);
    await this.redis.del(`user:${id}`);
  }

  // Other methods...
}
```

## Specification Pattern (Advanced)

For complex queries, use specification pattern:

```typescript
// ✅ Specification for complex filtering
export interface Specification<T> {
  isSatisfiedBy(item: T): boolean;
  toSql(): { where: string; params: any[] }; // Optional for DB queries
}

export class ActiveUserSpec implements Specification<User> {
  isSatisfiedBy(user: User): boolean {
    return user.isActive;
  }

  toSql() {
    return { where: 'is_active = true', params: [] };
  }
}

export class RoleSpec implements Specification<User> {
  constructor(private role: string) {}

  isSatisfiedBy(user: User): boolean {
    return user.role === this.role;
  }

  toSql() {
    return { where: 'role = $1', params: [this.role] };
  }
}

// ✅ Combine specifications
export class AndSpec<T> implements Specification<T> {
  constructor(private specs: Specification<T>[]) {}

  isSatisfiedBy(item: T): boolean {
    return this.specs.every(spec => spec.isSatisfiedBy(item));
  }

  toSql() {
    const sqlParts = this.specs.map(s => s.toSql());
    const where = sqlParts.map((s, i) => `(${s.where})`).join(' AND ');
    const params = sqlParts.flatMap(s => s.params);
    return { where, params };
  }
}

// ✅ Repository accepts specifications
interface IUserRepository {
  find(spec: Specification<User>): Promise<User[]>;
}

// Usage
const activeAdmins = await userRepo.find(
  new AndSpec([
    new ActiveUserSpec(),
    new RoleSpec('admin')
  ])
);
```

## Testing Strategy

```typescript
// ✅ Test service with in-memory repository
describe('UserService', () => {
  let service: UserService;
  let repo: InMemoryUserRepository;

  beforeEach(() => {
    repo = new InMemoryUserRepository();
    service = new UserService(repo);
  });

  it('registers new user', async () => {
    const user = await service.registerUser('test@example.com', 'password');
    
    expect(user.email).toBe('test@example.com');
    
    // Verify persisted
    const found = await repo.findById(user.id);
    expect(found).toBeTruthy();
  });

  it('throws if user already exists', async () => {
    await service.registerUser('test@example.com', 'password');
    
    await expect(
      service.registerUser('test@example.com', 'password')
    ).rejects.toThrow('User already exists');
  });
});

// ✅ Test repository with real database (integration test)
describe('PostgresUserRepository', () => {
  let repo: PostgresUserRepository;
  let db: Database;

  beforeEach(async () => {
    db = await createTestDatabase();
    repo = new PostgresUserRepository(db);
  });

  afterEach(async () => {
    await db.close();
  });

  it('saves and retrieves user', async () => {
    const user = new User('1', 'test@example.com', 'hash', 'user');
    
    await repo.save(user);
    const found = await repo.findById('1');
    
    expect(found?.email).toBe('test@example.com');
  });
});
```

## File Organization

```
src/
├── domain/
│   ├── models/
│   │   └── User.ts
│   └── repositories/           # Interfaces only
│       ├── IUserRepository.ts
│       └── IOrderRepository.ts
│
├── application/
│   └── services/
│       └── UserService.ts      # Uses IUserRepository
│
└── infrastructure/
    └── repositories/           # Implementations
        ├── PostgresUserRepository.ts
        ├── InMemoryUserRepository.ts
        └── RedisUserRepository.ts
```

## Rules Summary

- **ALWAYS** define repository interfaces in domain layer
- **ALWAYS** implement repositories in infrastructure layer
- **ALWAYS** use collection-like method names (add, remove, getById)
- **ALWAYS** return domain objects, not database rows
- **ALWAYS** make repositories responsible for data mapping only
- **NEVER** put business logic in repositories
- **NEVER** return database-specific types (like ORM entities)
- **PREFER** one repository per aggregate root
- **PREFER** repository methods that work with domain objects, not primitive types
- **CONSIDER** using in-memory implementation for testing
- **CONSIDER** specification pattern for complex queries
