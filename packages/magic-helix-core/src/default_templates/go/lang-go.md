# Language: Go

## Architecture: Clean Architecture with Go Idioms

**Organize Go applications with clear boundaries: Handlers → Use Cases → Domain → Infrastructure.**

### Project Structure

```
project/
├── cmd/
│   └── server/
│       └── main.go          # Application entry point
│
├── internal/
│   ├── handlers/            # HTTP handlers (presentation layer)
│   │   ├── user_handler.go
│   │   └── order_handler.go
│   │
│   ├── usecases/            # Business logic (application layer)
│   │   ├── user_usecase.go
│   │   └── order_usecase.go
│   │
│   ├── domain/              # Domain models and interfaces
│   │   ├── user.go          # Domain entities
│   │   ├── order.go
│   │   └── repository.go    # Repository interfaces
│   │
│   └── infrastructure/      # External concerns
│       ├── postgres/
│       │   └── user_repository.go
│       └── redis/
│           └── cache.go
│
└── pkg/                     # Public, reusable packages
    ├── validator/
    └── logger/
```

### Rule: Handlers Handle HTTP Only

**ALWAYS** keep HTTP handlers thin. They parse requests, call use cases, and serialize responses.

```go
// ✅ Good: Thin handler
package handlers

import (
    "encoding/json"
    "net/http"
    "github.com/yourorg/project/internal/domain"
    "github.com/yourorg/project/internal/usecases"
)

type UserHandler struct {
    userUseCase usecases.UserUseCase  // Interface, not concrete type
}

func NewUserHandler(uc usecases.UserUseCase) *UserHandler {
    return &UserHandler{userUseCase: uc}
}

func (h *UserHandler) CreateUser(w http.ResponseWriter, r *http.Request) {
    // Parse request
    var req CreateUserRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "Invalid request", http.StatusBadRequest)
        return
    }

    // Call use case (business logic)
    user, err := h.userUseCase.CreateUser(r.Context(), req.Email, req.Name)
    if err != nil {
        if err == domain.ErrEmailExists {
            http.Error(w, err.Error(), http.StatusConflict)
            return
        }
        http.Error(w, "Internal error", http.StatusInternalServerError)
        return
    }

    // Serialize response
    w.Header().Set("Content-Type", "application/json")
    w.WriteStatus(http.StatusCreated)
    json.NewEncoder(w).Encode(toUserResponse(user))
}

// ❌ Bad: Business logic in handler
func (h *UserHandler) CreateUser(w http.ResponseWriter, r *http.Request) {
    var req CreateUserRequest
    json.NewDecoder(r.Body).Decode(&req)

    // ❌ Validation in handler
    if !strings.Contains(req.Email, "@") {
        http.Error(w, "Invalid email", http.StatusBadRequest)
        return
    }

    // ❌ Database access in handler
    var existing User
    h.db.QueryRow("SELECT * FROM users WHERE email = $1", req.Email).Scan(&existing)
    if existing.ID != "" {
        http.Error(w, "Email exists", http.StatusConflict)
        return
    }

    // ❌ Domain logic in handler
    user := User{
        ID:    uuid.New().String(),
        Email: req.Email,
        Name:  req.Name,
    }
    h.db.Exec("INSERT INTO users (id, email, name) VALUES ($1, $2, $3)", 
        user.ID, user.Email, user.Name)

    json.NewEncoder(w).Encode(user)
}
```

### Rule: Use Cases Orchestrate Business Logic

**ALWAYS** put business logic in use cases. Use cases coordinate between repositories and domain models.

