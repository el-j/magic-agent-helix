# Domain-Driven Design (DDD) Patterns

## Purpose
Model complex business domains through strategic and tactical patterns. Align software structure with business concepts. Manage complexity through bounded contexts and rich domain models.

## Core Concepts

### Ubiquitous Language

**The same terms used by domain experts must be used in code.**

```typescript
// ✅ Good: Uses business domain language
class Order {
  confirmPayment(payment: Payment): void {
    if (this.status !== OrderStatus.AwaitingPayment) {
      throw new InvalidOrderStateError('Order is not awaiting payment');
    }
    this.status = OrderStatus.Confirmed;
    this.events.push(new OrderConfirmedEvent(this.id));
  }
}

// ❌ Bad: Technical jargon, not business language
class Order {
  updateStatus(newStatus: number): void {
    this.statusCode = newStatus;
    this.lastModified = new Date();
  }
}
```

**Learn the language from domain experts, then use it everywhere:** code, tests, docs, discussions.

## Building Blocks (Tactical Patterns)

### 1. Entities

Objects with identity that persist over time. Two entities are equal if they have the same ID, even if their attributes differ.

```typescript
// ✅ Entity: Has identity (id)
export class User {
  constructor(
    private readonly id: UserId,     // Identity (value object)
    private email: Email,             // Value object
    private name: string,
    private createdAt: Date
  ) {}

  getId(): UserId {
    return this.id;
  }

  changeEmail(newEmail: Email): void {
    if (!newEmail.isValid()) {
      throw new InvalidEmailError();
    }
    this.email = newEmail;
  }

  // Equality based on identity
  equals(other: User): boolean {
    return this.id.equals(other.id);
  }
}

// Usage
const user1 = new User(UserId.create(), Email.create('john@example.com'), 'John', new Date());
const user2 = new User(UserId.create(), Email.create('jane@example.com'), 'Jane', new Date());

user1.equals(user2); // false (different IDs)
```

**Rules:**
- Has a unique identifier (ID)
- Equality based on ID, not attributes
- Contains business logic methods
- Can change over time while keeping identity

### 2. Value Objects

Immutable objects defined by their attributes. Two value objects are equal if all their attributes are equal.

```typescript
// ✅ Value Object: Immutable, equality by attributes
export class Money {
  constructor(
    private readonly amount: number,
    private readonly currency: string
  ) {
    if (amount < 0) {
      throw new NegativeAmountError();
    }
    Object.freeze(this); // Enforce immutability
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new CurrencyMismatchError();
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency);
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  toString(): string {
    return `${this.amount} ${this.currency}`;
  }
}

// Usage
const price = new Money(100, 'USD');
const tax = price.multiply(0.2);
const total = price.add(tax); // New object, original unchanged
```

**Examples:** Email, Address, Money, DateRange, PhoneNumber

**Rules:**
- **ALWAYS** immutable (no setters)
- Equality based on all attributes
- No identity (no ID)
- Encapsulate validation
- Return new instances for changes

### 3. Aggregates

Cluster of entities and value objects with a single root entity. The root controls access and enforces invariants.

