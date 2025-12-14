# Swift Language Instructions

## Project Type
- Language: Swift
- Package Manager: Swift Package Manager (SPM)
- Platform: {iOS|macOS|Linux|Server}

## Build Commands

### Swift Package Manager
```bash
swift build              # Build project
swift test               # Run tests
swift run                # Run executable
swift package update     # Update dependencies
swift package clean      # Clean build artifacts
```

### Xcode
```bash
xcodebuild -scheme MyApp -destination 'platform=iOS Simulator,name=iPhone 15'
xcodebuild test -scheme MyApp
```

## Code Conventions

### Swift Basics
```swift
// Variables and constants
var mutableValue = 42
let constantValue = 100

// Optionals
var name: String? = "John"
if let unwrappedName = name {
    print(unwrappedName)
}

// Nil coalescing
let displayName = name ?? "Anonymous"

// Optional chaining
let length = user?.name?.count
```

### Structs and Classes
```swift
struct User {
    let id: UUID
    var name: String
    var email: String
    
    func fullProfile() -> String {
        "\(name) <\(email)>"
    }
}

class UserRepository {
    private var users: [User] = []
    
    func add(_ user: User) {
        users.append(user)
    }
    
    func find(by id: UUID) -> User? {
        users.first { $0.id == id }
    }
}
```

### Protocols and Extensions
```swift
protocol Identifiable {
    var id: UUID { get }
}

extension User: Identifiable {}

extension String {
    func toSnakeCase() -> String {
        // Implementation
    }
}
```

### Async/Await (Concurrency)
```swift
func fetchUser(id: UUID) async throws -> User {
    let (data, _) = try await URLSession.shared.data(from: url)
    return try JSONDecoder().decode(User.self, from: data)
}

// Usage
Task {
    do {
        let user = try await fetchUser(id: userId)
        print(user.name)
    } catch {
        print("Error: \(error)")
    }
}
```

### Error Handling
```swift
enum UserError: Error {
    case notFound
    case invalidEmail
}

func getUser(id: UUID) throws -> User {
    guard let user = findUser(id) else {
        throw UserError.notFound
    }
    return user
}

// Usage
do {
    let user = try getUser(id: userId)
} catch UserError.notFound {
    print("User not found")
} catch {
    print("Unknown error: \(error)")
}
```

## Testing with XCTest

```swift
import XCTest
@testable import MyApp

final class UserTests: XCTestCase {
    func testUserFullProfile() {
        let user = User(
            id: UUID(),
            name: "John",
            email: "john@example.com"
        )
        
        XCTAssertEqual(user.fullProfile(), "John <john@example.com>")
    }
    
    func testAsyncFunction() async throws {
        let user = try await fetchUser(id: testUserId)
        XCTAssertEqual(user.name, "John")
    }
}
```

## Docker for Server-Side Swift

### Multi-stage Dockerfile
```dockerfile
# Build stage
FROM swift:5.9-jammy AS build
WORKDIR /app

COPY Package.swift Package.resolved ./
RUN swift package resolve

COPY . .
RUN swift build -c release --static-swift-stdlib

# Runtime stage
FROM ubuntu:22.04
WORKDIR /app

RUN apt-get update && apt-get install -y \
    libcurl4 \
    libxml2 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/.build/release/MyApp ./

RUN useradd -m -u 1000 swift
USER swift

EXPOSE 8080
CMD ["./MyApp"]
```

### Docker Compose
```yaml
services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db/myapp
    depends_on:
      - db
  
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: password
```

## Package.swift Structure

```swift
// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "MyApp",
    platforms: [
        .macOS(.v13),
        .iOS(.v16),
        .linux
    ],
    products: [
        .executable(name: "MyApp", targets: ["MyApp"]),
        .library(name: "MyLibrary", targets: ["MyLibrary"])
    ],
    dependencies: [
        .package(url: "https://github.com/vapor/vapor.git", from: "4.89.0")
    ],
    targets: [
        .executableTarget(
            name: "MyApp",
            dependencies: [
                .product(name: "Vapor", package: "vapor")
            ]
        ),
        .testTarget(
            name: "MyAppTests",
            dependencies: ["MyApp"]
        )
    ]
)
```

## Memory Management

```swift
// ARC (Automatic Reference Counting)
class User {
    var name: String
    init(name: String) { self.name = name }
}

// Weak references to avoid retain cycles
class ViewController {
    weak var delegate: UserDelegate?
}

// Unowned for guaranteed non-nil references
class Order {
    unowned let customer: Customer
}
```

## Performance Tips

- Use value types (structs) for immutable data
- Leverage copy-on-write for collections
- Use `lazy` for expensive computations
- Profile with Instruments
- Use `@inlinable` for small, frequently-called functions
- Prefer `async/await` over completion handlers
- Use actors for thread-safe state

## Common Frameworks

### iOS/macOS
- **SwiftUI**: Modern declarative UI
- **Combine**: Reactive programming
- **CoreData**: Persistence
- **URLSession**: Networking

### Server-Side
- **Vapor**: Web framework
- **Fluent**: ORM
- **PostgresNIO**: PostgreSQL driver
- **AsyncHTTPClient**: HTTP client

## Best Practices

- Use optionals appropriately
- Prefer value types over reference types
- Use guard statements for early returns
- Implement proper error handling
- Write unit tests
- Use protocols for abstraction
- Follow Swift naming conventions
- Use type inference wisely
- Leverage Swift's type safety
