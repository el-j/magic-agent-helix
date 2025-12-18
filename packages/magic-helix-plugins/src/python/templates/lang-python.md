# Language: Python

## Architecture: Layered Architecture for Python Applications

**Organize Python applications with clear separation of concerns: API → Services → Domain → Data Access.**

### Layer Structure

```
src/
├── api/                    # Presentation layer (FastAPI/Flask routes)
│   ├── routes/
│   │   ├── users.py        # HTTP handlers, request/response
│   │   └── orders.py
│   └── schemas/
│       └── user_schema.py  # Pydantic models for API contracts
│
├── services/               # Business logic layer
│   ├── user_service.py     # Orchestrates domain operations
│   └── order_service.py
│
├── domain/                 # Domain models and business rules
│   ├── models/
│   │   ├── user.py         # Domain entities
│   │   └── order.py
│   └── value_objects/
│       └── email.py        # Immutable value objects
│
├── infrastructure/         # Data access and external services
│   ├── repositories/
│   │   ├── user_repository.py
│   │   └── order_repository.py
│   └── database/
│       └── db.py           # Database connection
│
└── main.py                 # Application entry point
```

### Rule: Routes Handle HTTP Only

**ALWAYS** keep route handlers thin. They should only handle HTTP concerns (parsing, validation, serialization).

```python
# ✅ Good: Thin route handler (FastAPI)
from fastapi import APIRouter, Depends, HTTPException
from src.services.user_service import UserService
from src.api.schemas.user_schema import CreateUserRequest, UserResponse

router = APIRouter()

@router.post("/users", response_model=UserResponse, status_code=201)
async def create_user(
    request: CreateUserRequest,
    user_service: UserService = Depends()
):
    """Create a new user - HTTP handler only."""
    try:
        user = await user_service.create_user(
            email=request.email,
            name=request.name
        )
        return UserResponse.from_domain(user)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# ❌ Bad: Business logic in route
@router.post("/users")
async def create_user(request: CreateUserRequest, db: Session = Depends()):
    # ❌ Validation logic in route
    if "@" not in request.email:
        raise HTTPException(status_code=400, detail="Invalid email")
    
    # ❌ Database access in route
    existing = db.query(UserModel).filter_by(email=request.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email exists")
    
    # ❌ Domain logic in route
    user = UserModel(email=request.email, name=request.name)
    db.add(user)
    db.commit()
    
    return user
```

### Rule: Services Orchestrate Business Logic

**ALWAYS** put business logic in services. Services coordinate between repositories and domain models.

```python
# ✅ services/user_service.py - Business logic layer
from src.domain.models.user import User
from src.domain.value_objects.email import Email
from src.infrastructure.repositories.user_repository import IUserRepository

class UserService:
    """Orchestrates user-related business operations."""
    
    def __init__(self, user_repository: IUserRepository):
        self._user_repo = user_repository
    
    async def create_user(self, email: str, name: str) -> User:
        """Create a new user with validation and business rules."""
        # Validate email using value object
        email_vo = Email(email)  # Raises ValueError if invalid
        
        # Business rule: Check uniqueness
        existing = await self._user_repo.find_by_email(email_vo)
        if existing:
            raise ValueError(f"User with email {email} already exists")
        
        # Create domain entity
        user = User.create(email=email_vo, name=name)
        
        # Persist
        await self._user_repo.save(user)
        
        return user
    
    async def update_user_email(self, user_id: str, new_email: str) -> User:
        """Update user email with validation."""
        user = await self._user_repo.find_by_id(user_id)
        if not user:
            raise ValueError(f"User {user_id} not found")
        
        # Use domain method for business logic
        email_vo = Email(new_email)
        user.change_email(email_vo)
        
        await self._user_repo.save(user)
        return user
```

### Rule: Domain Models Encapsulate Business Rules

**ALWAYS** put business rules and invariants in domain models. Keep them database-agnostic.

```python
# ✅ domain/models/user.py - Domain entity
from dataclasses import dataclass
from datetime import datetime
from uuid import UUID, uuid4
from src.domain.value_objects.email import Email

@dataclass
class User:
    """User domain entity with business logic."""
    id: UUID
    email: Email
    name: str
    created_at: datetime
    is_active: bool = True
    
    @classmethod
    def create(cls, email: Email, name: str) -> "User":
        """Factory method for creating new users."""
        if not name or len(name) < 2:
            raise ValueError("Name must be at least 2 characters")
        
        return cls(
            id=uuid4(),
            email=email,
            name=name,
            created_at=datetime.utcnow(),
            is_active=True
        )
    
    def change_email(self, new_email: Email) -> None:
        """Change user email with validation."""
        if new_email == self.email:
            raise ValueError("New email must be different")
        
        self.email = new_email
    
    def deactivate(self) -> None:
        """Deactivate user account."""
        if not self.is_active:
            raise ValueError("User is already inactive")
        
        self.is_active = False
    
    def is_admin(self) -> bool:
        """Business rule: Admins have company email."""
        return self.email.value.endswith("@company.com")

# ✅ domain/value_objects/email.py - Value object
@dataclass(frozen=True)  # Immutable
class Email:
    """Email value object with validation."""
    value: str
    
    def __post_init__(self):
        """Validate email format on creation."""
        if "@" not in self.value or "." not in self.value.split("@")[1]:
            raise ValueError(f"Invalid email format: {self.value}")
        
        if len(self.value) > 255:
            raise ValueError("Email too long")
    
    def __str__(self) -> str:
        return self.value
```