```typescript
// ✅ Aggregate Root: Order
export class Order {
  private readonly id: OrderId;
  private customerId: CustomerId;
  private items: OrderItem[] = [];        // Entities within aggregate
  private status: OrderStatus;
  private total: Money;

  constructor(customerId: CustomerId) {
    this.id = OrderId.create();
    this.customerId = customerId;
    this.status = OrderStatus.Draft;
    this.total = Money.zero('USD');
  }

  // ✅ All modifications go through aggregate root
  addItem(product: Product, quantity: number): void {
    if (this.status !== OrderStatus.Draft) {
      throw new OrderAlreadyConfirmedError();
    }

    const item = new OrderItem(product, quantity);
    this.items.push(item);
    this.recalculateTotal(); // Maintain invariant
  }

  removeItem(productId: ProductId): void {
    if (this.status !== OrderStatus.Draft) {
      throw new OrderAlreadyConfirmedError();
    }

    this.items = this.items.filter(item => !item.productId.equals(productId));
    this.recalculateTotal();
  }

  confirm(): void {
    if (this.items.length === 0) {
      throw new EmptyOrderError();
    }
    this.status = OrderStatus.Confirmed;
  }

  // ✅ Enforce invariant: total = sum of items
  private recalculateTotal(): void {
    this.total = this.items.reduce(
      (sum, item) => sum.add(item.getTotal()),
      Money.zero('USD')
    );
  }

  getTotal(): Money {
    return this.total;
  }
}

// ❌ Never modify entities within aggregate from outside
class OrderItem {
  constructor(
    private product: Product,
    private quantity: number
  ) {}

  getTotal(): Money {
    return this.product.price.multiply(this.quantity);
  }
}

// ❌ Bad: Bypassing aggregate root
order.items[0].quantity = 10; // Violates encapsulation!

// ✅ Good: Use aggregate root
order.addItem(product, 10);
```

**Aggregate Boundaries:**
- Small aggregates (1-3 entities) perform better
- One aggregate per transaction
- Reference other aggregates by ID, not direct reference

```typescript
// ✅ Good: Reference by ID
class Order {
  private customerId: CustomerId;  // ID reference
}

// ❌ Bad: Direct reference across aggregates
class Order {
  private customer: Customer;  // Couples two aggregates
}
```

### 4. Domain Events

Represent something significant that happened in the domain.

```typescript
// ✅ Domain Event: Immutable record of what happened
export class OrderConfirmedEvent {
  constructor(
    public readonly orderId: OrderId,
    public readonly customerId: CustomerId,
    public readonly total: Money,
    public readonly occurredAt: Date = new Date()
  ) {
    Object.freeze(this);
  }
}

// ✅ Aggregate raises events
export class Order {
  private events: DomainEvent[] = [];

  confirm(): void {
    if (this.items.length === 0) {
      throw new EmptyOrderError();
    }
    this.status = OrderStatus.Confirmed;
    
    // Raise event
    this.events.push(
      new OrderConfirmedEvent(this.id, this.customerId, this.total)
    );
  }

  getEvents(): DomainEvent[] {
    return [...this.events];
  }

  clearEvents(): void {
    this.events = [];
  }
}

// ✅ Event handler in separate bounded context
class InventoryEventHandler {
  async onOrderConfirmed(event: OrderConfirmedEvent): Promise<void> {
    // Reserve inventory when order confirmed
    await this.inventoryService.reserveItems(event.orderId);
  }
}
```

**Use events for:**
- Cross-aggregate consistency (eventual consistency)
- Decoupling bounded contexts
- Audit trail
- Triggering side effects

### 5. Domain Services

Business logic that doesn't belong to a single entity or value object.

```typescript
// ✅ Domain Service: Stateless, operates on domain objects
export class OrderPricingService {
  calculateDiscount(order: Order, customer: Customer): Money {
    let discount = Money.zero('USD');

    // VIP customers get 10% off
    if (customer.isVip()) {
      discount = order.getTotal().multiply(0.1);
    }

    // Bulk orders (>10 items) get additional 5%
    if (order.getItemCount() > 10) {
      const bulkDiscount = order.getTotal().multiply(0.05);
      discount = discount.add(bulkDiscount);
    }

    return discount;
  }
}

// ❌ Bad: Logic scattered across entities
class Order {
  calculateVipDiscount(): Money { /* ... */ }
  calculateBulkDiscount(): Money { /* ... */ }
}

class Customer {
  calculateOrderDiscount(order: Order): Money { /* ... */ }
}
```

**When to use domain services:**
- Logic involves multiple aggregates
- Logic doesn't naturally fit in an entity
- Stateless operations

### 6. Repositories

Provide collection-like interface for aggregates. Only for aggregate roots.

