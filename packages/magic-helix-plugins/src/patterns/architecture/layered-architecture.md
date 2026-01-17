# Layered Architecture Pattern

## Purpose
Organize code into horizontal layers with clear responsibilities. Common in MVC and enterprise applications.

## Layer Structure

```
┌─────────────────────────────────┐
│   Presentation Layer (UI/API)   │  ← User interaction, HTTP/GraphQL
├─────────────────────────────────┤
│   Application/Service Layer     │  ← Business logic orchestration
├─────────────────────────────────┤
│   Domain/Business Layer          │  ← Core business rules
├─────────────────────────────────┤
│   Data Access Layer (DAL)        │  ← Database, external APIs
└─────────────────────────────────┘
```

## Layer Responsibilities

### 1. Presentation Layer (Controllers, Views, Components)
**Handle user input, render UI, expose APIs.**

```typescript
// ✅ Controller handles HTTP, delegates to service
@Controller('/api/products')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Get()
  async getAll(@Query() filters: ProductFilters): Promise<ProductDTO[]> {
    const products = await this.productService.findAll(filters);
    return products.map(p => this.toDTO(p));
  }

  @Post()
  async create(@Body() dto: CreateProductDTO): Promise<ProductDTO> {
    const product = await this.productService.create(dto);
    return this.toDTO(product);
  }

  private toDTO(product: Product): ProductDTO {
    return {
      id: product.id,
      name: product.name,
      price: product.price.amount,
      currency: product.price.currency,
    };
  }
}
```

### 2. Service Layer (Business Logic)
**Orchestrate business operations, coordinate between domain and data layers.**

```typescript
// ✅ Service contains business logic, uses repositories
export class ProductService {
  constructor(
    private productRepository: ProductRepository,
    private inventoryService: InventoryService,
    private eventBus: EventBus
  ) {}

  async create(dto: CreateProductDTO): Promise<Product> {
    // Business validation
    if (dto.price <= 0) {
      throw new BusinessError('Price must be positive');
    }

    // Create domain object
    const product = new Product(
      generateId(),
      dto.name,
      new Money(dto.price, dto.currency)
    );

    // Persist
    await this.productRepository.save(product);

    // Business side effects
    await this.inventoryService.initializeStock(product.id, dto.initialStock);
    await this.eventBus.publish(new ProductCreatedEvent(product));

    return product;
  }

  async findAll(filters: ProductFilters): Promise<Product[]> {
    // Business logic for filtering
    const products = await this.productRepository.findMany(filters);
    
    // Business rule: filter out discontinued products unless explicitly requested
    if (!filters.includeDiscontinued) {
      return products.filter(p => !p.isDiscontinued);
    }
    
    return products;
  }

  async updatePrice(id: string, newPrice: Money): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Business rule: price change audit
    if (product.price.amount !== newPrice.amount) {
      await this.auditLog.recordPriceChange(id, product.price, newPrice);
    }

    product.updatePrice(newPrice);
    await this.productRepository.save(product);

    return product;
  }
}
```

### 3. Domain Layer (Business Models)
**Core business entities and rules. Framework-independent.**

```typescript
// ✅ Domain model with business rules
export class Product {
  constructor(
    public readonly id: string,
    private _name: string,
    private _price: Money,
    private _isDiscontinued: boolean = false
  ) {}

  get name(): string {
    return this._name;
  }

  get price(): Money {
    return this._price;
  }

  get isDiscontinued(): boolean {
    return this._isDiscontinued;
  }

  updatePrice(newPrice: Money): void {
    // Business rule: validate price
    if (newPrice.amount <= 0) {
      throw new Error('Price must be positive');
    }

    // Business rule: prevent large price changes
    const changePercent = Math.abs(
      (newPrice.amount - this._price.amount) / this._price.amount
    );
    if (changePercent > 0.5) {
      throw new Error('Price change exceeds 50% threshold');
    }

    this._price = newPrice;
  }

  discontinue(): void {
    // Business rule: cannot discontinue if already discontinued
    if (this._isDiscontinued) {
      throw new Error('Product already discontinued');
    }
    this._isDiscontinued = true;
  }

  rename(newName: string): void {
    // Business rule: validate name
    if (newName.trim().length < 3) {
      throw new Error('Name must be at least 3 characters');
    }
    this._name = newName;
  }
}

// ✅ Value object
export class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: string
  ) {
    if (amount < 0) {
      throw new Error('Amount cannot be negative');
    }
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot add different currencies');
    }
    return new Money(this.amount + other.amount, this.currency);
  }
}
```

### 4. Data Access Layer (Repositories)
**Database operations, external API calls, caching.**