### Rule: Repositories Abstract Data Access

**ALWAYS** define repository interfaces in domain layer, implement in infrastructure layer.

```python
# ✅ domain/repositories/user_repository.py - Interface
from abc import ABC, abstractmethod
from typing import Optional
from uuid import UUID
from src.domain.models.user import User
from src.domain.value_objects.email import Email

class IUserRepository(ABC):
    """Repository interface for User aggregate."""
    
    @abstractmethod
    async def save(self, user: User) -> None:
        """Save or update a user."""
        pass
    
    @abstractmethod
    async def find_by_id(self, user_id: UUID) -> Optional[User]:
        """Find user by ID."""
        pass
    
    @abstractmethod
    async def find_by_email(self, email: Email) -> Optional[User]:
        """Find user by email."""
        pass
    
    @abstractmethod
    async def delete(self, user_id: UUID) -> None:
        """Delete a user."""
        pass

# ✅ infrastructure/repositories/user_repository.py - Implementation
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.domain.repositories.user_repository import IUserRepository
from src.domain.models.user import User
from src.infrastructure.database.models import UserModel

class SQLAlchemyUserRepository(IUserRepository):
    """SQLAlchemy implementation of user repository."""
    
    def __init__(self, session: AsyncSession):
        self._session = session
    
    async def save(self, user: User) -> None:
        """Save domain user to database."""
        # Check if exists
        stmt = select(UserModel).where(UserModel.id == user.id)
        result = await self._session.execute(stmt)
        db_user = result.scalar_one_or_none()
        
        if db_user:
            # Update existing
            db_user.email = str(user.email)
            db_user.name = user.name
            db_user.is_active = user.is_active
        else:
            # Create new
            db_user = UserModel(
                id=user.id,
                email=str(user.email),
                name=user.name,
                created_at=user.created_at,
                is_active=user.is_active
            )
            self._session.add(db_user)
        
        await self._session.commit()
    
    async def find_by_id(self, user_id: UUID) -> Optional[User]:
        """Find user by ID and map to domain model."""
        stmt = select(UserModel).where(UserModel.id == user_id)
        result = await self._session.execute(stmt)
        db_user = result.scalar_one_or_none()
        
        if not db_user:
            return None
        
        return self._map_to_domain(db_user)
    
    async def find_by_email(self, email: Email) -> Optional[User]:
        stmt = select(UserModel).where(UserModel.email == str(email))
        result = await self._session.execute(stmt)
        db_user = result.scalar_one_or_none()
        
        return self._map_to_domain(db_user) if db_user else None
    
    def _map_to_domain(self, db_user: UserModel) -> User:
        """Map database model to domain model."""
        return User(
            id=db_user.id,
            email=Email(db_user.email),
            name=db_user.name,
            created_at=db_user.created_at,
            is_active=db_user.is_active
        )
```

### Complete Example: FastAPI Application

```python
# main.py - Application entry point
from fastapi import FastAPI
from src.api.routes import users, orders
from src.infrastructure.database.db import init_db

app = FastAPI()

@app.on_event("startup")
async def startup():
    await init_db()

app.include_router(users.router, prefix="/api")
app.include_router(orders.router, prefix="/api")

# api/routes/users.py - HTTP layer
from fastapi import APIRouter, Depends
from src.services.user_service import UserService
from src.api.dependencies import get_user_service

router = APIRouter()

@router.post("/users")
async def create_user(
    request: CreateUserRequest,
    service: UserService = Depends(get_user_service)
):
    user = await service.create_user(request.email, request.name)
    return UserResponse.from_domain(user)

# api/schemas/user_schema.py - API contracts
from pydantic import BaseModel, EmailStr

class CreateUserRequest(BaseModel):
    email: EmailStr
    name: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    is_active: bool
    
    @classmethod
    def from_domain(cls, user: User) -> "UserResponse":
        return cls(
            id=str(user.id),
            email=str(user.email),
            name=user.name,
            is_active=user.is_active
        )

# api/dependencies.py - Dependency injection
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from src.infrastructure.database.db import get_session
from src.infrastructure.repositories.user_repository import SQLAlchemyUserRepository
from src.services.user_service import UserService

async def get_user_service(
    session: AsyncSession = Depends(get_session)
) -> UserService:
    repository = SQLAlchemyUserRepository(session)
    return UserService(repository)
```