```typescript
// ✅ Repository: Collection interface for aggregates
export interface IOrderRepository {
  save(order: Order): Promise<void>;
  findById(id: OrderId): Promise<Order | null>;
  findByCustomer(customerId: CustomerId): Promise<Order[]>;
  delete(id: OrderId): Promise<void>;
}

// ✅ Implementation in infrastructure layer
export class PostgresOrderRepository implements IOrderRepository {
  constructor(private db: Database) {}

  async save(order: Order): Promise<void> {
    await this.db.transaction(async (tx) => {
      // Save aggregate root
      await tx.query(
        'INSERT INTO orders (id, customer_id, status, total) VALUES ($1, $2, $3, $4)',
        [order.id, order.customerId, order.status, order.total]
      );

      // Save child entities (items)
      for (const item of order.items) {
        await tx.query(
          'INSERT INTO order_items (order_id, product_id, quantity) VALUES ($1, $2, $3)',
          [order.id, item.productId, item.quantity]
        );
      }

      // Publish domain events
      for (const event of order.getEvents()) {
        await this.eventPublisher.publish(event);
      }
      order.clearEvents();
    });
  }

  async findById(id: OrderId): Promise<Order | null> {
    const row = await this.db.query('SELECT * FROM orders WHERE id = $1', [id.value]);
    if (!row) return null;

    const items = await this.db.query('SELECT * FROM order_items WHERE order_id = $1', [id.value]);
    
    return this.mapToAggregate(row, items);
  }
}
```

**Rules:**
- One repository per aggregate root
- No repositories for entities inside aggregates
- Interface in domain layer, implementation in infrastructure

## Strategic Patterns

### Bounded Contexts

Explicit boundaries where a domain model applies. Same term can have different meanings in different contexts.

```
┌─────────────────────────────────────────────────────────────┐
│                    E-commerce System                         │
├─────────────────┬─────────────────┬────────────────────────┤
│ Sales Context   │ Inventory Ctx   │ Shipping Context       │
├─────────────────┼─────────────────┼────────────────────────┤
│ Product:        │ Product:        │ Package:               │
│ - price         │ - quantity      │ - weight               │
│ - description   │ - location      │ - dimensions           │
│ - reviews       │ - reorderLevel  │ - tracking number      │
│                 │                 │                        │
│ Order:          │                 │ Shipment:              │
│ - customer      │                 │ - destination          │
│ - total         │                 │ - carrier              │
│ - items         │                 │ - status               │
└─────────────────┴─────────────────┴────────────────────────┘
```

**Example: Product in different contexts**

```typescript
// Sales Context - Product focuses on sellability
namespace SalesContext {
  export class Product {
    constructor(
      public id: ProductId,
      public name: string,
      public price: Money,
      public description: string
    ) {}
  }
}

// Inventory Context - Product focuses on stock management
namespace InventoryContext {
  export class Product {
    constructor(
      public id: ProductId,
      public sku: string,
      public quantityOnHand: number,
      public reorderLevel: number,
      public warehouseLocation: string
    ) {}
  }
}
```

### Context Mapping

Define relationships between bounded contexts.

```typescript
// ✅ Anti-Corruption Layer (ACL): Translate between contexts
export class SalesInventoryAdapter {
  constructor(private inventoryService: InventoryService) {}

  async checkAvailability(salesProduct: SalesContext.Product): Promise<boolean> {
    // Translate Sales Product → Inventory Product
    const inventoryProduct = await this.inventoryService.findBySku(
      salesProduct.id.toSku()
    );

    return inventoryProduct.quantityOnHand > 0;
  }
}
```

## Layered Architecture with DDD

```
┌──────────────────────────────────────────────┐
│ Presentation Layer (Controllers, UI)         │
│ - Handles HTTP requests                      │
│ - Maps DTOs ↔ Domain models                  │
└──────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────┐
│ Application Layer (Use Cases, Services)      │
│ - Orchestrates domain objects                │
│ - Transaction boundaries                     │
│ - Triggers domain events                     │
└──────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────┐
│ Domain Layer (Entities, VOs, Aggregates)     │
│ - Business logic                             │
│ - Domain rules and invariants                │
│ - Rich domain model                          │
└──────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────┐
│ Infrastructure Layer (DB, APIs, Messaging)   │
│ - Repository implementations                 │
│ - External service clients                   │
│ - Database access                            │
└──────────────────────────────────────────────┘
```

