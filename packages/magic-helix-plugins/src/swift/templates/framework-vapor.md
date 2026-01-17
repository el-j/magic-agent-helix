# Vapor Framework Instructions

## Server-Side Swift Web Framework

Vapor is a modern, high-performance web framework for Swift.

## Project Structure
```
Sources/
├── App/
│   ├── Controllers/
│   ├── Models/
│   ├── Migrations/
│   ├── configure.swift
│   └── routes.swift
└── Run/
    └── main.swift
Tests/
    └── AppTests/
Package.swift
```

## Basic Application

### configure.swift
```swift
import Vapor
import Fluent
import FluentPostgresDriver

public func configure(_ app: Application) async throws {
    // Database
    app.databases.use(
        .postgres(
            hostname: Environment.get("DATABASE_HOST") ?? "localhost",
            port: Environment.get("DATABASE_PORT").flatMap(Int.init) ?? 5432,
            username: Environment.get("DATABASE_USERNAME") ?? "postgres",
            password: Environment.get("DATABASE_PASSWORD") ?? "",
            database: Environment.get("DATABASE_NAME") ?? "vapor"
        ),
        as: .psql
    )
    
    // Migrations
    app.migrations.add(CreateUser())
    
    try await app.autoMigrate()
    
    // Routes
    try routes(app)
}
```

### routes.swift
```swift
import Vapor

func routes(_ app: Application) throws {
    app.get { req in
        "Welcome to Vapor!"
    }
    
    app.get("hello", ":name") { req -> String in
        let name = req.parameters.get("name")!
        return "Hello, \(name)!"
    }
    
    try app.register(collection: UserController())
}
```

## Models with Fluent ORM

```swift
import Fluent
import Vapor

final class User: Model, Content {
    static let schema = "users"
    
    @ID(key: .id)
    var id: UUID?
    
    @Field(key: "name")
    var name: String
    
    @Field(key: "email")
    var email: String
    
    @Children(for: \.$user)
    var posts: [Post]
    
    init() {}
    
    init(id: UUID? = nil, name: String, email: String) {
        self.id = id
        self.name = name
        self.email = email
    }
}

// Migration
struct CreateUser: AsyncMigration {
    func prepare(on database: Database) async throws {
        try await database.schema("users")
            .id()
            .field("name", .string, .required)
            .field("email", .string, .required)
            .unique(on: "email")
            .create()
    }
    
    func revert(on database: Database) async throws {
        try await database.schema("users").delete()
    }
}
```

## Controllers

```swift
import Vapor

struct UserController: RouteCollection {
    func boot(routes: RoutesBuilder) throws {
        let users = routes.grouped("api", "users")
        users.get(use: index)
        users.get(":id", use: show)
        users.post(use: create)
        users.put(":id", use: update)
        users.delete(":id", use: delete)
    }
    
    func index(req: Request) async throws -> [User] {
        try await User.query(on: req.db).all()
    }
    
    func show(req: Request) async throws -> User {
        guard let user = try await User.find(req.parameters.get("id"), on: req.db) else {
            throw Abort(.notFound)
        }
        return user
    }
    
    func create(req: Request) async throws -> User {
        let user = try req.content.decode(User.self)
        try await user.save(on: req.db)
        return user
    }
    
    func update(req: Request) async throws -> User {
        guard let user = try await User.find(req.parameters.get("id"), on: req.db) else {
            throw Abort(.notFound)
        }
        
        let updateData = try req.content.decode(User.self)
        user.name = updateData.name
        user.email = updateData.email
        try await user.save(on: req.db)
        return user
    }
    
    func delete(req: Request) async throws -> HTTPStatus {
        guard let user = try await User.find(req.parameters.get("id"), on: req.db) else {
            throw Abort(.notFound)
        }
        try await user.delete(on: req.db)
        return .noContent
    }
}
```

## Middleware

```swift
import Vapor

struct LogMiddleware: AsyncMiddleware {
    func respond(to request: Request, chainingTo next: AsyncResponder) async throws -> Response {
        request.logger.info("\(request.method) \(request.url.path)")
        let response = try await next.respond(to: request)
        request.logger.info("Response: \(response.status.code)")
        return response
    }
}

// Register middleware
app.middleware.use(LogMiddleware())
```

## Authentication

```swift
import Vapor
import Fluent

final class User: Model, Content, Authenticatable {
    // ... model definition
    
    static func authenticator() -> Authenticator {
        return BearerAuthenticator()
    }
}

// Protected route
let protected = app.grouped(User.authenticator())
protected.get("protected") { req -> String in
    let user = try req.auth.require(User.self)
    return "Hello, \(user.name)!"
}
```

## Validation

```swift
import Vapor

struct CreateUserRequest: Content, Validatable {
    var name: String
    var email: String
    
    static func validations(_ validations: inout Validations) {
        validations.add("name", as: String.self, is: !.empty)
        validations.add("email", as: String.self, is: .email)
    }
}

func create(req: Request) async throws -> User {
    try CreateUserRequest.validate(content: req)
    let userData = try req.content.decode(CreateUserRequest.self)
    // ...
}
```

## Testing

```swift
import XCTVapor
@testable import App

final class UserTests: XCTestCase {
    var app: Application!
    
    override func setUp() async throws {
        app = Application(.testing)
        try await configure(app)
    }
    
    override func tearDown() async throws {
        app.shutdown()
    }
    
    func testGetUsers() async throws {
        try await app.test(.GET, "api/users") { res in
            XCTAssertEqual(res.status, .ok)
            let users = try res.content.decode([User].self)
            XCTAssertGreaterThan(users.count, 0)
        }
    }
    
    func testCreateUser() async throws {
        let user = User(name: "John", email: "john@example.com")
        
        try await app.test(.POST, "api/users", beforeRequest: { req in
            try req.content.encode(user)
        }, afterResponse: { res in
            XCTAssertEqual(res.status, .ok)
            let created = try res.content.decode(User.self)
            XCTAssertEqual(created.name, "John")
        })
    }
}
```

## Docker Production Setup

```dockerfile
FROM swift:5.9-jammy AS build
WORKDIR /app

COPY Package.swift Package.resolved ./
RUN swift package resolve

COPY . .
RUN swift build -c release --static-swift-stdlib

FROM ubuntu:22.04
WORKDIR /app

RUN apt-get update && apt-get install -y \
    libcurl4 \
    libxml2 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/.build/release/Run ./Run

RUN useradd -m -u 1000 vapor
USER vapor

EXPOSE 8080
ENV VAPOR_ENV=production

ENTRYPOINT ["./Run"]
CMD ["serve", "--hostname", "0.0.0.0", "--port", "8080"]
```

## Environment Configuration

```swift
import Vapor

func configure(_ app: Application) async throws {
    switch app.environment {
    case .production:
        app.logger.logLevel = .warning
    case .development:
        app.logger.logLevel = .debug
    default:
        break
    }
    
    // Database URL from environment
    if let databaseURL = Environment.get("DATABASE_URL") {
        try app.databases.use(.postgres(url: databaseURL), as: .psql)
    }
}
```

## Performance Tips

- Use async/await throughout
- Leverage connection pooling
- Implement caching where appropriate
- Use database indexes
- Profile with Instruments
- Enable release optimizations
- Use EventLoopFuture batching for multiple operations
- Implement pagination for large datasets

## Best Practices

- Use proper error handling with `Abort`
- Validate user input
- Implement authentication/authorization
- Use migrations for database schema changes
- Write comprehensive tests
- Use environment variables for configuration
- Implement health check endpoints
- Log appropriately
- Use middlewares for cross-cutting concerns
- Keep controllers thin, logic in services