```typescript
// ✅ Repository handles data persistence
export class ProductRepository {
  constructor(private db: Database) {}

  async save(product: Product): Promise<void> {
    await this.db.query(
      `INSERT INTO products (id, name, price_amount, price_currency, is_discontinued)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET
         name = $2,
         price_amount = $3,
         price_currency = $4,
         is_discontinued = $5`,
      [product.id, product.name, product.price.amount, product.price.currency, product.isDiscontinued]
    );
  }

  async findById(id: string): Promise<Product | null> {
    const row = await this.db.queryOne(
      'SELECT * FROM products WHERE id = $1',
      [id]
    );

    if (!row) return null;

    return this.toDomain(row);
  }

  async findMany(filters: ProductFilters): Promise<Product[]> {
    const query = this.buildFilterQuery(filters);
    const rows = await this.db.query(query.sql, query.params);
    return rows.map(row => this.toDomain(row));
  }

  private toDomain(row: any): Product {
    return new Product(
      row.id,
      row.name,
      new Money(row.price_amount, row.price_currency),
      row.is_discontinued
    );
  }

  private buildFilterQuery(filters: ProductFilters): { sql: string; params: any[] } {
    // Build dynamic SQL based on filters
    // ...
  }
}
```

## File Organization

### Backend (Node.js/Express/NestJS)
```
src/
├── presentation/              # Controllers, DTOs, validators
│   ├── controllers/
│   │   ├── ProductController.ts
│   │   └── OrderController.ts
│   ├── dto/
│   │   ├── CreateProductDTO.ts
│   │   └── ProductDTO.ts
│   └── validators/
│       └── ProductValidator.ts
│
├── application/               # Services, use cases
│   ├── services/
│   │   ├── ProductService.ts
│   │   └── OrderService.ts
│   └── interfaces/
│       └── IProductRepository.ts
│
├── domain/                    # Business models, value objects
│   ├── models/
│   │   ├── Product.ts
│   │   └── Order.ts
│   └── value-objects/
│       └── Money.ts
│
└── infrastructure/            # Repositories, database, external APIs
    ├── repositories/
    │   ├── ProductRepository.ts
    │   └── OrderRepository.ts
    ├── database/
    │   └── connection.ts
    └── external/
        └── PaymentGateway.ts
```

### Frontend (React/Vue)
```
src/
├── presentation/              # Components (UI only)
│   ├── components/
│   │   ├── ProductCard.tsx
│   │   └── ProductList.tsx
│   └── pages/
│       └── ProductsPage.tsx
│
├── application/               # Hooks/Composables (business logic)
│   ├── hooks/                 # React
│   │   ├── useProducts.ts
│   │   └── useCart.ts
│   └── composables/           # Vue
│       ├── useProducts.ts
│       └── useCart.ts
│
├── domain/                    # Business models (client-side)
│   ├── models/
│   │   ├── Product.ts
│   │   └── Cart.ts
│   └── value-objects/
│       └── CartItem.ts
│
└── infrastructure/            # API clients, storage
    ├── api/
    │   └── ProductApiClient.ts
    └── storage/
        └── LocalStorageCart.ts
```

## Testing Strategy

```typescript
// ✅ Test presentation layer (mock service)
describe('ProductController', () => {
  it('returns all products', async () => {
    const mockService = { findAll: jest.fn().mockResolvedValue([]) };
    const controller = new ProductController(mockService);
    const result = await controller.getAll({});
    expect(result).toEqual([]);
  });
});

// ✅ Test service layer (mock repository)
describe('ProductService', () => {
  it('creates product and triggers events', async () => {
    const mockRepo = { save: jest.fn() };
    const mockEvents = { publish: jest.fn() };
    const service = new ProductService(mockRepo, mockEvents);
    
    await service.create({ name: 'Test', price: 100 });
    
    expect(mockRepo.save).toHaveBeenCalled();
    expect(mockEvents.publish).toHaveBeenCalled();
  });
});

// ✅ Test domain layer (no mocks - pure logic)
describe('Product', () => {
  it('prevents negative prices', () => {
    const product = new Product('1', 'Test', new Money(100, 'USD'));
    expect(() => product.updatePrice(new Money(-10, 'USD'))).toThrow();
  });
});

// ✅ Test data layer (integration test with real DB)
describe('ProductRepository', () => {
  it('persists and retrieves product', async () => {
    const repo = new ProductRepository(testDb);
    const product = new Product('1', 'Test', new Money(100, 'USD'));
    
    await repo.save(product);
    const retrieved = await repo.findById('1');
    
    expect(retrieved?.name).toBe('Test');
  });
});
```

## Rules Summary

- **ALWAYS** keep presentation logic separate from business logic
- **ALWAYS** put business rules in service or domain layer, not controllers
- **ALWAYS** make repositories responsible for data access only
- **ALWAYS** use DTOs to decouple API contracts from domain models
- **NEVER** access database directly from controllers
- **NEVER** put business logic in repositories
- **PREFER** thin controllers, fat services
- **PREFER** dependency injection for testability