```go
// ✅ internal/usecases/user_usecase.go
package usecases

import (
    "context"
    "github.com/yourorg/project/internal/domain"
)

// UserUseCase interface (for dependency inversion)
type UserUseCase interface {
    CreateUser(ctx context.Context, email, name string) (*domain.User, error)
    UpdateUserEmail(ctx context.Context, userID, newEmail string) (*domain.User, error)
}

// userUseCase implementation
type userUseCase struct {
    userRepo domain.UserRepository  // Interface from domain layer
}

func NewUserUseCase(userRepo domain.UserRepository) UserUseCase {
    return &userUseCase{userRepo: userRepo}
}

func (uc *userUseCase) CreateUser(ctx context.Context, email, name string) (*domain.User, error) {
    // Validate using domain methods
    if err := domain.ValidateEmail(email); err != nil {
        return nil, err
    }

    // Business rule: Check uniqueness
    existing, err := uc.userRepo.FindByEmail(ctx, email)
    if err != nil {
        return nil, err
    }
    if existing != nil {
        return nil, domain.ErrEmailExists
    }

    // Create domain entity
    user := domain.NewUser(email, name)

    // Persist
    if err := uc.userRepo.Save(ctx, user); err != nil {
        return nil, err
    }

    return user, nil
}

func (uc *userUseCase) UpdateUserEmail(ctx context.Context, userID, newEmail string) (*domain.User, error) {
    user, err := uc.userRepo.FindByID(ctx, userID)
    if err != nil {
        return nil, err
    }
    if user == nil {
        return nil, domain.ErrUserNotFound
    }

    // Use domain method (business logic)
    if err := user.ChangeEmail(newEmail); err != nil {
        return nil, err
    }

    if err := uc.userRepo.Save(ctx, user); err != nil {
        return nil, err
    }

    return user, nil
}
```

### Rule: Domain Layer Contains Business Rules

**ALWAYS** put business rules and invariants in domain entities. Keep them infrastructure-agnostic.

```go
// ✅ internal/domain/user.go - Domain entity
package domain

import (
    "errors"
    "regexp"
    "strings"
    "time"
    "github.com/google/uuid"
)

// Domain errors (business errors)
var (
    ErrInvalidEmail = errors.New("invalid email format")
    ErrEmailExists  = errors.New("email already exists")
    ErrUserNotFound = errors.New("user not found")
    ErrInvalidName  = errors.New("name must be at least 2 characters")
)

// User is a domain entity
type User struct {
    ID        string
    Email     string
    Name      string
    CreatedAt time.Time
    IsActive  bool
}

// NewUser creates a new user with validation
func NewUser(email, name string) *User {
    return &User{
        ID:        uuid.New().String(),
        Email:     email,
        Name:      name,
        CreatedAt: time.Now().UTC(),
        IsActive:  true,
    }
}

// ChangeEmail changes user email with validation
func (u *User) ChangeEmail(newEmail string) error {
    if err := ValidateEmail(newEmail); err != nil {
        return err
    }

    if strings.EqualFold(u.Email, newEmail) {
        return errors.New("new email must be different")
    }

    u.Email = newEmail
    return nil
}

// Deactivate deactivates the user account
func (u *User) Deactivate() error {
    if !u.IsActive {
        return errors.New("user is already inactive")
    }

    u.IsActive = false
    return nil
}

// IsAdmin checks if user is admin (business rule)
func (u *User) IsAdmin() bool {
    return strings.HasSuffix(u.Email, "@company.com")
}

// ValidateEmail validates email format
func ValidateEmail(email string) error {
    emailRegex := regexp.MustCompile(`^[^\s@]+@[^\s@]+\.[^\s@]+$`)
    if !emailRegex.MatchString(email) {
        return ErrInvalidEmail
    }
    if len(email) > 255 {
        return errors.New("email too long")
    }
    return nil
}
```

### Rule: Repository Interfaces in Domain, Implementation in Infrastructure

**ALWAYS** define repository interfaces in domain layer. Implement them in infrastructure layer.