**Example: Complete DDD Flow**

```typescript
// 1. Presentation Layer: Controller
export class OrderController {
  constructor(private createOrderUseCase: CreateOrderUseCase) {}

  async createOrder(req: Request, res: Response) {
    const dto: CreateOrderDTO = req.body;

    const result = await this.createOrderUseCase.execute({
      customerId: dto.customerId,
      items: dto.items,
    });

    if (result.isFailure) {
      return res.status(400).json({ error: result.error });
    }

    return res.status(201).json({ orderId: result.value.id });
  }
}

// 2. Application Layer: Use Case
export class CreateOrderUseCase {
  constructor(
    private orderRepo: IOrderRepository,
    private productRepo: IProductRepository,
    private pricingService: OrderPricingService
  ) {}

  async execute(request: CreateOrderRequest): Promise<Result<Order>> {
    // Load customer aggregate
    const customer = await this.customerRepo.findById(request.customerId);
    if (!customer) {
      return Result.fail('Customer not found');
    }

    // Create order aggregate
    const order = new Order(request.customerId);

    // Add items
    for (const item of request.items) {
      const product = await this.productRepo.findById(item.productId);
      if (!product) {
        return Result.fail(`Product ${item.productId} not found`);
      }
      order.addItem(product, item.quantity);
    }

    // Apply business logic via domain service
    const discount = this.pricingService.calculateDiscount(order, customer);
    order.applyDiscount(discount);

    // Confirm order
    order.confirm();

    // Persist aggregate
    await this.orderRepo.save(order);

    return Result.ok(order);
  }
}

// 3. Domain Layer: Aggregate
export class Order {
  // See aggregate example above
}

// 4. Infrastructure Layer: Repository
export class PostgresOrderRepository implements IOrderRepository {
  // See repository example above
}
```

## File Organization

```
src/
├── presentation/                # Presentation layer
│   └── controllers/
│       └── OrderController.ts
│
├── application/                 # Application layer
│   └── use-cases/
│       └── CreateOrderUseCase.ts
│
├── domain/                      # Domain layer
│   ├── order/                   # Bounded context
│   │   ├── entities/
│   │   │   ├── Order.ts
│   │   │   └── OrderItem.ts
│   │   ├── value-objects/
│   │   │   ├── OrderId.ts
│   │   │   └── OrderStatus.ts
│   │   ├── repositories/
│   │   │   └── IOrderRepository.ts
│   │   ├── services/
│   │   │   └── OrderPricingService.ts
│   │   └── events/
│   │       └── OrderConfirmedEvent.ts
│   │
│   ├── customer/                # Another bounded context
│   │   ├── entities/
│   │   │   └── Customer.ts
│   │   └── value-objects/
│   │       └── CustomerId.ts
│   │
│   └── shared/                  # Shared kernel
│       └── value-objects/
│           └── Money.ts
│
└── infrastructure/              # Infrastructure layer
    ├── repositories/
    │   └── PostgresOrderRepository.ts
    └── messaging/
        └── RabbitMQEventPublisher.ts
```

## Rules Summary

- **ALWAYS** use ubiquitous language from domain experts
- **ALWAYS** model aggregates with clear boundaries
- **ALWAYS** make value objects immutable
- **ALWAYS** enforce invariants in aggregate roots
- **ALWAYS** access child entities through aggregate root
- **ALWAYS** reference other aggregates by ID, not direct reference
- **NEVER** allow direct modification of entities inside aggregates
- **NEVER** create repositories for non-root entities
- **NEVER** let infrastructure concerns leak into domain layer
- **PREFER** small aggregates (1-3 entities)
- **PREFER** eventual consistency between aggregates
- **CONSIDER** domain events for cross-aggregate operations
- **CONSIDER** anti-corruption layers between bounded contexts