## Python Best Practices

- **ALWAYS** use type hints for function parameters and return values.
- **ALWAYS** use descriptive variable and function names (snake_case).
- **ALWAYS** follow PEP 8 style guidelines.
- **ALWAYS** use docstrings for modules, classes, and functions.
- **ALWAYS** handle exceptions properly with specific exception types.
- **ALWAYS** use context managers (`with` statements) for resource management.
- **ALWAYS** prefer list comprehensions and generator expressions over loops when appropriate.
- **ALWAYS** use `if __name__ == "__main__":` for script entry points.
- **ALWAYS** import modules at the top of files.
- **ALWAYS** use relative imports within packages.
- **ALWAYS** validate input parameters and return values.
- **ALWAYS** use logging instead of print statements for production code.
- **ALWAYS** write unit tests with pytest or unittest.
- **ALWAYS** use virtual environments for dependency management.
- **ALWAYS** keep functions small and focused on single responsibilities.
- **ALWAYS** use dataclasses or namedtuples for simple data structures.
- **ALWAYS** prefer `pathlib` over `os.path` for path operations.
- **ALWAYS** use f-strings for string formatting.
- **ALWAYS** handle encoding explicitly when working with files.
- **ALWAYS** use type checking tools like mypy in CI/CD pipelines.

## Testing Strategy

**Routes:** Test HTTP contracts (request/response)
```python
# tests/api/test_users.py
import pytest
from httpx import AsyncClient
from src.main import app

@pytest.mark.asyncio
async def test_create_user():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/api/users",
            json={"email": "test@example.com", "name": "Test User"}
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "test@example.com"
        assert data["name"] == "Test User"
```

**Services:** Test business logic (mock repositories)
```python
# tests/services/test_user_service.py
import pytest
from unittest.mock import AsyncMock
from src.services.user_service import UserService
from src.domain.value_objects.email import Email

@pytest.mark.asyncio
async def test_create_user_validates_uniqueness():
    # Arrange
    mock_repo = AsyncMock()
    mock_repo.find_by_email.return_value = User(...)  # Existing user
    
    service = UserService(mock_repo)
    
    # Act & Assert
    with pytest.raises(ValueError, match="already exists"):
        await service.create_user("test@example.com", "Test")
```

**Domain Models:** Test business rules (no mocking)
```python
# tests/domain/test_user.py
import pytest
from src.domain.models.user import User
from src.domain.value_objects.email import Email

def test_user_change_email():
    user = User.create(Email("old@example.com"), "Test User")
    
    user.change_email(Email("new@example.com"))
    
    assert user.email.value == "new@example.com"

def test_user_change_email_rejects_same_email():
    user = User.create(Email("test@example.com"), "Test User")
    
    with pytest.raises(ValueError, match="must be different"):
        user.change_email(Email("test@example.com"))
```

**Repositories:** Test database operations (integration tests)
```python
# tests/infrastructure/test_user_repository.py
import pytest
from src.infrastructure.repositories.user_repository import SQLAlchemyUserRepository
from src.domain.models.user import User
from src.domain.value_objects.email import Email

@pytest.mark.asyncio
async def test_save_and_find_user(db_session):
    # Arrange
    repo = SQLAlchemyUserRepository(db_session)
    user = User.create(Email("test@example.com"), "Test User")
    
    # Act
    await repo.save(user)
    found = await repo.find_by_id(user.id)
    
    # Assert
    assert found is not None
    assert found.email.value == "test@example.com"
    assert found.name == "Test User"
```

## Architecture Summary

1. **API Layer** (routes, schemas) = HTTP concerns
   - Parse requests, serialize responses
   - Call services, map domain ↔ DTOs
   - No business logic

2. **Service Layer** (services) = Business logic orchestration
   - Coordinate repositories and domain
   - Transaction boundaries
   - Application-specific workflows

3. **Domain Layer** (models, value objects) = Business rules
   - Entities with identity and behavior
   - Value objects (immutable)
   - Framework-agnostic

4. **Infrastructure Layer** (repositories, database) = External concerns
   - Database access
   - External APIs
   - File system

**Reference:** See `patterns/architecture/layered-architecture.md`, `patterns/architecture/repository-pattern.md`, and `patterns/architecture/domain-driven-design.md` for detailed architectural guidance.