```go
// ✅ internal/domain/repository.go - Interface in domain
package domain

import "context"

// UserRepository defines the contract for user data access
type UserRepository interface {
    Save(ctx context.Context, user *User) error
    FindByID(ctx context.Context, id string) (*User, error)
    FindByEmail(ctx context.Context, email string) (*User, error)
    Delete(ctx context.Context, id string) error
}

// ✅ internal/infrastructure/postgres/user_repository.go - Implementation
package postgres

import (
    "context"
    "database/sql"
    "errors"
    "github.com/yourorg/project/internal/domain"
)

type userRepository struct {
    db *sql.DB
}

// NewUserRepository creates a new PostgreSQL user repository
func NewUserRepository(db *sql.DB) domain.UserRepository {
    return &userRepository{db: db}
}

func (r *userRepository) Save(ctx context.Context, user *domain.User) error {
    query := `
        INSERT INTO users (id, email, name, created_at, is_active)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO UPDATE
        SET email = $2, name = $3, is_active = $5
    `

    _, err := r.db.ExecContext(ctx, query,
        user.ID,
        user.Email,
        user.Name,
        user.CreatedAt,
        user.IsActive,
    )

    return err
}

func (r *userRepository) FindByID(ctx context.Context, id string) (*domain.User, error) {
    query := `SELECT id, email, name, created_at, is_active FROM users WHERE id = $1`

    var user domain.User
    err := r.db.QueryRowContext(ctx, query, id).Scan(
        &user.ID,
        &user.Email,
        &user.Name,
        &user.CreatedAt,
        &user.IsActive,
    )

    if errors.Is(err, sql.ErrNoRows) {
        return nil, nil  // Not found
    }
    if err != nil {
        return nil, err
    }

    return &user, nil
}

func (r *userRepository) FindByEmail(ctx context.Context, email string) (*domain.User, error) {
    query := `SELECT id, email, name, created_at, is_active FROM users WHERE email = $1`

    var user domain.User
    err := r.db.QueryRowContext(ctx, query, email).Scan(
        &user.ID,
        &user.Email,
        &user.Name,
        &user.CreatedAt,
        &user.IsActive,
    )

    if errors.Is(err, sql.ErrNoRows) {
        return nil, nil
    }
    if err != nil {
        return nil, err
    }

    return &user, nil
}

func (r *userRepository) Delete(ctx context.Context, id string) error {
    query := `DELETE FROM users WHERE id = $1`
    _, err := r.db.ExecContext(ctx, query, id)
    return err
}
```

### Complete Example: Main Setup (Dependency Injection)

```go
// cmd/server/main.go - Wire dependencies
package main

import (
    "database/sql"
    "log"
    "net/http"

    _ "github.com/lib/pq"
    "github.com/yourorg/project/internal/handlers"
    "github.com/yourorg/project/internal/infrastructure/postgres"
    "github.com/yourorg/project/internal/usecases"
)

func main() {
    // Infrastructure: Database
    db, err := sql.Open("postgres", "postgres://user:pass@localhost/db?sslmode=disable")
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()

    // Infrastructure: Repositories (concrete implementations)
    userRepo := postgres.NewUserRepository(db)
    orderRepo := postgres.NewOrderRepository(db)

    // Use Cases (business logic)
    userUseCase := usecases.NewUserUseCase(userRepo)
    orderUseCase := usecases.NewOrderUseCase(orderRepo, userRepo)

    // Handlers (HTTP layer)
    userHandler := handlers.NewUserHandler(userUseCase)
    orderHandler := handlers.NewOrderHandler(orderUseCase)

    // Routes
    http.HandleFunc("/users", userHandler.CreateUser)
    http.HandleFunc("/orders", orderHandler.CreateOrder)

    log.Println("Server starting on :8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}
```

## Go Best Practices

- **ALWAYS** use `gofmt` to format code consistently.
- **ALWAYS** handle errors explicitly - never ignore them.
- **ALWAYS** use meaningful variable names (camelCase).
- **ALWAYS** write comprehensive godoc comments for exported functions/types.
- **ALWAYS** use `defer` for resource cleanup.
- **ALWAYS** prefer `struct` embedding over inheritance.
- **ALWAYS** use interfaces for abstraction and testing.
- **ALWAYS** use `context.Context` for cancellation and timeouts.
- **ALWAYS** use `go vet` and `golint` for code quality checks.
- **ALWAYS** write table-driven tests.
- **ALWAYS** use `t.Parallel()` for independent test functions.
- **ALWAYS** use `sync.WaitGroup` or channels for goroutine synchronization.
- **ALWAYS** avoid global variables - pass dependencies explicitly.
- **ALWAYS** use `panic` only for unrecoverable errors.
- **ALWAYS** use `log` package or structured logging for production.
- **ALWAYS** use `bufio` for efficient I/O operations.
- **ALWAYS** prefer `strings.Builder` for string concatenation in loops.
- **ALWAYS** use `time.Time` for time handling, not `int64`.
- **ALWAYS** use `json` tags for struct field serialization.
- **ALWAYS** use `iota` for enumerated constants.
- **ALWAYS** keep functions short and focused on single responsibilities.

## Testing Strategy

**Handlers:** Test HTTP contracts (mock use cases)
```go
// internal/handlers/user_handler_test.go
func TestCreateUser(t *testing.T) {
    mockUseCase := &MockUserUseCase{
        CreateUserFunc: func(ctx context.Context, email, name string) (*domain.User, error) {
            return &domain.User{ID: "123", Email: email, Name: name}, nil
        },
    }

    handler := NewUserHandler(mockUseCase)

    req := httptest.NewRequest("POST", "/users", strings.NewReader(`{"email":"test@example.com","name":"Test"}`))
    w := httptest.NewRecorder()

    handler.CreateUser(w, req)

    assert.Equal(t, http.StatusCreated, w.Code)
}
```

**Use Cases:** Test business logic (mock repositories)
```go
// internal/usecases/user_usecase_test.go
func TestCreateUser_EmailExists(t *testing.T) {
    mockRepo := &MockUserRepository{
        FindByEmailFunc: func(ctx context.Context, email string) (*domain.User, error) {
            return &domain.User{ID: "existing"}, nil  // Email exists
        },
    }

    uc := NewUserUseCase(mockRepo)

    _, err := uc.CreateUser(context.Background(), "test@example.com", "Test")

    assert.Equal(t, domain.ErrEmailExists, err)
}
```

**Domain Models:** Test business rules (no mocking)
```go
// internal/domain/user_test.go
func TestUser_ChangeEmail(t *testing.T) {
    tests := []struct {
        name      string
        newEmail  string
        expectErr bool
    }{
        {"valid email", "new@example.com", false},
        {"invalid email", "not-an-email", true},
        {"same email", "test@example.com", true},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            user := NewUser("test@example.com", "Test")
            err := user.ChangeEmail(tt.newEmail)

            if tt.expectErr {
                assert.Error(t, err)
            } else {
                assert.NoError(t, err)
                assert.Equal(t, tt.newEmail, user.Email)
            }
        })
    }
}
```

**Repositories:** Integration tests with real database
```go
// internal/infrastructure/postgres/user_repository_test.go
func TestUserRepository_Save(t *testing.T) {
    db := setupTestDB(t)  // Helper to create test DB
    defer db.Close()

    repo := NewUserRepository(db)
    user := domain.NewUser("test@example.com", "Test User")

    err := repo.Save(context.Background(), user)
    assert.NoError(t, err)

    found, err := repo.FindByID(context.Background(), user.ID)
    assert.NoError(t, err)
    assert.Equal(t, user.Email, found.Email)
}
```

## Architecture Summary

1. **Handlers** (`internal/handlers/`) = HTTP layer
   - Parse requests, serialize responses
   - Call use cases
   - No business logic

2. **Use Cases** (`internal/usecases/`) = Business logic
   - Orchestrate domain and repositories
   - Application workflows
   - Transaction boundaries

3. **Domain** (`internal/domain/`) = Business rules
   - Entities with behavior
   - Repository interfaces
   - Framework-agnostic

4. **Infrastructure** (`internal/infrastructure/`) = External concerns
   - Repository implementations
   - Database access
   - External APIs

**Reference:** See `patterns/architecture/clean-architecture.md`, `patterns/architecture/repository-pattern.md`, and `patterns/architecture/dependency-injection.md` for detailed architectural guidance.